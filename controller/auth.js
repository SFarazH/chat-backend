const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const usernameModel = require("../models/usernameModel");

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
    const verifyUsername = await usernameModel.findOne({ username });
    if (verifyUsername) {
      return res.status(409).json({ message: "Username already taken!" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user in userModel
    const user = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    // Save the new user in the database
    const savedUser = await user.save();

    // Save the username only if user registration is successful
    const newUsername = new usernameModel({
      username,
      userId: savedUser._id,
    });

    await newUsername.save();

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
      sameSite: "None",
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

module.exports = {
  login,
  register,
};
