import express from "express"
import { createUser, deleteUser, getUserById, getUsers, updateUser } from "../controllers/message.js";

const MESSAGE_API = express.Router();

// MESSAGE_API.get("/",sendmessage);
// MESSAGE_API.post("/get_msg",getmessage);
MESSAGE_API.get("/", getUsers);
MESSAGE_API.post("/", createUser);
MESSAGE_API.get("/:id", getUserById);
MESSAGE_API.put("/:id", updateUser);
MESSAGE_API.delete("/:id", deleteUser);

export default MESSAGE_API;