import express from "express"
import { createUser, deleteUser, getmessage, getUserById, getUsers, oldMessages, sendmessage, updateUser } from "../controllers/message.js";
import { verify } from "../middleware/Access_Token_Check.js";
import { getMyUser } from "../controllers/user.js";

const MESSAGE_API = express.Router();

// MESSAGE_API.get("/",sendmessage);
// MESSAGE_API.post("/get_msg",getmessage);
MESSAGE_API.get("/", getUsers);
MESSAGE_API.post("/getmsg",verify, getmessage);
MESSAGE_API.post("/oldMessages",verify,oldMessages);
MESSAGE_API.post("/:id",verify, sendmessage);
MESSAGE_API.get("/:id", getUserById);
MESSAGE_API.put("/:id", updateUser);
MESSAGE_API.delete("/:id", deleteUser);

export default MESSAGE_API;