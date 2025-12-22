const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Holiday = require('../models/Holiday');
const TotalLeave = require('../models/TotalLeave');

// ================= MIDDLEWARE =================
const requireLogin = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
    next();
};

// ================= USER =================
router.get('/me', requireLogin, async (req, res) => {
    const user = await User.findById(req.session.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
});

// ================= ATTENDANCE =================
router.get('/recent-attendance', requireLogin, async (req, res) => {
    const data = await Attendance.find({ userId: req.session.userId })
        .sort({ date: -1 });
    res.json(data);
});

// ================= LEAVES =================
router.get('/recent-leaves', requireLogin, async (req, res) => {
    const leaves = await Leave.find({ userId: req.session.userId })
        .sort({ createdAt: -1 });

    res.json(leaves.map(l => ({
        _id: l._id,
        type: l.type,
        status: l.status,
        reason: l.reason,
        from: l.fromDate.toISOString(),   // ✅ ISO
        to: l.toDate.toISOString()        // ✅ ISO
    })));
});

// ================= HOLIDAYS =================
router.get('/holidays', requireLogin, async (req, res) => {
    const today = new Date();
    const holidays = await Holiday.find({ date: { $gte: today } })
        .sort({ date: 1 })
        .limit(5);
    res.json(holidays);
});

// ================= LEAVE STATS =================
router.get('/stats', requireLogin, async (req, res) => {
    const leaveConfig = await TotalLeave.findOne();
    const paid = leaveConfig?.paidLeave || 12;
    const sick = leaveConfig?.sickLeave || 8;
    const casual = leaveConfig?.casualLeave || 5;

    const approved = await Leave.find({
        userId: req.session.userId,
        status: "Approved"
    });

    let used = 0;
    approved.forEach(l => {
        const from = new Date(l.fromDate);
        const to = new Date(l.toDate);
        used += Math.floor((to - from) / 86400000) + 1;
    });

    res.json({
        used,
        total: paid + sick + casual,
        breakdown: { paid, sick, casual }
    });
});

// ================= STATUS =================
router.get('/status', requireLogin, async (req, res) => {
    const start = new Date();
    start.setHours(0,0,0,0);

    const end = new Date();
    end.setHours(23,59,59,999);

    const att = await Attendance.findOne({
        userId: req.session.userId,
        date: { $gte: start, $lte: end }
    });

    res.json({
        inTime: att?.inTime || null,
        outTime: att?.outTime || null,
        workType: att?.workType || null
    });
});

// ================= PUNCH IN =================
router.post('/punch-in', requireLogin, async (req, res) => {
    const { workMode } = req.body;

    if (!["WFH","WFO"].includes(workMode)) {
        return res.status(400).json({ message: "Invalid work mode" });
    }

    const start = new Date(); start.setHours(0,0,0,0);
    const end = new Date(); end.setHours(23,59,59,999);

    const exists = await Attendance.findOne({
        userId: req.session.userId,
        date: { $gte: start, $lte: end }
    });
    if (exists) return res.status(400).json({ message: "Already punched in" });

    const att = await Attendance.create({
        userId: req.session.userId,
        date: new Date(),
        inTime: new Date(),
        status: "Present",
        workType: workMode
    });

    res.json({ inTime: att.inTime, workType: att.workType });
});

// ================= PUNCH OUT =================
router.post('/punch-out', requireLogin, async (req, res) => {
    const start = new Date(); start.setHours(0,0,0,0);
    const end = new Date(); end.setHours(23,59,59,999);

    const att = await Attendance.findOne({
        userId: req.session.userId,
        date: { $gte: start, $lte: end }
    });

    if (!att || att.outTime) {
        return res.status(400).json({ message: "Invalid punch-out" });
    }

    att.outTime = new Date();
    await att.save();

    res.json({ outTime: att.outTime });
});

module.exports = router;
