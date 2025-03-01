import mongoose from "mongoose";
import { ConnectOptions } from "./types";

// Global variable to cache the connection
declare global {
  var _mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

// Initialize the global mongoose object
global._mongoose = global._mongoose || { conn: null, promise: null };

/**
 * Connect to MongoDB for Next.js applications
 * @param options Connection options (optional, will use MONGODB_URI from .env by default)
 * @returns Mongoose instance
 */
export const connectMongo = async (
  options?: ConnectOptions
): Promise<typeof mongoose> => {
  // If we have an existing connection, return it
  if (global._mongoose.conn) {
    return global._mongoose.conn;
  }

  // If a connection is being established, wait for it
  if (global._mongoose.promise) {
    return await global._mongoose.promise;
  }

  const uri = options?.uri || process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MongoDB URI not provided. Set MONGODB_URI in .env file or pass as parameter"
    );
  }

  // Recommended by Mongoose to avoid deprecation warnings
  mongoose.set("strictQuery", false);

  // Create a new connection promise
  global._mongoose.promise = mongoose.connect(uri, {
    dbName: options?.dbName,
    useNewUrlParser: true, // Avoids deprecation warning
    useUnifiedTopology: true, // Ensures stable connection pooling
  } as any); // Casting to `any` to avoid TS complaints

  try {
    // Store the connection in the global cache
    global._mongoose.conn = await global._mongoose.promise;
    console.log("MongoDB connected successfully");
    return global._mongoose.conn;
  } catch (error) {
    global._mongoose.promise = null;
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

export default connectMongo;
