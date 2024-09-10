const friendRequestsModel = require("../models/friendRequestsModel");
const userModel = require("../models/userModel");

const sendFriendRequest = async (req, res) => {
  const { requestToUser } = req.body;
  const { _id: fromUserId } = req.user;

  try {
    // Check if the user exists
    if (!requestToUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    // 1. Check if the users are already friends
    const fromUser = await userModel.findById(fromUserId);
    const toUser = await userModel.findById(requestToUser);

    if (
      fromUser.friends.includes(requestToUser) ||
      toUser.friends.includes(fromUserId)
    ) {
      return res
        .status(400)
        .json({ message: "You are already friends with this user." });
    }

    // 2. Check if there is already a friend request from A to B or B to A
    const existingRequest = await friendRequestsModel.findOne({
      $or: [
        { fromUserId, toUserId: requestToUser },
        { fromUserId: requestToUser, toUserId: fromUserId },
      ],
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "Friend request already exists." });
    }

    // 3. Proceed to create a new friend request
    const newRequest = new friendRequestsModel({
      fromUserId,
      toUserId: requestToUser,
      status: "pending",
    });

    await newRequest.save();

    await userModel.findByIdAndUpdate(requestToUser, {
      $push: { requestsReceived: newRequest._id },
    });

    await userModel.findByIdAndUpdate(fromUserId, {
      $push: { requestsSent: newRequest._id },
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
  console.log("req",req.body)

  try {
    // Find the friend request by ID
    const friendRequest = await friendRequestsModel.findById(friendRequestId);
    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found!" });
    }

    // Ensure the current user is the one who received the request
    if (friendRequest.toUserId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized action!" });
    }

    // Update the friend request status to 'accepted'
    friendRequest.status = "accepted";
    await friendRequest.save();

    // Add the users to each other's friends list
    await userModel.findByIdAndUpdate(friendRequest.fromUserId, {
      $addToSet: { friends: userId },
    });

    await userModel.findByIdAndUpdate(friendRequest.toUserId, {
      $addToSet: { friends: friendRequest.fromUserId },
    });

    // Remove the friendRequestId from requestsReceived of the receiver
    await userModel.findByIdAndUpdate(friendRequest.toUserId, {
      $pull: { requestsReceived: friendRequestId },
    });

    // Remove the friendRequestId from requestsSent of the sender
    await userModel.findByIdAndUpdate(friendRequest.fromUserId, {
      $pull: { requestsSent: friendRequestId },
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

const rejectFriendRequest = async (req, res) => {
  const { friendRequestId } = req.body;
  const { _id: userId } = req.user;

  try {
    // Find the friend request by ID
    const friendRequest = await friendRequestsModel.findById(friendRequestId);
    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found!" });
    }

    // Ensure the current user is the one who received the request
    if (friendRequest.toUserId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized action!" });
    }

    friendRequest.status = "rejected";
    await friendRequest.save();

    await userModel.findByIdAndUpdate(friendRequest.toUserId, {
      $pull: { requestsReceived: friendRequestId },
    });

    await userModel.findByIdAndUpdate(friendRequest.fromUserId, {
      $pull: { requestsSent: friendRequestId },
    });

    return res.status(200).json({
      message: "Friend request rejected!",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getReceivedRequests = async (req, res) => {
  const { _id: userId } = req.user;

  try {
    const user = await userModel
      .findById(userId)
      .select("requestsReceived")
      .populate({
        path: "requestsReceived",
        select: "fromUserId createdAt",
        populate: {
          path: "fromUserId",
          select: "name username",
        },
      });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const receivedRequests = user.requestsReceived;

    return res.status(200).json({
      success: true,
      receivedRequests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSentRequests = async (req, res) => {
  const { _id: userId } = req.user;

  try {
    const user = await userModel
      .findById(userId)
      .select("requestsSent")
      .populate({
        path: "requestsSent",
        select: "toUserId createdAt",
        populate: {
          path: "toUserId",
          select: "name username",
        },
      });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const sentRequests = user.requestsSent;

    return res.status(200).json({
      success: true,
      sentRequests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  getReceivedRequests,
  getSentRequests,
  rejectFriendRequest
};
