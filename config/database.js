const mongoose= require("mongoose");

mongoose.Promise=global.Promise;

require("dotenv").config();
const MONGO_URL= process.env.MONGO_URL;

mongoose.connect(MONGO_URL,{
 useNewUrlParser: true,
 useUnifiedTopology: true,
}).then(
  ()=> console.log("Conected!")
  ).catch((err)=>console.error(err));