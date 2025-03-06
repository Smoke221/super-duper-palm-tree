import mongoose from 'mongoose';
import { env } from './env.config';

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private retryAttempts: number = 0;
  private maxRetryAttempts: number = 5;
  private retryInterval: number = 5000; // 5 seconds

  private constructor() {
    this.init();
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  private async init() {
    try {
      await this.connect();
    } catch (error) {
      console.error('Initial database connection failed:', error);
      this.handleConnectionError(error);
    }
  }

  private async connect() {
    try {
      mongoose.connection.on('connected', () => {
        console.log('MongoDB connected successfully');
        this.retryAttempts = 0; // Reset retry attempts on successful connection
      });

      mongoose.connection.on('error', (error) => {
        console.error('MongoDB connection error:', error);
        this.handleConnectionError(error);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected. Attempting to reconnect...');
        this.handleConnectionError(new Error('Disconnected from MongoDB'));
      });

      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      });

      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

    } catch (error) {
      throw error;
    }
  }

  private async handleConnectionError(error: any) {
    if (this.retryAttempts < this.maxRetryAttempts) {
      this.retryAttempts++;
      console.log(`Retrying connection... Attempt ${this.retryAttempts} of ${this.maxRetryAttempts}`);
      setTimeout(() => {
        this.connect()
          .catch(err => console.error('Retry connection failed:', err));
      }, this.retryInterval);
    } else {
      console.error('Max retry attempts reached. Database connection failed.');
      process.exit(1);
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await mongoose.connection.close();
      console.log('Database connection closed successfully');
    } catch (error) {
      console.error('Error closing database connection:', error);
      throw error;
    }
  }
}

export const initializeDatabase = () => DatabaseConnection.getInstance();
export const disconnectDatabase = async () => {
  await DatabaseConnection.getInstance().disconnect();
}; 