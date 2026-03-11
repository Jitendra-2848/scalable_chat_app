import { config } from "dotenv";
config({ path: "./.env" });
import express from "express";
import http from "http";
import MESSAGE_API from "./routes/message.js";
import pool from "./config/db.js";
import { Server } from "socket.io";
import Auth_API from "./routes/auth.js";
import cors from "cors";
import cookie_parser from "cookie-parser";
import User_API from "./routes/User.js";

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cookie_parser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/message", MESSAGE_API);
app.use("/auth", Auth_API);
app.use("/user", User_API);

app.get("/", async (req, res) => {
  const result = await pool.query("SELECT current_database()");
  return res
    .status(200)
    .json(`The database name is : ${result.rows[0].current_database}`);
});

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

  socket.on("message", (message) => {
    socket.emit("message_sent", {
      temp_id: message.id,
      receiver_id: message.receiver_id,
      conversation_id: message.conversation_id,
    });

    const receiverSocketId = userSocketMap.get(message.receiver_id);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("onMessage", message);
    }
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

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`listening on PORT : ${PORT}`);
});