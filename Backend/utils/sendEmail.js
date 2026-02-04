const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // ✅ MUST be false on Render
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // ✅ Gmail App Password
  },
  tls: {
    rejectUnauthorized: false, // ✅ REQUIRED on Render
  },
});

module.exports = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"TradeXA" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
