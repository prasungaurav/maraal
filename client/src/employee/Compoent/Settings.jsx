import React, { useState, useEffect } from "react";
import axios from "axios";

function EmployeeSettings() {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="page-wrapper">
      <h1>Settings</h1>
      <div className="settings-item">
        <label>
          <input
            type="checkbox"
            checked={settings.notifications}
            onChange={() => handleToggle("notifications")}
          />
          Enable Notifications
        </label>
      </div>
      <div className="settings-item">
        <label>
          <input
            type="checkbox"
            checked={settings.darkMode}
            onChange={() => handleToggle("darkMode")}
          />
          Dark Mode
        </label>
      </div>
    </div>
  );
}

export default EmployeeSettings;
