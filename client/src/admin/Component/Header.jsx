import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../Style/Header.css";
import {
  User,
  Settings,
  LogOut,
  ChevronDown
} from "lucide-react";
import { useAuth } from "../../App";

axios.defaults.withCredentials = true;

function AdminHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Define API Base URL from environment variables
  const API_BASE_URL = process.env.REACT_APP_API_URL;

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(null);

  const dropdownRef = useRef(null);

  /* ===============================
      FETCH ADMIN USER
  ================================ */
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        // Updated URL using API_BASE_URL
        const res = await axios.get(
          `${API_BASE_URL}/api/admin/header/me`
        );

        if (!res.data.user) {
          navigate("/login");
          return;
        }

        setUser(res.data.user);
      } catch (err) {
        console.error("Admin header fetch failed:", err);
        navigate("/login");
      }
    };

    if (API_BASE_URL) {
      fetchAdmin();
    }
  }, [navigate, API_BASE_URL]);

  /* ===============================
      CLOSE DROPDOWN ON OUTSIDE CLICK
  ================================ */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getActiveClass = (path) =>
    location.pathname === path ? "nav-item active" : "nav-item";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <header className="top-dashboard-header">
      {/* LEFT NAV */}
      <nav className="main-nav-links">
        <Link to="/admin" className={getActiveClass("/admin")}>
          Dashboard
        </Link>

        <Link to="/admin/users" className={getActiveClass("/admin/users")}>
          Users
        </Link>

        <Link
          to="/admin/approvals"
          className={getActiveClass("/admin/approvals")}
        >
          Approvals
        </Link>

        <Link
          to="/admin/holidays"
          className={getActiveClass("/admin/holidays")}
        >
          Holidays
        </Link>

        <Link
          to="/admin/export"
          className={getActiveClass("/admin/export")}
        >
          Export
        </Link>
      </nav>

      {/* RIGHT PROFILE */}
      <div className="header-info">
        <div
          className={`user-profile-widget ${
            isProfileOpen ? "active" : ""
          }`}
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          ref={dropdownRef}
        >
          {/* AVATAR */}
          <div className="user-avatar">
            {user.name?.charAt(0).toUpperCase()}
          </div>

          <span className="user-name">{user.name}</span>

          <ChevronDown
            size={14}
            className={`profile-arrow ${
              isProfileOpen ? "rotate" : ""
            }`}
          />

          {isProfileOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <span className="d-name">{user.name}</span>
                <span className="d-role">{user.role}</span>
              </div>

              <div className="dropdown-divider" />

              <div
                className="dropdown-item logout"
                onClick={handleLogout}
              >
                <LogOut size={16} /> Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;