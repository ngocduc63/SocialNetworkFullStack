const Comment = require("../models/commentModel");
const Post = require("../models/postModel");
const Notification = require("../models/notificationModel");
const mongoose = require("mongoose");
const catchAsync = require("../middlewares/catchAsync");
const ErrorHandler = require("../utils/errorHandler");

// Tạo bình luận mới
exports.createComment = catchAsync(async (req, res, next) => {
  // Lấy postId từ cả params và body để xử lý cả hai loại request
  const postId = req.params.id || req.body.postId;
  const { content, parentCommentId } = req.body;
  const userId = req.user._id;

  console.log("Tạo bình luận với dữ liệu:", {
    postId,
    content,
    parentCommentId,
    userId,
  });

  // Kiểm tra bài đăng tồn tại
  const post = await Post.findById(postId);
  if (!post) {
    return next(new ErrorHandler("Bài đăng không tồn tại", 404));
  }

  // Tạo đối tượng comment mới
  const comment = new Comment({
    comment_postId: postId,
    comment_userId: userId,
    comment_content: content,
    comment_parentId: parentCommentId || null,
    comment_likes: [], // Khởi tạo mảng likes rỗng
  });

  let rightValue;
  if (parentCommentId) {
    // Trả lời bình luận
    const parentComment = await Comment.findById(parentCommentId);
    if (!parentComment) {
      return next(new ErrorHandler("Bình luận gốc không tồn tại", 404));
    }

    rightValue = parentComment.comment_right;

    // Cập nhật giá trị right cho các bình luận hiện có
    await Comment.updateMany(
      {
        comment_postId: new mongoose.Types.ObjectId(postId),
        comment_right: { $gte: rightValue },
      },
      {
        $inc: { comment_right: 2 },
      },
    );

    // Cập nhật giá trị left cho các bình luận hiện có
    await Comment.updateMany(
      {
        comment_postId: new mongoose.Types.ObjectId(postId),
        comment_left: { $gte: rightValue },
      },
      {
        $inc: { comment_left: 2 },
      },
    );

    // Tạo thông báo khi trả lời bình luận (nếu trả lời không phải bình luận của mình)
    if (parentComment.comment_userId.toString() !== userId.toString()) {
      try {
        // Tạo dữ liệu thông báo theo model mới
        const notificationData = {
          recipient: parentComment.comment_userId,
          sender: userId,
          type: "reply",
          text: `đã trả lời bình luận của bạn`,
          post: post._id,
          comment: parentCommentId,
          read: false,
        };

        // Tạo thông báo trong database
        const notification = await Notification.create(notificationData);
        console.log("Đã tạo thông báo trả lời comment:", notification._id);

        // Gửi thông báo qua socket.io nếu có
        if (req.app) {
          const io = req.app.get("io");
          const userSockets = req.app.get("userSockets");

          if (io && userSockets) {
            const recipientSocketId =
              userSockets[parentComment.comment_userId.toString()];

            if (recipientSocketId) {
              // Populate thông tin người gửi
              await notification.populate("sender", "username avatar");

              // Gửi thông báo qua socket
              io.to(recipientSocketId).emit("newNotification", notification);
              console.log(
                `Đã gửi thông báo trả lời comment đến ${parentComment.comment_userId}`,
              );
            } else {
              console.log(
                `Người dùng ${parentComment.comment_userId} không online`,
              );
            }
          }
        }
      } catch (error) {
        console.error("Lỗi khi tạo thông báo trả lời comment:", error.message);
      }
    }
  } else {
    // Bình luận gốc
    const maxRightValue = await Comment.findOne(
      {
        comment_postId: new mongoose.Types.ObjectId(postId),
      },
      "comment_right",
      { sort: { comment_right: -1 } },
    );

    if (maxRightValue) {
      rightValue = maxRightValue.comment_right + 1;
    } else {
      rightValue = 1;
    }

    // Tạo thông báo khi comment vào bài viết (nếu người comment không phải người đăng bài)
    if (post.postedBy.toString() !== userId.toString()) {
      try {
        // Tạo dữ liệu thông báo theo model mới
        const notificationData = {
          recipient: post.postedBy,
          sender: userId,
          type: "comment",
          text: `đã bình luận về bài viết của bạn`,
          post: post._id,
          read: false,
        };

        // Tạo thông báo trong database
        const notification = await Notification.create(notificationData);
        console.log("Đã tạo thông báo comment post:", notification._id);

        // Gửi thông báo qua socket.io nếu có
        if (req.app) {
          const io = req.app.get("io");
          const userSockets = req.app.get("userSockets");

          if (io && userSockets) {
            const recipientSocketId = userSockets[post.postedBy.toString()];

            if (recipientSocketId) {
              // Populate thông tin người gửi
              await notification.populate("sender", "username avatar");

              // Gửi thông báo qua socket
              io.to(recipientSocketId).emit("newNotification", notification);
              console.log(`Đã gửi thông báo comment post đến ${post.postedBy}`);
            } else {
              console.log(`Người dùng ${post.postedBy} không online`);
            }
          } else {
            console.log("IO hoặc userSockets không có sẵn");
          }
        }
      } catch (error) {
        console.error("Lỗi khi tạo thông báo comment post:", error.message);
      }
    }
  }

  // Gán giá trị left và right cho bình luận mới
  comment.comment_left = rightValue;
  comment.comment_right = rightValue + 1;

  await comment.save();

  // Thêm bình luận vào danh sách bình luận mới nhất của bài đăng nếu cần
  if (!parentCommentId) {
    post.latestComments = post.latestComments || [];
    post.latestComments.unshift(comment._id);
    // Giữ chỉ 5 bình luận mới nhất
    if (post.latestComments.length > 5) {
      post.latestComments = post.latestComments.slice(0, 5);
    }
    await post.save();
  }

  // Populate thông tin người dùng
  const populatedComment = await Comment.findById(comment._id)
    .populate("comment_userId", "username avatar")
    .populate("comment_parentId", "comment_content");

  res.status(200).json({
    success: true,
    comment: populatedComment,
    message: "Comment Added",
  });
});

