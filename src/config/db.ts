import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import fs from 'fs';
import path from 'path';

const connectDB = async (): Promise<void> => {
  const localUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dental_clinic_db';
  try {
    await mongoose.connect(localUri, { serverSelectionTimeoutMS: 3000 });
    console.log('MongoDB Connected Successfully (External/Local Server)');
  } catch (_err) {
    console.log('Local MongoDB service not detected. Starting built-in persistent MongoDB engine...');
    try {
      const dbPath = path.join(process.cwd(), 'local-mongo-data');
      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
      }
      const mongod = await MongoMemoryServer.create({
        instance: {
          dbPath,
          storageEngine: 'wiredTiger',
        },
      });
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log('MongoDB Connected Successfully (Built-in Persistent Engine)');
    } catch (memErr: any) {
      console.error('Database Initialization Error:', memErr.message);
    }
  }
};

export default connectDB;
