import { Worker } from "bullmq";
import pool from "../config/db.js";

const connection = {
  host: "127.0.0.1",
  port: 6379,
  password: "yourpassword",
};

const message_Db = async (data) => {
  const { sender_id, message, conversation_id } = data;

  if (!message || !message.trim()) {
    console.error("Empty message, skipping");
    return;
  }

  if (!sender_id || !conversation_id) {
    console.error("Missing sender_id or conversation_id:", data);
    return;
  }

  await pool.query(
    "INSERT INTO messages (sender_id, message, seen, status, deleted, conversation_id) VALUES ($1, $2, $3, $4, $5, $6)",
    [sender_id, message.trim(), false, "delivered", false, conversation_id]
  );
};

const worker = new Worker(
  "message",
  async (job) => {
    await message_Db(job.data);
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

export default worker;