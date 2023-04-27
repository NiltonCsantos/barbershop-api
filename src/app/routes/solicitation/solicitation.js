const express= require("express");

const router= express.Router();

const solicitationController= require("../../../controller/solicitation-contoller")

router.post("/solicitation", solicitationController);
router.post("/login/solicitation", solicitationController);

module.exports=router;