import mongoose from 'mongoose';
import { config } from '@config/dotenv';

const DATABASE_URL = config.databaseUrl;

class MongoClient {
  static instance: MongoClient;
  private _connection: typeof mongoose | null = null;

  private constructor() {
    // Private constructor to enforce singleton
  }

  static getInstance(): MongoClient {
    if (!MongoClient.instance) {
      MongoClient.instance = new MongoClient();
    }
    return MongoClient.instance;
  }

  async connect(): Promise<typeof mongoose> {
    try {
      if (!this._connection) {
        mongoose.set('strictQuery', true);
        
        this._connection = await mongoose.connect(DATABASE_URL);
        
        mongoose.connection.on('connected', () => {
          console.log('MongoDB connection established successfully');
        });
        
        mongoose.connection.on('error', (err) => {
          console.error('MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
          console.log('MongoDB connection disconnected');
        });

        // Handle application termination
        process.on('SIGINT', async () => {
          await this.disconnect();
          process.exit(0);
        });
      }

      return this._connection;
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this._connection) {
      await mongoose.disconnect();
      this._connection = null;
      console.log('MongoDB connection closed');
    }
  }

  getConnection(): typeof mongoose {
    if (!this._connection) {
      throw new Error('MongoDB connection not established. Call connect() first.');
    }
    return this._connection;
  }
}

export default MongoClient;
