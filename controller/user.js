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

module.exports = { getFriends };
