require('dotenv').config();

console.log("Middlewars")

const secret= process.env.SECRET;

const jwt= require("jsonwebtoken");

const userModel= require("../../models/users");

const withAuthentication=(req, res, next)=>{

  const token= req.headers["x-acces-token"];

  if(!token){
     res.status(401).json({error: "usuário não autorizado"});
  }else{

    jwt.verify(token, secret, async (err, decode)=>{

      if(err){
         res.status(401).json({error:"token inválido"})
      }else{

        req.email=decode.email;

        const user= await userModel.findOne({email: decode.email})

        if(user){
          req.user=user;
          next()
        }
        
      }
  
    })
    
  }

}

module.exports=withAuthentication;