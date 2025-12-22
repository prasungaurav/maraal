import React, { useState } from "react";
import "../Style/Settings.css";

const HRSettings = () => {
  const [company, setCompany] = useState({
    name: "MARAAL TECHNOLOGIES",
    address: "Delhi NCR, India",
    website: "https://maraal.com",
  });

  const [leavePolicy, setLeavePolicy] = useState({
    casual: 12,
    sick: 8,
    carryForward: true,
    maxCarryForward: 6,
  });

  const [attendance, setAttendance] = useState({
    checkIn: "09:30",
    checkOut: "18:00",
    lateAfter: "09:45",
    halfDayAfter: "12:00",
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    leaveApprovalNotify: true,
    attendanceNotify: false,
  });

  return (
    <div className="settings-page">
      <h1 className="settings-title">System Settings</h1>
      <p className="settings-sub">Configure company, leave, attendance, and system preferences.</p>

      {/* ========================
          COMPANY INFORMATION
      ========================= */}
      <div className="settings-card">
        <h2>Company Information</h2>
        <div className="settings-group">
          <label>Company Name</label>
          <input
            type="text"
            value={company.name}
            onChange={(e) => setCompany({ ...company, name: e.target.value })}
          />

          <label>Company Address</label>
          <input
            type="text"
            value={company.address}
            onChange={(e) => setCompany({ ...company, address: e.target.value })}
          />

          <label>Website</label>
          <input
            type="url"
            value={company.website}
            onChange={(e) => setCompany({ ...company, website: e.target.value })}
          />

          <button className="save-btn">Save Changes</button>
        </div>
      </div>

      {/* ========================
          LEAVE POLICY
      ========================= */}
      <div className="settings-card">
        <h2>Leave Policy</h2>
        <div className="settings-group">
          <label>Casual Leaves / Year</label>
          <input
            type="number"
            value={leavePolicy.casual}
            onChange={(e) =>
              setLeavePolicy({ ...leavePolicy, casual: e.target.value })
            }
          />

          <label>Sick Leaves / Year</label>
          <input
            type="number"
            value={leavePolicy.sick}
            onChange={(e) =>
              setLeavePolicy({ ...leavePolicy, sick: e.target.value })
            }
          />

          <label>Carry Forward</label>
          <select
            value={leavePolicy.carryForward}
            onChange={(e) =>
              setLeavePolicy({ ...leavePolicy, carryForward: e.target.value === "true" })
            }
          >
            <option value="true">Allowed</option>
            <option value="false">Not Allowed</option>
          </select>

          {leavePolicy.carryForward && (
            <>
              <label>Max Carry Forward Leaves</label>
              <input
                type="number"
                value={leavePolicy.maxCarryForward}
                onChange={(e) =>
                  setLeavePolicy({
                    ...leavePolicy,
                    maxCarryForward: e.target.value,
                  })
                }
              />
            </>
          )}

          <button className="save-btn">Save Leave Policy</button>
        </div>
      </div>

      {/* ========================
          ATTENDANCE SETTINGS
      ========================= */}
      <div className="settings-card">
        <h2>Attendance Settings</h2>

        <div className="settings-group grid-2">
          <div>
            <label>Check-In Time</label>
            <input
              type="time"
              value={attendance.checkIn}
              onChange={(e) =>
                setAttendance({ ...attendance, checkIn: e.target.value })
              }
            />
          </div>

          <div>
            <label>Check-Out Time</label>
            <input
              type="time"
              value={attendance.checkOut}
              onChange={(e) =>
                setAttendance({ ...attendance, checkOut: e.target.value })
              }
            />
          </div>

          <div>
            <label>Late After</label>
            <input
              type="time"
              value={attendance.lateAfter}
              onChange={(e) =>
                setAttendance({ ...attendance, lateAfter: e.target.value })
              }
            />
          </div>

          <div>
            <label>Half Day After</label>
            <input
              type="time"
              value={attendance.halfDayAfter}
              onChange={(e) =>
                setAttendance({ ...attendance, halfDayAfter: e.target.value })
              }
            />
          </div>

          <button className="save-btn full">Save Attendance Settings</button>
        </div>
      </div>

      {/* ========================
          NOTIFICATION SETTINGS
      ========================= */}
      <div className="settings-card">
        <h2>Notification Settings</h2>

        <div className="toggle-item">
          <span>Email Alerts</span>
          <input
            type="checkbox"
            checked={notifications.emailAlerts}
            onChange={(e) =>
              setNotifications({ ...notifications, emailAlerts: e.target.checked })
            }
          />
        </div>

        <div className="toggle-item">
          <span>Leave Approval Notifications</span>
          <input
            type="checkbox"
            checked={notifications.leaveApprovalNotify}
            onChange={(e) =>
              setNotifications({
                ...notifications,
                leaveApprovalNotify: e.target.checked,
              })
            }
          />
        </div>

        <div className="toggle-item">
          <span>Attendance Alerts</span>
          <input
            type="checkbox"
            checked={notifications.attendanceNotify}
            onChange={(e) =>
              setNotifications({
                ...notifications,
                attendanceNotify: e.target.checked,
              })
            }
          />
        </div>

        <button className="save-btn">Save Notification Settings</button>
      </div>

      {/* ========================
          DANGER ZONE
      ========================= */}
      <div className="settings-card danger-zone">
        <h2>Danger Zone</h2>
        <p>These actions are permanent and risky. Proceed with caution.</p>

        <button className="danger-btn">Reset System Data</button>
        <button className="danger-btn">Clear Cache</button>
      </div>
    </div>
  );
};

export default HRSettings;
