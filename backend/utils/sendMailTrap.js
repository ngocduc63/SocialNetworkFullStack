require("dotenv").config();
const nodemailer = require("nodemailer");

// login google app passwords de lay mat khau theo email cau minh
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "duco060303@gmail.com",
    pass: "ghsh stet lvhe ryxt",
  },
});
const sendMailTrap = async (toEmail) => {
  try {
    let mailOptions = {
      from: '"POLLUX" <noreply@pollux.com>',
      to: toEmail,
      subject: "Chào mừng bạn đến với POLLUX",
      text: `Xin chào, bạn đã đăng nhập vào lúc ${new Date().toLocaleString()}.`,
    };

    let info = await transporter.sendMail(mailOptions);
    console.log("✅ Email đã được gửi:", info.messageId);
  } catch (error) {
    console.error("❌ Lỗi gửi email:", error.message);
    if (error.response) console.error("Chi tiết lỗi:", error.response);
  }
};

module.exports = sendMailTrap;
