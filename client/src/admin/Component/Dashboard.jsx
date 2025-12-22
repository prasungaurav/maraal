import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  CheckCircle,
  Download,
  UserCheck,
  Calendar as CalendarIcon,
  ShieldCheck,
  Palmtree,
  RefreshCw
} from "lucide-react";
import "../Style/Dashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  // Get the base URL from .env file
  const API_BASE_URL = process.env.REACT_APP_API_URL;

  const [stats, setStats] = useState({
    totalEmployees: 0,
    approvals: 0,
    presenceRate: "0%"
  });

  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [absentToday, setAbsentToday] = useState([]);
  const [adminName, setAdminName] = useState("Admin");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const getUTCDateString = () => new Date().getUTCDate().toString();

  // =========================
  // FETCH DATA (WITH CACHE BUSTING)
  // =========================
  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      // Updated URL to use ENV variable
      const response = await fetch(`${API_BASE_URL}/api/admin/dashboard?t=${Date.now()}`, {
        credentials: "include",
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      const data = await response.json();
      if (response.ok) {
        setStats(data.stats);
        setPendingLeaves(data.pendingLeaves);
        setAbsentToday(data.absentToday);
        setAdminName(data.adminName);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // =========================
  // REAL-TIME AUTO-REFRESH
  // =========================
  useEffect(() => {
    fetchDashboard();

    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);

    const dateWatcher = setInterval(() => {
      const currentDay = getUTCDateString();
      const lastDay = localStorage.getItem("lastDashboardDay");
      if (currentDay !== lastDay) {
        fetchDashboard();
      }
    }, 30000);

    window.addEventListener("focus", fetchDashboard);

    return () => {
      clearInterval(clockTimer);
      clearInterval(dateWatcher);
      window.removeEventListener("focus", fetchDashboard);
    };
  }, [fetchDashboard]);

  const handleAction = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this leave?`)) return;
    try {
      // Updated URL to use ENV variable
      const res = await fetch(`${API_BASE_URL}/api/admin/dashboard/leave-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ leaveId: id, action: status })
      });

      if (res.ok) {
        fetchDashboard();
      }
    } catch (err) {
      console.error("Leave action error:", err);
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const renderCalendar = () => {
    const now = currentTime;
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let d = 1; d <= daysInMonth; d++) {
      let cls = "cal-date";
      if (d === today) cls += " active";
      days.push(
        <div key={d} className={cls} style={d === 1 ? { gridColumnStart: firstDay + 1 } : {}}>
          {d}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="dashboard-container">
      <div className="main-grid">
        {/* LEFT COLUMN */}
        <div className="col-left">
          <div className="card stats-panel">
            <div className="main-stat">
              <h1>{stats.totalEmployees}</h1>
              <p>Total Active Employees</p>
            </div>
            <div className="divider"></div>
            <div className="stat-list">
              <div className="stat-row">
                <UserCheck size={20} color="#4f46e5" />
                <div className="stat-info">
                  <span className="val">{stats.approvals}</span>
                  <span className="lbl">Approvals Pending</span>
                </div>
              </div>
              <div className="stat-row">
                <CheckCircle size={20} color="#10b981" />
                <div className="stat-info">
                  <span className="val">{stats.presenceRate}</span>
                  <span className="lbl">Presence Rate</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card calendar-card">
            <div className="cal-header">
              {currentTime.toLocaleString("default", { month: "long", year: "numeric" })}
            </div>
            <div className="cal-grid">
              <small>S</small><small>M</small><small>T</small><small>W</small><small>T</small><small>F</small><small>S</small>
              {renderCalendar()}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN */}
        <div className="col-center">
          <div className="card hero-card">
            <div className="hero-header">
              <span className="live-indicator">
                <span className={`blink-dot ${loading ? 'syncing' : ''}`}></span>
                {loading ? "Syncing..." : "Live System"} • {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <div className="hero-date">
                <CalendarIcon size={14} />
                {currentTime.toDateString()}
              </div>
            </div>
            <h2 className="hero-title">{getGreeting()}, {adminName}!</h2>
            <p className="hero-subtitle">
              You have <strong>{pendingLeaves.length}</strong> leave requests awaiting review.
            </p>
          </div>

          <div className="quick-actions-section">
            <h3 className="section-label">Quick Actions</h3>
            <div className="modern-action-grid">
              <button className="modern-tile blue" onClick={() => navigate("/admin/users")}>
                <Users size={24} /> <span>Manage Users</span>
              </button>
              <button className="modern-tile green" onClick={() => navigate("/admin/approvals")}>
                <ShieldCheck size={24} /> <span>Approvals</span>
              </button>
              <button className="modern-tile purple" onClick={() => navigate("/admin/holidays")}>
                <Palmtree size={24} /> <span>Holidays</span>
              </button>
              <button className="modern-tile orange" onClick={fetchDashboard}>
                <RefreshCw size={24} className={loading ? "animate-spin" : ""} /> <span>Refresh Data</span>
              </button>
            </div>
          </div>

          <div className="footer card">
            <h4>MARAAL</h4>
            <p>Powered by Maraal Aerospace</p>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-right">
          <div className="card section-card">
            <h3>Leave Approvals Queue</h3>
            <div className="scrollable-queue">
              {pendingLeaves.map(leave => (
                <div key={leave._id} className="approval-item">
                  <div className="app-info">
                    <h4>{leave.name}</h4>
                    <span className="app-email">{leave.email}</span>
                  </div>
                  <div className="app-details">
                    <p><strong>Reason:</strong> {leave.reason || "N/A"}</p>
                    <p><strong>Duration:</strong> {leave.duration} day(s)</p>
                  </div>
                  <div className="app-actions">
                    <button className="btn-approve" onClick={() => handleAction(leave._id, "Approved")}>Approve</button>
                    <button className="btn-reject" onClick={() => handleAction(leave._id, "Rejected")}>Reject</button>
                  </div>
                </div>
              ))}
              {pendingLeaves.length === 0 && <p className="all-clear">No pending requests</p>}
            </div>
          </div>

          <div className="card section-card">
            <h3>Absent Today</h3>
            <div className="scrollable-queue">
              {absentToday.map(user => (
                <div key={user._id} className="approval-item">
                  <div className="app-info">
                    <h4>{user.name}</h4>
                    <p style={{ fontSize: "0.8rem", color: "#666" }}>
                      {user.role} • {user.email}
                    </p>
                    <span className="absent-badge">Absent</span>
                  </div>
                </div>
              ))}
              {absentToday.length === 0 && <p className="all-clear">Everyone is present today!</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;