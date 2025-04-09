const catchAsync = require("../middlewares/catchAsync");
const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const Post = require("../models/postModel");
const ErrorHandler = require("../utils/errorHandler");

// Send New Message
exports.newMessage = catchAsync(async (req, res, next) => {
  const { chatId, content, idReply = null } = req.body;

  const replyContent = idReply ? JSON.parse(idReply) : null;

  const images =
    req.files && req.files.length > 0
      ? req.files.map((file) => file.filename)
      : [];
  if (images.length > 0) {
    const message = await Message.create({
      content: `Đã gửi ${images.length} ảnh`,
      chatId,
      sender: req.user._id,
      images,
      type: "image",
      idReply: replyContent?._id ?? null,
    });
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    const rsMess = {
      ...message.toObject(),
      idReply: replyContent
        ? { _id: replyContent._id, content: replyContent.content }
        : null,
    };

    return res.status(200).json({
      success: true,
      newMessage: rsMess,
    });
  }

  const msgData = {
    sender: req.user._id,
    chatId,
    content,
    idReply: replyContent?._id ?? null,
  };

  const newMessage = await Message.create(msgData);
  await Chat.findByIdAndUpdate(chatId, { latestMessage: newMessage });

  const rsMess = {
    ...newMessage.toObject(),
    idReply: replyContent
      ? { _id: replyContent._id, content: replyContent.content }
      : null,
  };

  return res.status(200).json({
    success: true,
    newMessage: rsMess,
  });
});

exports.deleteMessage = catchAsync(async (req, res, next) => {
  const { messId } = req.params;

  const message = await Message.findById(messId);
  if (!message) {
    return res.status(404).json({
      success: false,
      message: "Tin nhắn không tồn tại",
    });
  }

  message.content = "Tin nhắn đã bị xóa";
  message.isDelete = true;
  await message.save();

  res.status(200).json({
    success: true,
    message: "Xóa thành công",
  });
});

// Get All Messages
exports.getMessages = catchAsync(async (req, res, next) => {
  const messages = await Message.find({
    chatId: req.params.chatId,
  }).populate("idReply", "content");

  res.status(200).json({
    success: true,
    messages,
  });
});

exports.sharePost = catchAsync(async (req, res, next) => {
  try {
    const { postId, recipientId, message } = req.body;

    if (!postId || !recipientId) {
      return next(new ErrorHandler("Thiếu thông tin cần thiết", 400));
    }

    // Kiểm tra bài viết tồn tại
    const post = await Post.findById(postId);
    if (!post) {
      return next(new ErrorHandler("Bài viết không tồn tại", 404));
    }

    // Kiểm tra người dùng tồn tại
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return next(new ErrorHandler("Người nhận không tồn tại", 404));
    }

    // Tìm chat giữa người gửi và người nhận
    let chat = await Chat.findOne({
      users: {
        $all: [req.user._id, recipientId],
        $size: 2, // Đảm bảo đây là chat 1-1
      },
    });

    // Nếu chưa có chat, tạo mới
    if (!chat) {
      chat = await Chat.create({
        users: [req.user._id, recipientId],
      });
    }

    // Tạo tin nhắn chia sẻ bài viết
    const newMessage = await Message.create({
      sender: req.user._id,
      chatId: chat._id, // Đổi từ chat thành chatId
      content: message || "Đã chia sẻ một bài viết",
      isPostShare: true,
      sharedPost: postId,
    });

    // Cập nhật latestMessage của chat
    chat.latestMessage = newMessage._id;
    await chat.save();

    // Populate tin nhắn
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "username avatar")
      .populate("chatId") // Đổi từ chat thành chatId
      .populate({
        path: "sharedPost",
        select: "image caption postedBy",
        populate: {
          path: "postedBy",
          select: "username",
        },
      });

    // Xử lý real-time với Socket.IO
    if (req.app && req.app.get("io")) {
      const io = req.app.get("io");
      const userSockets = req.app.get("userSockets");

      if (io && userSockets) {
        // Lấy socket ID của người nhận nếu họ đang online
        const recipientSocketId = userSockets[recipientId];

        if (recipientSocketId) {
          // Lấy thêm thông tin chi tiết về bài viết nếu cần
          const postDetail = {
            _id: post._id,
            image: post.image,
            caption: post.caption,
            postedBy: post.postedBy,
          };

          // Gửi sự kiện socket đến người nhận
          io.to(recipientSocketId).emit("receivePostShare", {
            _id: newMessage._id,
            sender: {
              _id: req.user._id,
              username: req.user.username,
              avatar: req.user.avatar,
            },
            chatId: chat._id,
            content: message || "Đã chia sẻ một bài viết với bạn",
            isPostShare: true,
            sharedPost: postDetail,
            createdAt: new Date(),
          });

          console.log(
            `Đã gửi thông báo chia sẻ bài viết real-time đến ${recipientId}`,
          );
        }
      }
    }

    // Trả về kết quả
    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    console.error("Lỗi trong controller sharePost:", error);
    return next(new ErrorHandler(error.message || "Lỗi server", 500));
  }
});
