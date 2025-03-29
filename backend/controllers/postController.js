const Post = require("../models/postModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");
const Comment = require("../models/commentModel");
const Notification = require("../models/notificationModel");
const catchAsync = require("../middlewares/catchAsync");
const ErrorHandler = require("../utils/errorHandler");
const deleteFile = require("../utils/deleteFile");

// Create New Post
exports.newPost = catchAsync(async (req, res, next) => {
  const postData = {
    caption: req.body.caption,
    image: req.file.filename,
    postedBy: req.user._id,
  };

  const post = await Post.create(postData);

  const user = await User.findById(req.user._id);
  user.posts.push(post._id);
  await user.save();
  post.postedBy = user;

  res.status(201).json({
    success: true,
    post,
  });
});

// Like or Unlike Post
exports.likeUnlikePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorHandler("Post Not Found", 404));
  }

  if (post.likes.includes(req.user._id)) {
    // Unlike post
    const index = post.likes.indexOf(req.user._id);
    post.likes.splice(index, 1);
    await post.save();

    return res.status(200).json({
      success: true,
      message: "Post Unliked",
    });
  } else {
    // Like post
    post.likes.push(req.user._id);
    await post.save();

    // Tạo thông báo khi like post (nếu người like không phải người đăng bài)
    if (post.postedBy.toString() !== req.user._id.toString()) {
      try {
        // Tạo dữ liệu thông báo theo model mới
        const notificationData = {
          recipient: post.postedBy,
          sender: req.user._id,
          type: "like",
          text: `đã thích bài viết của bạn`,
          post: post._id,
          read: false,
        };

        // Tạo thông báo trong database
        const notification = await Notification.create(notificationData);
        console.log("Đã tạo thông báo like post:", notification._id);

        // Gửi thông báo qua socket.io nếu có
        if (req.app) {
          const io = req.app.get("io");
          const userSockets = req.app.get("userSockets");

          console.log(
            "Socket IO và userSockets khả dụng:",
            !!io,
            !!userSockets,
          );

          if (io && userSockets) {
            // Lấy socket của người nhận
            const recipientSocketId = userSockets[post.postedBy.toString()];
            console.log("Socket ID của người nhận:", recipientSocketId);

            if (recipientSocketId) {
              // Populate thông tin người gửi
              await notification.populate("sender", "username avatar");

              // Gửi thông báo qua socket
              io.to(recipientSocketId).emit("newNotification", notification);
              console.log(`Đã gửi thông báo like post đến ${post.postedBy}`);
            } else {
              console.log(`Người dùng ${post.postedBy} không online`);
            }
          }
        }
      } catch (error) {
        console.error("Lỗi khi tạo thông báo like post:", error.message);
        // Không throw lỗi để không ảnh hưởng đến việc like post
      }
    }

    return res.status(200).json({
      success: true,
      message: "Post Liked",
    });
  }
});

// Delete Post
exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorHandler("Post Not Found", 404));
  }

  if (post.postedBy.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Unauthorized", 401));
  }

  await deleteFile("posts/", post.image);

  // Sử dụng deleteOne thay vì remove (remove đã deprecated)
  await Post.deleteOne({ _id: post._id });

  const user = await User.findById(req.user._id);

  const index = user.posts.indexOf(req.params.id);
  user.posts.splice(index, 1);
  await user.save();

  // Xóa tất cả các thông báo liên quan đến bài đăng này
  await Notification.deleteMany({ post: post._id });

  res.status(200).json({
    success: true,
    message: "Post Deleted",
  });
});

// Update Caption
exports.updateCaption = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorHandler("Post Not Found", 404));
  }

  if (post.postedBy.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Unauthorized", 401));
  }

  post.caption = req.body.caption;

  await post.save();

  res.status(200).json({
    success: true,
    message: "Post Updated",
  });
});

