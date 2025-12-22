const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ----------------------------
// GET ALL EMPLOYEES (HR)
// ----------------------------
router.get("/", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not logged in" });
    }

    const employees = await User.find({ role: "Employee" }).select("-password");
    res.json({ employees });
  } catch (err) {
    console.error("Fetch employees error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------------------
// ADD EMPLOYEE
// ----------------------------
router.post("/", async (req, res) => {
  try {
    const { name, email, department, position } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Employee already exists" });
    }

    const employee = new User({
      name,
      email,
      department,
      position,
      role: "Employee",
      password: "123456", // temporary
    });

    await employee.save();
    res.json({ message: "Employee added", employee });
  } catch (err) {
    console.error("Add employee error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
