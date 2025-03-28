const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // Người nhận thông báo
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Người gửi thông báo (người thực hiện hành động)
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Loại thông báo
    type: {
      type: String,
      enum: ["like", "comment", "follow", "mention", "tag", "reply"],
      required: true,
    },

    // Bài đăng liên quan (nếu có)
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },

    // Comment liên quan (nếu có)
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },

    // Nội dung thông báo
    text: {
      type: String,
      trim: true,
    },

    // Trạng thái đọc
    read: {
      type: Boolean,
      default: false,
    },

    // Thời gian tạo
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Index để tối ưu truy vấn
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
