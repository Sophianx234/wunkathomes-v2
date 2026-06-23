import mongoose from "mongoose";

// Define the global type to prevent TypeScript errors
declare global {
  var mongoose: { conn: any; promise: any } | undefined;
}

const DATABASE_URL = process.env.DATABASE_URL?.replace('<db_password>', process.env.DATABASE_PASSWORD || '').replace('<db_username>', process.env.DATABASE_USERNAME || '');

if (!DATABASE_URL) {
  throw new Error("Please define the DATABASE_URL environment variable.");
}

// Check the global cache
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectToDatabase = async () => {
  // If connection exists, reuse it
  if (cached.conn) {
    return cached.conn;
  }

  // If no promise exists, create one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(DATABASE_URL!, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  // Await the promise and cache the connection
  cached.conn = await cached.promise;
  return cached.conn;
};