// Lấy danh sách bình luận theo bài đăng và parent ID
exports.getCommentsByParentId = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  const { parentId, limit = 50, offset = 0 } = req.query;

  const parentCommentId = parentId || null;

  let comments;

  if (parentCommentId) {
    // Tìm bình luận cha
    const parent = await Comment.findById(parentCommentId);
    if (!parent) {
      return next(new ErrorHandler("Không tìm thấy bình luận cha", 404));
    }

    // Tìm tất cả bình luận con dựa trên khoảng giá trị left-right
    comments = await Comment.find({
      comment_postId: new mongoose.Types.ObjectId(postId),
      comment_left: { $gt: parent.comment_left },
      comment_right: { $lte: parent.comment_right },
    })
      .select(
        "comment_left comment_right comment_content comment_parentId comment_userId comment_likes createdAt",
      )
      .populate("comment_userId", "username avatar")
      .sort({ comment_left: 1 })
      .limit(Number(limit))
      .skip(Number(offset));
  } else {
    // Tìm tất cả bình luận gốc (không có parent)
    comments = await Comment.find({
      comment_postId: new mongoose.Types.ObjectId(postId),
      comment_parentId: parentCommentId,
    })
      .select(
        "comment_left comment_right comment_content comment_parentId comment_userId comment_likes createdAt",
      )
      .populate("comment_userId", "username avatar")
      .sort({ comment_left: 1 })
      .limit(Number(limit))
      .skip(Number(offset));
  }

  return res.status(200).json({
    success: true,
    comments,
    count: comments.length,
  });
});

// Xóa bình luận
exports.deleteComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  const { postId } = req.body;

  // Kiểm tra bài đăng tồn tại
  const post = await Post.findById(postId);
  if (!post) {
    return next(new ErrorHandler("Bài đăng không tồn tại", 404));
  }

  // Tìm bình luận cần xóa
  const comment = await Comment.findById(commentId);
  if (!comment) {
    return next(new ErrorHandler("Bình luận không tồn tại", 404));
  }

  // Kiểm tra quyền xóa (người dùng phải là người tạo bình luận hoặc người tạo bài đăng)
  if (
    comment.comment_userId.toString() !== req.user._id.toString() &&
    post.postedBy.toString() !== req.user._id.toString()
  ) {
    return next(new ErrorHandler("Không có quyền xóa bình luận này", 401));
  }

  // Xóa các thông báo liên quan đến comment này
  await Notification.deleteMany({ comment: commentId });

  // Xác định giá trị left và right của bình luận cần xóa
  const leftValue = comment.comment_left;
  const rightValue = comment.comment_right;

  // Tính độ rộng của cây bình luận
  const width = rightValue - leftValue + 1;

  // Xóa tất cả bình luận con
  await Comment.deleteMany({
    comment_postId: new mongoose.Types.ObjectId(postId),
    comment_left: { $gte: leftValue, $lte: rightValue },
  });

  // Cập nhật giá trị right của các bình luận còn lại
  await Comment.updateMany(
    {
      comment_postId: new mongoose.Types.ObjectId(postId),
      comment_right: { $gt: rightValue },
    },
    {
      $inc: { comment_right: -width },
    },
  );

  // Cập nhật giá trị left của các bình luận còn lại
  await Comment.updateMany(
    {
      comment_postId: new mongoose.Types.ObjectId(postId),
      comment_left: { $gt: rightValue },
    },
    {
      $inc: { comment_left: -width },
    },
  );

  // Xóa bình luận khỏi latestComments của bài đăng nếu có
  if (post.latestComments && post.latestComments.includes(comment._id)) {
    post.latestComments = post.latestComments.filter(
      (id) => id.toString() !== comment._id.toString(),
    );
    await post.save();
  }

  res.status(200).json({
    success: true,
    message: "Bình luận đã được xóa",
  });
});

