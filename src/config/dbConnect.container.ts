import { container } from "tsyringe";
import { TOKENS } from "./tokens.js";
import mongoose from "mongoose";
import Database from "./databaseConnection.js";

container.register(TOKENS.DATABASE_CONNECTION, {
  useFactory: () => mongoose.connection,
});

const db = container.resolve(Database);

async function initDatabase() {
  try {
    await db.connect();
    console.log("Db container is connected");
  } catch (error) {
    console.error("Failed to connect", error);
  }
}

initDatabase();

console.log("db container is connected and ready");
