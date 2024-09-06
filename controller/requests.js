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

const acceptFriendRequest = async (req, res) => {
  const { friendRequestId } = req.body;
  const { _id: userId } = req.user;

  try {
    const friendRequest = await friendRequestsModel.findById(friendRequestId);
    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found!" });
    }
    if (friendRequest.toUserId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized action!" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    await userModel.findByIdAndUpdate(friendRequest.fromUserId, {
      $addToSet: { friends: userId },
    });

    await userModel.findByIdAndUpdate(friendRequest.toUserId, {
      $addToSet: { friends: friendRequest.fromUserId },
    });

    await userModel.findByIdAndUpdate(friendRequest.toUserId, {
      $pull: { pendingRequests: friendRequestId },
    });
    return res.status(200).json({
      message: "Friend request accepted!",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { sendFriendRequest, acceptFriendRequest };
