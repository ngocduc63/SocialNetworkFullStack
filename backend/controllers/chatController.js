const catchAsync = require("../middlewares/catchAsync");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

// Create New Chat
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

    if (chatExists) {
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
    });

    res.status(200).json({
      success: true,
      newChat,
    });
  }
});

// Get All Chats
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
