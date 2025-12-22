import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Style/Header.css';
import { User, Settings, LogOut, ChevronDown, HelpCircle } from 'lucide-react';

axios.defaults.withCredentials = true;

function EmployeeHeader() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // ✅ Combined state for user, attendance, leaves
  const [headerData, setHeaderData] = useState({
    user: null,
    attendance: [],
    leaves: []
  });

  const dropdownRef = useRef(null);

  /* ===============================
     CLOCK + OUTSIDE CLICK
  ================================ */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      clearInterval(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /* ===============================
     FETCH HEADER DATA
  ================================ */
  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/header/data`);
        console.log('Header data response:', res.data);
        if (!res.data.user) {
          // session expired

          return;
        }
        setHeaderData(res.data);
      } catch (err) {
        console.error('Error fetching header data:', err);
        navigate('/login');
      }
    };

    fetchHeaderData();
  }, [navigate]);

  /* ===============================
     HELPERS
  ================================ */
  const formatTime = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let h = date.getHours();
    const m = date.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${date.getFullYear()} | ${h}:${m} ${ampm} ${days[date.getDay()]}`;
  };

  const getActiveClass = (path) =>
    location.pathname === path ? 'nav-item active' : 'nav-item';

  const handleLogout = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/header/logout`);
    } catch (err) {
      console.error('Logout error:', err);
    }
    navigate('/login');
  };

  const { user, attendance, leaves } = headerData;

  if (!user) return null; // wait till session loads

  return (
    <header className="top-dashboard-header">
      {/* LEFT NAV */}
      <nav className="main-nav-links">
        <Link to="/" className={getActiveClass('/')}>Home</Link>
        <Link to="/attendance" className={getActiveClass('/attendance')}>Attendance</Link>
        <Link to="/leaves" className={getActiveClass('/leaves')}>Leaves</Link>
        <Link to="/terms" className={getActiveClass('/terms')}>Terms</Link>
      </nav>

      {/* RIGHT INFO */}
      <div className="header-info">
        <span className="date">{formatTime(currentDateTime)}</span>

        <div
          className={`user-profile-widget ${isProfileOpen ? 'active' : ''}`}
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          ref={dropdownRef}
        >
          {/* ✅ FIRST LETTER AVATAR */}
          <div className="user-avatar">
            {user.name?.charAt(0).toUpperCase()}
          </div>

          <span className="user-name">{user.name}</span>

          <ChevronDown
            size={14}
            className={`profile-arrow ${isProfileOpen ? 'rotate' : ''}`}
          />

          {isProfileOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <span className="d-name">{user.name}</span>
                <span className="d-role">{user.role}</span>
              </div>

              <div className="dropdown-divider" />

              <Link to="/profile" className="dropdown-item">
                <User size={16} /> My Profile
              </Link>

              <Link to="/settings" className="dropdown-item">
                <Settings size={16} /> Settings
              </Link>

              <Link to="/help" className="dropdown-item">
                <HelpCircle size={16} /> Help
              </Link>

              <div className="dropdown-divider" />

              <div className="dropdown-item logout" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default EmployeeHeader;
