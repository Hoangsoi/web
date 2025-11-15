// Vercel Serverless Function entry point for backend
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from '../server/config/database.js';
import authRoutes from '../server/routes/auth.js';
import productRoutes from '../server/routes/products.js';
import cartRoutes from '../server/routes/cart.js';
import orderRoutes from '../server/routes/orders.js';
import transactionRoutes from '../server/routes/transactions.js';
import adminRoutes from '../server/routes/admin.js';
import settingsRoutes from '../server/routes/settings.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);

// Initialize database on cold start
let dbInitialized = false;

async function ensureDatabase() {
  if (dbInitialized) return;
  
  try {
    await initDatabase();
    dbInitialized = true;
    console.log('Database initialized for Vercel serverless function');
  } catch (error) {
    console.error('Database initialization error:', error);
    // Don't throw, let requests handle errors
  }
}

// Vercel serverless function handler
export default async function handler(req, res) {
  // Initialize database on first request
  await ensureDatabase();
  
  // Handle Express app
  return app(req, res);
}

