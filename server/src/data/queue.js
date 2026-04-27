import { Queue } from "bullmq";
import IORedis from "ioredis";

// ✅ Single shared IORedis instance
// Plain object connection in worker.js causes BullMQ to open
// multiple internal connections per worker → hits Redis maxclients
export const sharedRedisConnection = new IORedis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,  // Required by BullMQ
  enableReadyCheck: false,      // Required by BullMQ
  lazyConnect: false,

  retryStrategy(times) {
    if (times > 20) return null;
    return Math.min(times * 100, 3000);
  },

  reconnectOnError(err) {
    const targetErrors = ["READONLY", "ECONNRESET", "ETIMEDOUT"];
    return targetErrors.some((e) => err.message.includes(e));
  },
});

sharedRedisConnection.on("connect", () =>
  console.log("✅ Queue Redis connected")
);
sharedRedisConnection.on("error", (err) =>
  console.error("❌ Queue Redis error:", err.message)
);

export const message_Queue = new Queue("message", {
  connection: sharedRedisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
});

message_Queue.on("error", (err) => {
  console.error("❌ Queue error:", err.message);
});