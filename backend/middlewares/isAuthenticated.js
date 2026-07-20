const jwt = require("jsonwebtoken");
require("dotenv").config();
const isAuthentictaed = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    console.log("DEBUG: Token =", token);
    console.log("DEBUG: Secret Key =", process.env.SECRET_KEY);
    if (!token) {return res.status(401) .json({ message: "user not Authenticated", success: false });}

    const decode = await jwt.verify(token, process.env.SECRET_KEY);
    if (!decode)return res.status(401).json({ message: "Invalid", success: false });
    req.id = decode.userId;
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
};
module.exports = {isAuthentictaed}
