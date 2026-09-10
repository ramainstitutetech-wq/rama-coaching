import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: ReturnType<typeof mongoose.connect> | null;
}

declare global {
  var mongoose: MongooseCache;
}

let cached: MongooseCache = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn && mongoose.connection.readyState === 1) return cached.conn;

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing from .env");
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      family: 4,
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((m) => {
      cached.conn = m;
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export async function syncIndexes(): Promise<void> {
  const models = Object.values(mongoose.connection.models) as mongoose.Model<unknown>[];
  await Promise.all(models.map((m) => m.createIndexes()));
}
