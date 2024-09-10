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
    // Use a case-insensitive regular expression to find matching usernames
    const users = await userModel
      .find({
        $or: [
          { username: { $regex: query, $options: "i" } }, // Search in the username field
          { name: { $regex: query, $options: "i" } }, // Search in the name field
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

module.exports = { getFriends, searchUsernames };
