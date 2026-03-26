import jwt from "jsonwebtoken";

const generateAccessToken = (id, res) => {
  const token = jwt.sign(
    { id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  return token;
};

export default generateAccessToken;
