"use strict";
const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "Comment";
const COLLECTION_NAME = "Comments";

const commentSchema = new Schema(
  {
    comment_postId: { type: Schema.Types.ObjectId, ref: "Post" }, // Thay đổi từ product sang post
    comment_userId: { type: Schema.Types.ObjectId, ref: "User" }, // Sử dụng ObjectId cho user thay vì Number
    comment_content: { type: String, required: true, trim: true }, // Thêm required và trim
    comment_left: { type: Number, default: 0 },
    comment_right: { type: Number, default: 0 },
    comment_parentId: { type: Schema.Types.ObjectId, ref: DOCUMENT_NAME },
    comment_likes: [{ type: Schema.Types.ObjectId, ref: "User" }], // Thêm trường theo dõi lượt thích
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  },
);

// Thêm index để cải thiện hiệu suất truy vấn
commentSchema.index({ comment_postId: 1, comment_left: 1, comment_right: 1 });
commentSchema.index({ comment_postId: 1, comment_parentId: 1 });

module.exports = model(DOCUMENT_NAME, commentSchema);
