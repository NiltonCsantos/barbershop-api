require("./config/database");

const express = require("express");

const indexRouter = require("./src/app/routes/index");

const userRoutes = require("./src/app/routes/users/users");

const solicitationRoutes = require("./src/app/routes/solicitation/solicitation");

const forgetPassworRoutes= require("./src/app/routes/forgetPassword/forgetPassword");

const cors = require("cors");

const app = express();

app.use(express.json());
// middleware para utilizar json

app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use("/", indexRouter);
app.use("/", userRoutes);
app.use("/", solicitationRoutes);
app.use("/", forgetPassworRoutes);

app.listen(3000, (req, res) => {
  console.log("Servidor iniciado!");
});
