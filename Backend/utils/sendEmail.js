const nodemailer = require("nodemailer");

let transporter;

const getTransporter = async () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // ✅ VERY IMPORTANT ON RENDER
  await transporter.verify();

  return transporter;
};

module.exports = async ({ to, subject, html }) => {
  const mailer = await getTransporter();

  await mailer.sendMail({
    from: `"TradeXA" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
