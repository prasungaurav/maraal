// routes/holidays.js
const express = require('express');
const router = express.Router();
const Holiday = require('../models/Holiday');
const TotalLeave = require('../models/TotalLeave');

// 🔐 Login middleware
function requireLogin(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
    next();
}

/* =====================================================
   TOTAL LEAVE APIs (COMPANY POLICY)  ✅ MUST BE FIRST
===================================================== */

/* GET TOTAL LEAVE */
router.get('/total-leave', requireLogin, async (req, res) => {
    try {
        let totalLeave = await TotalLeave.findOne();

        if (!totalLeave) {
            totalLeave = await TotalLeave.create({});
        }

        res.json(totalLeave);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch total leave' });
    }
});

/* UPDATE TOTAL LEAVE */
router.put('/total-leave', requireLogin, async (req, res) => {
    try {
        const { paidLeave, sickLeave, casualLeave } = req.body;

        let totalLeave = await TotalLeave.findOne();

        if (!totalLeave) {
            totalLeave = new TotalLeave({ paidLeave, sickLeave, casualLeave });
        } else {
            totalLeave.paidLeave = paidLeave;
            totalLeave.sickLeave = sickLeave;
            totalLeave.casualLeave = casualLeave;
        }

        await totalLeave.save();
        res.json(totalLeave);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update total leave' });
    }
});

/* =====================================================
   HOLIDAY APIs
===================================================== */

/* GET ALL HOLIDAYS */
router.get('/', requireLogin, async (req, res) => {
    try {
        const holidays = await Holiday.find().sort({ date: 1 });
        res.json(holidays);
    } catch {
        res.status(500).json({ message: 'Failed to fetch holidays' });
    }
});

/* ADD HOLIDAY */
router.post('/', requireLogin, async (req, res) => {
    try {
        const { name, date, type } = req.body;

        if (!name || !date) {
            return res.status(400).json({ message: 'Name and date are required' });
        }

        const holidayDate = new Date(date);
        const dayName = holidayDate.toLocaleDateString('en-US', { weekday: 'long' });

        const holiday = new Holiday({
            name,
            date: holidayDate,
            day: dayName,
            type: type || 'Mandatory',
            leaveDays: type === 'Optional' ? 1 : 0
        });

        await holiday.save();
        res.status(201).json(holiday);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to add holiday' });
    }
});

/* UPDATE HOLIDAY */
router.put('/:id', requireLogin, async (req, res) => {
    try {
        const updated = await Holiday.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: 'Holiday not found' });
        }

        res.json(updated);
    } catch {
        res.status(500).json({ message: 'Failed to update holiday' });
    }
});

/* DELETE HOLIDAY */
router.delete('/:id', requireLogin, async (req, res) => {
    try {
        const deleted = await Holiday.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: 'Holiday not found' });
        }

        res.json({ message: 'Holiday deleted successfully' });
    } catch {
        res.status(500).json({ message: 'Failed to delete holiday' });
    }
});

module.exports = router;
