import {config} from "dotenv";
import path from "path";
config({path : "./.env"})
import express from "express";
import http from "http"
import MESSAGE_API from "./routes/message.js";
import pool from "./config/db.js"
import { Server } from "socket.io"
import Auth_API from "./routes/auth.js";
import cors from "cors"
import cookie_parser from "cookie-parser"
import User_API from "./routes/User.js";
const app = express(); 
const server = http.createServer(app);
app.use(express.json())
app.use(cookie_parser())
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))
app.use("/message",MESSAGE_API);
app.use("/auth",Auth_API);
app.use("/user",User_API);

app.get("/",async(req,res)=>{
    // res.write("Hello from server");
    // res.end();
    const result = await pool.query("SELECT current_database()") 
    return res.status(200).json(`The database name is : ${result.rows[0].current_database}`);
})

app.get("/x",async(req,res) =>{
    console.log("hello")
    const result = await pool.query("select * from chat");
    console.log(result.rows)
    return res.status(200).json(result.rows)
})

const io = new Server(server,{
    cors:{origin: "*"}
})

io.on("connection",(socket)=>{
    socket.on("message",(message)=>{
        console.log(message);
        // socket.broadcast.emit("message",message);      
    })
})


console.log(process.env.PORT)
const PORT = process.env.PORT || 8000;
server.listen(PORT,()=>{
    console.log(`listening on PORT : ${PORT}`);
})