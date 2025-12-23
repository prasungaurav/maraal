require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const bodyParser = require("body-parser");
const setupSession = require("./models/Session"); // your session store config
const Attendance = require("./models/Attendance"); // your attendance model

const AttendanceSync = require("./sync/AttendanceSync.js")
const app = express();

// ------------------------------
// MIDDLEWARES
// ------------------------------
app.use(express.json());
app.use(bodyParser.json());


// Ensure CORS allows your Cloudflare URL
const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:3000"];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));

// ------------------------------
// SESSION SETUP
// ------------------------------
setupSession(app, process.env.MONGO_URI, process.env.SESSION_SECRET);

// ------------------------------
// LOGIN CHECK MIDDLEWARE
// ------------------------------
function requireLogin(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Please login first",
    });
  }
  next();
}
app.requireLogin = requireLogin; // export middleware to routes

// ------------------------------
// MONGODB CONNECT
// ------------------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));



// ------------------------------
// UNIVERSAL AUTH ROUTES
// ------------------------------
app.use("/auth", require("./auth")); // universal login/logout/me

// ------------------------------
// EMPLOYEE ROUTES
// ------------------------------
app.use("/api/dashboard", requireLogin, require("./employees/dashboard"));
app.use("/api/header", requireLogin, require("./employees/header"));
app.use("/api/attendance", requireLogin, require("./employees/attendance"));
app.use("/api/leave", requireLogin, require("./employees/leave"));

// ------------------------------
// ADMIN ROUTES
// ------------------------------
app.use("/api/admin/header", requireLogin, require("./admin/header"));
app.use("/api/admin/dashboard", requireLogin, require("./admin/dashboard"));
app.use("/api/admin/approval", requireLogin, require("./admin/approval"));
app.use("/api/admin/users", requireLogin, require("./admin/manageuser"));
app.use("/api/admin/view", requireLogin, require("./admin/view"));
app.use("/api/admin/holidays", requireLogin, require("./admin/holidays"));
app.use("/api/admin/export", requireLogin, require("./admin/export"));

// ------------------------------
// HR ROUTES
// ------------------------------
app.use("/api/hr/header", requireLogin, require("./hr/header"));
app.use("/api/hr/attendance", requireLogin, require("./hr/attendance"));
app.use("/api/hr/employee", requireLogin, require("./hr/employee"));
app.use("/api/hr/leave", requireLogin, require("./hr/leave"));

// ------------------------------
// START SERVER
// ------------------------------
const PORT = process.env.PORT || 5000;
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
