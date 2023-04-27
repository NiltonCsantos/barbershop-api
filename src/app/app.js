require("../../config/database");

const express = require("express");

const indexRouter = require("./routes/index");

const userRoutes = require("./routes/users/users");

const solicitationRoutes = require("./routes/solicitation/solicitation");

const forgetPassworRoutes= require("./routes/forgetPassword/forgetPassword");

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

app.listen({
  port: process.env.PORT? Number(process.env.PORT):3333 ,
})
