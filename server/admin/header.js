const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Leave = require("../models/Leave");

// -------------------------------------------
// GET CURRENT ADMIN + PENDING LEAVES COUNT
// -------------------------------------------
router.get("/me", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not logged in" });
    }

    // Fetch user
    const user = await User.findById(req.session.userId).select("-password");

    if (!user || user.role !== "Admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // COUNT pending leaves
    const pendingLeaves = await Leave.countDocuments({ status: "Pending" });

    res.json({
      user,
      pendingLeaves,
    });
  } catch (err) {
    console.error("Admin /me error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------------------------------
// LOGOUT ADMIN
// -------------------------------------------
router.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Admin logout error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }

    res.clearCookie("connect.sid");
    res.json({ message: "Logged out" });
  });
});

module.exports = router;
