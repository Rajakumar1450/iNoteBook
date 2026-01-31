const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const dotenv = require("dotenv");
const fetchuser = require("../middleware/fetchuser");
const changepasswordvalidation = require("../helpers/changePasswordValidation");
const validateRegistration = require("../helpers/validationChecks");
const {
  register,
  login,
  getuser,
  getOtp,
  verifyOtp,
  getOtpForForgetPassword,
  changePassword,
  googlesignin,
} = require("../controllers/authController");

dotenv.config();
//Route 1: api:localhost:5000/api/auth/signup
router.post(
  "/getOtp",
  [body("email").isEmail().withMessage("Enters A Valid Mail")],
  getOtp,
);
//Route 1: api:localhost:5000/api/auth/verifyOtp
router.post("/verifyOtp", verifyOtp);
//Route 1: api:localhost:5000/api/auth/signup
router.post("/signup", validateRegistration, register);

router.post("/forgetpassword", getOtpForForgetPassword);
router.post("/changepassword", changepasswordvalidation, changePassword);
// Route 2 : /api/auth/login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("enter a valid email"),
    body("password").exists().withMessage("password cannot be blank"),
  ],
  login,
);
router.post("/googleLogin", googlesignin);
router.post("/getuser", fetchuser, getuser);
module.exports = router;
