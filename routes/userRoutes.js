const express = require("express");
const { authenticate } = require("../middleware/authenticate");
const { getFriends, searchUsernames } = require("../controller/user");

const router = express.Router();

router.get("/getFriends", authenticate, getFriends);
router.get("/search", authenticate, searchUsernames);

module.exports = router;
