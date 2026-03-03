import express from "express"
import { createUser, getUser, logUser, getAllUser, logout } from "../controllers/auth.js";
import { verify } from "../middleware/jwt_check.js";

const Auth_API = express.Router();

Auth_API.get("/get",verify,getUser);
Auth_API.get("/getAllUser",verify,getAllUser);
Auth_API.get("/logout",logout);
Auth_API.post("/create", createUser);
Auth_API.post("/log", logUser);

export default Auth_API;