import React, { useState } from "react";
import { X } from "lucide-react";
import axios from "axios";

export default function ApplyLeaveForm({ onClose }) {
  const [form, setForm] = useState({
    type: "",
    from: "",
    to: "",
    reason: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/leave/apply`,
        {
          type: form.type,
          fromDate: form.from,
          toDate: form.to,
          reason: form.reason,
        },
        { withCredentials: true } // ensures session is sent
      );

      alert("Leave Applied Successfully!");
      onClose(); // close popup
    } catch (err) {
      console.error("Error applying leave:", err);
      setError("Failed to apply leave. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="apply-form-overlay">
      <div className="apply-form-container">
        <div className="form-header">
          <h2>Apply for Leave</h2>
          <X size={22} className="close-btn" onClick={onClose} />
        </div>

        <form className="leave-form" onSubmit={handleSubmit}>
          <label>Leave Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            required
          >
            <option value="">Select Type</option>
            <option value="Sick Leave">Sick Leave</option>
            <option value="Paid Leave">Paid Leave</option>
            <option value="Emergency Leave">Emergency Leave</option>
          </select>

          <label>From Date</label>
          <input
            type="date"
            value={form.from}
            onChange={(e) => setForm({ ...form, from: e.target.value })}
            required
          />

          <label>To Date</label>
          <input
            type="date"
            value={form.to}
            onChange={(e) => setForm({ ...form, to: e.target.value })}
            required
          />

          <label>Reason</label>
          <textarea
            rows="3"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            required
          ></textarea>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Applying..." : "Apply Leave"}
          </button>
        </form>
      </div>
    </div>
  );
}
