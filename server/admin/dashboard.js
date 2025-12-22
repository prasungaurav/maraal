const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Leave = require("../models/Leave");
const Attendance = require("../models/Attendance");

// ------------------------------
// HELPER: Get Local Day Start/End
// ------------------------------
const getLocalDayRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return { start, end };
};

// ------------------------------
// GET DASHBOARD DATA
// ------------------------------
router.get("/", async (req, res) => {
  try {
    // 1️⃣ Authentication check
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not logged in" });
    }

    const admin = await User.findById(req.session.userId).select("-password").lean();
    if (!admin || admin.role !== "Admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // 2️⃣ Calculate today's local range
    const { start: todayStart, end: todayEnd } = getLocalDayRange();

    // 3️⃣ Fetch data concurrently
    const [allEmployees, presentRecords, approvedLeavesToday, pendingLeavesRaw] = await Promise.all([
      User.find({ role: "Employee" }).select("name email role").lean(),
      Attendance.find({
        date: { $gte: todayStart, $lte: todayEnd },
        status: "Present"
      }).select("userId").lean(),
      Leave.find({
        status: "Approved",
        fromDate: { $lte: todayEnd },
        toDate: { $gte: todayStart }
      }).select("userId").lean(),
      Leave.find({ status: "Pending" }).populate("userId", "name email").lean()
    ]);

    // 4️⃣ Determine present and absent users
    const presentIds = new Set(presentRecords.map(r => r.userId.toString()));
    const leaveIds = new Set(approvedLeavesToday.map(l => l.userId.toString()));

    const absentUsers = allEmployees.filter(emp => {
      const id = emp._id.toString();
      return !presentIds.has(id) && !leaveIds.has(id); // Absent if not present & not on leave
    });

    // 5️⃣ Calculate stats
    const totalEmployees = allEmployees.length;
    const currentlyPresent = presentIds.size;
    const presenceRate = totalEmployees > 0 
      ? `${Math.round((currentlyPresent / totalEmployees) * 100)}%` 
      : "0%";

    // 6️⃣ Format pending leaves
    const pendingLeaves = pendingLeavesRaw.map(leave => {
      const from = new Date(leave.fromDate);
      const to = new Date(leave.toDate);
      const duration = Math.floor((to - from) / (1000 * 60 * 60 * 24)) + 1;

      return {
        ...leave,
        name: leave.userId?.name || "Unknown",
        email: leave.userId?.email || "N/A",
        duration: duration > 0 ? duration : 1
      };
    });

    // 7️⃣ Send fresh response (no cache)
    res.set("Cache-Control", "no-store");
    res.json({
      adminName: admin.name,
      stats: {
        totalEmployees,
        totalAbsent: absentUsers.length,
        approvals: pendingLeaves.length,
        presenceRate
      },
      pendingLeaves,
      absentToday: absentUsers
    });

  } catch (err) {
    console.error("ADMIN DASHBOARD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------------------
// LEAVE ACTION (APPROVE/REJECT)
// ------------------------------
router.post("/leave-action", async (req, res) => {
  try {
    const { leaveId, action } = req.body;
    if (!req.session.userId) return res.status(401).json({ message: "Unauthorized" });

    const updated = await Leave.findByIdAndUpdate(
      leaveId,
      { status: action },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Leave not found" });

    // Send updated leave + prevent caching
    res.set("Cache-Control", "no-store");
    res.json({ message: `Leave ${action} successfully`, updatedLeave: updated });

  } catch (err) {
    console.error("LEAVE ACTION ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
