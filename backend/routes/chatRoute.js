const express = require("express");
const {
  newChat,
  getChats,
  renameGroup,
  removeMembers,
  addMembers,
  updateAvatarGroup,
} = require("../controllers/chatController");
const { isAuthenticated } = require("../middlewares/auth");
const multer = require("multer");
const path = require("path");

const router = express();

const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(__dirname, "../../public/uploads/profiles"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "_" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  limit: { fileSize: 1000000 * 2 },
});

router.route("/newChat").post(isAuthenticated, newChat);
router.route("/chats").get(isAuthenticated, getChats);
router.route("/renameGroup").put(isAuthenticated, renameGroup);
router.route("/removeMembers").put(isAuthenticated, removeMembers);
router.route("/addMembers").put(isAuthenticated, addMembers);
router
  .route("/updateAvatarGroup")
  .put(isAuthenticated, avatarUpload.single("avatar"), updateAvatarGroup);

module.exports = router;
