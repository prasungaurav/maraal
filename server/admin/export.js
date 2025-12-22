const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Holiday = require('../models/Holiday'); // Ensure you have this model

const getDaysArray = (start, end) => {
    let arr = [];
    let dt = new Date(start);
    while (dt <= new Date(end)) {
        arr.push(new Date(dt));
        dt.setDate(dt.getDate() + 1);
    }
    return arr;
};

router.get('/employee-summary', async (req, res) => {
    try {
        const { month, search } = req.query;
        
        let userQuery = {};
        if (search) userQuery.name = { $regex: search, $options: 'i' };

        const users = await User.find(userQuery);

        // Define month boundaries
        const startLimit = new Date(`${month}-01T00:00:00.000Z`);
        const endLimit = new Date(startLimit.getFullYear(), startLimit.getMonth() + 1, 0, 23, 59, 59);

        // Fetch Global Holidays for the month once
        const holidays = await Holiday.find({
            date: { $gte: startLimit, $lte: endLimit }
        });

        const result = await Promise.all(users.map(async (user) => {
            const [attendance, leaves] = await Promise.all([
                Attendance.find({ 
                    userId: user._id, 
                    date: { $gte: startLimit, $lte: endLimit } 
                }),
                Leave.find({ 
                    userId: user._id, 
                    status: 'Approved',
                    $or: [
                        { fromDate: { $gte: startLimit, $lte: endLimit } },
                        { toDate: { $gte: startLimit, $lte: endLimit } },
                        { fromDate: { $lte: startLimit }, toDate: { $gte: endLimit } }
                    ]
                })
            ]);

            const expandedLeaves = [];
            leaves.forEach(l => {
                const days = getDaysArray(l.fromDate, l.toDate);
                days.forEach(day => {
                    if (day >= startLimit && day <= endLimit) {
                        expandedLeaves.push({
                            date: new Date(day),
                            status: 'Leave',
                            leaveType: l.type,
                            isLeave: true
                        });
                    }
                });
            });

            // Map holidays into a format compatible with details
            const holidayDetails = holidays.map(h => ({
                date: h.date,
                status: 'Holiday',
                name: h.name,
                isHoliday: true
            }));

            // Combine all: Attendance, expanded Leaves, and Holidays
            const combinedDetails = [...attendance, ...expandedLeaves, ...holidayDetails].sort(
                (a, b) => new Date(a.date) - new Date(b.date)
            );

            return {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                attendanceDetails: combinedDetails
            };
        }));

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;