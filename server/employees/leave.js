const express = require("express");
const router = express.Router();
const Leave = require("../models/Leave");
const Holiday = require("../models/Holiday");
const TotalLeave = require("../models/TotalLeave"); // import your schema

// Middleware to check login
function requireLogin(req, res, next) {
    if (!req.session.userId) return res.status(401).json({ message: "Not authenticated" });
    next();
}

/* =====================================================
  1️⃣ APPLY LEAVE
===================================================== */
router.post("/apply", requireLogin, async (req, res) => {
    try {
        const { fromDate, toDate, type, reason } = req.body;
        const userId = req.session.userId;

        if (!fromDate || !toDate || !type) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const from = new Date(fromDate);
        const to = new Date(toDate);
        const diffDays = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;

        const leave = await Leave.create({
            userId,
            type,
            fromDate: from,
            toDate: to,
            reason,
            status: "Pending",
            days: diffDays
        });

        res.json(leave);
    } catch (err) {
        console.error("ERROR /leaves/apply:", err);
        res.status(500).json({ error: "Server error" });
    }
});

//=====================================================
//2️⃣ LEAVE BALANCES


router.get("/balances", requireLogin, async (req, res) => {
    try {
        const userId = req.session.userId;

        // Fetch the single TotalLeave document
        const totalLeave = await TotalLeave.findOne();
        if (!totalLeave) {
            return res.status(500).json({ error: "Total leave data not found" });
        }

        const leaveTypes = [
            { type: "Paid Leave", total: totalLeave.paidLeave, color: "#10B981", icon: "Briefcase" },
            { type: "Sick Leave", total: totalLeave.sickLeave, color: "#EC4899", icon: "Thermometer" },
            { type: "Casual Leave", total: totalLeave.casualLeave, color: "#4F46E5", icon: "User" }
        ];

        // Calculate used leaves per type
        const balances = await Promise.all(
            leaveTypes.map(async (leave) => {
                const approvedLeaves = await Leave.find({ userId, type: leave.type, status: "Approved" });

                const used = approvedLeaves.reduce((sum, l) => {
                    if (l.fromDate && l.toDate) {
                        const from = new Date(l.fromDate);
                        const to = new Date(l.toDate);
                        return sum + Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
                    }
                    return sum;
                }, 0);

                return {
                    type: leave.type,
                    total: leave.total,
                    used,
                    color: leave.color,
                    icon: leave.icon
                };
            })
        );

        res.json(balances);
    } catch (err) {
        console.error("ERROR /leaves/balances:", err);
        res.status(500).json({ error: "Server error" });
    }
});


/* =====================================================
  3️⃣ LEAVE HISTORY
===================================================== */
router.get("/history", requireLogin, async (req, res) => {
    try {
        const userId = req.session.userId;
        const leaves = await Leave.find({ userId }).sort({ fromDate: -1 });

        const mapped = leaves.map(l => ({
            id: l._id,
            type: l.type,
            from: l.fromDate ? new Date(l.fromDate).toLocaleDateString('en-GB') : '--',
            to: l.toDate ? new Date(l.toDate).toLocaleDateString('en-GB') : '--',
            days: l.fromDate && l.toDate ? Math.ceil((new Date(l.toDate) - new Date(l.fromDate)) / (1000*60*60*24)) + 1 : '--',
            status: l.status,
            reason: l.reason
        }));

        res.json(mapped);

    } catch (err) {
        console.error("ERROR /leaves/history:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/* =====================================================
  4️⃣ UPCOMING HOLIDAYS
===================================================== */
router.get("/holidays", requireLogin, async (req, res) => {
    try {
        const today = new Date();
        const holidays = await Holiday.find({ date: { $gte: today } }).sort({ date: 1 });

        const mapped = holidays.map(h => ({
            name: h.name,
            date: `${h.date.getDate()} ${h.date.toLocaleString('default', { month: 'short' })}`,
            day: h.date.toLocaleDateString('en-US', { weekday: 'short' })
        }));

        res.json(mapped);
    } catch (err) {
        console.error("ERROR /leaves/holidays:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