// Add Comment - VỚI CHỨC NĂNG TẠO COMMENT CẢI TIẾN
exports.newComment = catchAsync(async (req, res, next) => {
  console.log("Request params:", req.params);
  console.log("Request body:", req.body);

  // Lấy postId từ cả params và body để phù hợp với cả hai loại request
  const postId = req.params.id || req.body.postId;
  const { content, parentCommentId } = req.body;
  const userId = req.user._id;

  console.log("Tạo bình luận với dữ liệu:", {
    postId,
    content,
    parentCommentId,
    userId,
  });

  if (!postId) {
    return next(new ErrorHandler("Post ID is required", 400));
  }

  // Kiểm tra bài đăng tồn tại
  const post = await Post.findById(postId);
  if (!post) {
    return next(new ErrorHandler("Post Not Found", 404));
  }

  // Tạo đối tượng comment mới
  const comment = new Comment({
    comment_postId: post._id,
    comment_userId: userId,
    comment_content: content,
    comment_parentId: parentCommentId || null,
    comment_likes: [],
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
        comment_postId: new mongoose.Types.ObjectId(post._id),
        comment_right: { $gte: rightValue },
      },
      {
        $inc: { comment_right: 2 },
      },
    );

    // Cập nhật giá trị left cho các bình luận hiện có
    await Comment.updateMany(
      {
        comment_postId: new mongoose.Types.ObjectId(post._id),
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

          console.log(
            "Socket IO và userSockets khả dụng:",
            !!io,
            !!userSockets,
          );

          if (io && userSockets) {
            const recipientSocketId =
              userSockets[parentComment.comment_userId.toString()];
            console.log("Socket ID của người nhận:", recipientSocketId);

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
        comment_postId: new mongoose.Types.ObjectId(post._id),
      },
      "comment_right",
      { sort: { comment_right: -1 } },
    );

    if (maxRightValue) {
      rightValue = maxRightValue.comment_right + 1;
    } else {
      rightValue = 1;
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

  // Tạo thông báo khi comment vào bài viết (nếu người comment không phải người đăng bài)
  if (!parentCommentId && post.postedBy.toString() !== userId.toString()) {
    try {
      // Tạo dữ liệu thông báo theo model mới
      const notificationData = {
        recipient: post.postedBy,
        sender: userId,
        type: "comment",
        text: `đã bình luận về bài viết của bạn`,
        post: post._id,
        comment: comment._id,
        read: false,
      };

      // Tạo thông báo trong database
      const notification = await Notification.create(notificationData);
      console.log("Đã tạo thông báo comment post:", notification._id);

      // Gửi thông báo qua socket.io nếu có
      if (req.app) {
        const io = req.app.get("io");
        const userSockets = req.app.get("userSockets");

        console.log("Socket IO và userSockets khả dụng:", !!io, !!userSockets);

        if (io && userSockets) {
          const recipientSocketId = userSockets[post.postedBy.toString()];
          console.log("Socket ID của người nhận:", recipientSocketId);

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

  // Populate thông tin người dùng và trả về comment chi tiết
  const populatedComment = await Comment.findById(comment._id)
    .populate("comment_userId", "username avatar")
    .populate("comment_parentId", "comment_content");

  return res.status(200).json({
    success: true,
    message: "Comment Added",
    comment: populatedComment,
  });
});

// Like Comment
exports.likeUnlikeComment = catchAsync(async (req, res, next) => {
  const commentId = req.params.id;
  const userId = req.user._id;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return next(new ErrorHandler("Comment Not Found", 404));
  }

  const isLiked = comment.comment_likes.includes(userId);

  if (isLiked) {
    // Unlike comment
    comment.comment_likes = comment.comment_likes.filter(
      (id) => id.toString() !== userId.toString(),
    );
    await comment.save();

    return res.status(200).json({
      success: true,
      message: "Comment Unliked",
      isLiked: false,
      likeCount: comment.comment_likes.length,
    });
  } else {
    // Like comment
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

          console.log(
            "Socket IO và userSockets khả dụng:",
            !!io,
            !!userSockets,
          );

          if (io && userSockets) {
            const recipientSocketId =
              userSockets[comment.comment_userId.toString()];
            console.log("Socket ID của người nhận:", recipientSocketId);

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
      message: "Comment Liked",
      isLiked: true,
      likeCount: comment.comment_likes.length,
    });
  }
});

// Delete Comment
exports.deleteComment = catchAsync(async (req, res, next) => {
  const commentId = req.params.id;
  const userId = req.user._id;
  const { postId } = req.body;

  if (!postId) {
    return next(new ErrorHandler("Post ID is required", 400));
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return next(new ErrorHandler("Comment Not Found", 404));
  }

  // Kiểm tra quyền xóa (chỉ cho phép người comment hoặc admin xóa)
  if (comment.comment_userId.toString() !== userId.toString()) {
    return next(new ErrorHandler("Unauthorized", 401));
  }

  // Xóa các thông báo liên quan đến comment này
  await Notification.deleteMany({ comment: commentId });

  // Lấy left và right của comment cần xóa
  const left = comment.comment_left;
  const right = comment.comment_right;
  const width = right - left + 1;

  // Xóa comment và tất cả các comment con
  await Comment.deleteMany({
    comment_postId: postId,
    comment_left: { $gte: left, $lte: right },
  });

  // Cập nhật left và right của các comment còn lại
  await Comment.updateMany(
    {
      comment_postId: postId,
      comment_left: { $gt: right },
    },
    {
      $inc: { comment_left: -width },
    },
  );

  await Comment.updateMany(
    {
      comment_postId: postId,
      comment_right: { $gt: right },
    },
    {
      $inc: { comment_right: -width },
    },
  );

  return res.status(200).json({
    success: true,
    message: "Comment Deleted",
  });
});

// Get Comments Count
exports.getCommentsCount = catchAsync(async (req, res, next) => {
  const postId = req.params.id;

  const count = await Comment.countDocuments({
    comment_postId: postId,
    isDeleted: false,
  });

  return res.status(200).json({
    success: true,
    count,
  });
});

// Get Parent Comments
exports.getParentComments = catchAsync(async (req, res, next) => {
  const postId = req.params.id;
  const parentId = req.query.parentId;

  let query = {
    comment_postId: postId,
    isDeleted: false,
  };

  if (parentId) {
    // Lấy comment con của một comment cụ thể
    query.comment_parentId = parentId;
  } else {
    // Lấy tất cả comment gốc (không có parent)
    query.comment_parentId = null;
  }

  const comments = await Comment.find(query)
    .populate("comment_userId", "name username avatar")
    .populate("comment_parentId", "comment_content")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    comments,
  });
});

// Get Comment By ID
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

// Posts of Following
exports.getPostsOfFollowing = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const currentPage = Number(req.query.page) || 1;

  const skipPosts = 4 * (currentPage - 1);

  const totalPosts = await Post.find({
    $or: [
      {
        postedBy: {
          $in: user.following,
        },
      },
      {
        postedBy: user._id,
      },
    ],
  }).countDocuments();

  const posts = await Post.find({
    $or: [
      {
        postedBy: {
          $in: user.following,
        },
      },
      {
        postedBy: user._id,
      },
    ],
  })
    .populate("postedBy likes")
    .populate({
      path: "comments",
      populate: {
        path: "user",
      },
    })
    .sort({ $natural: -1 })
    .limit(4)
    .skip(skipPosts);

  return res.status(200).json({
    success: true,
    posts: posts,
    totalPosts,
  });
});

// Save or Unsave Post
exports.saveUnsavePost = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorHandler("Post Not Found", 404));
  }

  if (user.saved.includes(post._id.toString())) {
    user.saved = user.saved.filter((p) => p.toString() !== post._id.toString());
    post.savedBy = post.savedBy.filter(
      (p) => p.toString() !== req.user._id.toString(),
    );
    await user.save();
    await post.save();

    return res.status(200).json({
      success: true,
      message: "Post Unsaved",
    });
  } else {
    user.saved.push(post._id);
    post.savedBy.push(req.user._id);

    await user.save();
    await post.save();

    return res.status(200).json({
      success: true,
      message: "Post Saved",
    });
  }
});

// Get Post Details
exports.getPostDetails = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id)
    .populate("postedBy likes")
    .populate({
      path: "comments",
      populate: {
        path: "user",
      },
    });

  if (!post) {
    return next(new ErrorHandler("Post Not Found", 404));
  }

  res.status(200).json({
    success: true,
    post,
  });
});

// Get All Posts
exports.allPosts = catchAsync(async (req, res, next) => {
  const posts = await Post.find();

  return res.status(200).json({
    posts,
  });
});
