import express from "express"
import { verify } from "../middleware/jwt_check.js";
import { getUser } from "../controllers/user.js";

const User_API = express.Router();

User_API.post("/getUser",verify,getUser);

export default User_API;