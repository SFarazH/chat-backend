const { login, register, verify } = require("../controller/auth");
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authenticate");

router.post("/login", login);
router.post("/register", register);
router.get("/verify", authenticate, verify);

module.exports = router;
