const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance"); // Make sure this schema exists
const User = require("../models/User");

// Middleware to check login/session
const requireLogin = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    next();
};

// GET attendance records with optional query filters
// Example query: /api/attendance?name=Alice&startDate=2025-12-01&endDate=2025-12-10
router.get("/", requireLogin, async (req, res) => {
    try {
        const { name, startDate, endDate } = req.query;

        const filter = {};

        if (name) {
            const users = await User.find({ name: { $regex: name, $options: "i" } }, { _id: 1 });
            const userIds = users.map(u => u._id);
            filter.userId = { $in: userIds };
        }

        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        const records = await Attendance.find(filter)
            .populate("userId", "name") // populate user name
            .sort({ date: -1 });

        // Map to frontend format
        const data = records.map(r => ({
            id: r._id,
            name: r.userId?.name || "Unknown",
            date: r.date.toISOString().split('T')[0],
            inTime: r.inTime || '00:00 AM',
            outTime: r.outTime || '00:00 AM',
            status: r.status || 'Absent'
        }));

        res.status(200).json({ success: true, data });
    } catch (err) {
        console.error("Error fetching attendance:", err);
        res.status(500).json({ success: false, message: "Error fetching attendance" });
    }
});

module.exports = router;
