import React, { useState, useEffect, useMemo } from "react";
import {
  CheckSquare,
  XCircle,
  ArrowRightCircle,
  ListChecks,
  LayoutGrid
} from "lucide-react";
import "../Style/Approval.css";

function AdminApproval() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);

  // Get the base URL from .env file
  const API_BASE_URL = process.env.REACT_APP_API_URL;

  // -------------------------
  // Fetch Leaves
  // -------------------------
  const fetchLeaves = async () => {
    try {
      // Updated URL to use ENV variable
      const res = await fetch(`${API_BASE_URL}/api/admin/approval/all`, {
        credentials: "include",
      });

      const data = await res.json();
      setLeaves(data.leaves || []);
    } catch (error) {
      console.error("Error fetching leaves:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // -------------------------
  // Update Status
  // -------------------------
  const updateStatus = async (leaveId, status) => {
    try {
      // Updated URL to use ENV variable
      const res = await fetch(
        `${API_BASE_URL}/api/admin/approval/update-status`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leaveId, status }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setLeaves((prev) =>
          prev.map((l) =>
            l._id === leaveId ? { ...l, status } : l
          )
        );
      }
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  // -------------------------
  // Stats Summary
  // -------------------------
  const { pendingCount, approvedCount, rejectedCount, totalCount } =
    useMemo(() => {
      const stats = {
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
        totalCount: 0,
      };

      leaves.forEach((l) => {
        stats.totalCount++;
        if (l.status === "Pending") stats.pendingCount++;
        if (l.status === "Approved") stats.approvedCount++;
        if (l.status === "Rejected") stats.rejectedCount++;
      });

      return stats;
    }, [leaves]);

  // -------------------------
  // Leave Card Component
  // -------------------------
  const LeaveCard = ({ leave }) => (
    <div className={`request-card status-${leave.status.toLowerCase()}`}>
      <div className="request-details">
        <span className="employee-name">{leave.userId?.name}</span>

        <span className="request-info">
          {leave.type}
          <ArrowRightCircle size={12} style={{ margin: "0 6px" }} />
          {new Date(leave.fromDate).toDateString()} →{" "}
          {new Date(leave.toDate).toDateString()}
        </span>

        <p className="reason">Reason: {leave.reason}</p>
      </div>

      <div className="status-col">
        <span className={`status-badge ${leave.status.toLowerCase()}`}>
          {leave.status}
        </span>
      </div>

      <div className="request-actions">
        {leave.status === "Pending" ? (
          <>
            <button
              className="btn-action btn-approve"
              onClick={() => updateStatus(leave._id, "Approved")}
            >
              <CheckSquare size={16} /> Approve
            </button>

            <button
              className="btn-action btn-reject"
              onClick={() => updateStatus(leave._id, "Rejected")}
            >
              <XCircle size={16} /> Reject
            </button>
          </>
        ) : (
          <span className="action-taken-text">Completed</span>
        )}
      </div>
    </div>
  );

  if (loading) return <p>Loading...</p>;

  return (
    <div className="approval-page">
      <h1 className="page-title">
        <CheckSquare size={28} /> Leave Approval Dashboard
      </h1>

      <div className="approval-layout">

        {/* Summary */}
        <div className="column-1">
          <div className="panel summary-panel">
            <h3><LayoutGrid size={18} /> Overview</h3>

            <div className="summary-stats">
              <div className="stat-card status-pending">
                <span>Pending</span><b>{pendingCount}</b>
              </div>
              <div className="stat-card status-approved">
                <span>Approved</span><b>{approvedCount}</b>
              </div>
              <div className="stat-card status-rejected">
                <span>Rejected</span><b>{rejectedCount}</b>
              </div>
              <div className="stat-card status-total">
                <span>Total</span><b>{totalCount}</b>
              </div>
            </div>
          </div>
        </div>

        {/* Lists */}
        <div className="column-2">

          {/* Pending Requests */}
          <div className="panel approval-list-container">
            <h3><ListChecks size={18} /> Pending Requests</h3>

            {leaves.filter((l) => l.status === "Pending").length ? (
              leaves
                .filter((l) => l.status === "Pending")
                .map((leave) => (
                  <LeaveCard key={leave._id} leave={leave} />
                ))
            ) : (
              <p className="empty-list">No pending requests</p>
            )}
          </div>

          {/* Completed Requests */}
          <div className="panel approval-list-container">

            <div className="completed-header">
              <h3><ListChecks size={18} /> Completed Requests</h3>

              <button
                className="toggle-btn"
                onClick={() => setShowCompleted(prev => !prev)}
              >
                {showCompleted ? "Hide" : "Show"}
              </button>
            </div>

            {showCompleted && (
              leaves.filter((l) => l.status !== "Pending").length ? (
                leaves
                  .filter((l) => l.status !== "Pending")
                  .map((leave) => (
                    <LeaveCard key={leave._id} leave={leave} />
                  ))
              ) : (
                <p className="empty-list">No completed requests</p>
              )
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default AdminApproval;