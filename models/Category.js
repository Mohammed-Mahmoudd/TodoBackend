const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CategoryScema = new Schema({
  categoryName: String,
  userId: String,
  taskNumber: Number,
  icon: String,
});

const Category = mongoose.model("category", CategoryScema, "Categories");

module.exports = Category;
