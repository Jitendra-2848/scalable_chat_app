import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const verify = async (req, res) => {
    try {
        const Token = req.cookies.jwt;
        if (!Token) {
            return res.status(401).json({ message: "Unauthorized person!!" })
        }
        const decoded_jwt = jwt.verify(Token, process.env.JWT_SECRET)
        console.log(decoded_jwt.userId);
        const user_data = await pool.query("select id,name,email from users where id=$1", [decoded_jwt.userId]);
        console.log(user_data.rows[0]);
        return user_data.rows[0]
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "internal server error!!" });
    }
}

export {
    verify
};