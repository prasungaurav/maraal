const ZKLib = require("node-zklib");

class BiometricReader {
  constructor(ip, port = 4370, timeout = 5000, delay = 5000) {
    this.zk = new ZKLib(ip, port, timeout, delay);
    this.connected = false;
  }

  async connect() {
    if (this.connected) return;
    await this.zk.createSocket();
    this.connected = true;
    console.log("Device connected");
  }

  async getAttendance() {
    try {
      await this.connect();
      const res = await this.zk.getAttendances();
      return res?.data || [];
    } catch (err) {
      if (err.message?.includes("TIME OUT")) {
        console.warn("Timeout after receiving data (safe)");
        return [];
      }
      throw err;
    }
  }

  // ❌ DO NOT AUTO DISCONNECT
  async disconnect() {
    if (!this.connected) return;
    await this.zk.disconnect();
    this.connected = false;
    console.log("Device disconnected");
  }
}

module.exports = BiometricReader;
