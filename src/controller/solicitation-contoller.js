const express = require("express");

const router = express.Router();

const nodeMailer = require("nodemailer");

const smtpConfig = require("../../config/smtp");

const solicitationModel = require("../models/solicitation");

const userModel = require("../models/users");

router.post("/solicitation", async (req, res) => {
  try {
    let { time, solicitation, date, professional, user } = req.body;

    let newdate= date.split("-");

    let aux;

    aux=newdate[0];
    newdate[0]=newdate[2];
    newdate[2]=aux;

    date="";
    for (let i = 0; i < newdate.length; i++) {
     
        i<2?date += newdate[i]+"-": date += newdate[i];
     
    }

    console.log(date);


    const request = await solicitationModel
      .find()
      .where("date")
      .equals(date)
      .where("time")
      .equals(time)
      .where("professional")
      .equals(professional);

    if (request.length == 0) {

      const checkedDate= await solicitationModel.find().where("user").equals(user);

      checkedDate.forEach(element => {

        if(element.user==user && element.date==date){
          throw new Error("Você não pode marcar mais de um horário no mesmo dia!");
        }
        
      });

      const order = new solicitationModel({
        time: time,
        solicitation: solicitation,
        date: date,
        professional: professional,
        user: user,
      });

      await order.save();

      const responseUser = await getUser(user);

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
         text: `Oi, ${responseUser.name} tudo bem? Estamos passando para te notificar que deu tudo certo ao marcar seu horário! Te aguardamos às ${order.time}, do dia ${order.date}.\nSegue os dados do agendamento: O que você irá fazer: ${order.solicitation}\nProfissional escolhido: ${order.professional}`,
         subject: "Agendamento",
         from: barbershop,
         to: `${responseUser.email}`,
       });

      res.status(200).json({ msg: "Deu certo" });
    } else {
      // request;
      throw new Error(
        "Horáio indisponível. Tente o mesmo horário com outro profissional ou selecione um horário diferente"
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

router.post("/login/solicitation", async(req, res)=>{

  let {date}=req.body;

  let newdate= date.split("-");

  let aux;

  aux=newdate[0];
  newdate[0]=newdate[2];
  newdate[2]=aux;

  date="";
  for (let i = 0; i < newdate.length; i++) {
   
      i<2?date += newdate[i]+"-": date += newdate[i];
   
  }

  const resul= await solicitationModel.find().where("date").equals(date);

  let listTime=[];

  for (let i = 0; i < resul.length; i++) {
     listTime[i] =resul[i].time;
  }

  res.status(200).json(listTime);

})

module.exports = router;
