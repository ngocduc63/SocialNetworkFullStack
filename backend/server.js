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

        if (ownerSocketId) {
          // Send notification to post owner using the new model structure
          io.to(ownerSocketId).emit("newNotification", {
            type: "like",
            sender: data.likerId,
            recipient: postOwnerId,
            post: data.post._id,
            text: `${data.likerName || "Someone"} liked your post`,
            read: false,
            createdAt: new Date(),
          });

          console.log(`Sent like notification to post owner ${postOwnerId}`);
        }
      }
    }
  });

  // Xử lý comment post
  socket.on("commentPost", (data) => {
    console.log("Received commentPost event:", data);

    // Broadcast UI update
    io.emit("updatePost", { data, action: "comment" });

    // Handle notification
    // if (data && data.post && data.post.postedBy && data.commenterId) {
    //   const postOwnerId =
    //     typeof data.post.postedBy === "object"
    //       ? data.post.postedBy._id.toString()
    //       : data.post.postedBy.toString();
    //
    //   const commenterId = data.commenterId.toString();
    //
    //   // Don't send notification if commenter is post owner
    //   if (postOwnerId !== commenterId) {
    //     const ownerSocketId = userSockets[postOwnerId];
    //
    //     if (ownerSocketId) {
    //       // Send notification to post owner
    //       io.to(ownerSocketId).emit("newNotification", {
    //         type: "comment",
    //         sender: commenterId,
    //         recipient: postOwnerId,
    //         post: data.post._id,
    //         comment: data.comment ? data.comment._id : null,
    //         text: `${data.commenterName || "Someone"} commented on your post`,
    //         read: false,
    //         createdAt: new Date(),
    //       });
    //
    //       console.log(`Sent comment notification to post owner ${postOwnerId}`);
    //     }
    //   }
    // }
  });

  // Xử lý chat message
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });
  socket.on("sendMessage", ({ chatId, ...data }) => {
    io.to(`chat_${chatId}`).emit("receiveMessage", data);
    console.log(`Message sent to room ${chatId}:`, data);
  });
  socket.on("deleteMessage", ({ chatId, ...data }) => {
    io.to(`chat_${chatId}`).emit("receiveDeleteMessage", data);
    console.log(`receiveDeleteMessage sent to room ${chatId}:`, data);
  });
  // socket.on("sendMessage", ({ senderId, receiverId, content, idReply }) => {
  //   console.log(`Message from ${senderId} to ${receiverId}`);
  //
  //   const receiverSocketId = userSockets[receiverId];
  //
  //   if (receiverSocketId) {
  //     io.to(receiverSocketId).emit("getMessage", {
  //       senderId,
  //       content,
  //       idReply,
  //     });
  //   }
  // });

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

  // Xử lý disconnect
  socket.on("disconnect", () => {
    console.log("⚠️ Socket disconnected:", socket.id);
    removeUser(socket.id);

    // Cập nhật userSockets trong app
    app.set("userSockets", userSockets);
  });
});
