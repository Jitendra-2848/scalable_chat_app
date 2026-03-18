import { createClient } from "redis";

let pubClient;
let subClient;

export const createRedis = async () => {
  pubClient = createClient({
    url: process.env.REDIS_URI,
  });

  subClient = pubClient.duplicate();

  pubClient.on("error", (err) => console.log("Redis Pub Error", err));
  subClient.on("error", (err) => console.log("Redis Sub Error", err));

  await pubClient.connect();
  await subClient.connect();

  console.log("Redis connected ✅");

  return { pubClient, subClient };
};

export const publish = async (data) => {
  if (!pubClient) throw new Error("Redis not initialized");
  await pubClient.publish("channel", JSON.stringify(data));
};

export const subscribe = async (callback) => {
  if (!subClient) throw new Error("Redis not initialized");
  await subClient.subscribe("channel", (message) => {
    callback(JSON.parse(message));
  });
};