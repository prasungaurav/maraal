const mongoose = require("mongoose");

const LeaveSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true },          // Sick Leave / Paid Leave / Casual Leave
    fromDate: { type: Date, required: true },       // start date
    toDate: { type: Date, required: true },         // end date
    status: { type: String, default: "Pending" },
    reason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Leave", LeaveSchema);
