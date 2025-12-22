const User = require("../models/User");
const Attendance = require("../models/Attendance");
const BiometricReader = require("../reader/reader");

const reader = new BiometricReader(
  process.env.BIOMETRIC_IP || "192.168.1.199"
);
async function upsertAttendance(userId, timestamp) {
  const start = new Date(timestamp);
  start.setHours(0, 0, 0, 0);

  const end = new Date(timestamp);
  end.setHours(23, 59, 59, 999);

  const attendance = await Attendance.findOne({
    userId,
    date: { $gte: start, $lte: end },
  });

  if (!attendance) {
    // First punch → IN
    await Attendance.create({
      userId,
      date: timestamp,
      inTime: timestamp,
      status: "Present",
      workType: "WFO",
    });
  } else if (!attendance.outTime) {
    // Second punch → OUT
    attendance.outTime = timestamp;
    await attendance.save();
  }
}

async function syncAttendance() {
  try {
    console.log("🔁 Checking biometric logs...");

    const logs = await reader.getAttendance();

    if (!Array.isArray(logs) || logs.length === 0) {
      console.log("ℹ️ No logs received");
      return;
    }

    for (const log of logs) {
      const user = await User.findOne({
        biometricId: log.deviceUserId,
      });
      if (user){
        console.log(log);
      }
      if (!user) {
        console.warn(
          `⚠️ No user for biometricId ${log.deviceUserId}`
        );
        continue;
      }

      await upsertAttendance(user._id, log.recordTime);
    }

    console.log("✅ Biometric sync completed");
  } catch (err) {
    console.error("❌ Biometric sync error FULL:", err);
  }
}

// Run immediately
syncAttendance();

// Run every 1 minute
setInterval(syncAttendance, 60 * 1000);
