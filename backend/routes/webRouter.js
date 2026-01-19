const express = require("express");
const user_route = express();

user_route.set("view engine", "ejs");
user_route.set("views", "./views");

// const user_controller = require("../controllers/authController");

// user_route.get("/mail_verification", user_controller.verifyMail);

module.exports = user_route;
