const ZKLib = require("node-zklib");

class BiometricReader {
  constructor(ip, port = 4370, timeout = 5000, delay = 5000) {
    this.ip = ip;
    this.port = port;
    this.timeout = timeout;
    this.delay = delay;
  }

  async getAttendance() {
    const zk = new ZKLib(
      this.ip,
      this.port,
      this.timeout,
      this.delay
    );

    try {
      await zk.createSocket();
      console.log("🔌 Biometric connected");

      const res = await zk.getAttendances();
      return res?.data || [];

    } catch (err) {
      console.error("❌ Device error:", err.message);
      return [];
    } finally {
      try {
        await zk.disconnect();
        console.log("🔌 Biometric disconnected");
      } catch (_) {}
    }
  }
}

module.exports = BiometricReader;
