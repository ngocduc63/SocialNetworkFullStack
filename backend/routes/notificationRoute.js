const express = require("express");
const { isAuthenticated } = require("../middlewares/auth");
const {
  getUserNotifications,
  getRecentNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllReadNotifications,
  getUnreadCount,
} = require("../controllers/notificationController");

const router = express.Router();

// Bảo vệ tất cả các routes với middleware xác thực
router.use(isAuthenticated);

// Route lấy danh sách thông báo
router.route("/notifications").get(getUserNotifications);

// Route lấy các thông báo gần đây
router.route("/notifications/recent").get(getRecentNotifications);

// Route lấy số lượng thông báo chưa đọc
router.route("/notifications/unread/count").get(getUnreadCount);

// Route đánh dấu đã đọc một thông báo
router.route("/notification/:id/mark-read").put(markAsRead);

// Route đánh dấu tất cả thông báo đã đọc
router.route("/notifications/mark-all-read").put(markAllAsRead);

// Route xóa một thông báo
router.route("/notification/:id").delete(deleteNotification);

// Route xóa tất cả thông báo đã đọc
router.route("/notifications/delete-read").delete(deleteAllReadNotifications);

module.exports = router;
