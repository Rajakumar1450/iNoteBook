const { body } = require("express-validator");
const changePasswordvalidation = [
  body("newPassword")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
      minNumbers: 1,
    })
    .withMessage(
      "Password must be at least 8 characters long and include uppercase, lowercase, 1 numbers, and a symbol",
    ),
  body("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("password and confirm password do not match");
      }
      return true;
    }),
];
module.exports = changePasswordvalidation;
