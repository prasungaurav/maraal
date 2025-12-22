const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");

// ----------------------------
// GET CURRENT LOGGED-IN USER
// ----------------------------
router.get("/me", async (req, res) => {
  try {
    if (!req.session.userId)
      return res.status(401).json({ message: "Not logged in" });

    const user = await User.findById(req.session.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------------------
// FETCH HEADER DATA (USER + ATTENDANCE + LEAVES)
// ----------------------------
router.get("/data", async (req, res) => {
  try {
    if (!req.session.userId)
      return res.status(401).json({ message: "Not logged in" });

    const user = await User.findById(req.session.userId).select("-password");
    const attendance = await Attendance.find({ userId: req.session.userId });
    const leaves = await Leave.find({ userId: req.session.userId });

    res.json({ user, attendance, leaves });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
// ----------------------------
// LOGOUT (Destroy Session)
// ----------------------------
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }

    res.clearCookie("connect.sid"); // important
    return res.json({ message: "Logged out" });
  });
});


module.exports = router;
