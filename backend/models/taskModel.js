const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    assigner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
    },
    content: {
      type: String,
    },
    done: {
      type: Boolean,
      default: false,
    },
    time: {
      type: String,
      default: "Không thời hạn",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Task", taskSchema);
