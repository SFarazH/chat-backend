const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // for postman
  // const token = req.cookies.accessToken; // for website

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    const user = await userModel.findById(decodedToken.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error during token verification:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { authenticate };
