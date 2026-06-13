import { Sequelize } from 'sequelize';
import { config } from '../config.js';

const isPostgres = config.db.url?.startsWith('postgres') || config.db.dialect === 'postgres';
const dialect = isPostgres ? 'postgres' : 'mariadb';

// Render's true internal hostname is the short "dpg-xxxx-a" form, reachable on
// the private network from same-region services WITHOUT SSL. The
// "-internal.<region>-postgres.render.com" / ".<region>-postgres.render.com"
// variants route through the PUBLIC endpoint, where free-tier "external traffic
// not allowed" drops the socket ("Connection terminated unexpectedly"). Strip
// the domain so we use the private network.
const dbUrl = config.db.url
  ? config.db.url.replace(/(@dpg-[a-z0-9]+-a)(-internal)?\.[a-z0-9-]+-postgres\.render\.com/i, '$1')
  : null;

// SSL is required for public endpoints (host ends in render.com) but not for
// the private internal network (short host).
const pgSsl = dbUrl && /\.render\.com/i.test(dbUrl)
  ? { ssl: { require: true, rejectUnauthorized: false } }
  : {};

export const sequelize = dbUrl
  ? new Sequelize(dbUrl, {
      dialect: 'postgres',
      dialectOptions: pgSsl,
      logging: false,
      pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
      define: { timestamps: true, underscored: true, createdAt: 'created_at', updatedAt: 'updated_at' },
    })
  : new Sequelize(config.db.name, config.db.user, config.db.password, {
      host: config.db.host,
      port: config.db.port,
      dialect,
      dialectOptions: dialect === 'mariadb'
        ? { connectTimeout: 10000, charset: 'utf8mb4' }
        : { ssl: false },
      logging: config.nodeEnv === 'development' ? (msg) => console.log('[SQL]', msg) : false,
      pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
      define: {
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        ...(dialect === 'mariadb' ? { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' } : {}),
      },
    });

export async function connectDB(retries = 8, delayMs = 3000) {
  console.log(`[DB] Using dialect: ${dbUrl ? 'postgres (URL)' : 'mariadb (host)'}`);
  if (dbUrl) console.log(`[DB] URL host: ${dbUrl.replace(/:([^@]+)@/, ':***@')}`);
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await sequelize.authenticate();
      console.log('DB connected.');
      await sequelize.sync({ force: false });
      console.log('All models synced.');
      return;
    } catch (err) {
      console.error(`[DB] Attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, delayMs));
      } else {
        throw err;
      }
    }
  }
}
