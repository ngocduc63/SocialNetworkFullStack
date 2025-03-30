const catchAsync = require("../middlewares/catchAsync");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const deleteFile = require("../utils/deleteFile");

exports.newChat = catchAsync(async (req, res, next) => {
  const users = req.body.users;
  const checkNewChat = users.length === 1;

  if (checkNewChat) {
    const friendId = users[0];
    const chatExists = await Chat.findOne({
      users: {
        $all: [req.user._id, friendId],
      },
    });

    if (chatExists && chatExists.users.length === 2) {
      return res.status(200).json({
        success: true,
        newChat: chatExists,
      });
    }

    const newChat = await Chat.create({
      users: [req.user._id, friendId],
    });

    res.status(200).json({
      success: true,
      newChat,
    });
  } else {
    const user = await User.findById(users[0]);
    console.log(user);
    const newChat = await Chat.create({
      users: [req.user._id, ...users],
      name: `${user.name} và ${users.length} người khác`,
      avatar: "hero.png",
    });

    res.status(200).json({
      success: true,
      newChat,
    });
  }
});

exports.getChats = catchAsync(async (req, res, next) => {
  const chats = await Chat.find({
    users: {
      $in: [req.user._id],
    },
  })
    .sort({ updatedAt: -1 })
    .populate("users latestMessage");

  res.status(200).json({
    success: true,
    chats,
  });
});

exports.renameGroup = catchAsync(async (req, res, next) => {
  const { chatId, newName } = req.body;

  if (!chatId || !newName) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng cung cấp chatId và tên mới",
    });
  }

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { name: newName },
    { new: true, runValidators: true },
  ).populate("users latestMessage");

  if (!updatedChat) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy nhóm chat",
    });
  }
  res.status(200).json({
    success: true,
    chat: updatedChat,
  });
});

exports.updateAvatarGroup = catchAsync(async (req, res, next) => {
  const { chatId, avatar } = req.body;

  if (!chatId) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng cung cấp chatId",
    });
  }

  if (avatar !== "") {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { avatar: req.file.filename },
      { new: true, runValidators: true },
    ).populate("users latestMessage");

    if (!updatedChat) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhóm chat",
      });
    }

    res.status(200).json({
      success: true,
      chat: updatedChat,
    });
  }

  return res.status(400).json({
    success: false,
    message: "Vui lòng cung cấp avatar",
  });
});

exports.removeMembers = catchAsync(async (req, res, next) => {
  const { chatId, userIds } = req.body;

  if (!chatId || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng cung cấp chatId và danh sách userIds",
    });
  }

  const chat = await Chat.findById(chatId);

  if (!chat) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy nhóm chat",
    });
  }

  if (chat.users.length <= 2) {
    return res.status(400).json({
      success: false,
      message: "Không thể xóa thành viên trong cuộc trò chuyện 1-1",
    });
  }

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: { $in: userIds } } },
    { new: true },
  ).populate("users latestMessage");

  if (!updatedChat) {
    return res.status(404).json({
      success: false,
      message: "Không thể cập nhật nhóm chat",
    });
  }

  res.status(200).json({
    success: true,
    chat: updatedChat,
  });
});

exports.addMembers = catchAsync(async (req, res, next) => {
  const { chatId, userIds } = req.body;

  if (!chatId || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng cung cấp chatId và danh sách userIds",
    });
  }

  const chat = await Chat.findById(chatId);

  if (!chat) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy nhóm chat",
    });
  }

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { $push: { users: { $each: userIds } } },
    { new: true },
  ).populate("users latestMessage");

  if (!updatedChat) {
    return res.status(404).json({
      success: false,
      message: "Không thể cập nhật nhóm chat",
    });
  }

  res.status(200).json({
    success: true,
    chat: updatedChat,
  });
});

module.exports = exports;
