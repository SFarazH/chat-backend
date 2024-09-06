const express = require("express");
const { authenticate } = require("../middleware/authenticate");
const { getFriends } = require("../controller/user");

const router = express.Router();

router.get("/getFriends", authenticate, getFriends);

module.exports = router;
