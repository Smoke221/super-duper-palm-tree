import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { initializeDatabase } from './config/database';
import { env } from './config/env.config';
import transactionRoutes from './routes/transactionRoutes';
import userRoutes from './routes/userRoutes';
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('Expense Manager API is running!!');
});

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

const startServer = async () => {
  try {
    // Initialize database connection
    await initializeDatabase();
    
    app.listen(env.PORT, () => {
      console.log(`Server is running in ${env.NODE_ENV} mode`);
      console.log(`Server URL: http://localhost:${env.PORT}`);
      console.log(`Health check: http://localhost:${env.PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (error: Error) => {
  console.error('Unhandled Promise Rejection:', error);
  // Gracefully shutdown on unhandled promise rejections
  process.exit(1);
});

startServer(); 