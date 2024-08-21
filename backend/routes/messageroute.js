const express = require("express");
const router = express.Router();

const {
  sendMessage,
  getMessage,
  deleteMessage,
} = require("../controllers/messagecontroller");

const { isAuthentictaed } = require("../middlewares/isAuthenticated");

router.post("/send/:id", isAuthentictaed, sendMessage);

router.get("/all/:id", isAuthentictaed, getMessage);
router.get("/all/:id", isAuthentictaed, getMessage);
router.post("/delete", deleteMessage);

module.exports = router;
