import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Style/Dashboard.css';
import { Calendar as CalIcon, Clock, XCircle, ChevronLeft, ChevronRight, X, ClipboardCheck, Home, Briefcase } from 'lucide-react';
import axios from 'axios';
import ApplyLeaveForm from './ApplyLeave'; // Adjust the path if needed

function EmployeeDashboard() {
    const navigate = useNavigate();
    const [activePreview, setActivePreview] = useState(null);
    const [showApplyForm, setShowApplyForm] = useState(false);
    const [userName, setUserName] = useState("Loading...");
    const [historyData, setHistoryData] = useState([]);
    const [recentAttendance, setRecentAttendance] = useState([]);
    const [recentLeaves, setRecentLeaves] = useState([]);
    const [upcomingHolidays, setUpcomingHolidays] = useState([]);
    const [leaveStats, setLeaveStats] = useState({ used: 0, total: 20 });
    const [punchInTime, setPunchInTime] = useState(null);
    const [punchOutTime, setPunchOutTime] = useState(null);
    const [workingHours, setWorkingHours] = useState("00:00:00");
    const [ringPercentage, setRingPercentage] = useState(0);

    // New State for WFH/WFO selection and Punch-In process
    const [punchingIn, setPunchingIn] = useState(false);
    const [workType, setWorkType] = useState(null);

    // Ref for the punch action area to detect clicks outside
    const punchActionRef = useRef(null);

    // calendar state
    const [currentDate, setCurrentDate] = useState(new Date());
    const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api`;

    const togglePreview = (previewName) => {
        setActivePreview(activePreview === previewName ? null : previewName);
    };

    // ---------- FETCH DASHBOARD DATA ----------
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // ---------- SESSION USER ----------
                const userRes = await axios.get(`${API_BASE_URL}/dashboard/me`, { withCredentials: true });
                console.log("Fetched User Data:", userRes.data);

                setUserName(userRes.data.user.name);
                const userId = userRes.data.user._id;
                console.log("Fetched User ID:", userId);

                // ---------- RECENT ATTENDANCE / FULL ATTENDANCE HISTORY ----------
                const recentAttRes = await axios.get(`${API_BASE_URL}/dashboard/recent-attendance`, { withCredentials: true });
                setRecentAttendance(recentAttRes.data);
                // Ensure history data contains `date`, `timeIn`, `timeOut`
                setHistoryData(recentAttRes.data.map(item => ({
                    date: new Date(item.date).toISOString().split('T')[0].split('-').reverse().join('-'), // Assuming backend returns date string
                    timeIn: item.inTime ? new Date(item.inTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
                    timeOut: item.outTime ? new Date(item.outTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
                    workType: item.workMode // Assuming backend uses workMode
                })));
                console.log("Fetched Recent Attendance:", recentAttRes.data);

                // ---------- RECENT LEAVES ----------
                const leaveRes = await axios.get(`${API_BASE_URL}/dashboard/recent-leaves`, { withCredentials: true });
                setRecentLeaves(leaveRes.data);
                console.log("Fetched Recent Leaves:", leaveRes.data);

                // ---------- UPCOMING HOLIDAYS ----------
                const holidayRes = await axios.get(`${API_BASE_URL}/dashboard/holidays`, { withCredentials: true });
                setUpcomingHolidays(holidayRes.data);

                // ---------- LEAVE STATS ----------
                const statsRes = await axios.get(`${API_BASE_URL}/dashboard/stats`, { withCredentials: true });
                setLeaveStats(statsRes.data);

                // ---------- TODAY PUNCH STATUS ----------
                const statusRes = await axios.get(`${API_BASE_URL}/dashboard/status`, { withCredentials: true });
                if (statusRes.data.inTime) setPunchInTime(new Date(statusRes.data.inTime));
                if (statusRes.data.outTime) setPunchOutTime(new Date(statusRes.data.outTime));
                if (statusRes.data.workType) setWorkType(statusRes.data.workType); // Restore work type

            } catch (error) {
                console.error("Dashboard API Error:", error);
                navigate('/login');
            }
        };

        fetchDashboardData();
    }, [navigate]);

    // ---------- WORKING HOURS TIMER ----------
    useEffect(() => {
        const interval = setInterval(() => {
            if (!punchInTime || punchOutTime) return;

            const now = new Date();
            const diff = now - punchInTime;

            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);

            const pad = n => n.toString().padStart(2, '0');
            setWorkingHours(`${pad(h)}:${pad(m)}:${pad(s)}`);
            setRingPercentage(Math.min((diff / 32400000) * 100, 100)); // 32400000ms = 9 hours
        }, 1000);

        return () => clearInterval(interval);
    }, [punchInTime, punchOutTime]);

    // ---------- CLICK OUTSIDE HANDLER (NEW LOGIC) ----------
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (punchingIn && punchActionRef.current && !punchActionRef.current.contains(event.target)) {
                setPunchingIn(false);
            }
        };

        // Attach the listener if punchingIn is true
        if (punchingIn) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        // Cleanup: remove the listener
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [punchingIn]);


    // ---------- PUNCH IN / OUT LOGIC ----------
    const handlePunchAction = async () => {
        if (!punchInTime) {
            // First time punch-in, show selection buttons
            setPunchingIn(true);
        } else if (!punchOutTime) {
            // Punch-out
            try {
                const res = await axios.post(`${API_BASE_URL}/dashboard/punch-out`, {}, { withCredentials: true });
                setPunchOutTime(new Date(res.data.outTime));
                setPunchingIn(false);
                setWorkType(null); // Clear work type on punch out
                // Refresh history
                const historyRes = await axios.get(`${API_BASE_URL}/dashboard/recent-attendance`, { withCredentials: true });
                setHistoryData(historyRes.data.map(item => ({
                    date: new Date(item.date).toISOString().split('T')[0],
                    timeIn: item.inTime ? new Date(item.inTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
                    timeOut: item.outTime ? new Date(item.outTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
                    workType: item.workMode
                })));
            } catch (err) {
                alert(err.response?.data?.message || "Punch out failed. Check console for details.");
                console.error(err);
            }
        } else {
            // Reset and start new punch-in (show selection buttons)
            setPunchingIn(true);
            setPunchInTime(null);
            setPunchOutTime(null);
            setWorkingHours("00:00:00");
            setRingPercentage(0);
        }
    };

    const handleSelectWorkType = async (selectedWorkType) => {
        try {
            const res = await axios.post(
                `${API_BASE_URL}/dashboard/punch-in`,
                { workMode: selectedWorkType },
                { withCredentials: true }
            );
            setPunchInTime(new Date(res.data.inTime));
            setPunchOutTime(null);
            setWorkingHours("00:00:00");
            setWorkType(selectedWorkType); // Set the selected work type
            setPunchingIn(false); // Hide selection buttons

            // Refresh history
            const historyRes = await axios.get(`${API_BASE_URL}/dashboard/recent-attendance`, { withCredentials: true });
            setHistoryData(historyRes.data.map(item => ({
                date: new Date(item.date).toISOString().split('T')[0],
                timeIn: item.inTime ? new Date(item.inTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
                timeOut: item.outTime ? new Date(item.outTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
                workType: item.workMode
            })));

        } catch (err) {
            alert(err.response?.data?.message || "Punch in failed. Check console for details.");
            console.error(err);
        }
    };


    const formatTimeDisplay = (date) =>
        date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--";

    const leavePercent = (leaveStats.used / leaveStats.total) * 100;
    const leaveStroke = `${leavePercent}, 100`;

    const renderStatusBadge = (status) => {
        let badgeClass = 'p-badge-success';
        if (status === 'Pending' || status === 'Half Day') badgeClass = 'p-badge-warning';
        if (status === 'Rejected' || status === 'Absent') badgeClass = 'p-badge-danger';
        return <span className={`preview-badge ${badgeClass}`}>{status}</span>;
    };

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const getDaysInMonth = (date) =>
        new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    const getFirstDayOfMonth = (date) =>
        new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate); // 0 = Sunday
        const days = [];

        const today = new Date();
        today.setHours(0, 0, 0, 0); // normalize today

        // Empty cells before first date
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="date-cell empty"></div>);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
            cellDate.setHours(0, 0, 0, 0);

            const dayOfWeek = cellDate.getDay(); // 0 = Sunday
            const weekNumber = Math.ceil((d + firstDay) / 7); // accurate week number

            /* --- WEEKEND/OFF DAYS LOGIC --- */
            let isOffDay = false;
            if ([1, 3, 5].includes(weekNumber)) {
                if (dayOfWeek === 0 || dayOfWeek === 6) isOffDay = true; // Sat + Sun off
            } else if ([2, 4, 6].includes(weekNumber)) {
                if (dayOfWeek === 0) isOffDay = true; // Sunday only
            }

            /* --- PRESENT CHECK --- */
            const isPresent = recentAttendance.some(att => {
                if (!att.date) return false;
                const attDate = new Date(att.date);
                return (
                    attDate.getFullYear() === cellDate.getFullYear() &&
                    attDate.getMonth() === cellDate.getMonth() &&
                    attDate.getDate() === cellDate.getDate()
                );
            });

            /* --- LEAVE CHECK (APPROVED ONLY) --- */
            const isOnLeave = recentLeaves.some(leave => {
                if (!leave.from || !leave.to || leave.status !== "Approved") return false;

                const start = new Date(leave.from);
                const end = new Date(leave.to);
                start.setHours(0, 0, 0, 0);
                end.setHours(0, 0, 0, 0);

                return cellDate >= start && cellDate <= end;
            });

            /* --- FINAL STATUS ASSIGNMENT --- */
            const isPast = cellDate < today;
            let statusClass = "";

            if (isOnLeave) {
                statusClass = "cal-leave"; // Yellow
            } else if (isPast && !isOffDay && !isPresent) {
                statusClass = "cal-absent"; // Red
            }
            // Present, future, weekends/off-days remain colorless

            days.push(
                <div
                    key={d}
                    className={`date-cell ${statusClass} ${cellDate.getTime() === today.getTime() ? "today" : ""
                        }`}
                >
                    {d}
                </div>
            );
        }

        return days;
    };


    const getPunchButtonText = () => {
        if (!punchInTime) return "Punch In";
        if (punchInTime && !punchOutTime) return "Punch Out";
        if (punchInTime && punchOutTime) return "Punch In (New Day)";
    };

    const getPunchButtonColor = () => {
        if (!punchInTime || (punchInTime && punchOutTime)) return '#10B981';
        if (punchInTime && !punchOutTime) return '#F59E0B';
    };


    return (
        <div className="dashboard-page-wrapper">
            <main className="dashboard-grid">

                {/* --- Column 1: Attendance Card --- */}
                <div className="card attendance-card">
                    <div className="attendance-ring-container">
                        <div className="working-hours-text">
                            <span>{workingHours}</span>
                            <p>Working Hours</p>
                        </div>
                        <svg className="attendance-ring" viewBox="0 0 36 36">
                            <path
                                className="ring-bg"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                                className="ring-progress"
                                strokeDasharray={`${ringPercentage}, 100`}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                        </svg>
                    </div>

                    <div className="punch-time-box">
                        <div className="time-in">
                            <span>{formatTimeDisplay(punchInTime)}</span>
                            <p>IN</p>
                        </div>
                        <div className="time-out">
                            <span>{formatTimeDisplay(punchOutTime)}</span>
                            <p>OUT</p>
                        </div>
                    </div>


                    {/* Conditional Punch Action Buttons (Wrapped in ref for click-outside) */}
                    <div ref={punchActionRef} className="punch-action-container">
                        {punchingIn ? (
                            <div className="work-type-selection">
                                <button
                                    className="work-type-button wfh"
                                    onClick={() => handleSelectWorkType('WFH')}
                                >
                                    <Home size={20} /> WFH
                                </button>
                                <button
                                    className="work-type-button wfo"
                                    onClick={() => handleSelectWorkType('WFF')} // Corrected from WFF to WFO
                                >
                                    <Briefcase size={20} /> WFF
                                </button>
                            </div>
                        ) : (
                            <button
                                className="punch-button"
                                onClick={handlePunchAction}
                                style={{ backgroundColor: getPunchButtonColor() }}
                            >
                                {getPunchButtonText()}
                            </button>
                        )}
                    </div>


                    {/* --- MODIFIED HISTORY SECTION (Table Layout: Date | IN Time | OUT Time) --- */}
                    <div className="history-section">
                        <h3 className="history-title">Recent Activity</h3>

                        <div className="history-list">
                            {/* Header Row */}
                            <div className="history-card-header">
                                <div className="history-label">Date</div>
                                <div className="history-label">IN</div>
                                <div className="history-label">OUT</div>
                            </div>

                            {/* History Cards */}
                            {historyData.slice(0, 3).map((item, index) => (
                                <div key={index} className="history-card">
                                    <div className="history-card-body">
                                        <div className="history-value">{item.date}</div>
                                        <div className="history-value">{item.timeIn}</div>
                                        <div className="history-value">{item.timeOut}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {/* --- Column 2: Welcome, Preview & Quick Status --- */}
                <div className="col-2-container">
                    <div className="card welcome-card-top">
                        <div className="welcome-header">
                            <div>
                                <h1>Hi, {userName}</h1>
                                <p>Good Morning</p>
                                <p className="good-day-text">Have a productive day.</p>
                            </div>
                            <div className="illustration-box">
                                <div className="hourglass">
                                    <div className="sand-top"></div>
                                    <div className="sand-stream"></div>
                                    <div className="sand-bottom"></div>
                                </div>
                            </div>
                        </div>

                        {/* --- DYNAMIC PREVIEW --- */}
                        {activePreview === 'attendance' && (
                            <div className="dashboard-preview-box slide-in-top">
                                <div className="preview-header">
                                    <h4>Recent Attendance</h4>
                                    <button
                                        className="close-preview"
                                        onClick={() => setActivePreview(null)}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                                <table className="preview-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>In</th>
                                            <th>Out</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentAttendance.map((log, idx) => (
                                            <tr key={idx}>
                                                <td className="p-date">{new Date(log.date).toISOString().split('T')[0]}</td>
                                                <td>{log.inTime ? new Date(log.inTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</td>
                                                <td>{log.outTime ? new Date(log.outTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</td>
                                                <td>{renderStatusBadge(log.status)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="preview-footer">
                                    <span onClick={() => navigate('/attendance')}>
                                        View All Logs &rarr;
                                    </span>
                                </div>
                            </div>
                        )}

                        {activePreview === 'leave' && (
                            <div className="dashboard-preview-box slide-in-top">
                                <div className="preview-header">
                                    <h4>Recent Leave Requests</h4>
                                    <button
                                        className="close-preview"
                                        onClick={() => setActivePreview(null)}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                                <table className="preview-table">
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>From</th>
                                            <th>To</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentLeaves.map((leave, idx) => (
                                            <tr key={idx}>
                                                <td className="p-type">{leave.type}</td>
                                                <td>{leave.from}</td>
                                                <td>{leave.to}</td>
                                                <td>{renderStatusBadge(leave.status)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="preview-footer">
                                    <span onClick={() => navigate('/leaves')}>
                                        View All History &rarr;
                                    </span>
                                </div>
                            </div>
                        )}
                        {activePreview === 'holiday' && (
                            <div className="dashboard-preview-box slide-in-top">
                                <div className="preview-header">
                                    <h4>Upcoming Holidays</h4>
                                    <button
                                        className="close-preview"
                                        onClick={() => setActivePreview(null)}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                                <div className="preview-list">
                                    {upcomingHolidays.map((h, idx) => {
                                        const dateObj = new Date(h.date); // Convert string to Date
                                        const day = dateObj.getDate(); // e.g., 25
                                        const month = dateObj.toLocaleString('default', { month: 'short' }); // e.g., Dec

                                        return (
                                            <div key={idx} className="p-list-item">
                                                <div className="p-date-box">
                                                    <span>{day}</span>
                                                    <small>{month}</small>
                                                </div>
                                                <div className="p-info">
                                                    <span className="p-name">{h.name}</span>
                                                    <span className="p-day">{dateObj.toLocaleDateString('default', { weekday: 'long' })}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <h3 className="section-subtitle">Quick Status</h3>

                        <div className="quick-status-grid">
                            <div
                                className={`status-item project-status ${activePreview === 'attendance' ? 'active-box' : ''}`}
                                onClick={() => togglePreview('attendance')}
                            >
                                <ClipboardCheck size={20} />
                                <div>
                                    <p>Attendance</p>
                                    <span>View Logs</span>
                                </div>
                            </div>
                            <div
                                className={`status-item leave-status status-denied ${activePreview === 'leave' ? 'active-box' : ''}`}
                                onClick={() => togglePreview('leave')}
                            >
                                <XCircle size={20} />
                                <div>
                                    <p>Leave</p>
                                    <span className="status-indicator">Action Required</span>
                                </div>
                            </div>
                            <div
                                className={`status-item holiday-status ${activePreview === 'holiday' ? 'active-box' : ''}`}
                                onClick={() => togglePreview('holiday')}
                            >
                                <CalIcon size={20} />
                                <div>
                                    <p>Holiday</p>
                                    <span>Upcoming: {upcomingHolidays[0]?.name || 'N/A'}</span>
                                </div>
                            </div>
                            <div
                                className="status-item meeting-status"
                                onClick={() => window.open('https://meet.google.com', '_blank')}
                            >
                                <Clock size={20} />
                                <div>
                                    <p>Meeting</p>
                                    <span>10:00 AM - Team Sync</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card maraal-card-bottom">
                        <div className="maraal-logo-placeholder">
                            <span className="maraal-text">Maraal</span>
                        </div>
                        <p className="maraal-tagline">Powered by Maraal Aerospace</p>
                    </div>
                </div>

                {/* --- Column 3: Calendar --- */}
                <div className="card calendar-stats-card">
                    <div className="calendar-box">
                        <div className="calendar-header-box">
                            <span className="month-year">
                                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </span>
                            <div className="calendar-nav">
                                <button
                                    onClick={() =>
                                        setCurrentDate(
                                            new Date(
                                                currentDate.getFullYear(),
                                                currentDate.getMonth() - 1,
                                                1
                                            )
                                        )
                                    }
                                    className="nav-btn"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() =>
                                        setCurrentDate(
                                            new Date(
                                                currentDate.getFullYear(),
                                                currentDate.getMonth() + 1,
                                                1
                                            )
                                        )
                                    }
                                    className="nav-btn"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="calendar-grid-dates">
                            <div className="day-name">S</div>
                            <div className="day-name">M</div>
                            <div className="day-name">T</div>
                            <div className="day-name">W</div>
                            <div className="day-name">T</div>
                            <div className="day-name">F</div>
                            <div className="day-name">S</div>
                            {renderCalendarDays()}
                        </div>
                    </div>
                    <div className="leave-stats-box">
                        <h3 className="section-subtitle">Annual Leaves</h3>
                        <div className="stats-ring-container">
                            <span className="stats-count">
                                {leaveStats.used}/{leaveStats.total}
                            </span>
                            <svg className="leave-stats-ring" viewBox="0 0 36 36">
                                <path
                                    className="ring-bg"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                    className="ring-progress"
                                    strokeDasharray={leaveStroke}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                            </svg>
                        </div>
                        <button
                            className="apply-leave-button"
                            onClick={() => navigate('/leaves', { state: { openAsPopup: true } })}
                        >
                            Apply Leave
                        </button>

                        {showApplyForm && <ApplyLeaveForm onClose={() => setShowApplyForm(false)} />}

                    </div>
                </div>
            </main>
        </div>
    );
}

export default EmployeeDashboard;