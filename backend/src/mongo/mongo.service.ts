import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { MongoClient, Db, ObjectId } from 'mongodb';
import * as fs from 'fs';
import * as path from 'path';

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

    await this.initializeDatabase();
  }

  getDatabase(): Db {
    if (!this.db) {
      throw new Error('Database connection is not initialized');
    }
    return this.db;
  }

  private sanitizeDocument(doc: Record<string, any>): Record<string, any> {
    const sanitizedDoc = { ...doc };

    for (const key in sanitizedDoc) {
      const value = sanitizedDoc[key];

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Nếu là object và có $oid, chuyển thành ObjectId
        if ('$oid' in value) {
          sanitizedDoc[key] = new ObjectId(value.$oid);
        }
        // Nếu là object và có $date, chuyển thành Date
        else if ('$date' in value) {
          sanitizedDoc[key] = new Date(value.$date);
        }
        // Nếu là object khác, đệ quy xử lý tiếp
        else {
          sanitizedDoc[key] = this.sanitizeDocument(value);
        }
      }

      // Nếu là mảng, kiểm tra từng phần tử
      if (Array.isArray(value)) {
        sanitizedDoc[key] = value.map((item) => {
          // Nếu phần tử là object có $oid, chuyển thành ObjectId
          if (item && typeof item === 'object' && '$oid' in item) {
            return new ObjectId(item.$oid);
          }
          // Nếu phần tử là object, đệ quy xử lý tiếp
          else if (typeof item === 'object') {
            return this.sanitizeDocument(item);
          }
          // Nếu phần tử không phải object, trả về nguyên giá trị
          return item;
        });
      }
    }

    return sanitizedDoc;
  }

  async initializeDatabase() {
    const collections = await this.db.listCollections().toArray();
    if (collections.length === 0) {
      console.log('No collections found. Seeding database...');
      const initDbPath = path.join(__dirname, '..', '..', 'initdb');
      const files = fs.readdirSync(initDbPath);

      for (const file of files) {
        if (file.endsWith('.json')) {
          const collectionName = file.replace('.json', '');
          const filePath = path.join(initDbPath, file);
          const rawData = fs.readFileSync(filePath, 'utf8');
          const data = JSON.parse(rawData);

          if (Array.isArray(data)) {
            const sanitizedData = data.map((item) =>
              this.sanitizeDocument(item),
            );
            await this.db.collection(collectionName).insertMany(sanitizedData);
            console.log(`Inserted data into collection: ${collectionName}`);
          } else {
            console.warn(`Skipping ${file}: Not an array`);
          }
        }
      }
    } else {
      console.log('Collections already exist. Skipping seeding.');
    }
  }

  async onModuleDestroy() {
    await this.client.close();
    console.log('Disconnected from MongoDB');
  }
}
