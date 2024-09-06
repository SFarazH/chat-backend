const friendRequestsModel = require("../models/friendRequestsModel");
const userModel = require("../models/userModel");
const sendFriendRequest = async (req, res) => {
  const { requestToUser } = req.body;
  const { _id: fromUserId } = req.user;

  try {
    if (!requestToUser) {
      return res.status(404).json({ message: "User not found!" });
    }
    const newRequest = new friendRequestsModel({
      fromUserId,
      toUserId: requestToUser,
      status: "pending",
    });
    await newRequest.save();

    await userModel.findByIdAndUpdate(requestToUser, {
      $push: { pendingRequests: newRequest._id },
    });

    return res.status(201).json({
      message: "Friend request sent!",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { sendFriendRequest };
