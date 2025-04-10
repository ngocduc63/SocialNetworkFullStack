const app = require("./app");
const connectDatabase = require("./config/database");
const PORT = process.env.PORT || 4000;

connectDatabase();

const server = app.listen(PORT, () => {
  console.log(`Server Running on http://localhost:${PORT}`);
});

// ============= socket.io ==============

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

// Lưu trữ người dùng đang online bằng object thay vì mảng
// Sử dụng cấu trúc: { userId: socketId }
const userSockets = {};

// Thêm người dùng vào danh sách online
const addUser = (userId, socketId) => {
  if (userId) {
    userSockets[userId] = socketId;
    console.log(`User ${userId} connected with socket ${socketId}`);
  }
};

// Xóa người dùng khỏi danh sách online
const removeUser = (socketId) => {
  for (const [userId, id] of Object.entries(userSockets)) {
    if (id === socketId) {
      delete userSockets[userId];
      console.log(`User ${userId} disconnected`);
      break;
    }
  }
};

// Lưu io và userSockets vào app để sử dụng trong controller
app.set("io", io);
app.set("userSockets", userSockets);

io.on("connection", (socket) => {
  console.log("🚀 New socket connection:", socket.id);

  // Xác thực người dùng khi kết nối
  socket.on("addUser", (userId) => {
    if (!userId) {
      console.log("No userId provided");
      return;
    }

    addUser(userId, socket.id);

    // Cập nhật userSockets trong app
    app.set("userSockets", userSockets);
    console.log("Online users:", Object.keys(userSockets));
  });

  // Xử lý like post
  socket.on("likePost", (data) => {
    console.log("Received likePost event from client:", socket.id);

    // Broadcast UI update to all clients
    io.emit("updatePost", { data, action: "like" });

    // Handle notification
    if (data && data.post && data.post.postedBy) {
      const postOwnerId =
        typeof data.post.postedBy === "object"
          ? data.post.postedBy._id
          : data.post.postedBy;

      // Don't send notification if liker is post owner
      if (data.likerId && postOwnerId.toString() !== data.likerId.toString()) {
        const ownerSocketId = userSockets[postOwnerId.toString()];
      }
    }
  });

  // Xử lý comment post
  socket.on("commentPost", (data) => {
    console.log("Received commentPost event:", data);

    // Broadcast UI update
    io.emit("updatePost", { data, action: "comment" });
  });

  // Xử lý chat message
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });
  socket.on("sendMessage", (data) => {
    const chatId = data.chatId;
    io.to(`chat_${chatId}`).emit("receiveMessage", data);
    console.log(`Message sent to room ${chatId}:`, data);
  });
  socket.on("deleteMessage", ({ chatId, ...data }) => {
    io.to(`chat_${chatId}`).emit("receiveDeleteMessage", data);
    console.log(`receiveDeleteMessage sent to room ${chatId}:`, data);
  });

  //xử lý video call
  socket.on("initiate-call", ({ callerId, receiverId }) => {
    console.log(`Call initiated from ${callerId} to ${receiverId}`);

    // Kiểm tra xem người nhận có online không
    const receiverSocketId = userSockets[receiverId];

    if (receiverSocketId) {
      // Gửi thông báo cuộc gọi đến người nhận
      io.to(receiverSocketId).emit("incoming-call", {
        callerId,
        callerSocketId: socket.id,
      });
      console.log(`Sent incoming call notification to ${receiverId}`);
    } else {
      // Người nhận không online, thông báo cho người gọi
      socket.emit("call-failed", {
        message: "User is not online",
        receiverId,
      });
      console.log(`Call failed: User ${receiverId} is not online`);
    }
  });

  socket.on("signal", (data) => {
    socket.to(data.to).emit("signal", { signal: data.signal, from: data.from });
  });

  // Xử lý khi người dùng chấp nhận cuộc gọi
  socket.on("accept-call", ({ callerId, receiverId }) => {
    const callerSocketId = userSockets[callerId];

    if (callerSocketId) {
      io.to(callerSocketId).emit("call-accepted", {
        receiverId,
        receiverSocketId: socket.id,
      });
      console.log(`Call accepted by ${receiverId}`);
    } else {
      socket.emit("call-failed", {
        message: "Caller is no longer online",
        callerId,
      });
      console.log(`Call failed: Caller ${callerId} is no longer online`);
    }
  });

  // Xử lý khi người dùng từ chối cuộc gọi
  socket.on("reject-call", ({ callerId, receiverId }) => {
    const callerSocketId = userSockets[callerId];

    if (callerSocketId) {
      io.to(callerSocketId).emit("call-rejected", {
        receiverId,
        message: "Call was rejected",
      });
      console.log(`Call rejected by ${receiverId}`);
    }
  });

  // Chuyển tiếp SDP offer WebRTC
  socket.on("call-offer", ({ offer, from, to }) => {
    const receiverSocketId = userSockets[to];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call-offer", {
        offer,
        from,
      });
      console.log(`WebRTC offer sent from ${from} to ${to}`);
    }
  });

  // Chuyển tiếp SDP answer WebRTC
  socket.on("call-answer", ({ answer, from, to }) => {
    const receiverSocketId = userSockets[to];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call-answer", {
        answer,
        from,
      });
      console.log(`WebRTC answer sent from ${from} to ${to}`);
    }
  });

  // Chuyển tiếp ICE candidates
  socket.on("ice-candidate", ({ candidate, from, to }) => {
    const receiverSocketId = userSockets[to];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("ice-candidate", {
        candidate,
        from,
      });
      console.log(`ICE candidate exchanged between ${from} and ${to}`);
    }
  });

  // Xử lý khi kết thúc cuộc gọi
  socket.on("end-call", ({ callerId, receiverId }) => {
    console.log(`Call ended between ${callerId} and ${receiverId}`);

    // Gửi thông báo kết thúc đến người gọi (nếu không phải người kết thúc)
    if (callerId !== socket.id) {
      const callerSocketId = userSockets[callerId];
      if (callerSocketId) {
        io.to(callerSocketId).emit("call-ended", { by: receiverId });
      }
    }

    // Gửi thông báo kết thúc đến người nhận (nếu không phải người kết thúc)
    if (receiverId !== socket.id) {
      const receiverSocketId = userSockets[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("call-ended", { by: callerId });
      }
    }
  });

  // Xử lý typing states
  socket.on("typing", ({ senderId, receiverId }) => {
    const receiverSocketId = userSockets[receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", senderId);
    }
  });

  socket.on("typing stop", ({ senderId, receiverId }) => {
    const receiverSocketId = userSockets[receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing stop", senderId);
    }
  });

  // Xử lý like comment
  socket.on(
    "likeComment",
    ({ commentId, postId, likerId, commentOwnerId, likerName }) => {
      console.log("Received likeComment event:", {
        commentId,
        postId,
        likerId,
        commentOwnerId,
      });

      // Only send notification if liker is not comment owner
      if (likerId !== commentOwnerId) {
        const ownerSocketId = userSockets[commentOwnerId];

        if (ownerSocketId) {
          // Send notification to comment owner
          io.to(ownerSocketId).emit("newNotification", {
            type: "like",
            sender: likerId,
            recipient: commentOwnerId,
            post: postId,
            comment: commentId,
            text: `${likerName || "Someone"} liked your comment`,
            read: false,
            createdAt: new Date(),
          });

          console.log(`Sent like comment notification to ${commentOwnerId}`);
        }
      }
    },
  );

  // Xử lý reply comment
  socket.on(
    "replyComment",
    ({
      commentId,
      postId,
      parentCommentId,
      replierId,
      parentCommentOwnerId,
      replierName,
    }) => {
      console.log("Received replyComment event:", {
        commentId,
        parentCommentId,
        replierId,
        parentCommentOwnerId,
      });

      // Only send notification if replier is not parent comment owner
      if (replierId !== parentCommentOwnerId) {
        const ownerSocketId = userSockets[parentCommentOwnerId];

        if (ownerSocketId) {
          // Send notification to parent comment owner
          io.to(ownerSocketId).emit("newNotification", {
            type: "reply",
            sender: replierId,
            recipient: parentCommentOwnerId,
            post: postId,
            comment: parentCommentId,
            text: `${replierName || "Someone"} replied to your comment`,
            read: false,
            createdAt: new Date(),
          });

          console.log(`Sent reply notification to ${parentCommentOwnerId}`);
        }
      }
    },
  );
  // Xử lý share post
  socket.on("sharePost", (data) => {
    console.log("Received sharePost event:", data);

    if (data && data.recipientId) {
      const recipientSocketId = userSockets[data.recipientId];

      if (recipientSocketId) {
        // Gửi sự kiện receivePostShare đến người nhận
        io.to(recipientSocketId).emit("receivePostShare", {
          senderId: data.senderId,
          senderName: data.senderName,
          postId: data.postId,
          postImage: data.postImage,
          postCaption: data.postCaption,
          postOwnerUsername: data.postOwnerUsername,
          message: data.message || "Đã chia sẻ một bài viết với bạn",
        });

        console.log(
          `Đã gửi thông báo chia sẻ bài viết đến ${data.recipientId}`,
        );
      } else {
        console.log(`Người dùng ${data.recipientId} không online`);
      }
    }
  });

  // Xử lý disconnect
  socket.on("disconnect", () => {
    console.log("⚠️ Socket disconnected:", socket.id);
    removeUser(socket.id);

    // Cập nhật userSockets trong app
    app.set("userSockets", userSockets);
  });
});
