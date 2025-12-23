require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const ZKLib = require("node-zklib");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected for Attendance Sync"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// Biometric Reader
class BiometricReader {
  constructor(ip, port = 4370, timeout = 5000, delay = 5000) {
    this.ip = ip;
    this.port = port;
    this.timeout = timeout;
    this.delay = delay;
  }

  async getAttendance() {
    const zk = new ZKLib(this.ip, this.port, this.timeout, this.delay);
    try {
      await zk.createSocket();
      console.log("🔌 Biometric connected");
      const res = await zk.getAttendances();
      return res?.data || [];
    } catch (err) {
      console.error("❌ Device error:", err.message);
      return [];
    } finally {
      try { await zk.disconnect(); console.log("🔌 Biometric disconnected"); } catch(_) {}
    }
  }
}

// Initialize reader
const reader = new BiometricReader(process.env.BIOMETRIC_IP || "192.168.1.199");
let lastSyncTime = new Date(0);

// Upsert function (first in, last out)
async function upsertAttendance(userId, timestamp) {
  const date = new Date(timestamp);
  const start = new Date(date); start.setHours(0,0,0,0);
  const end = new Date(date); end.setHours(23,59,59,999);

  let attendance = await Attendance.findOne({ userId, date: { $gte: start, $lte: end } });

  if (!attendance) {
    // First punch of the day → set inTime
    await Attendance.create({
      userId,
      date,
      inTime: date,
      outTime: null,
      status: "Present",
      workType: "WFO"
    });
  } else {
    // Update outTime to latest punch
    attendance.outTime = date;
    await attendance.save();
  }
}

// Sync function
async function syncAttendance() {
  try {
    const logs = await reader.getAttendance();
    if (!Array.isArray(logs) || logs.length === 0) return;

    const newLogs = logs.filter(l => new Date(l.recordTime) > lastSyncTime);

    for (const log of newLogs) {
      const user = await User.findOne({ biometricId: log.deviceUserId });
      if (!user) continue;

      await upsertAttendance(user._id, log.recordTime);
      lastSyncTime = new Date(log.recordTime);
    }

    if (newLogs.length) console.log(`✅ Synced ${newLogs.length} logs`);
  } catch (err) {
    console.error("❌ Sync error:", err);
  }
}

// Run immediately and then every 1 minute
syncAttendance();
setInterval(syncAttendance, 60 * 1000);

module.exports = {};
