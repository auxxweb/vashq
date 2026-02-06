import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';

import authRoutes from './routes/auth.routes.js';
import superAdminRoutes from './routes/superAdmin.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();

// CORS: single origin in production, multiple in development
const corsOrigin = process.env.FRONTEND_URL
  ? (process.env.FRONTEND_URL.includes(',') ? process.env.FRONTEND_URL.split(',').map(s => s.trim()) : process.env.FRONTEND_URL)
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Security and performance
app.use(helmet({
  contentSecurityPolicy: isProduction,
  crossOriginEmbedderPolicy: false,
}));
app.use(compression());

// Rate limiting: stricter in production
const limiter = rateLimit({
  windowMs: isProduction ? 15 * 60 * 1000 : 1 * 60 * 1000,
  max: isProduction ? 100 : 1000,
  message: { success: false, message: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

app.use(express.json({ limit: '512kb' }));
app.use(express.urlencoded({ extended: true, limit: '512kb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
  if (!isProduction) {
    console.error('Error:', err);
  }
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(isProduction ? {} : { stack: err.stack }),
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/washq_saas');
    if (!isProduction) {
      console.log('MongoDB connected');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  if (!isProduction) {
    console.log(`Server running on port ${PORT}`);
  }
});

export default app;
