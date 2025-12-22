const mongoose = require('mongoose');

const totalLeaveSchema = new mongoose.Schema({
    paidLeave: {
        type: Number,
        default: 12
    },
    sickLeave: {
        type: Number,
        default: 8
    },
    casualLeave: {
        type: Number,
        default: 5
    }
}, { timestamps: true });

module.exports = mongoose.model('TotalLeave', totalLeaveSchema);
