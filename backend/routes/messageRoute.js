const express = require("express");
const {
  newMessage,
  getMessages,
  deleteMessage,
  sharePost,
} = require("../controllers/messageController");
const { isAuthenticated } = require("../middlewares/auth");

const multer = require("multer");
const path = require("path");

const router = express();

const messStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(__dirname, "../../public/uploads/messages"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "_" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const messUpload = multer({
  storage: messStorage,
  limits: { fileSize: 1000000 * 2 },
});

router
  .route("/newMessage")
  .post(isAuthenticated, messUpload.array("images", 5), newMessage);
router.route("/messages/:chatId").get(isAuthenticated, getMessages);
router.route("/deleteMessage/:messId").delete(isAuthenticated, deleteMessage);
router.route("/message/share-post").post(isAuthenticated, sharePost);

module.exports = router;
