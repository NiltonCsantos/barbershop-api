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

// src/models/solicitation.js
var require_solicitation = __commonJS({
  "src/models/solicitation.js"(exports2, module2) {
    var mongoose2 = require("mongoose");
    var solicitationSchema = mongoose2.Schema({
      time: { type: String, required: true },
      solicitation: { type: String, required: true },
      date: { type: String, required: true },
      professional: { type: String, required: true },
      user: {
        type: mongoose2.Types.ObjectId,
        ref: "Users",
        required: true
      }
    });
    module2.exports = mongoose2.model("solicitation", solicitationSchema);
  }
});

// src/controller/forgetPasswordController.js
var require_forgetPasswordController = __commonJS({
  "src/controller/forgetPasswordController.js"(exports2, module2) {
    var express2 = require("express");
    var router2 = express2.Router();
    var userModel = require_users();
    var nodeMailer = require("nodemailer");
    var smtpConfig = require_smtp();
    var { updateOne } = require_solicitation();
    var jwt = require("jsonwebtoken");
    var bcrypt = require("bcrypt");
    require("dotenv").config();
    var secret = process.env.SECRET;
    router2.post("/login/forgetpassword", async (req, res) => {
      console.log("Esquece a senha");
      try {
        const { email } = req.body;
        const checkedEmail = await userModel.findOne({ email });
        console.log("email: " + email);
        if (checkedEmail) {
          let stringRandom2 = function(length) {
            let string = "";
            let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (let i = 0; i < length; i++) {
              string += characters.charAt(
                Math.floor(Math.random() * characters.length)
              );
            }
            return string;
          };
          var stringRandom = stringRandom2;
          const transporter = await nodeMailer.createTransport({
            host: smtpConfig.host,
            port: smtpConfig.port,
            secure: false,
            auth: {
              user: smtpConfig.user,
              pass: smtpConfig.pass
            }
          });
          const barbershop = smtpConfig.user;
          const rand = stringRandom2(8);
          await transporter.sendMail({
            text: `Oi, ${checkedEmail.name} tudo bem? Esse \xE9 seu c\xF3digo de redefini\xE7\xE3o:
 
 
 	 	 	 ${rand}`,
            subject: "Redifini\xE7\xE3o de senha",
            from: barbershop,
            to: `${checkedEmail.email}`
          });
          const update = { $set: { code: rand } };
          const filter = { email: checkedEmail.email };
          await userModel.updateOne(filter, update);
          res.status(200).json(checkedEmail.id);
        } else {
          throw new Error("Usu\xE1rio n\xE3o encontrado");
        }
      } catch (error) {
        res.status(422).json(error.message);
      }
    });
    router2.put("/login/forgetpassword/acesscode", async (req, res) => {
      try {
        const { code, id } = req.body;
        const checkedUser = await userModel.findOne({ _id: id });
        if (checkedUser.code.match(code)) {
          res.status(200).json(checkedUser.code);
        } else {
          throw new Error("C\xF3digo incorreto!");
        }
      } catch (error) {
        res.status(400).json(error.message);
      }
    });
    router2.put("/login/forgetpassword/newPassword", async (req, res) => {
      let { id, newPassword, confirmPassword } = req.body;
      try {
        const salt = await bcrypt.genSalt(12);
        confirmPassword = await bcrypt.hash(newPassword, salt);
        const checkedUser = await userModel.findOne({ _id: id });
        if (!checkedUser) {
          throw new Error("N\xE3o foi poss\xEDvel atualizar sua senha");
        }
        const update = { $set: { password: confirmPassword } };
        const filter = { _id: checkedUser.id };
        await userModel.updateOne(filter, update);
        const transporter = await nodeMailer.createTransport({
          host: smtpConfig.host,
          port: smtpConfig.port,
          secure: false,
          auth: {
            user: smtpConfig.user,
            pass: smtpConfig.pass
          }
        });
        const barbershop = smtpConfig.user;
        await transporter.sendMail({
          text: `Oi, ${checkedUser.name} tudo bem? Esatmos passando para informar que sua senha foi redefinida com sucesso`,
          subject: "Redifini\xE7\xE3o de senha",
          from: barbershop,
          to: `${checkedUser.email}`
        });
        res.status(200).json("ok");
      } catch (error) {
        res.status(400).json(error.message);
      }
    });
    module2.exports = router2;
  }
});

// src/app/routes/forgetPassword/forgetPassword.js
var express = require("express");
var router = express.Router();
var forgetPasswordController = require_forgetPasswordController();
router.post("/login/forgetpassword", forgetPasswordController);
router.put("/login/forgetpassword/acesscode", forgetPasswordController);
router.put("/login/forgetpassword/newPassword", forgetPasswordController);
module.exports = router;
