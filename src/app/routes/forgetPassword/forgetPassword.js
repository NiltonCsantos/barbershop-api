const express= require("express");

const router= express.Router();

const forgetPasswordController= require("../../../controller/forgetPasswordController");

router.post("/login/forgetpassword", forgetPasswordController);
router.put("/login/forgetpassword/acesscode", forgetPasswordController);
router.put("/login/forgetpassword/newPassword", forgetPasswordController);

module.exports=router;