import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '7999', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  db: {
    url: process.env.DATABASE_URL || null,
    dialect: process.env.DB_DIALECT || null,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    name: process.env.DB_NAME || 'amudhu',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  },

  cors: {
    origins: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map(s => s.trim()),
  },

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
    staticQrId: process.env.RAZORPAY_STATIC_QR_ID || '',
    currency: process.env.RAZORPAY_CURRENCY || 'INR',
  },

  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  pagination: {
    defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE || '20', 10),
    maxPageSize: parseInt(process.env.MAX_PAGE_SIZE || '100', 10),
  },
};
