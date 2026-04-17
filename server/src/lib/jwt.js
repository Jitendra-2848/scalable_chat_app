import jwt from "jsonwebtoken";

const generateToken = (userId, res) => {
  const token = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  if(res){
  res.cookie("jwt", token, {
  httpOnly: true,
  secure: true,        // MUST be true on production
  sameSite: "none",    // IMPORTANT for cross-site (frontend/backend)
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
}
  return token;
};

export default generateToken;
