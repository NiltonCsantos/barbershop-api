var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// src/models/users.js
var require_users = __commonJS({
  "src/models/users.js"(exports2, module2) {
    mongoose = require("mongoose");
    var bcrypt2 = require("bcrypt");
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

// config/smtp.js
var require_smtp = __commonJS({
  "config/smtp.js"(exports2, module2) {
    require("dotenv").config();
    var USER = process.env.EMAIL;
    var PASS = process.env.PASS;
    var smtp = {
      host: "smtp.outlook.com",
      port: 587,
      user: USER,
      pass: PASS
    };
    module2.exports = smtp;
  }
});

// src/app/middlewars/authentication.js
var require_authentication = __commonJS({
  "src/app/middlewars/authentication.js"(exports2, module2) {
    require("dotenv").config();
    console.log("Middlewars");
    var secret2 = process.env.SECRET;
    var jwt2 = require("jsonwebtoken");
    var userModel2 = require_users();
    var withAuthentication = (req, res, next) => {
      const token = req.headers["x-acces-token"];
      if (!token) {
        res.status(401).json({ error: "usu\xE1rio n\xE3o autorizado" });
      } else {
        jwt2.verify(token, secret2, async (err, decode) => {
          if (err) {
            res.status(401).json({ error: "token inv\xE1lido" });
          } else {
            req.email = decode.email;
            const user = await userModel2.findOne({ email: decode.email });
            if (user) {
              req.user = user;
              next();
            }
          }
        });
      }
    };
    module2.exports = withAuthentication;
  }
});

// src/controller/user-controller.js
var express = require("express");
var bcrypt = require("bcrypt");
var router = express.Router();
var userModel = require_users();
var jwt = require("jsonwebtoken");
require("dotenv").config();
var secret = process.env.SECRET;
var nodeMailer = require("nodemailer");
var smtpConfig = require_smtp();
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const user = new userModel({ name, email, password });
  const salt = await bcrypt.genSalt(12);
  user.password = await bcrypt.hash(password, salt);
  const checkedUser = await userModel.findOne({ email });
  try {
    if (checkedUser) {
      throw new Error("Usu\xE1rio j\xE1 existe");
    }
  } catch (error) {
    res.status(422).json(error.message);
  }
  if (!checkedUser) {
    const transporter = await nodeMailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: false,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass
      }
    });
    async function sendEmail(user2) {
      const barbershop = smtpConfig.user;
      await transporter.sendMail({
        html: `ol\xE1, ${user2.name}. Seja bem vindo a Navalha BarberShop, a barbearia mais moderna do Estado! \xC9 um prazer ver voc\xEA por aqui :)`,
        subject: "Cadastro no sistema",
        from: barbershop,
        to: user2.email
      });
    }
    await user.save();
    const response = await sendEmail(user);
    res.status(200).json(user);
  }
});
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });
  try {
    if (!user) {
      throw new Error("Usu\xE1rio n\xE3o encontrado");
    }
    const checkedPassword = await bcrypt.compare(password, user.password);
    if (!checkedPassword) {
      throw new Error("Senha incorreta");
    } else {
      const token = jwt.sign({}, secret, { expiresIn: "10d" });
      console.log("Chamando");
      res.status(200).json({ id: user.id, name: user.name, token });
    }
  } catch (error) {
    res.status(422).json(error.message);
  }
});
router.post("/authenticate", async (req, res) => {
  const withAuthentication = require_authentication();
  console.log("Testando");
  res.status(500);
});
module.exports = router;
