const mongoose = require("mongoose");

const usernameSchema = mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // ref to user model
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Username", usernameSchema);
