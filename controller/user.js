const userModel = require("../models/userModel");

const getFriends = async (req, res) => {
  try {
    const user = req.user;
    const populatedUser = await userModel
      .findById(user._id)
      .populate("friends", "name username");

    if (!populatedUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    return res.status(200).json({
      success: true,
      friends: populatedUser.friends,
    });
  } catch (error) {
    console.error("Error fetching friends:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const searchUsernames = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: "Query parameter is required." });
  }

  try {
    const users = await userModel
      .find({
        $or: [
          { username: { $regex: query, $options: "i" } },
          { name: { $regex: query, $options: "i" } },
        ],
      })
      .select("username name");
    if (!users.length) {
      return res.status(404).json({ message: "No users found!" });
    }

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const addProfilePicture = async (req, res) => {
  console.log(req, "req");
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }
  const user = req.user;
  try {
    const pfp = {
      data: req.file.buffer,
      contentType: req.file.mimetype,
    };
    user.profilePicture = pfp;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "profile picutre updated",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const displayProfilePicture = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.profilePicture) {
      return res.status(404).json({ message: "Profile picture not found." });
    }
    res.setHeader("Content-Type", user.profilePicture.contentType);
    res.send(user.profilePicture.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getFriends,
  searchUsernames,
  addProfilePicture,
  displayProfilePicture,
};
