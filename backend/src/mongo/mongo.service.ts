import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { MongoClient, Db } from 'mongodb';

@Injectable()
export class MongoService implements OnModuleInit, OnModuleDestroy {
  private client: MongoClient;
  private db: Db;

  async onModuleInit() {
    const uri = process.env.MONGO_URI;
    const dbName = process.env.MONGO_DB_NAME;

    this.client = new MongoClient(uri);
    await this.client.connect();
    this.db = this.client.db(dbName);
    console.log(`Connected to MongoDB: ${dbName}`);
  }

  getDatabase(): Db {
    if (!this.db) {
      throw new Error('Database connection is not initialized');
    }
    return this.db;
  }

  async onModuleDestroy() {
    await this.client.close();
    console.log('Disconnected from MongoDB');
  }
}
