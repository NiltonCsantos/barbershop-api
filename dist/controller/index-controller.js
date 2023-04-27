// src/controller/index-controller.js
var express = require("express");
var router = express.Router();
router.get("/", async (req, res) => {
  res.status(200);
});
module.exports = router;
