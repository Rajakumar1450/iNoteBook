const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const sendmail = require("../helpers/sendMail");
const { validationResult } = require("express-validator");
dotenv.config();
const jwt_secret = process.env.JWT_SECRET;
exports.register = async (req, res) => {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    return res.status(400).json({ err: err.array() });
  }

  const { name, email, password } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 1. Insert User
    const sql = "INSERT INTO users(name, email, password) VALUES (?, ?, ?)";
    const [result] = await db.execute(sql, [name, email, hashedPassword]);

    const payload = { user: { id: result.insertId } };
    const authToken = jwt.sign(payload, jwt_secret, { expiresIn: "24h" });

    // 2. Prepare Email Content (HTML)
    let mailSubject = "Mail Verification";
    let content = `
      <p>Hi ${name},</p>
      <p>Please <a href="http://localhost:5000/api/auth/mail-verification?token=${authToken}">click here</a> to verify your mail.</p>
    `;

    // 3. Update User with Token (Using Await and Correct Parameter Array)
    await db.execute("UPDATE users SET token=? WHERE email = ?", [
      authToken,
      email,
    ]);

    // 4. Send the Mail
    await sendmail(email, mailSubject, content);

    res.status(200).json({
      authToken,
      message: "Signup successful, verification email sent.",
    });
  } catch (error) {
    console.error("Signup Error: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.login = async (req, res) => {
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
};

exports.getuser = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.execute(
      "SELECT id , name,email,created_at FROM users WHERE id =? ",
      [userId]
    );
    if (rows.length === 0) {
      return res.status(404).send("user not found");
    }
    res.send(rows[0], user);
  } catch (error) {
    console.log(error);
    res.status(401).send({ error: "server error" });
  }
};
