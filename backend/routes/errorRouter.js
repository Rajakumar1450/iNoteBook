const express = require("express");
const router = express.Router();

const errorHandler = require("../controllers/errorHandler");

router.use(errorHandler.error404, errorHandler.error500);

module.exports = router;
