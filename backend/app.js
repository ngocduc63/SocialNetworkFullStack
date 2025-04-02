const express = require("express");
const cookieParser = require("cookie-parser");
const errorMiddleware = require("./middlewares/error");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/public", express.static("public"));

if (process.env.NODE_ENV != "production") {
  require("dotenv").config({ path: "backend/config/config.env" });
}

const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  }),
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:4000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const User = require("./models/userModel");
        // Tìm user dựa trên email từ Google
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          // Nếu user không tồn tại, tạo mới
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            username: profile.id, // Dùng Google ID làm username (hoặc tạo username độc nhất)
            password: "12345678", // mac dinh
            avatar: "hero.png", // Ảnh từ Google hoặc mặc định
            googleId: profile.id, // Lưu Google ID để xác thực sau này
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    },
  ),
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.get("/", (req, res) => {
  res.send("<a href='/auth/google'>Login with Google</a>");
});

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  }),
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    const sendEmail = require("./utils/sendMailTrap");
    const sendCookie = require("./utils/sendCookieLoginGoogle");
    sendEmail(req.user.email);
    sendCookie(req.user, 200, res);
    res.redirect(`http://localhost:3000/`);
  },
);

app.get("/profile", (req, res) => {
  res.send(`Welcome ${req.user.displayName}`);
});

app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

// import routes
const comment = require("./routes/commentRoute");

const post = require("./routes/postRoute");
const user = require("./routes/userRoute");
const chat = require("./routes/chatRoute");
const message = require("./routes/messageRoute");
const task = require("./routes/taskRoute");
const notificationRoute = require("./routes/notificationRoute");

app.use("/api/v1", comment);
app.use("/api/v1", post);
app.use("/api/v1", user);
app.use("/api/v1", chat);
app.use("/api/v1", message);
app.use("/api/v1", task);
app.use("/api/v1", notificationRoute);

// deployment
__dirname = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("Server is Running! 🚀");
  });
}

// error middleware
app.use(errorMiddleware);

module.exports = app;
