const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");

const requireLogin = (req, res, next) => {
  if (!req.session.userId)
    return res.status(401).json({ message: "Not authenticated" });
  next();
};

// ------------------- GET ATTENDANCE -------------------
router.get("/", requireLogin, async (req, res) => {
  const { date, status, search } = req.query;
  const filter = {};

  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    filter.date = { $gte: start, $lte: end };
  }

  if (status && status !== "All") {
    filter.status = status;
  }

  try {
    const records = await Attendance.find(filter)
      .populate("userId", "name department") // ✅ JOIN USER
      .sort({ inTime: 1 });

    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
});

module.exports = router;
