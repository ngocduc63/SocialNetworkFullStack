const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsync = require("./catchAsync");

exports.isAuthenticated = catchAsync(async (req, res, next) => {
  let token;

  // Web
  if (req.cookies?.token) {
    token = req.cookies.token;
  }

  // App 
  if (
    !token &&
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new ErrorHandler("Please Login to Access", 401));
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decodedData.id);
  next();
});
