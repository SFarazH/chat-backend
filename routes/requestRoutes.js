const express = require("express");
const { authenticate } = require("../middleware/authenticate");
const {
  sendFriendRequest,
  acceptFriendRequest,
} = require("../controller/requests");

const router = express.Router();

// Apply authentication middleware
router.post("/send", authenticate, sendFriendRequest);
router.post("/accept", authenticate, acceptFriendRequest);

module.exports = router;
