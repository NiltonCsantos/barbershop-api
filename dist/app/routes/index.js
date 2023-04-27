var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// src/controller/index-controller.js
var require_index_controller = __commonJS({
  "src/controller/index-controller.js"(exports2, module2) {
    var express2 = require("express");
    var router2 = express2.Router();
    router2.get("/", async (req, res) => {
      res.status(200);
    });
    module2.exports = router2;
  }
});

// src/app/routes/index.js
var express = require("express");
var router = express.Router();
var indexController = require_index_controller();
router.get("/", indexController);
module.exports = router;
