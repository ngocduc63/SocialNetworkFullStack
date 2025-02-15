const catchAsync = require("../middlewares/catchAsync");
const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");

// Send New Message
exports.newMessage = catchAsync(async (req, res, next) => {
  const { chatId, content, idReply = null } = req.body;

  const msgData = {
    sender: req.user._id,
    chatId,
    content,
    idReply: idReply?._id ?? null,
  };

  const newMessage = await Message.create(msgData);
  await Chat.findByIdAndUpdate(chatId, { latestMessage: newMessage });

  const rsMess = {
    ...newMessage.toObject(),
    idReply: idReply ? { _id: idReply._id, content: idReply.content } : null,
  };

  res.status(200).json({
    success: true,
    newMessage: rsMess,
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
