import { Sequelize } from 'sequelize';
import { config } from '../config.js';

const isPostgres = config.db.url?.startsWith('postgres') || config.db.dialect === 'postgres';
const dialect = isPostgres ? 'postgres' : 'mariadb';

export const sequelize = config.db.url
  ? new Sequelize(config.db.url, {
      dialect: 'postgres',
      dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
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
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await sequelize.authenticate();
      console.log('MariaDB connected.');
      await sequelize.sync({ alter: { drop: false } });
      console.log('All models synced.');
      return;
    } catch (err) {
      if (attempt < retries) {
        console.log(`[DB] Connection failed (attempt ${attempt}/${retries}). Retrying in ${delayMs / 1000}s...`);
        await new Promise(r => setTimeout(r, delayMs));
      } else {
        throw err;
      }
    }
  }
}
