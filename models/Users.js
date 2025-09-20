const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: String,
  email: String,
  password: String,
});

const Users = mongoose.model("User", userSchema, "Auth");

module.exports = Users;
