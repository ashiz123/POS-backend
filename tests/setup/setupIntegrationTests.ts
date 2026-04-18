import "reflect-metadata";
import "../../src/config/container.js";
import { Redis } from "ioredis";
import { beforeAll, afterAll } from "vitest";
import Database from "../../src/config/databaseConnection.js";

import { container } from "tsyringe";
import { TOKENS } from "../../src/config/tokens.js";

let redisInstance: Redis;
const db = container.resolve(Database);

beforeAll(async () => {
  // container.registerInstance(TOKENS.REDIS_CONNECT, redisInstance)
  console.log(process.env.MONGODB_URL);

  redisInstance = container.resolve<Redis>(TOKENS.REDIS_CONNECT);
  await db.connect();
  await db.dropAllDatabase();

  if (redisInstance.status !== "ready") {
    await new Promise((resolve) => redisInstance.once("ready", resolve));
  }
});

afterAll(async () => {
  console.log("🏁 cleanup triggered");
  await db.dropAllDatabase();
  await db.disconnect();

  // 4. Use the correct variable name and status check
  if (redisInstance && redisInstance.status !== "end") {
    await redisInstance.quit();
    console.log("🔌 Redis Disconnected Successfully");
  }
});
