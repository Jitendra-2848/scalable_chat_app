import express from "express"
import { createUser, getUser, logUser } from "../controllers/auth.js";

const Auth_API = express.Router();

Auth_API.get("/get", getUser);
Auth_API.post("/create", createUser);
Auth_API.post("/log", logUser);

export default Auth_API;