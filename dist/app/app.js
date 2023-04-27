var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// config/database.js
var require_database = __commonJS({
  "config/database.js"() {
    var mongoose2 = require("mongoose");
    mongoose2.Promise = global.Promise;
    require("dotenv").config();
    var MONGO_URL = process.env.MONGO_URL;
    mongoose2.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).then(
      () => console.log("Conected!")
    ).catch((err) => console.error(err));
  }
});

// src/controller/index-controller.js
var require_index_controller = __commonJS({
  "src/controller/index-controller.js"(exports, module2) {
    var express2 = require("express");
    var router = express2.Router();
    router.get("/", async (req, res) => {
      res.status(200);
    });
    module2.exports = router;
  }
});

// src/app/routes/index.js
var require_routes = __commonJS({
  "src/app/routes/index.js"(exports, module2) {
    var express2 = require("express");
    var router = express2.Router();
    var indexController = require_index_controller();
    router.get("/", indexController);
    module2.exports = router;
  }
});

// src/models/users.js
var require_users = __commonJS({
  "src/models/users.js"(exports, module2) {
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
  "config/smtp.js"(exports, module2) {
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
  "src/app/middlewars/authentication.js"(exports, module2) {
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
    module2.exports = withAuthentication;
  }
});

// src/controller/user-controller.js
var require_user_controller = __commonJS({
  "src/controller/user-controller.js"(exports, module2) {
    var express2 = require("express");
    var bcrypt = require("bcrypt");
    var router = express2.Router();
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
    module2.exports = router;
  }
});

// src/app/routes/users/users.js
var require_users2 = __commonJS({
  "src/app/routes/users/users.js"(exports, module2) {
    var express2 = require("express");
    var userController = require_user_controller();
    var router = express2.Router();
    router.get("/login", userController);
    router.post("/authenticate", userController);
    router.post("/login", userController);
    router.post("/register", userController);
    module2.exports = router;
  }
});

// src/models/solicitation.js
var require_solicitation = __commonJS({
  "src/models/solicitation.js"(exports, module2) {
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

// src/controller/solicitation-contoller.js
var require_solicitation_contoller = __commonJS({
  "src/controller/solicitation-contoller.js"(exports, module2) {
    var express2 = require("express");
    var router = express2.Router();
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
    module2.exports = router;
  }
});

// src/app/routes/solicitation/solicitation.js
var require_solicitation2 = __commonJS({
  "src/app/routes/solicitation/solicitation.js"(exports, module2) {
    var express2 = require("express");
    var router = express2.Router();
    var solicitationController = require_solicitation_contoller();
    router.post("/solicitation", solicitationController);
    router.post("/login/solicitation", solicitationController);
    module2.exports = router;
  }
});

// src/controller/forgetPasswordController.js
var require_forgetPasswordController = __commonJS({
  "src/controller/forgetPasswordController.js"(exports, module2) {
    var express2 = require("express");
    var router = express2.Router();
    var userModel = require_users();
    var nodeMailer = require("nodemailer");
    var smtpConfig = require_smtp();
    var { updateOne } = require_solicitation();
    var jwt = require("jsonwebtoken");
    var bcrypt = require("bcrypt");
    require("dotenv").config();
    var secret = process.env.SECRET;
    router.post("/login/forgetpassword", async (req, res) => {
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
    router.put("/login/forgetpassword/acesscode", async (req, res) => {
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
    router.put("/login/forgetpassword/newPassword", async (req, res) => {
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
    module2.exports = router;
  }
});

// src/app/routes/forgetPassword/forgetPassword.js
var require_forgetPassword = __commonJS({
  "src/app/routes/forgetPassword/forgetPassword.js"(exports, module2) {
    var express2 = require("express");
    var router = express2.Router();
    var forgetPasswordController = require_forgetPasswordController();
    router.post("/login/forgetpassword", forgetPasswordController);
    router.put("/login/forgetpassword/acesscode", forgetPasswordController);
    router.put("/login/forgetpassword/newPassword", forgetPasswordController);
    module2.exports = router;
  }
});

// src/app/app.js
require_database();
var express = require("express");
var indexRouter = require_routes();
var userRoutes = require_users2();
var solicitationRoutes = require_solicitation2();
var forgetPassworRoutes = require_forgetPassword();
var cors = require("cors");
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/", indexRouter);
app.use("/", userRoutes);
app.use("/", solicitationRoutes);
app.use("/", forgetPassworRoutes);
app.listen({
  host: "0.0.0.0",
  port: process.env.PORT ? Number(process.env.PORT) : 3333
});
