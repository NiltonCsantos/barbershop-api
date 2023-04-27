var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// src/models/users.js
var require_users = __commonJS({
  "src/models/users.js"(exports2, module2) {
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
    module2.exports = mongoose.model("users", userSchema);
  }
});

// src/app/middlewars/authentication.js
require("dotenv").config();
console.log("Middlewars");
var secret = process.env.SECRET;
var jwt = require("jsonwebtoken");
var userModel = require_users();
var withAuthentication = (req, res, next) => {
  const token = req.headers["x-acces-token"];
  if (!token) {
    res.status(401).json({ error: "usu\xE1rio n\xE3o autorizado" });
  } else {
    jwt.verify(token, secret, async (err, decode) => {
      if (err) {
        res.status(401).json({ error: "token inv\xE1lido" });
      } else {
        req.email = decode.email;
        const user = await userModel.findOne({ email: decode.email });
        if (user) {
          req.user = user;
          next();
        }
      }
    });
  }
};
module.exports = withAuthentication;
