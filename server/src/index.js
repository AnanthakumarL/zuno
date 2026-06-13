import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import { existsSync } from 'fs';
import { config } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { connectDB } from './db/index.js';
import './db/models/index.js';
import { errorHandler } from './middleware/errorHandler.js';

// Main API routes
import healthRouter from './routes/v1/health.js';
import authRouter from './routes/v1/auth.js';
import usersRouter from './routes/v1/users.js';
import productsRouter from './routes/v1/products.js';
import ordersRouter from './routes/v1/orders.js';
import paymentsRouter from './routes/v1/payments.js';
import categoriesRouter from './routes/v1/categories.js';
import sectionsRouter from './routes/v1/sections.js';
import accountsRouter from './routes/v1/accounts.js';
import jobsRouter from './routes/v1/jobs.js';
import applicationsRouter from './routes/v1/applications.js';
import productionManagementsRouter from './routes/v1/productionManagements.js';
import productionUsersRouter from './routes/v1/productionUsers.js';
import deliveryManagementsRouter from './routes/v1/deliveryManagements.js';
import deliveryUsersRouter from './routes/v1/deliveryUsers.js';
import siteConfigRouter from './routes/v1/siteConfig.js';
import addressesRouter from './routes/v1/addresses.js';
import cartRouter from './routes/v1/cart.js';
import subscriptionsRouter from './routes/v1/subscriptions.js';

const app = express();

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const allowed = config.cors.origins;
    if (allowed.includes(origin) || allowed.includes('*')) return cb(null, true);
    if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return cb(null, true);
    const host = origin.replace(/^https?:\/\//, '');
    if (host === 'amudhu.click' || host.endsWith('.amudhu.click') || host.endsWith('.vercel.app')) return cb(null, true);
    if (host === 'zuno.site' || host.endsWith('.zuno.site')) return cb(null, true);
    cb(new Error('CORS not allowed'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple ping — always 200, no DB check
app.get('/ping', (_req, res) => {
  const dbUrl = process.env.DATABASE_URL;
  const dbHost = dbUrl ? new URL(dbUrl).hostname : null;
  res.json({ ok: true, dbHost, hasUrl: !!dbUrl });
});

// Main API v1
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/orders', ordersRouter);
app.use('/api/v1/payments', paymentsRouter);
app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/sections', sectionsRouter);
app.use('/api/v1/accounts', accountsRouter);
app.use('/api/v1/jobs', jobsRouter);
app.use('/api/v1/applications', applicationsRouter);
app.use('/api/v1/production-managements', productionManagementsRouter);
app.use('/api/v1/production-users', productionUsersRouter);
app.use('/api/v1/delivery-managements', deliveryManagementsRouter);
app.use('/api/v1/delivery-users', deliveryUsersRouter);
app.use('/api/v1/site-config', siteConfigRouter);
app.use('/api/v1/addresses', addressesRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/subscriptions', subscriptionsRouter);

app.use(errorHandler);

// Redirect bare /login to /admin/login
app.get('/login', (_req, res) => res.redirect('/admin/login'));

// Serve Admin panel static files
const adminDist = path.join(__dirname, '..', 'public', 'admin');
if (existsSync(adminDist)) {
  app.use('/admin', express.static(adminDist));
  app.get('/admin/*', (_req, res) => res.sendFile(path.join(adminDist, 'index.html')));
}

// Serve Client (storefront) static files — must be LAST
const clientDist = path.join(__dirname, '..', 'public', 'client');
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

async function start() {
  // Start HTTP server first so health checks pass, then connect DB
  app.listen(config.port, () => {
    console.log(`Zuno Server running on port ${config.port}`);
  });
  try {
    await connectDB();
    console.log('Database ready.');
  } catch (err) {
    console.error('DB connection error (app still running):', err.message);
  }
}

start().catch(err => { console.error('Startup error:', err); process.exit(1); });
