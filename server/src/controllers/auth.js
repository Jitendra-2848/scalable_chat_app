import bcrypt from "bcrypt"
import pool from "../config/db.js";
import generateToken from "../lib/jwt.js";
import {verify} from "../middleware/jwt_check.js";
const saltround = 10
const getUser = async(req,res) => {
    try {
        console.log("hello my friend");
        const data = await verify(req,res);
        console.log(data)
        return res.status(200).json({ message: "Authorized!1",data:data});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error !!" });
    }
}
const createUser = async (req, res) => {
    try {
        const { name, email, pass } = req.body;

        if (!name || !email || !pass) {
            return res.status(400).json({ message: "All fields are required!!" });
        }

        const match = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );
        if (match.rows.length > 0) {
            return res.status(400).json({ message: "Email already exists!!" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashpass = await bcrypt.hash(pass, salt);
        const new_user = await pool.query(
            "INSERT INTO users (name, email, pass) VALUES ($1, $2, $3)",
            [name, email, hashpass]
        );
        const cookie = generateToken(new_user.rows[0].id,res);
        console.log(cookie);
        return res.status(201).json({ message: "User created successfully",data:match.rows[0]});
    } catch (error) {
        console.log("Error: " + error.message);
        return res.status(500).json({ message: "Internal Server Error !!" });
    }
};
const logUser = async(req,res)=>{
    try {
        console.log(req.body)
        const { email, pass } = req.body;
        if (!email || !pass) {
            return res.status(400).json({ message: "All fields are required!!" });
        }
        const match = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );
        console.log(match.rows[0])
        if (match.rows.length === 0) {
            return res.status(400).json({ message: "User not found!!" });
        }
        const match_pass = await bcrypt.compare(pass , match.rows[0].pass );
        console.log(match_pass)
        if(!match_pass){
            return res.status(401).json({message:"Invalid credentials !!"});
        }
        generateToken(match.rows[0].id,res);
        return res.status(200).json({message:"Logged in Successfully",data:match.rows});
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({message:"Internal server error"});
    }
}
export {
    getUser,
    createUser,
    logUser
}