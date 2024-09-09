const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const register = async (req, res) => {
  const { name, email, password, username } = req.body;

  // Check if all fields are provided
  if (!name || !email || !password || !username) {
    return res.status(400).json({ message: "Enter all the details!" });
  }

  try {
    // Check if email is already registered
    const verifyEmail = await userModel.findOne({ email });
    if (verifyEmail) {
      return res.status(403).json({ message: "Email already registered!" });
    }

    // Check if username is already taken
    const verifyUsername = await userModel.findOne({ username });
    if (verifyUsername) {
      return res.status(409).json({ message: "Username already taken!" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user in userModel
    const user = new userModel({
      name,
      email,
      username,
      password: hashedPassword,
    });

    await user.save();

    return res.status(201).json({
      message: "User registered successfully!",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Please enter email and password!" });
  }

  try {
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ message: "Email not registered" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Incorrect Password" });
    }

    const jwtToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "1d",
      }
    );

    res.cookie("accessToken", jwtToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: true, // for production
      maxAge: 4 * 60 * 60 * 1000,
      path: "/",
    });
    res.header("Access-Control-Allow-Credentials", "true");
    console.log("cookie sent", jwtToken);

    return res.status(200).json({
      message: "logged in",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const verify = async (req, res) => {
  const user = req.user;
  const userData = {
    name: user.name,
    email: user.email,
    username: user.username,
  };
  res.status(200).json(userData);
};

const logout = async (req, res) => {
  try {
    // Clear the access token cookie by setting it to expire in the past
    res.clearCookie("accessToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: true, // Set to true if using HTTPS
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  login,
  register,
  logout,
  verify,
};