// Cập nhật nội dung bình luận
exports.updateComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  const { content } = req.body;

  const comment = await Comment.findById(commentId);

  if (!comment) {
    return next(new ErrorHandler("Bình luận không tồn tại", 404));
  }

  // Kiểm tra quyền sửa bình luận
  if (comment.comment_userId.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Không có quyền sửa bình luận này", 401));
  }

  comment.comment_content = content;

  await comment.save();

  res.status(200).json({
    success: true,
    message: "Bình luận đã được cập nhật",
  });
});

// Thích hoặc bỏ thích bình luận (tính năng mạng xã hội)
exports.likeUnlikeComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  const comment = await Comment.findById(commentId);

  if (!comment) {
    return next(new ErrorHandler("Bình luận không tồn tại", 404));
  }

  // Kiểm tra xem người dùng đã thích bình luận chưa
  const isLiked = comment.comment_likes.includes(userId);

  if (isLiked) {
    // Nếu đã thích, bỏ thích
    comment.comment_likes = comment.comment_likes.filter(
      (id) => id.toString() !== userId.toString(),
    );
    await comment.save();

    return res.status(200).json({
      success: true,
      message: "Đã bỏ thích bình luận",
      isLiked: false,
      likeCount: comment.comment_likes.length,
    });
  } else {
    // Nếu chưa thích, thêm thích
    comment.comment_likes.push(userId);
    await comment.save();

    // Tạo thông báo khi like comment (nếu người like không phải người comment)
    if (comment.comment_userId.toString() !== userId.toString()) {
      try {
        // Tạo dữ liệu thông báo theo model mới
        const notificationData = {
          recipient: comment.comment_userId,
          sender: userId,
          type: "like",
          text: `đã thích bình luận của bạn`,
          post: comment.comment_postId,
          comment: comment._id,
          read: false,
        };

        // Tạo thông báo trong database
        const notification = await Notification.create(notificationData);
        console.log("Đã tạo thông báo like comment:", notification._id);

        // Gửi thông báo qua socket.io nếu có
        if (req.app) {
          const io = req.app.get("io");
          const userSockets = req.app.get("userSockets");

          if (io && userSockets) {
            const recipientSocketId =
              userSockets[comment.comment_userId.toString()];

            if (recipientSocketId) {
              // Populate thông tin người gửi
              await notification.populate("sender", "username avatar");

              // Gửi thông báo qua socket
              io.to(recipientSocketId).emit("newNotification", notification);
              console.log(
                `Đã gửi thông báo like comment đến ${comment.comment_userId}`,
              );
            } else {
              console.log(`Người dùng ${comment.comment_userId} không online`);
            }
          }
        }
      } catch (error) {
        console.error("Lỗi khi tạo thông báo like comment:", error.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Đã thích bình luận",
      isLiked: true,
      likeCount: comment.comment_likes.length,
    });
  }
});

// Lấy tất cả bình luận của một bài đăng
exports.getAllCommentsByPost = catchAsync(async (req, res, next) => {
  const { postId } = req.params;

  const comments = await Comment.find({
    comment_postId: postId,
  })
    .populate("comment_userId", "username avatar")
    .populate("comment_likes", "username avatar")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    comments,
    count: comments.length,
  });
});

// Lấy số lượng bình luận của một bài đăng
exports.getCommentCount = catchAsync(async (req, res, next) => {
  const { postId } = req.params;

  const count = await Comment.countDocuments({
    comment_postId: postId,
  });

  return res.status(200).json({
    success: true,
    count,
  });
});

// Lấy một comment cụ thể theo ID
exports.getCommentById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const comment = await Comment.findById(id)
    .populate("comment_userId", "username avatar")
    .populate("comment_parentId", "comment_content");

  if (!comment) {
    return next(new ErrorHandler("Bình luận không tồn tại", 404));
  }

  return res.status(200).json({
    success: true,
    comment,
  });
});
