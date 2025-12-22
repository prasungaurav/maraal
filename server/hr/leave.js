const express = require("express");
const router = express.Router();
const Leave = require("../models/Leave");

// --------------------
// SESSION CHECK
// --------------------
const requireLogin = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not logged in" });
  }
  next();
};

// --------------------
// GET ALL LEAVES (Populated with Name & Email)
// --------------------
router.get("/", requireLogin, async (req, res) => {
  try {
    // .populate('userId', 'name email') replaces the ID with the actual user object
    const leaves = await Leave.find()
      .populate("userId", "name email") 
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// --------------------
// APPROVE LEAVE (Step-by-Step Workflow)
// --------------------
router.post("/:id/approve", requireLogin, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    // Step 1: Lead Approval
    if (leave.currentLevel === "Team Lead") {
      leave.leadApproval = "Approved"; // Matches frontend logic
      leave.currentLevel = "HR";
      leave.status = "Pending"; // Still pending overall until final level
    } 
    // Step 2: HR Approval
    else if (leave.currentLevel === "HR") {
      leave.hrApproval = "Approved";
      leave.currentLevel = "Director"; // Moving to next stage
      leave.status = "Pending";
    }
    // Step 3: Director Approval (Final)
    else if (leave.currentLevel === "Director") {
      leave.directorApproval = "Approved";
      leave.currentLevel = "Completed";
      leave.status = "Approved"; // Final Status
    }

    await leave.save();
    // Re-populate before sending back so the UI doesn't lose the name
    const updatedLeave = await Leave.findById(leave._id).populate("userId", "name email");
    res.json(updatedLeave);
  } catch (err) {
    res.status(500).json({ message: "Approval failed" });
  }
});

// --------------------
// REJECT LEAVE (Immediate End)
// --------------------
router.post("/:id/reject", requireLogin, async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status: "Rejected",
        currentLevel: "Completed",
        // Optionally mark the specific level that rejected it
      },
      { new: true }
    ).populate("userId", "name email");

    res.json(leave);
  } catch (err) {
    res.status(500).json({ message: "Rejection failed" });
  }
});

module.exports = router;