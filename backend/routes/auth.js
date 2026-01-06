const express = require("express");
const db = require("../config/db");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const jwt_secret = process.env.JWT_SECRET;
const validateRegistration = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("name is required")
    .isLength({ min: 3 })
    .withMessage("name should have 3 letters"),
  body("email")
    .isEmail()
    .withMessage("provide a valid email")
    .normalizeEmail()
    .custom(async (email) => {
      const [user] = await db.execute("SELECT ID FROM users WHERE email=?", [
        email,
      ]);
      if (user.length > 0) {
        throw new Error("email is already register");
      }
      return true;
    }),
  body("password")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
      minNumbers: 1,
    })
    .withMessage(
      "Password must be at least 8 characters long and include uppercase, lowercase, 1 numbers, and a symbol"
    ),
  body("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("password and confirm password do not match");
      }
      return true;
    }),
];
// api:localhost:5000/api/auth/signup
router.post("/signup", validateRegistration, async (req, res) => {
  // if we use this "/api/login"  here and /api/login in the server.js also the api becomes /api/login/api/login
  const err = validationResult(req);
  if (!err.isEmpty()) {
    return res.status(400).json({ err: err.array() });
  }
  const { name, email, password } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  try {
    const sql = "INSERT INTO users(name, email, password) VALUES (?, ?, ?)";
    const [Result] = await db.execute(sql, [name, email, hashedPassword]);
    const payload = {
      user: {
        id: Result.insertId, // This is much faster than running a SELECT query
      },
    };
    const authToken = jwt.sign(payload, jwt_secret, {
      expiresIn: "24h",
    });
    res.status(200).json({ authToken });
  } catch (error) {
    res
      .status(500)
      .json({ error: "internal server error while user resigtration", error });
  }
});

module.exports = router;
