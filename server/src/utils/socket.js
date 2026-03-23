import express from "express";
import http from "http";
import { Server } from "socket.io";
import { createRedis, publish, subscribe, getRedisClient } from "./redisClient.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

const userSocketMap = new Map();

let redis;

const addUserSocket = (userId, socketId) => {
  if (!userSocketMap.has(userId)) {
    userSocketMap.set(userId, new Set());
  }
  userSocketMap.get(userId).add(socketId);
};

const removeUserSocket = (userId, socketId) => {
  const sockets = userSocketMap.get(userId);
  if (!sockets) return true;
  sockets.delete(socketId);
  if (sockets.size === 0) {
    userSocketMap.delete(userId);
    return true;
  }
  return false;
};

const broadcastOnlineUsers = async () => {
  const onlineUsers = await redis.sMembers("online_users");
  io.emit("onlineUsers", onlineUsers.map(Number));
};

// Initialize everything
const initSocket = async () => {
  // 1. Connect Redis FIRST
  await createRedis();
  redis = await getRedisClient();

  if (!redis) {
    throw new Error("Redis client failed to initialize!");
  }

  console.log("✅ Redis connected");

  // 2. Clear stale online users from previous crash
  await redis.del("online_users");

  // 3. Subscribe to Redis channel
  await subscribe((data) => {
    const receiverId = Number(data.receiver_id);
    const socketIds = userSocketMap.get(receiverId);
    if (socketIds) {
      socketIds.forEach((sid) => {
        io.to(sid).emit("onMessage", data);
      });
    }
  });

  console.log("✅ Redis subscribed");

  // 4. NOW set up socket handlers (Redis is guaranteed ready)
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join", async (rawUserId) => {
      const userId = Number(rawUserId);
      if (isNaN(userId)) return;

      socket.userId = userId;
      addUserSocket(userId, socket.id);

      await redis.sAdd("online_users", String(userId));
      console.log(`User ${userId} joined`);

      await broadcastOnlineUsers();
    });

    socket.on("message", async (message) => {
      if (socket.userId == null) return;

      await publish({
        ...message,
        sender_id: socket.userId,
      });

      socket.emit("message_sent", {
        temp_id: message.id,
        receiver_id: message.receiver_id,
        conversation_id: message.conversation_id,
      });
    });

    socket.on("message_delivered", ({ message_id, sender_id }) => {
      const senderSockets = userSocketMap.get(Number(sender_id));
      if (senderSockets) {
        senderSockets.forEach((sid) => {
          io.to(sid).emit("message_delivered", {
            message_id,
            receiver_id: socket.userId,
          });
        });
      }
    });

    socket.on("message_read", ({ message_id, sender_id }) => {
      const senderSockets = userSocketMap.get(Number(sender_id));
      if (senderSockets) {
        senderSockets.forEach((sid) => {
          io.to(sid).emit("message_read", {
            message_id,
            receiver_id: socket.userId,
          });
        });
      }
    });

    socket.on("typing", (receiverId) => {
      const receiverSockets = userSocketMap.get(Number(receiverId));
      if (receiverSockets) {
        receiverSockets.forEach((sid) => {
          io.to(sid).emit("Typing", socket.userId);
        });
      }
    });

    socket.on("disconnect", async () => {
      if (socket.userId == null) return;

      const userId = socket.userId;
      const fullyOffline = removeUserSocket(userId, socket.id);

      if (fullyOffline) {
        await redis.sRem("online_users", String(userId));
        console.log(`User ${userId} offline`);
      }

      await broadcastOnlineUsers();
    });
  });

  console.log("✅ Socket handlers ready");
};

// Call it and catch errors
initSocket().catch((err) => {
  console.error("❌ Failed to initialize:", err);
  process.exit(1);
});

export { server, app, express };