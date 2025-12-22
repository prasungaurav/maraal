const express = require("express");
const router = express.Router();
const User = require("./models/User");

// ----------------------------
// LOGIN (EMAIL + PASSWORD ONLY)
// ----------------------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    // 🔥 FIND USER WITHOUT ROLE CHECK
    const user = await User.findOne({ email, password });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    // ✅ Save session
    req.session.userId = user._id;
    req.session.userRole = user.role;

    res.json({
      success: true,
      message: "Login Successful",
      user: {
        id: user._id,
        name: user.name,
        role: user.role, // 🔥 ROLE COMES FROM DB
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ----------------------------
// LOGOUT
// ----------------------------
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ success: true });
  });
});

// ----------------------------
// AUTH CHECK
// ----------------------------
router.get("/me", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false });
  }

  const user = await User.findById(req.session.userId).select("-password");
  res.json({ success: true, user });
});

module.exports = router;
