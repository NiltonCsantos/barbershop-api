const express= require ("express");

const userController= require("../../../controller/user-controller");

const router= express.Router();

router.get("/login", userController);

router.post("/authenticate", userController);

router.post("/login", userController);
router.post("/register", userController);

module.exports=router;
