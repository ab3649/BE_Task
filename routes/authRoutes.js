const express = require("express");
const {
  registerVendor,
  loginVendor,
} = require("../controllers/authController");
const router = express.Router();

router.post("/register", registerVendor);
router.post("/login", loginVendor);

module.exports = router;
