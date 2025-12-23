const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");

// -------------------------------------------
// EMPLOYEE HEADER DATA (USER + STATS)
// -------------------------------------------
router.get("/data", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not logged in" });
    }

    if (req.session.userRole !== "Employee") {
      return res.status(403).json({ message: "Employee access only" });
    }

    // Select only fields that exist in your current schema
    const user = await User.findById(req.session.userId).select("name email role");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const attendanceCount = await Attendance.countDocuments({ userId: req.session.userId });
    const leaveCount = await Leave.countDocuments({ userId: req.session.userId });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      stats: {
        attendanceCount,
        leaveCount,
      },
    });
  } catch (err) {
    console.error("Employee header error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
router.post("/change-password", async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Both old and new passwords are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Old password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
