import mongoose from "mongoose";
import { ConnectOptions } from "./types";

// Global variable to cache the connection
declare global {
  // eslint-disable-next-line no-var
  var _mongoConnections: {
    [key: string]: {
      conn: typeof mongoose | null;
      promise: Promise<typeof mongoose> | null;
    };
  };
}

// Initialize the global mongoose object
global._mongoConnections = global._mongoConnections || {};

/**
 * Connect to MongoDB for Next.js applications
 * @param options Connection options (optional, will use MONGODB_URI from .env by default)
 * @returns Mongoose instance
 */
export const connectMongo = async (
  options?: ConnectOptions
): Promise<typeof mongoose> => {
  // Use MONGODB_URI from .env by default
  const uri = options?.uri || process.env.MONGODB_URI;

  if (!uri) {
    const errorMessage =
      "MongoDB URI not provided. Set MONGODB_URI in .env file or pass as parameter";
    console.error("CONNECTION ERROR:", errorMessage);
    throw new Error(errorMessage);
  }

  // Determine connection mode and key
  const isMultiDbMode = options?.multiDb || false;
  const dbKey = isMultiDbMode
    ? options?.dbName || "multi_default"
    : "single_default";

  // Check if we have an existing connection
  const existingConnection = global._mongoConnections[dbKey];

  // Single database mode (default)
  if (!isMultiDbMode) {
    // If we have an existing connection, return it
    if (existingConnection?.conn) {
      return existingConnection.conn;
    }

    // If a connection is being established, wait for it
    if (existingConnection?.promise) {
      return await existingConnection.promise;
    }
  }

  // Multiple database mode
  else if (existingConnection?.conn) {
    try {
      // Disconnect existing connection
      await existingConnection.conn.disconnect();
    } catch (error) {
      console.error(`Error disconnecting from ${dbKey}:`, error);
    }
    global._mongoConnections[dbKey] = { conn: null, promise: null };
  }

  // Recommended by Mongoose to avoid deprecation warnings
  mongoose.set("strictQuery", false);

  // Create a new connection promise
  const connectionPromise = mongoose.connect(uri, {
    dbName: options?.dbName,
  });

  // Store the connection in the global cache
  global._mongoConnections[dbKey] = {
    conn: null,
    promise: connectionPromise,
  };

  try {
    // Await the connection and store it
    const connection = await connectionPromise;
    global._mongoConnections[dbKey].conn = connection;

    console.log(`MongoDB connected successfully to database: ${dbKey}`);

    // Safely log database name
    if (connection.connection?.db) {
      console.log(
        `Actual Database Name: ${connection.connection.db.databaseName}`
      );
    }
    return connection;
  } catch (error) {
    global._mongoConnections[dbKey].promise = null;
    console.error(`MongoDB connection error for database ${dbKey}:`, error);
    throw error;
  }
};

export default connectMongo;
