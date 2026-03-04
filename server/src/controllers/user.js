import pool from "../config/db.js";

const getUser = async (req, res) => {
    try {
        console.log(req.body);
        const { search } = req.body;
        const result = await pool.query("select * from users where email ~* $1 AND id <> $2", ['^' + search, req.user.id]);
        const data = result.rows;
        return res.status(200).json({ message: "search successfull", data: data });
        // const {} = req.body;
    } catch (error) {
        console.log(error);
        return res.status(500).json({ messgae: "internal server error" });
    }
}
const getMyUser = async (req, res) => {
    try {
        const users = await pool.query(
            `
      SELECT * FROM messages
      WHERE 
      (sender_id = $1)
      OR
      (receiver_id = $1)
      `,
        [req.user.id]
        );
        console.log(users.rows);
        return res.status(200).json({message:"Your user find",data:users.rows});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ messgae: "internal server error" });
    }
}

export {
    getUser,
    getMyUser
}