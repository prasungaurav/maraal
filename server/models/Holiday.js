const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    date: {
        type: Date,
        required: true
    },

    // Auto-calculated day name (Monday, Tuesday...)
    day: {
        type: String,
        required: true,
        trim: true
    },

    // Holiday type
    type: {
        type: String,
        enum: ['Mandatory', 'Optional'],
        default: 'Mandatory'
    },

    // How many leave days this holiday consumes
    // Mandatory → usually 0 (paid)
    // Optional → usually 1
    leaveDays: {
        type: Number,
        default: 0,
        min: 0
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Holiday', holidaySchema);
