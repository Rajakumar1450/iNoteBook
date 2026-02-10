const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const dotenv = require("dotenv");
const sendMail = require("../helpers/sendMail");
const { validationResult } = require("express-validator");
const { OAuth2Client } = require("google-auth-library");
const { env } = require("../env");
// dotenv.config();
const jwt_secret = env.JWT_SECRET;

exports.getOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const [existing] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (existing.length > 0) {
      return res.status(400).json({ mssg: "You are already register" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await db.execute(
      "REPLACE INTO otp_verification (email , otp , expires_in) VALUES (?,?,DATE_ADD(NOW(), INTERVAL 1 MINUTE))",
      [email, hashedOtp],
    );
    let content = `<p>Hii your OTP For registering to the Inotebook the digital cloud based notebook in your Hand is ${otp} </p>
  <p>Kindly <b> Do Not </b> Share This OTP to anyone 
  Expires in 1 minutes `;
    sendMail(email, "verify Your Mail", content);
    res
      .status(200)
      .json({ message: "OTP Sent To This Email Kindly Check your Email" });
  } catch (error) {
    res.status(400).json({ error: "Internal Error" });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const [rows] = await db.execute(
      "SELECT * FROM otp_verification WHERE email = ?",
      [email],
    );
    if (rows.length === 0) {
      return res.status(400).json({ message: "Request a Otp first!" });
    }
    const { otp: savedOtp, expires_in } = rows[0];
    if (new Date() > new Date(expires_in))
      return res.status(400).json({ message: "Otp Expired!" });
    const ismatch = await bcrypt.compare(otp, savedOtp);
    if (!ismatch)
      return res.status(400).json({ message: "OTP is NOT Matched" });
    const token = jwt.sign({ email }, jwt_secret, { expiresIn: "5m" });
    await db.execute("DELETE FROM otp_verification WHERE email = ?", [email]);
    await db.execute("UPDATE users SET is_verified = 1 WHERE email = ?", [
      email,
    ]);
    res.status(200).json({ token, message: "Email Verified successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.register = async (req, res) => {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    return res.status(400).json({ err: err.array() });
  }

  const { name, password, token } = req.body;

  try {
    const decoded = jwt.verify(token, jwt_secret);
    const email = decoded.email;
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length > 0) {
      return res
        .status(400)
        .json({ message: "User is already Registered You Can login" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 1. Insert User
    const sql = "INSERT INTO users(name, email, password) VALUES (?, ?, ?)";
    const [result] = await db.execute(sql, [name, email, hashedPassword]);

    const payload = { user: { id: result.insertId } };
    const authToken = jwt.sign(payload, jwt_secret);

    // 3. Update User with Token (Using Await and Correct Parameter Array)
    await db.execute("UPDATE users SET token=? WHERE email = ?", [
      authToken,
      email,
    ]);

    res.status(200).json({
      authToken,
      message: "Signup successful.",
    });
  } catch (error) {
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
    const authToken = jwt.sign(payload, jwt_secret, {
      expiresIn: "24h",
    });

    res.status(200).json({ authToken, message: "login seccessful" });
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
};

exports.getuser = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.execute(
      "SELECT id , name,email,created_at FROM users WHERE id =? ",
      [userId],
    );
    if (rows.length === 0) {
      return res.status(404).send("user not found");
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(401).send({ error: "server error" });
  }
};

exports.getOtpForForgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const [rows] = await db.execute("SELECT id FROM users WHERE email= ?", [
      email,
    ]);
    if (rows.length === 0)
      return res
        .status(200)
        .json({ message: "If Email is registered, an OTP has been sent " });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expires_in = new Date(Date.now() + 5 * 60000);
    let content = `<p> Your Otp for reset Your Password for iNoteBook is ${otp} </p>`;
    await db.execute(
      "REPLACE INTO otp_verification(email , otp, expires_in) VALUES (?,?,?)",
      [email, hashedOtp, expires_in],
      [email],
    );
    sendMail(email, "Password Reset Code", content);
    res
      .status(200)
      .json({ message: "Otp is successfully sent ! Kindly check your email" });
  } catch (error) {
    res.status(400).json({ message: "Internal Server Error" });
  }
};

exports.changePassword = async (req, res) => {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    return res.status(400).json({ err: err.array() });
  }
  const { newPassword, token } = req.body;
  try {
    const decoded = jwt.verify(token, jwt_secret);
    const email = decoded.email;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await db.execute("UPDATE users SET password = ? WHERE email = ? ", [
      hashedPassword,
      email,
    ]);
    res.status(200).json({ message: "Password is Changed Successfully " });
  } catch (error) {
    res.status(400).json({ error: " internal Error" });
  }
};
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
exports.googlesignin = async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { name, email } = ticket.getPayload();
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    let user;
    // this is case for new user Means Register this user in our App
    if (rows.length === 0) {
      const [result] = await db.execute(
        "INSERT INTO users(name , email , password) VALUES (?,?,?) ",
        [name, email, null], // we are keeping the password null beacause this user is getting verified by the Google itSelf
      );
      user = { id: result.insertId, email: email };
    } else {
      user = rows[0];
    }
    const payload = {
      user: {
        id: user.id,
      },
    };
    const Authtoken = jwt.sign(payload, jwt_secret, {
      expiresIn: "24h",
    });
    res.status(200).json({ Authtoken, message: "Google Login Successfull " });
  } catch (error) {
    res.status(500).json({ error: "Internal error" });
  }
};
