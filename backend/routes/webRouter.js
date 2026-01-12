const express = require("express");
const user_route = express();

user_route.set("view engine", "ejs");
user_route.set("views", "../views");
