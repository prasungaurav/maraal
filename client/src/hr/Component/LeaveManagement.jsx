import React, { useEffect, useState } from "react";
import "../Style/LeaveManagement.css";

const HRLeaveManagement = () => {
  const [leaveData, setLeaveData] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  const fetchLeaves = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/hr/leave`, { credentials: "include" });
      const data = await res.json();
      setLeaveData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const pendingRequests = leaveData.filter(req => req.status === "Pending");
  const historyRequests = leaveData.filter(req => req.status !== "Pending");

  const calcDays = (from, to) => {
    if (!from || !to) return 0;
    const diff = Math.ceil((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  };

  const handleAction = async (id, action) => {
    setLoadingId(id);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/hr/leave/${id}/${action}`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        await fetchLeaves();
        alert(`Success: ${action}`);
      }
    } finally { setLoadingId(null); }
  };

  const LeaveTable = ({ data, showActions }) => (
    <table className="leave-table">
      <thead>
        <tr>
          <th>Employee</th><th>Type</th><th>Days</th><th>Status</th><th>Flow</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? data.map((req) => (
          <tr key={req._id} className={loadingId === req._id ? "row-loading" : ""}>
            <td>
              <div className="user-info-cell">
                <span className="user-name">{req.userId?.name || "Unknown"}</span>
                <span className="user-email">{req.userId?.email || "N/A"}</span>
              </div>
            </td>
            <td>{req.type}</td>
            <td>{calcDays(req.fromDate, req.toDate)}</td>
            <td><span className={`leave-badge ${req.status?.toLowerCase()}`}>{req.status}</span></td>
            <td>
              <div className="flow-chips">
                <span className={`chip ${req.leadApproval === 'Approved' ? 'done' : 'pending'}`}>Lead</span>
                <span className={`chip ${req.hrApproval === 'Approved' ? 'done' : 'pending'}`}>HR</span>
              </div>
            </td>
            <td className="actions-col">
              <button className="act-btn view" onClick={() => setSelectedRequest(req)}>View</button>
              {showActions && (
                <>
                  <button className="act-btn approve" onClick={() => handleAction(req._id, "approve")} disabled={loadingId === req._id}>Approve</button>
                  <button className="act-btn reject" onClick={() => handleAction(req._id, "reject")} disabled={loadingId === req._id}>Reject</button>
                </>
              )}
            </td>
          </tr>
        )) : <tr><td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>No records found.</td></tr>}
      </tbody>
    </table>
  );

  return (
    <div className="leave-page">
      <div className="leave-header-card smooth-card">
        <div>
          <h1 className="leave-title">Leave Management</h1>
          <p className="leave-sub">Track and manage employee leave workflow.</p>
        </div>
      </div>

      <div className="section-container">
        <h2 className="section-title pending-title">Pending Requests</h2>
        <div className="leave-table-card smooth-card">
          <LeaveTable data={pendingRequests} showActions={true} />
        </div>
      </div>

      <div className="section-container">
        <h2 className="section-title history-title">Action History</h2>
        <div className="leave-table-card smooth-card ">
          <LeaveTable data={historyRequests} showActions={false} />
        </div>
      </div>

      {selectedRequest && (
        <div className="side-panel-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="side-panel-content" onClick={e => e.stopPropagation()}>
            <div className="panel-header">
              <h2>Request Details</h2>
              <button className="close-x" onClick={() => setSelectedRequest(null)}>&times;</button>
            </div>
            <div className="panel-body">
              <div className="detail-group">
                <label>Employee</label>
                <p className="detail-name">{selectedRequest.userId?.name}</p>
                <p className="detail-email">{selectedRequest.userId?.email}</p>
              </div>
              <p><b>Reason:</b> {selectedRequest.reason}</p>
            </div>
            <button className="close-btn" onClick={() => setSelectedRequest(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRLeaveManagement;