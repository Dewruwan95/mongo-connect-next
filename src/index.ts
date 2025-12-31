import connectMongo from "./mongo-connect";
import { disconnectMongo, getConnectionStatus } from "./mongo-connect";

export default connectMongo;
export { connectMongo, disconnectMongo, getConnectionStatus };

export * from "./types";
