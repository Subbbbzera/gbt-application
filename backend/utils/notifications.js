require('dotenv').config();
const nodemailer = require('nodemailer');
const https = require('https');
const db = require('../db');

console.log("Initializing Notifications Utility...");
console.log("Email User:", process.env.EMAIL_USER || "NOT SET");
console.log("Telegram Bot Token:", process.env.TELEGRAM_BOT_TOKEN ? "Loaded" : "NOT SET");
console.log("Telegram Admin Chat ID:", process.env.TELEGRAM_ADMIN_CHAT_ID || "NOT SET");


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


const sendEmail = async (to, subject, text, html, userId = null) => {
  if (!to) {
    console.error('❌ Email Error: Recipient (to) is missing');
    return;
  }

  
  
  if (userId && userId !== 0) {
    try {
      const [users] = await db.query('SELECT email_notifications FROM users WHERE id = ?', [userId]);
      if (users.length > 0 && users[0].email_notifications === 0) {
        console.log(`🔇 Skipping email to user ${userId} (${to}) - notifications disabled in profile.`);
        return { success: true, skipped: true };
      }
    } catch (dbError) {
      console.error('❌ DB Error checking notification settings:', dbError);
    }
  }
  
  console.log(`📧  Attempting to send email to: ${to} | Subject: ${subject}`);
  
  try {
    const info = await transporter.sendMail({
      from: `"Gold Bud Trans" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log(`✅  Email sent successfully: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌  Email sending error:', error);
    return { success: false, error: error.message };
  }
};


const sendTelegramMessage = (message) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  
  if (!token || !chatId) {
    console.warn('⚠️  Telegram credentials missing in .env');
    return;
  }

  if (!message || message.toString().trim() === "") {
    console.error('❌  Telegram Error: Message text is empty!');
    return;
  }

  console.log(`📡  Sending Telegram Message to Chat ID ${chatId}...`);
  
  const cleanMessage = message.toString().trim();

  const data = JSON.stringify({
    chat_id: chatId,
    text: cleanMessage,
    parse_mode: 'HTML'
  });

  const options = {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/bot${token}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (d) => {
      body += d;
    });
    res.on('end', () => {
      try {
        const response = JSON.parse(body);
        if (res.statusCode === 200 && response.ok) {
          console.log("✅  Telegram message sent successfully");
        } else {
          console.error(`❌  Telegram API Error (Status ${res.statusCode}):`, response.description || body);
        }
      } catch (e) {
        console.error(`❌  Telegram Response Parse Error:`, body);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌  Telegram Network Error:', error);
  });

  req.write(data);
  req.end();
};

module.exports = {
  sendEmail,
  sendTelegramMessage
};
