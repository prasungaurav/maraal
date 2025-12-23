import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../Style/Header.css"; // use HR navbar css
import { useAuth } from "../../App";

axios.defaults.withCredentials = true;

function AdminHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const API_BASE_URL = process.env.REACT_APP_API_URL;

  const [user, setUser] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef(null);

  /* ===============================
      FETCH ADMIN USER
  ================================ */
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
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

    if (API_BASE_URL) fetchAdmin();
  }, [navigate, API_BASE_URL]);

  /* ===============================
      CLOSE DROPDOWN ON OUTSIDE CLICK
  ================================ */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setOpenDropdown(false);
    await logout();
    navigate("/login");
  };

  if (!user) return null;

  const menu = [
    { to: "/admin", label: "Dashboard" },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/approvals", label: "Approvals" },
    { to: "/admin/holidays", label: "Holidays" },
    { to: "/admin/export", label: "Export" }
  ];

  return (
    <header className="nav-root">
      {/* LEFT LOGO */}
      <div className="nav-left">
        <img
          src="/logo.png"
          alt="Company Logo"
          className="nav-logo"
        />
      </div>

      {/* CENTER MENU */}
      <nav className="nav-menu">
        {menu.map((item, i) => (
          <Link
            key={i}
            to={item.to}
            className={`nav-link ${
              location.pathname === item.to ? "active" : ""
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* PROFILE */}
      <div
        className="nav-profile"
        ref={dropdownRef}
        onClick={() => setOpenDropdown(!openDropdown)}
      >
        <div className="profile-avatar">
          {user.name?.charAt(0).toUpperCase()}
        </div>

        <span className="profile-name">{user.name}</span>

        {openDropdown && (
          <div className="nav-dropdown">
            <p className="logout">{user.name}</p>
            <p className="logout">{user.email}</p>
            <p className="logout" onClick={handleLogout}>
              Logout
            </p>
          </div>
        )}
      </div>
    </header>
  );
}

export default AdminHeader;
