import express from "express";
import http from "http";
import { Server } from "socket.io";
import { createRedis, publish, subscribe, getRedisClient } from "./redisClient.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// Map to track connected sockets
const userSocketMap = new Map();

// Redis client
let redis;

// Initialize Redis and subscribe to messages
const startRedis = async () => {
  await createRedis();
  redis = await getRedisClient();

  // Subscribe to Redis channel
  await subscribe((data) => {
    const receiverSocketId = userSocketMap.get(data.receiver_id);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("onMessage", data);
    }
  });
};

startRedis();

// Socket.IO connection
io.on("connection", (socket) => {
  // User joins
  socket.on("join", async (userId) => {
    socket.userId = userId;
    userSocketMap.set(userId, socket.id);

    // ✅ Store in Redis (convert number → string)
    await redis.sAdd("online_users", String(userId));

    // Send current online users to this socket
    const onlineUsers = await redis.sMembers("online_users");
    socket.emit("onlineUsers", onlineUsers.map(Number));

    // Notify everyone else (same event your frontend expects)
    io.emit("onlineUsers", onlineUsers.map(Number));
  });

  // Sending a message
  socket.on("message", async (message) => {
    if (!socket.userId) return;

    // ✅ Publish message via Redis
    await publish({
      ...message,
      sender_id: socket.userId,
    });

    // Emit confirmation to sender
    socket.emit("message_sent", {
      temp_id: message.id,
      receiver_id: message.receiver_id,
      conversation_id: message.conversation_id,
    });
  });

  // Message delivered
  socket.on("message_delivered", ({ message_id, sender_id }) => {
    const senderSocketId = userSocketMap.get(sender_id);
    if (senderSocketId) {
      io.to(senderSocketId).emit("message_delivered", {
        message_id,
        receiver_id: socket.userId,
      });
    }
  });

  // Message read
  socket.on("message_read", ({ message_id, sender_id }) => {
    const senderSocketId = userSocketMap.get(sender_id);
    if (senderSocketId) {
      io.to(senderSocketId).emit("message_read", {
        message_id,
        receiver_id: socket.userId,
      });
    }
  });

  // Typing indicator
  socket.on("typing", (receiverId) => {
    const receiverSocketId = userSocketMap.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("Typing", socket.userId);
    }
  });

  // User disconnects
  socket.on("disconnect", async () => {
    if (!socket.userId) return;

    userSocketMap.delete(socket.userId);
    await redis.sRem("online_users", String(socket.userId));

    // Update all clients with current online users
    const onlineUsers = await redis.sMembers("online_users");
    io.emit("onlineUsers", onlineUsers.map(Number));
  });
});

export { server, app, express };