import express from "express"
import { verify } from "../middleware/jwt_check.js";
import { getMyUser, getUser } from "../controllers/user.js";

const User_API = express.Router();

User_API.post("/getUser",verify,getUser);
User_API.get("/",verify,getMyUser);
export default User_API;