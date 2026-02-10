const jwt = require("jsonwebtoken");
// const dotenv = require("dotenv");
// dotenv.config();
const env = require("../env");
const jwt_secret = env.JWT_SECRET;
const fetchuser = (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    return res.status(401).send("access denied");
  }
  try {
    const data = jwt.verify(token, jwt_secret);
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send("access denied");
  }
};

module.exports = fetchuser;
