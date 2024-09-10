const express = require("express");
const { authenticate } = require("../middleware/authenticate");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const {
  getFriends,
  searchUsernames,
  addProfilePicture,
  displayProfilePicture,
} = require("../controller/user");

const router = express.Router();

router.get("/getFriends", authenticate, getFriends);
router.get("/search", authenticate, searchUsernames);
router.post("/addPFP", upload.single("file"), authenticate, addProfilePicture);
router.get("/getPFP", authenticate, displayProfilePicture);

module.exports = router;
