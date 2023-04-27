const express = require("express");

const router = express.Router();

const userModel = require("../models/users");

const nodeMailer = require("nodemailer");

const smtpConfig = require("../../config/smtp");
const { updateOne } = require("../models/solicitation");

const jwt = require("jsonwebtoken");

const bcrypt= require("bcrypt");

require("dotenv").config();

const secret = process.env.SECRET;

router.post("/login/forgetpassword", async (req, res) => {
  console.log("Esquece a senha");

  try {
    const { email } = req.body;

    const checkedEmail = await userModel.findOne({ email: email });

    console.log("email: " + email);

    if (checkedEmail) {
      const transporter = await nodeMailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: false,
        auth: {
          user: smtpConfig.user,
          pass: smtpConfig.pass,
        },
      });

      const barbershop = smtpConfig.user;
      const rand = stringRandom(8);
      await transporter.sendMail({
        text: `Oi, ${checkedEmail.name} tudo bem? Esse é seu código de redefinição:\n \n \n \t \t \t ${rand}`,
        subject: "Redifinição de senha",
        from: barbershop,
        to: `${checkedEmail.email}`,
      });

      const update = { $set: { code: rand } }
      const filter= {email: checkedEmail.email}

      await userModel.updateOne(filter, update);

      function stringRandom(length) {
        let string = "";
        let characters =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < length; i++) {
          string += characters.charAt(
            Math.floor(Math.random() * characters.length)
          );
        }
        return string;
      }

      res.status(200).json(checkedEmail.id);
    } else {
      throw new Error("Usuário não encontrado");
    }
  } catch (error) {
    res.status(422).json(error.message);
  }
});

router.put("/login/forgetpassword/acesscode", async (req, res) => {

  try {

    const { code, id } = req.body;
  
    const checkedUser = await userModel.findOne({_id: id});  
  
     if(checkedUser.code.match(code)){
  
       res.status(200).json(checkedUser.code);
  
     }else{
      throw new Error("Código incorreto!")
     }
    
  } catch (error) {
    res.status(400).json(error.message);
  }


});

router.put("/login/forgetpassword/newPassword", async(req, res)=>{
let {id, newPassword, confirmPassword}= req.body;

try {

  const salt = await bcrypt.genSalt(12);

  confirmPassword = await bcrypt.hash(newPassword, salt);

  const checkedUser= await userModel.findOne({_id: id})

  if(!checkedUser){
    throw new Error("Não foi possível atualizar sua senha")
  }

  const update = { $set: { password: confirmPassword } }

  const filter= {_id: checkedUser.id}

  await userModel.updateOne(filter,update);

  const transporter = await nodeMailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: false,
    auth: {
      user: smtpConfig.user,
      pass: smtpConfig.pass,
    },
  });
  const barbershop = smtpConfig.user;

  await transporter.sendMail({
    text: `Oi, ${checkedUser.name} tudo bem? Esatmos passando para informar que sua senha foi redefinida com sucesso`,
    subject: "Redifinição de senha",
    from: barbershop,
    to: `${checkedUser.email}`,
  });

  res.status(200).json("ok");

} catch (error) {

    res.status(400).json(error.message)
  
}

})

module.exports = router;
