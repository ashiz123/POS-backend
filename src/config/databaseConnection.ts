import mongoose from "mongoose";
import { logger } from "../middlewares/logHandler.js";
import { singleton } from "tsyringe";

@singleton()
export class Database {
  constructor() {}

  public async connect(): Promise<void> {
    // 1. Check if already connected or connecting

    if (
      mongoose.connection.readyState === 1 ||
      mongoose.connection.readyState === 2
    ) {
      logger.info("MongoDB already connected or connecting");
      return;
    }

    const isDevelopment = process.env.NODE_ENV === "development";

    if (isDevelopment) {
      mongoose.set("debug", true);
    }

    const dbUrl = process.env.DATABASE_URL || process.env.MONGO_URI;
    if (!dbUrl) {
      throw new Error(
        "Database connection URL is not defined in environment variables",
      );
    }

    console.log("Attempting to connect to MongoDB...");

    try {
      mongoose.set("debug", true);
      const connectionOptions: mongoose.ConnectOptions = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      if (isDevelopment) {
        console.log(
          "Environment: Development. Enabling directConnection for local replica set.",
        );
        (connectionOptions as any).directConnection = true;
      } else {
        console.log(
          "Environment: Production/Other. Bypassing directConnection for Atlas compatibility.",
        );
      }

      const conn = await mongoose.connect(dbUrl, connectionOptions);

      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error("Connection failed with error:", error);
      process.exit(1);
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await mongoose.connection.close();
      console.log("MongoDB Disconnected Successfully");
    } catch (error) {
      console.error("Error disconnecting from DB:", error);
      process.exit(1);
    }
  }

  public async dropAllDatabase(): Promise<void> {
    try {
      if (mongoose.connection.db) {
        await mongoose.connection.db.dropDatabase();
        console.log("Database dropped successfully");
      } else {
        console.error("No active database connection to drop");
      }
    } catch (error) {
      console.error("Error dropping databases:", error);
      process.exit(1);
    }
  }
}

export default Database;
