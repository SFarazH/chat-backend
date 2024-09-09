const express = require("express");
const { authenticate } = require("../middleware/authenticate");
const {
  sendFriendRequest,
  acceptFriendRequest,
  getReceivedRequests,
} = require("../controller/requests");

const router = express.Router();

// Apply authentication middleware
router.post("/send", authenticate, sendFriendRequest);
router.post("/accept", authenticate, acceptFriendRequest);
router.get("/getRec", authenticate, getReceivedRequests);

module.exports = router;
