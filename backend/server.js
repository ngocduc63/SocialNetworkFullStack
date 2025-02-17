const app = require("./app");
const connectDatabase = require("./config/database");
const PORT = process.env.PORT || 4000;

connectDatabase();

const server = app.listen(PORT, () => {
  console.log(`Server Running on http://localhost:${PORT}`);
});

// ============= socket.io ==============

const io = require("socket.io")(server, {
  // pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  console.log("🚀 Someone connected!");
  // console.log(users);

  // get userId and socketId from client
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  // Nhận sự kiện khi có người like bài post
  socket.on("likePost", (data) => {
    // Cập nhật dữ liệu trong DB nếu cần
    io.emit("updatePost", { data, action: "like" });
  });

  // Nhận sự kiện khi có người bình luận bài post
  socket.on("commentPost", (data) => {
    // Cập nhật dữ liệu trong DB nếu cần
    io.emit("updatePost", { data, action: "comment" });
  });

  // get and send message
  socket.on("sendMessage", ({ senderId, receiverId, content, idReply }) => {
    const user = getUser(receiverId);

    io.to(user?.socketId).emit("getMessage", {
      senderId,
      content,
      idReply,
    });
  });

  // typing states
  socket.on("typing", ({ senderId, receiverId }) => {
    const user = getUser(receiverId);
    console.log("user", user);
    io.to(user?.socketId).emit("typing", senderId);
  });

  socket.on("typing stop", ({ senderId, receiverId }) => {
    const user = getUser(receiverId);
    io.to(user?.socketId).emit("typing stop", senderId);
  });

  // user disconnected
  socket.on("disconnect", () => {
    console.log("⚠️ Someone disconnected");
    removeUser(socket.id);
    io.emit("getUsers", users);
    // console.log(users);
  });
});
