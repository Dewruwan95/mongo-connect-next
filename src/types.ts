export interface ConnectOptions {
  /** MongoDB connection URI */
  uri?: string;

  /** Database name to connect to */
  dbName?: string;

  /** Enable multi-database mode (disconnects existing connections) */
  multiDb?: boolean;

  /** Additional Mongoose connection options */
  mongooseOptions?: {
    /** Maximum number of sockets the MongoDB driver will keep open */
    maxPoolSize?: number;

    /** Server selection timeout in milliseconds */
    serverSelectionTimeoutMS?: number;

    /** Socket timeout in milliseconds */
    socketTimeoutMS?: number;

    /** TLS/SSL options */
    tls?: boolean;
    tlsCAFile?: string;
    tlsCertificateKeyFile?: string;
  };
}

export interface ConnectionStatus {
  /** Whether the connection is established */
  connected: boolean;

  /** Whether a connection is being established */
  connecting: boolean;

  /** Database key for this connection */
  key?: string;

  /** Error message if connection failed */
  error?: string;
}
