const Task = require("../models/taskModel");

// Thêm task mới
exports.createTask = async (req, res) => {
  try {
    const { users, assigner, title, content, time } = req.body;
    const newTask = new Task({ users, assigner, title, content, time });
    await newTask.save();

    const populatedTask = await Task.findById(newTask._id).populate(
      "users assigner",
    );

    res.status(201).json({ success: true, task: populatedTask });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Sửa task
exports.updateTask = async (req, res) => {
  try {
    const { _id: idTask } = req.body;
    const updatedTask = await Task.findByIdAndUpdate(idTask, req.body, {
      new: true,
    }).populate("users assigner");
    if (!updatedTask)
      return res
        .status(404)
        .json({ success: false, message: "Task không tồn tại" });
    res.status(200).json({ success: true, task: updatedTask });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Xóa task
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTask = await Task.findByIdAndDelete(id);
    if (!deletedTask)
      return res
        .status(404)
        .json({ success: false, message: "Task không tồn tại" });
    res.status(200).json({ success: true, message: "Task đã được xóa" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Đánh dấu task hoàn thành
exports.updateTaskStatus = async (req, res) => {
  try {
    const { _id: idTask, done } = req.body;
    const updatedTask = await Task.findByIdAndUpdate(
      idTask,
      { done },
      { new: true },
    ).populate("users assigner");
    if (!updatedTask)
      return res
        .status(404)
        .json({ success: false, message: "Task không tồn tại" });
    res.status(200).json({ success: true, task: updatedTask });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Lấy danh sách task liên quan đến userId
exports.getUserTasks = async (req, res) => {
  try {
    const { userId } = req.params;
    const tasks = await Task.find({
      $or: [{ users: userId }, { assigner: userId }],
    }).populate("users assigner");
    res.status(200).json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
