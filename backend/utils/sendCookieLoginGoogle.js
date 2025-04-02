const sendCookieLoginGoogle = (user, statusCode, res) => {
  const token = user.generateToken(); // Giả sử bạn có method này trong model User
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  res.status(statusCode).cookie("token", token, options); // Chỉ set cookie, không gửi JSON
};

module.exports = sendCookieLoginGoogle;
