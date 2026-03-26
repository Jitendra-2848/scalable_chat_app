import express from "express"
import { createUser, getUser, logUser, getAllUser, logout,getToken } from "../controllers/auth.js";
import { verify } from "../middleware/Access_Token_Check.js";
import { Check_Jwt } from "../middleware/jwt_check.js";

const Auth_API = express.Router();

Auth_API.get("/get",verify,getUser);
Auth_API.get("/getAllUser",verify,getAllUser);
Auth_API.get("/logout",verify,logout);
Auth_API.post("/create",createUser);
Auth_API.post("/log",logUser);
Auth_API.get("/refresh_token",Check_Jwt,getToken);

export default Auth_API;