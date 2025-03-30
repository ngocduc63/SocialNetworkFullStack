const express = require("express");
const {
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  getUserTasks,
} = require("../controllers/taskController");
const { isAuthenticated } = require("../middlewares/auth");

const router = express();

router.route("/getUserTasks/:userId").get(isAuthenticated, getUserTasks);
router.route("/createTask").post(isAuthenticated, createTask);
router.route("/updateTask").put(isAuthenticated, updateTask);
router.route("/updateTaskStatus").put(isAuthenticated, updateTaskStatus);
router.route("/deleteTask/:id").delete(isAuthenticated, deleteTask);

module.exports = router;
