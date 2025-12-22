const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Leave = require("../models/Leave");

// -----------------------------------------
// Middleware: Only Admin Can Access
// -----------------------------------------
function requireAdmin(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ message: "Not logged in" });
    }

    User.findById(req.session.userId).then(user => {
        if (!user || user.role !== "Admin") {
            return res.status(403).json({ message: "Unauthorized" });
        }
        req.admin = user;
        next();
    });
}

// -----------------------------------------
// GET ALL LEAVE REQUESTS (Admin Panel)
// -----------------------------------------
router.get("/all", requireAdmin, async (req, res) => {
    try {
        const leaves = await Leave.find()
            .populate("userId", "name email")
            .sort({ createdAt: -1 });

        res.json({ success: true, leaves });
    } catch (err) {
        console.error("Error fetching leaves:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// -----------------------------------------
// APPROVE / REJECT A LEAVE
// -----------------------------------------
router.post("/update-status", requireAdmin, async (req, res) => {
    try {
        const { leaveId, status } = req.body;

        if (!["Approved", "Rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const updatedLeave = await Leave.findByIdAndUpdate(
            leaveId,
            { status },
            { new: true }
        );

        if (!updatedLeave) {
            return res.status(404).json({ message: "Leave not found" });
        }

        res.json({ success: true, leave: updatedLeave });

    } catch (err) {
        console.error("Status update error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
