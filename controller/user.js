const userModel = require("../models/userModel");
const usernameModel = require("../models/usernameModel");

const getUsername = async (userId) => {
  try {
    const user = await usernameModel.findOne({ userId });
    return user ? user.username : null;
  } catch (error) {
    console.error("Error fetching username:", error);
    return null;
  }
};

const getFriends = async (req, res) => {
  try {
    const user = req.user;
    const populatedUser = await userModel
      .findById(user._id)
      .populate("friends", "name");

    if (!populatedUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    const friendsWithUsernames = await Promise.all(
      populatedUser.friends.map(async (friend) => {
        const username = await getUsername(friend._id);
        return {
          ...friend.toObject(),
          username,
        };
      })
    );

    return res.status(200).json({
      success: true,
      friends: friendsWithUsernames,
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
