// src/models/solicitation.js
var mongoose = require("mongoose");
var solicitationSchema = mongoose.Schema({
  time: { type: String, required: true },
  solicitation: { type: String, required: true },
  date: { type: String, required: true },
  professional: { type: String, required: true },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "Users",
    required: true
  }
});
module.exports = mongoose.model("solicitation", solicitationSchema);
