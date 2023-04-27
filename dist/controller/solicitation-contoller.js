var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

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

// src/controller/solicitation-contoller.js
var express = require("express");
var router = express.Router();
var nodeMailer = require("nodemailer");
var smtpConfig = require_smtp();
var solicitationModel = require_solicitation();
var userModel = require_users();
router.post("/solicitation", async (req, res) => {
  try {
    let { time, solicitation, date, professional, user } = req.body;
    let newdate = date.split("-");
    let aux;
    aux = newdate[0];
    newdate[0] = newdate[2];
    newdate[2] = aux;
    date = "";
    for (let i = 0; i < newdate.length; i++) {
      i < 2 ? date += newdate[i] + "-" : date += newdate[i];
    }
    console.log(date);
    const request = await solicitationModel.find().where("date").equals(date).where("time").equals(time).where("professional").equals(professional);
    if (request.length == 0) {
      const checkedDate = await solicitationModel.find().where("user").equals(user);
      checkedDate.forEach((element) => {
        if (element.user == user && element.date == date) {
          throw new Error("Voc\xEA n\xE3o pode marcar mais de um hor\xE1rio no mesmo dia!");
        }
      });
      const order = new solicitationModel({
        time,
        solicitation,
        date,
        professional,
        user
      });
      await order.save();
      const responseUser = await getUser(user);
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
        text: `Oi, ${responseUser.name} tudo bem? Estamos passando para te notificar que deu tudo certo ao marcar seu hor\xE1rio! Te aguardamos \xE0s ${order.time}, do dia ${order.date}.
Segue os dados do agendamento: O que voc\xEA ir\xE1 fazer: ${order.solicitation}
Profissional escolhido: ${order.professional}`,
        subject: "Agendamento",
        from: barbershop,
        to: `${responseUser.email}`
      });
      res.status(200).json({ msg: "Deu certo" });
    } else {
      throw new Error(
        "Hor\xE1io indispon\xEDvel. Tente o mesmo hor\xE1rio com outro profissional ou selecione um hor\xE1rio diferente"
      );
    }
  } catch (error) {
    res.status(422).json(error.message);
  }
});
async function getUser(userId) {
  const user = await userModel.findOne({ _id: userId });
  return user;
}
router.post("/login/solicitation", async (req, res) => {
  let { date } = req.body;
  let newdate = date.split("-");
  let aux;
  aux = newdate[0];
  newdate[0] = newdate[2];
  newdate[2] = aux;
  date = "";
  for (let i = 0; i < newdate.length; i++) {
    i < 2 ? date += newdate[i] + "-" : date += newdate[i];
  }
  const resul = await solicitationModel.find().where("date").equals(date);
  let listTime = [];
  for (let i = 0; i < resul.length; i++) {
    listTime[i] = resul[i].time;
  }
  res.status(200).json(listTime);
});
module.exports = router;
