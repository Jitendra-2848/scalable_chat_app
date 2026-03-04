import express from "express"
import { createUser, deleteUser, getUserById, getUsers, sendmessage, updateUser } from "../controllers/message.js";
import { verify } from "../middleware/jwt_check.js";
import { getMyUser } from "../controllers/user.js";

const MESSAGE_API = express.Router();

// MESSAGE_API.get("/",sendmessage);
// MESSAGE_API.post("/get_msg",getmessage);
MESSAGE_API.get("/", getUsers);
MESSAGE_API.post("/:id",verify, sendmessage);
MESSAGE_API.get("/:id", getUserById);
MESSAGE_API.put("/:id", updateUser);
MESSAGE_API.delete("/:id", deleteUser);

export default MESSAGE_API;