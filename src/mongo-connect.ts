import mongoose, { Mongoose } from "mongoose";
import { ConnectOptions } from "./types";

// Global variable to cache the connection
declare global {
  // eslint-disable-next-line no-var
  var _mongoConnections: Map<
    string,
    {
      conn: Mongoose | null;
      promise: Promise<Mongoose> | null;
    }
  >;
}

// Initialize the global mongoose object
global._mongoConnections = global._mongoConnections || new Map();

/**
 * Connect to MongoDB for Next.js 16+ applications
 * @param options Connection options (optional, will use MONGODB_URI from .env by default)
 * @returns Mongoose instance
 */
export const connectMongo = async (
  options?: ConnectOptions
): Promise<Mongoose> => {
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
  const existingConnection = global._mongoConnections.get(dbKey);

  // Single database mode (default) - reuse connection
  if (!isMultiDbMode && existingConnection?.conn) {
    return existingConnection.conn;
  }

  // If a connection is being established, wait for it
  if (!isMultiDbMode && existingConnection?.promise) {
    return await existingConnection.promise;
  }

  // Multiple database mode - disconnect existing connection if it exists
  if (isMultiDbMode && existingConnection?.conn) {
    try {
      await existingConnection.conn.disconnect();
    } catch (error) {
      console.error(`Error disconnecting from ${dbKey}:`, error);
    }
    global._mongoConnections.set(dbKey, { conn: null, promise: null });
  }

  // Mongoose 9.x configuration
  const mongooseOptions: mongoose.ConnectOptions = {
    dbName: options?.dbName,
    // Recommended configurations for production
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4, // Use IPv4, skip trying IPv6
    // Enable these for better performance
    bufferCommands: false,
    // Disable deprecated features
    autoIndex: true,
  };

  // Create a new connection promise
  const connectionPromise = mongoose.connect(uri, mongooseOptions);

  // Store the connection in the global cache
  global._mongoConnections.set(dbKey, {
    conn: null,
    promise: connectionPromise,
  });

  try {
    // Await the connection and store it
    const connection = await connectionPromise;
    global._mongoConnections.set(dbKey, {
      conn: connection,
      promise: null,
    });

    console.log(`MongoDB connected successfully to database: ${dbKey}`);

    // Log actual database name
    if (connection.connection?.db) {
      console.log(
        `Actual Database Name: ${connection.connection.db.databaseName}`
      );
    }

    // Handle connection events
    connection.connection.on("error", (err) => {
      console.error(`MongoDB connection error for ${dbKey}:`, err);
    });

    connection.connection.on("disconnected", () => {
      console.log(`MongoDB disconnected from ${dbKey}`);
      global._mongoConnections.set(dbKey, { conn: null, promise: null });
    });

    return connection;
  } catch (error) {
    // Clean up failed connection
    global._mongoConnections.set(dbKey, { conn: null, promise: null });
    console.error(`MongoDB connection error for database ${dbKey}:`, error);

    // Re-throw with more context
    throw new Error(
      `Failed to connect to MongoDB for ${dbKey}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

/**
 * Utility function to disconnect from MongoDB
 * @param dbKey Optional database key to disconnect from (if not provided, disconnects all)
 */
export const disconnectMongo = async (dbKey?: string): Promise<void> => {
  if (dbKey) {
    const connection = global._mongoConnections.get(dbKey);
    if (connection?.conn) {
      await connection.conn.disconnect();
      global._mongoConnections.delete(dbKey);
      console.log(`Disconnected from MongoDB: ${dbKey}`);
    }
  } else {
    // Disconnect all connections
    const disconnectPromises = Array.from(global._mongoConnections.entries())
      .filter(([, connection]) => connection?.conn)
      .map(async ([key, connection]) => {
        if (connection.conn) {
          await connection.conn.disconnect();
          console.log(`Disconnected from MongoDB: ${key}`);
        }
      });

    await Promise.all(disconnectPromises);
    global._mongoConnections.clear();
  }
};

/**
 * Get current connection status
 * @param dbKey Optional database key to check
 * @returns Connection status
 */
export const getConnectionStatus = (
  dbKey?: string
): {
  connected: boolean;
  connecting: boolean;
  key?: string;
} => {
  if (dbKey) {
    const connection = global._mongoConnections.get(dbKey);
    return {
      connected: !!connection?.conn,
      connecting: !!connection?.promise,
      key: dbKey,
    };
  }

  // Return overall status
  const connections = Array.from(global._mongoConnections.entries());
  const connected = connections.some(([, conn]) => conn.conn);
  const connecting = connections.some(([, conn]) => conn.promise);

  return {
    connected,
    connecting,
  };
};

export default connectMongo;
