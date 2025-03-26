const express = require("express");
const {
  newChat,
  getChats,
  renameGroup,
  removeMembers,
  addMembers,
} = require("../controllers/chatController");
const { isAuthenticated } = require("../middlewares/auth");

const router = express();

router.route("/newChat").post(isAuthenticated, newChat);
router.route("/chats").get(isAuthenticated, getChats);
router.route("/renameGroup").post(isAuthenticated, renameGroup);
router.route("/removeMembers").post(isAuthenticated, removeMembers);
router.route("/addMembers").post(isAuthenticated, addMembers);

module.exports = router;
