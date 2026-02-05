const nodemailer = require("nodemailer");

let transporter;

const getTransporter = async () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,          // ✅ CHANGE
    secure: true,       // ✅ CHANGE (REQUIRED ON RENDER)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

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
