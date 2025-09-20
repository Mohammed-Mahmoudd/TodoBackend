const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const tasksSchema = new Schema({
  userId: String,
  taskTitle: String,
  taskDescription: String,
  taskDate: String,
  status: String,
  categoryId: String,
});

const Tasks = mongoose.model("task", tasksSchema, "Tasks");

module.exports = Tasks;
