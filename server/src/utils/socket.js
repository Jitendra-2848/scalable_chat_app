import express from "express";
import http from "http";
import { Server } from "socket.io";
const app = express();
const server = http.createServer(app);
import { createRedis, publish, subscribe } from "./redisClient.js";

const start = async () => {

    await createRedis();

    await subscribe((data) => {
        const receiverSocketId = userSocketMap.get(data.receiver_id);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("onMessage", data);
        }
    });
}
start();
const io = new Server(server, {
    cors: { origin: "*" },
});



const userSocketMap = new Map();




io.on("connection", (socket) => {
    socket.on("join", (userId) => {
        userSocketMap.set(userId, socket.id);
        socket.userId = userId;
        io.emit("onlineUsers", Array.from(userSocketMap.keys()));
    });

    socket.on("message", async (message) => {
        console.log("Sender:", socket.userId);

        // ✅ publish via Redis
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
        const senderSocketId = userSocketMap.get(sender_id);
        if (senderSocketId) {
            io.to(senderSocketId).emit("message_delivered", {
                message_id,
                receiver_id: socket.userId,
            });
        }
    });

    socket.on("message_read", ({ message_id, sender_id }) => {
        const senderSocketId = userSocketMap.get(sender_id);
        if (senderSocketId) {
            io.to(senderSocketId).emit("message_read", {
                message_id,
                receiver_id: socket.userId,
            });
        }
    });

    socket.on("typing", (receiverId) => {
        const receiverSocketId = userSocketMap.get(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("Typing", socket.userId);
        }
    });

    socket.on("disconnect", () => {
        if (socket.userId) userSocketMap.delete(socket.userId);
        io.emit("onlineUsers", Array.from(userSocketMap.keys()));
    });
});

export {
    server,app,express
}