import React, { useState, useEffect } from "react";
import { Search, CalendarDays, ChevronDown, Eye } from "lucide-react";
import axios from "axios";
import "../Style/Attendance.css";

const HRAttendance = () => {
  const [date, setDate] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    fetchAttendance();
  }, [date, search, status]);

  const fetchAttendance = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/hr/attendance`, {
        params: { date, status, search },
        withCredentials: true,
      });
      setAttendanceData(res.data || []);
    } catch (err) {
      console.error("Attendance fetch error", err);
      setAttendanceData([]);
    }
  };

  const formatTime = (time) => {
    if (!time) return "--";
    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="att-page">

      <div className="att-header-card smooth-card">
        <div>
          <h1 className="att-title">Attendance Overview</h1>
          <p className="att-sub">Daily attendance summary</p>
        </div>

        <div className="att-filters">

          <div className="att-input">
            <CalendarDays size={18} />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="att-input search-box">
            <Search size={18} />
            <input
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="att-input dropdown">
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>All</option>
              <option>Present</option>
              <option>Absent</option>
              <option>Half Day</option>
            </select>
            <ChevronDown size={18} />
          </div>

        </div>
      </div>

      <div className="att-table-card smooth-card">
        <table className="att-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Status</th>
              <th>Check-In</th>
              <th>Check-Out</th>
              <th>Work Type</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {attendanceData.length ? (
              attendanceData.map((item) => (
                <tr key={item._id}>
                  <td>{item.userId?.name || "—"}</td>
                  <td>{item.userId?.department || "—"}</td>

                  <td>
                    <span className={`status-badge ${item.status.toLowerCase().replace(" ", "-")}`}>
                      {item.status}
                    </span>
                  </td>

                  <td>{formatTime(item.inTime)}</td>
                  <td>{formatTime(item.outTime)}</td>
                  <td>{item.workType}</td>

                  <td>
                    <button className="action-btn view">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default HRAttendance;
