const express = require("express");
const { authenticate } = require("../middleware/authenticate");
const {
  sendFriendRequest,
  acceptFriendRequest,
  getReceivedRequests,
  getSentRequests,
} = require("../controller/requests");

const router = express.Router();

// Apply authentication middleware
router.post("/send", authenticate, sendFriendRequest);
router.post("/accept", authenticate, acceptFriendRequest);
router.get("/getRec", authenticate, getReceivedRequests);
router.get("/getSent", authenticate, getSentRequests);

module.exports = router;
