const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middlewares/auth"); // Đổi tên cho phù hợp với postRoute

const {
  createComment,
  getCommentsByParentId,
  deleteComment,
  updateComment,
  getAllCommentsByPost,
  likeUnlikeComment,
  getCommentCount,
  getCommentById,
} = require("../controllers/commentController");

// Tạo bình luận mới cho bài đăng
router.route("/post/:id/comment").post(isAuthenticated, createComment);

// Lấy bình luận theo parent ID
router.route("/comments/:postId/parent").get(getCommentsByParentId);

// Lấy tất cả bình luận của bài đăng
router.route("/comments/:postId").get(getAllCommentsByPost);

// Lấy số lượng bình luận của bài đăng
router.route("/comments/:postId/count").get(getCommentCount);

// Thích hoặc bỏ thích bình luận
router
  .route("/comment/:commentId/like")
  .post(isAuthenticated, likeUnlikeComment);

// Xóa bình luận
router.route("/comment/:commentId").delete(isAuthenticated, deleteComment);

// Cập nhật bình luận
router.route("/comment/:commentId").put(isAuthenticated, updateComment);
// Thêm route cho getCommentById
router.route("/comment/:id").get(getCommentById);
module.exports = router;
