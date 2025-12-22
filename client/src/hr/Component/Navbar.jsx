// src/Component/Navbar.jsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../App"; // Use context
import "../Style/Navbar.css";

const HRNavbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [openDropdown, setOpenDropdown] = useState(false);

    // Get auth info from context
    const { isLoggedIn, userName, logout } = useAuth();

    // Do not show Navbar on login page or if not logged in
    if (!isLoggedIn || location.pathname === "/login") return null;

const menu = [
  { to: "/hr", label: "Dashboard" },
  { to: "/hr/employees", label: "Employees" },
  { to: "/hr/attendance", label: "Attendance" },
  { to: "/hr/leaves", label: "Leave" },
  { to: "/hr/reports", label: "Reports" },
  { to: "/hr/settings", label: "Settings" }
];


    const handleLogout = () => {
        setOpenDropdown(false);
        logout(); // Use context logout
        navigate("/login"); // Redirect after logout
    };

    return (
        <header className="nav-root">

            {/* Left Logo */}
            <div className="nav-left">
                <img
                    src="src/assets/logo.png"
                    alt="Maraal Aerospace"
                    className="nav-logo"
                />
            </div>

            {/* Center Menu */}
            <nav className="nav-menu">
                {menu.map((item, i) => (
                    <Link
                        key={i}
                        to={item.to}
                        className={`nav-link ${location.pathname === item.to ? "active" : ""}`}
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>

            {/* Profile */}
            <div
                className="nav-profile"
                onClick={() => setOpenDropdown(!openDropdown)}
            >
                <img
                    src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                    className="profile-img"
                    alt="profile"
                />
                <span className="profile-name">{userName || 'User'}</span>

                {openDropdown && (
                    <div className="nav-dropdown">
                        <p>Profile</p>
                        <p>Account Settings</p>
                        <p className="logout" onClick={handleLogout}>Logout</p>
                    </div>
                )}
            </div>

        </header>
    );
};

export default HRNavbar;
