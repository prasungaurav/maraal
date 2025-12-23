import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Style/Header.css';
import { User, Settings, LogOut, ChevronDown, HelpCircle, Key, X } from 'lucide-react';

axios.defaults.withCredentials = true;

function EmployeeHeader() {
  const location = useLocation();
  const navigate = useNavigate();

  // ==========================
  // HOOKS
  // ==========================
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isChangeOpen, setIsChangeOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [headerData, setHeaderData] = useState({ user: null, attendance: [], leaves: [] });

  // Change Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changeMessage, setChangeMessage] = useState('');

  const dropdownRef = useRef(null);

  // ==========================
  // EFFECTS
  // ==========================
  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);

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

  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/header/data`);
        if (!res.data.user) {
          navigate('/login');
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

  // ==========================
  // HELPERS
  // ==========================
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

  const validateStrongPassword = (password) => {
    // Must be at least 8 chars, contain uppercase, number, and special @
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@]).{8,}$/;
    return regex.test(password);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangeMessage('');

    if (!validateStrongPassword(newPassword)) {
      setChangeMessage('New password must be 8+ chars, include 1 uppercase letter, 1 number, and @');
      return;
    }

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/header/change-password`, {
        oldPassword,
        newPassword
      });
      setChangeMessage(res.data.message);
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setChangeMessage(err.response?.data?.error || 'Something went wrong');
    }
  };

  // ==========================
  // RENDER
  // ==========================
  const { user } = headerData;
  if (!user) return null;

  return (
    <header className="top-dashboard-header">
      {/* LEFT LOGO */}
      <div className="nav-left">
        <img src="/logo.png" alt="Company Logo" className="nav-logo" />
      </div>

      {/* CENTER NAV */}
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
          <div className="user-avatar">{user.name?.charAt(0).toUpperCase()}</div>
          <span className="user-name" style={{ color: 'white' }}>{user.name}</span>
          <ChevronDown size={14} className={`profile-arrow ${isProfileOpen ? 'rotate' : ''}`} />

          {isProfileOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <span className="d-name">{user.name}</span>
                <span className="d-role">{user.role}</span>
              </div>

              <div className="dropdown-divider" />

              <Link to="/profile" className="dropdown-item"><User size={16} /> My Profile</Link>
              <Link to="/settings" className="dropdown-item"><Settings size={16} /> Settings</Link>
              <Link to="/help" className="dropdown-item"><HelpCircle size={16} /> Help</Link>

              {/* CHANGE PASSWORD */}
              <div
                className="dropdown-item change-password"
                onClick={() => { setIsChangeOpen(true); setIsProfileOpen(false); }}
              >
                <Key size={16} /> Change Password
              </div>

              <div className="dropdown-divider" />

              <div className="dropdown-item logout" onClick={handleLogout}><LogOut size={16} /> Logout</div>
            </div>
          )}
        </div>
      </div>

      {/* ==========================
          CHANGE PASSWORD MODAL
      ========================== */}
      {isChangeOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Change Password</h3>
              <X size={20} onClick={() => setIsChangeOpen(false)} style={{ cursor: 'pointer' }} />
            </div>
            <form onSubmit={handleChangePassword}>
              <input
                type="text" // visible password
                placeholder="Old Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
              <input
                type="text" // visible password
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button type="submit">Update Password</button>
            </form>
            {changeMessage && <p className="message">{changeMessage}</p>}
          </div>
        </div>
      )}
    </header>
  );
}

export default EmployeeHeader;