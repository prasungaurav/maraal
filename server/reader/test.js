const BiometricReader = require("./reader");

const reader = new BiometricReader("192.168.1.199");

let lastUserSn = 0; // 🔴 load from DB in real app

async function syncAttendance() {
  try {
    console.log("Checking attendance...");

    const logs = await reader.getAttendance();

    const newLogs = logs.filter(l => l.userSn > lastUserSn);

    if (newLogs.length === 0) {
      console.log("No new records");
      return;
    }

    for (const log of newLogs) {
      console.log("New log:", log);
      // 👉 INSERT INTO DB HERE
      lastUserSn = log.userSn;
    }

  } catch (err) {
    console.error("Sync error:", err.message);
  }
}

// ▶ Run immediately
syncAttendance();

// 🔁 Every 1 minute
setInterval(syncAttendance, 60 * 1000);

