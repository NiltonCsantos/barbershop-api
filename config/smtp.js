require("dotenv").config();

const USER= process.env.USER;
const PASS= process.env.PASS;
const smtp={
  host:"smtp.outlook.com",
  port:587,
  user:USER,
  pass:PASS
};

module.exports= smtp;