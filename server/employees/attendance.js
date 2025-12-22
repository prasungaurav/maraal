const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");

// Middleware: require login
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

// Helper: convert YYYY-MM → date range
function getMonthDateRange(startMonth) {
  if (!startMonth) return {};
  const [year, month] = startMonth.split("-").map(Number);
  const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  return { startDate, endDate };
}

/* =====================================================
  1️⃣ GET ALL ATTENDANCE LOGS (optional month filter)
===================================================== */
router.get("/all", requireLogin, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { startMonth } = req.query;

    const query = { userId };
    if (startMonth) {
      const { startDate, endDate } = getMonthDateRange(startMonth);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const logs = await Attendance.find(query).sort({ date: -1 });

    const mapped = logs.map((log) => {
      let duration = '--';
      if (log.inTime && log.outTime) {
        const diff = (new Date(log.outTime) - new Date(log.inTime)) / 1000 / 60; // minutes
        const hours = Math.floor(diff / 60);
        const mins = Math.floor(diff % 60);
        duration = `${hours}h ${mins}m`;
      }

      return {
        id: log._id,
        date: log.date,
        day: new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' }),
        status: log.status,
        type: log.workType,
        duration,
        inTime: log.inTime,
        outTime: log.outTime
      };
    });

    res.json(mapped);
  } catch (err) {
    console.error("ERROR /attendance/all:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =====================================================
  2️⃣ STATS SUMMARY
===================================================== */
router.get("/stats-summary", requireLogin, async (req, res) => {
  try {
    const userId = req.session.userId;
    const logs = await Attendance.find({ userId });

    let present = 0;
    let lateMarks = 0;
    let totalMinutes = 0;

    logs.forEach((log) => {
      if (log.status === "Present") {
        present++;

        // Calculate duration in minutes
        if (log.inTime && log.outTime) {
          const inDate = new Date(log.inTime);
          const outDate = new Date(log.outTime);
          const diff = (outDate - inDate) / 1000 / 60;
          totalMinutes += diff;

          // Late if inTime > 10:00 AM
          if (inDate.getHours() > 10 || (inDate.getHours() === 10 && inDate.getMinutes() > 0)) {
            lateMarks++;
          }
        }
      }
    });

    // Average hours
    const avgMinutes = present > 0 ? totalMinutes / present : 0;
    const avgHours = Math.floor(avgMinutes / 60);
    const avgMins = Math.floor(avgMinutes % 60);

    res.json({
      avgHours: `${avgHours}h ${avgMins}m`,
      presentDays: present,
      lateMarks
    });
  } catch (err) {
    console.error("ERROR /stats-summary:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =====================================================
  3️⃣ WEEKLY CHART DATA (Sun → Sat)
===================================================== */
router.get("/weekly-chart", requireLogin, async (req, res) => {
  try {
    const userId = req.session.userId;
    const logs = await Attendance.find({ userId });

    const weeklyData = [0, 0, 0, 0, 0, 0, 0]; // Sun → Sat

    logs.forEach((log) => {
      const dayIndex = new Date(log.date).getDay();
      weeklyData[dayIndex]++;
    });

    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const chartData = weeklyData.map((count, idx) => ({
      day: days[idx],
      height: `${(count/Math.max(...weeklyData)*100 || 0)}%`
    }));

    res.json(chartData);
  } catch (err) {
    console.error("ERROR /weekly-chart:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =====================================================
  4️⃣ MONTHLY SUMMARY (optional)
===================================================== */
router.get("/monthly-summary", requireLogin, async (req, res) => {
  try {
    const userId = req.session.userId;
    const logs = await Attendance.find({ userId });

    const monthly = {};

    logs.forEach((log) => {
      const d = new Date(log.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthly[key]) monthly[key] = 0;
      monthly[key]++;
    });

    res.json(monthly);
  } catch (err) {
    console.error("ERROR /monthly-summary:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
