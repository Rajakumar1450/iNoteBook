const { body } = require("express-validator");
const db = require("../config/db");
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
module.exports = validateRegistration;
