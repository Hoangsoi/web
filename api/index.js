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

// CORS configuration for Vercel
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In production, allow all origins (Vercel handles this)
    // You can restrict this to specific domains if needed
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Initialize database on cold start
let dbInitialized = false;
let dbInitPromise = null;

async function ensureDatabase() {
  if (dbInitialized) return;
  
  // If initialization is already in progress, wait for it
  if (dbInitPromise) {
    await dbInitPromise;
    return;
  }
  
  // Start initialization
  dbInitPromise = (async () => {
    try {
      await initDatabase();
      dbInitialized = true;
      console.log('Database initialized for Vercel serverless function');
    } catch (error) {
      console.error('Database initialization error:', error);
      // Reset promise so we can retry
      dbInitPromise = null;
      throw error;
    }
  })();
  
  await dbInitPromise;
}

// Vercel serverless function handler
export default async function handler(req, res) {
  try {
    // Initialize database on first request
    await ensureDatabase();
    
    // Handle Express app
    return app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

