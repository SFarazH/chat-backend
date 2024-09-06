const express = require("express");
const { authenticate } = require("../middleware/authenticate");
const { sendFriendRequest } = require("../controller/requests");

const router = express.Router();

// Apply authentication middleware
router.post("/sendRequest", authenticate, sendFriendRequest);

module.exports = router;
