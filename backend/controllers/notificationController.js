const Notification = require("../models/notificationModel");
const catchAsync = require("../middlewares/catchAsync");
const ErrorHandler = require("../utils/errorHandler");

// Create Notification
exports.createNotification = catchAsync(async (req, res, next) => {
  // Kiểm tra các trường bắt buộc
  if (!req.body.recipient || !req.body.type) {
    return next(
      new ErrorHandler("Thiếu thông tin cần thiết cho thông báo", 400),
    );
  }

  // Tạo object notification dựa trên model của bạn
  const notificationData = {
    recipient: req.body.recipient,
    sender: req.user._id,
    type: req.body.type,
    text: req.body.text || req.body.content, // Hỗ trợ cả hai trường
    post: req.body.post || req.body.reference || null,
    comment: req.body.comment || null,
    read: false,
  };

  try {
    // Tạo thông báo
    const notification = await Notification.create(notificationData);

    // Populate thông tin người gửi
    await notification.populate("sender", "username avatar");

    // Gửi thông báo real-time qua Socket.IO
    if (req.app && req.app.get("io")) {
      const io = req.app.get("io");
      const userSockets = req.app.get("userSockets") || {};

      // Tìm socket của người nhận thông báo
      const recipientSocketId = userSockets[notification.recipient.toString()];

      // Nếu người nhận đang online, gửi thông báo ngay lập tức
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("newNotification", notification);
        console.log(
          "Đã gửi thông báo theo thời gian thực đến:",
          notification.recipient,
        );
      }
    }

    return res.status(201).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Lỗi khi tạo thông báo:", error.message);
    return next(new ErrorHandler("Không thể tạo thông báo", 500));
  }
});

// Get Recent Notifications
exports.getRecentNotifications = catchAsync(async (req, res, next) => {
  console.log("User requesting notifications:", req.user?._id);

  const notifications = await Notification.find({
    recipient: req.user._id,
  })
    .populate("sender", "username avatar")
    .populate("post", "image") // Populate post nếu cần
    .populate("comment", "comment_content") // Populate comment nếu cần
    .sort({ createdAt: -1 })
    .limit(10);

  res.status(200).json({
    success: true,
    notifications,
  });
});

// Helper function để tạo thông báo từ controllers khác
exports.createNotificationHelper = async (req, notificationData) => {
  try {
    console.log(
      "createNotificationHelper được gọi với data:",
      notificationData,
    );

    // Đảm bảo dữ liệu phù hợp với model
    const data = {
      recipient: notificationData.recipient,
      sender: notificationData.sender,
      type: notificationData.type,
      text: notificationData.text || notificationData.content,
      post: notificationData.post || notificationData.reference || null,
      comment: notificationData.comment || null,
      read: false,
    };

    // Kiểm tra dữ liệu đầu vào
    if (!data.recipient || !data.sender || !data.type) {
      console.error("Thiếu các trường bắt buộc:", data);
      throw new Error("Missing required notification fields");
    }

    // Tạo thông báo trong database
    const notification = await Notification.create(data);
    console.log("Thông báo đã được tạo với ID:", notification._id);

    // Populate thông tin người gửi
    await notification.populate("sender", "username avatar");

    // Gửi thông báo qua Socket.IO
    if (req && req.app) {
      const io = req.app.get("io");
      const userSockets = req.app.get("userSockets") || {};

      console.log("Socket IO khả dụng:", !!io);
      console.log("Mảng userSockets khả dụng:", !!userSockets);

      if (io && userSockets) {
        // Tìm socket của người nhận
        const recipientSocketId =
          userSockets[notification.recipient.toString()];

        console.log("Socket ID của người nhận:", recipientSocketId);

        if (recipientSocketId) {
          console.log("Gửi thông báo đến socket:", recipientSocketId);
          io.to(recipientSocketId).emit("newNotification", notification);
        } else {
          console.log("Người nhận không online");
        }
      }
    }

    return notification;
  } catch (error) {
    console.error("Lỗi trong createNotificationHelper:", error.message);
    console.error("Stack lỗi:", error.stack);
    return null;
  }
};

// Get User's Notifications
exports.getUserNotifications = catchAsync(async (req, res, next) => {
  const currentPage = Number(req.query.page) || 1;
  const limit = 10;
  const skip = limit * (currentPage - 1);

  const totalNotifications = await Notification.find({
    recipient: req.user._id,
  }).countDocuments();

  const notifications = await Notification.find({
    recipient: req.user._id,
  })
    .populate("sender", "username avatar")
    .populate("post", "image")
    .populate("comment", "comment_content")
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  return res.status(200).json({
    success: true,
    notifications,
    totalNotifications,
  });
});

// Mark as Read
exports.markAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new ErrorHandler("Notification Not Found", 404));
  }

  if (notification.recipient.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Unauthorized", 401));
  }

  notification.read = true; // Sử dụng trường read thay vì isRead
  await notification.save();

  res.status(200).json({
    success: true,
    message: "Notification marked as read",
  });
});

// Mark All as Read
exports.markAllAsRead = catchAsync(async (req, res, next) => {
  await Notification.updateMany(
    {
      recipient: req.user._id,
      read: false, // Sử dụng trường read thay vì isRead
    },
    { read: true },
  );

  res.status(200).json({
    success: true,
    message: "All notifications marked as read",
  });
});

// Delete Notification
exports.deleteNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new ErrorHandler("Notification Not Found", 404));
  }

  if (notification.recipient.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Unauthorized", 401));
  }

  await notification.deleteOne();

  res.status(200).json({
    success: true,
    message: "Notification Deleted",
  });
});

// Get Unread Count
exports.getUnreadCount = catchAsync(async (req, res, next) => {
  const count = await Notification.countDocuments({
    recipient: req.user._id,
    read: false, // Sử dụng trường read thay vì isRead
  });

  res.status(200).json({
    success: true,
    unreadCount: count,
  });
});

// Delete All Read Notifications
exports.deleteAllReadNotifications = catchAsync(async (req, res, next) => {
  await Notification.deleteMany({
    recipient: req.user._id,
    read: true, // Sử dụng trường read thay vì isRead
  });

  res.status(200).json({
    success: true,
    message: "All read notifications deleted",
  });
});
