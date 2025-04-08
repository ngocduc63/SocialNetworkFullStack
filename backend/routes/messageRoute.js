const express = require("express");
const {
  newMessage,
  getMessages,
  deleteMessage,
  sharePost,
} = require("../controllers/messageController");
const { isAuthenticated } = require("../middlewares/auth");

const router = express();

router.route("/newMessage").post(isAuthenticated, newMessage);
router.route("/messages/:chatId").get(isAuthenticated, getMessages);
router.route("/deleteMessage/:messId").delete(isAuthenticated, deleteMessage);
router.route("/message/share-post").post(isAuthenticated, sharePost);
module.exports = router;
