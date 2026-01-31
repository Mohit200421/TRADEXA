exports.emailOTPTemplate = (otp) => `
<div style="font-family: Arial, sans-serif; color:#111; line-height:1.6;">
  <h2 style="margin-bottom:10px;">Verify Your Email Address</h2>

  <p>
    We received a request to verify your email address for your
    <strong>TradeFX</strong> account.
  </p>

  <p style="margin-top:20px; margin-bottom:10px;">
    Please use the following One-Time Password (OTP):
  </p>

  <div style="
    font-size:28px;
    font-weight:bold;
    letter-spacing:6px;
    background:#f4f4f4;
    padding:12px 16px;
    display:inline-block;
    border-radius:6px;
  ">
    ${otp}
  </div>

  <p style="margin-top:20px;">
    This code is valid for <strong>10 minutes</strong>.
    Do not share this code with anyone for security reasons.
  </p>

  <p style="margin-top:20px;">
    If you did not request this verification, you can safely ignore this email.
  </p>

  <hr style="margin:30px 0; border:none; border-top:1px solid #e5e5e5;" />

  <p style="font-size:12px; color:#666;">
    © TradeFX. All rights reserved.<br />
    This is an automated message. Please do not reply.
  </p>
</div>
`;
