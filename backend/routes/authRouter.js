const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const dotenv = require("dotenv");
const fetchuser = require("../middleware/fetchuser");

const validateRegistration = require("../helpers/validationChecks");
const { register, login, getuser } = require("../controllers/authController");

dotenv.config();
//Route 1: api:localhost:5000/api/auth/signup
router.post("/signup", validateRegistration, register);
// Route 2 : /api/auth/login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("enter a valid email"),
    body("password").exists().withMessage("password cannot be blank"),
  ],
  login
);
router.post("/getuser", fetchuser, getuser);
module.exports = router;
