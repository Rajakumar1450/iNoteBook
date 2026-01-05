const express = require("express");
const db = require("../config/db");
const router = express.Router();

router.post("/", async (req, res) => {
  // if we use this "/api/login"  here and /api/login in the server.js also the api becomes /api/login/api/login
  const { name, email, password } = req.body;
  try {
    const sql = "INSERT INTO users(name, email, password) VALUES (?, ?, ?)";
    await db.execute(sql, [name, email, password]);
    res.status(200).json({ message: "user resigter" });
  } catch (error) {
    console.log(`server error while register `);
  }
});

module.exports = router;
