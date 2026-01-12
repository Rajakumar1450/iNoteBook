const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();
const SMTP_EMAIL = process.env.SMTP_MAIL;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const sendMail = async (email, emailsubject, content) => {
  try {
    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: SMTP_EMAIL,
        pass: SMTP_PASSWORD,
      },
    });
    const mailOption = {
      from: SMTP_EMAIL,
      to: email,
      subject: emailsubject,
      html: content,
    };
    const info = await transport.sendMail(mailOption);
    console.log("Email is sent successfully! ", info.response);
    return info;
  } catch (error) {
    console.log(error);
  }
};

module.exports = sendMail;
