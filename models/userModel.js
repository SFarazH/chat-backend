const mongoose = require("mongoose");
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    username: {
      type: String,
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    requestsReceived: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FriendReqs",
      },
    ],
    requestsSent: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FriendReqs",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
