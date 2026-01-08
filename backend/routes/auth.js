const express = require("express");
const db = require("../config/db");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const fetchuser = require("../middleware/fetchuser");
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
//Route 1: api:localhost:5000/api/auth/signup
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
    console.log(error);
    res
      .status(500)
      .json({ error: "internal server error while user resigtration", error });
  }
});
// Route 2 : /api/auth/login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("enter a valid email"),
    body("password").exists().withMessage("password cannot be blank"),
  ],
  async (req, res) => {
    const { email, password } = req.body;
    try {
      const [rows] = await db.execute("SELECT * FROM users WHERE email= ?", [
        email,
      ]);
      if (rows.length === 0) {
        res.status(400).json("Either email or password is not correct");
      }
      const user = rows[0];
      const ismatch = await bcrypt.compare(password, user.password);
      if (!ismatch) {
        res.status(400).json("invalid login credentials");
      }
      const payload = {
        user: {
          id: user.id,
        },
      };
      const { authToken } = jwt.sign(payload, jwt_secret, {
        expiresIn: "24h",
      });
      // res.send({
      //   authToken,
      //   // user: { id: user.id, name: user.name, email: user.email },
      //   //message: "Login successful",
      // });
      res.status(200).json({ authToken, message: "login seccessful" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "server error" });
    }
  }
);
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.execute(
      "SELECT id , name,email,created_at FROM users WHERE id =? ",
      [userId]
    );
    if (rows.length === 0) {
      return res.status(404).send("user not found");
    }
    res.send(rows[0]);
    res.send(user);
  } catch (error) {
    console.log(error);
    res.status(401).send({ error: "server error" });
  }
});
module.exports = router;
