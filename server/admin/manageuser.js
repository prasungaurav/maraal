const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Middleware: requireLogin
const requireLogin = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    next();
};

// GET all users
router.get("/", requireLogin, async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: users });
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ success: false, message: "Error fetching users" });
    }
});

// ADD new user
router.post("/", requireLogin, async (req, res) => {
    try {
        const { name, email, password, role, biometricId } = req.body;

        // Validate required fields
        if (!name || !email || !password || !role || !biometricId) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Check if email exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(409).json({ success: false, message: "Email already exists" });
        }

        // Check if biometricId exists
        const existingBio = await User.findOne({ biometricId });
        if (existingBio) {
            return res.status(409).json({ success: false, message: "Biometric ID already exists" });
        }

        const newUser = new User({ name, email, password, role, biometricId });
        await newUser.save();

        res.status(201).json({ success: true, message: "User added successfully", data: newUser });
    } catch (err) {
        console.error("Failed to add user:", err);
        res.status(500).json({ success: false, message: "Failed to add user" });
    }
});


// DELETE user
router.delete("/:id", requireLogin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (err) {
        console.error("Failed to delete user:", err);
        res.status(500).json({ success: false, message: "Failed to delete user" });
    }
});

module.exports = router;
