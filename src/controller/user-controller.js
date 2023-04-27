const express = require("express");

const bcrypt = require("bcrypt");

const router = express.Router();

const userModel = require("../models/users");

const jwt = require("jsonwebtoken");

require("dotenv").config();

const secret = process.env.SECRET;

const nodeMailer = require("nodemailer");

const smtpConfig = require("../../config/smtp");

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const user = new userModel({ name, email, password });

  const salt = await bcrypt.genSalt(12);

  user.password = await bcrypt.hash(password, salt);

  const checkedUser = await userModel.findOne({ email: email });

  try {
    if (checkedUser) {
      throw new Error("Usuário já existe");
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
        pass: smtpConfig.pass,
      }
    });

    

    async function sendEmail(user) {
      const barbershop = smtpConfig.user;
      await transporter.sendMail({
        html: `olá, ${user.name}. Seja bem vindo a Navalha BarberShop, a barbearia mais moderna do Estado! É um prazer ver você por aqui :)`,
        subject: "Cadastro no sistema",
        from: barbershop,
        to: user.email,
      });
    }

    await user.save();
    const response= await sendEmail(user);

    res.status(200).json(user);
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email: email });

  try {
    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const checkedPassword = await bcrypt.compare(password, user.password);

    if (!checkedPassword) {
      throw new Error("Senha incorreta");
    } else {
      const token = jwt.sign({}, secret, { expiresIn: "10d" });

      console.log("Chamando");

      res.status(200).json({ id:user.id, name:user.name, token: token });
      
    }
  } catch (error) {
    res.status(422).json(error.message);
  }
});

router.post("/authenticate", async (req, res) => {
  const withAuthentication = require("../app/middlewars/authentication");

  console.log("Testando");

  res.status(500);
});


module.exports = router;
