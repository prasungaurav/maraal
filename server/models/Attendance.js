const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema(
    {
        userId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User",
            required: true 
        },

        // Store the attendance entry date (yyyy-mm-dd)
        date: {
            type: Date,
            required: true
        },

        // Time when user punched in
        inTime: {
            type: Date,
            default: null
        },

        // Time when user punched out
        outTime: {
            type: Date,
            default: null
        },

        // Present / Absent / Half Day
        status: {
            type: String,
            enum: ["Present", "Absent", "Half Day"],
            default: "Present"
        },

        // WFO / WFH
        workType: {
            type: String,
            enum: ["WFO", "WFH","WFF"],
            default: "WFO"
        }
    },

    // Adds createdAt & updatedAt automatically
    { timestamps: true }
);

module.exports = mongoose.model("Attendance", AttendanceSchema);
