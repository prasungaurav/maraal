const express = require("express");
const router = express.Router();
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


module.exports = router;
