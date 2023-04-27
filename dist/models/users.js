// src/models/users.js
mongoose = require("mongoose");
var bcrypt = require("bcrypt");
var userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  code: { type: String, default: "" },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});
module.exports = mongoose.model("users", userSchema);
