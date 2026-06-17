import { ConnectionOptions, Queue } from "bullmq";
import { redisConnect } from "../config/ioRedisConnection";

export const stockQueue = new Queue("stockUpdates", {
  connection: redisConnect as unknown as ConnectionOptions,
});
