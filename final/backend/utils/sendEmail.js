// utils/sendEmail.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async ({ to, subject, html, text }) => {
  let transporter;
  let fromAddress;

  const isRealGmailConfigured = 
    process.env.EMAIL_USER && 
    process.env.EMAIL_USER !== 'example@gmail.com' && 
    process.env.EMAIL_PASS && 
    process.env.EMAIL_PASS !== 'smtp_app_password';

  if (isRealGmailConfigured) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    fromAddress = process.env.EMAIL_USER;
  } else {
    // Generate automated Ethereal Email test account credentials
    console.log('ℹ️ EMAIL_USER/EMAIL_PASS is not configured in .env. Generating a temporary Ethereal SMTP test account...');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    fromAddress = testAccount.user;
  }

  const mailOptions = {
    from: `"Photo Contest Platform" <${fromAddress}>`,
    to,
    subject,
    html,
    text,
  };

  const info = await transporter.sendMail(mailOptions);

  if (!isRealGmailConfigured) {
    console.log('📧 Ethereal Email sent successfully!');
    console.log('📬 Preview URL to view email:', nodemailer.getTestMessageUrl(info));
  } else {
    console.log('📧 Email sent successfully using configured SMTP account.');
  }
};

module.exports = sendEmail;
