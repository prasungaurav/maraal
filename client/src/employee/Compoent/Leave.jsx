import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Style/Leave.css';
import {
    Plus, Filter, Download, Thermometer, User, Briefcase, ChevronDown, Search, Calendar
} from 'lucide-react';
import { useLocation } from 'react-router-dom';   // <-- NEW
import ApplyLeaveForm from "./ApplyLeave";

const iconMap = {
    Thermometer: <Thermometer size={20} />,
    User: <User size={20} />,
    Briefcase: <Briefcase size={20} />,
};

function EmployeeLeaves() {
    const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api/leave`;
    const location = useLocation();   // <-- NEW

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filterType, setFilterType] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterMonth, setFilterMonth] = useState('All');

    const [leaveBalances, setLeaveBalances] = useState([]);
    const [historyLogs, setHistoryLogs] = useState([]);
    const [upcomingHolidays, setUpcomingHolidays] = useState([]);

    const [showApplyForm, setShowApplyForm] = useState(false);

    // OPEN POPUP AUTOMATICALLY WHEN NAVIGATED FROM DASHBOARD
    useEffect(() => {
        if (location.state?.openAsPopup) {
            setShowApplyForm(true);
            // Clear state so it doesn't auto-open on refresh/back
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    useEffect(() => {
        const fetchLeaveData = async () => {
            setLoading(true);
            setError(null);
            try {
                const balancesRes = await axios.get(`${API_BASE_URL}/balances`);
                setLeaveBalances(balancesRes.data);

                const historyRes = await axios.get(`${API_BASE_URL}/history`);
                setHistoryLogs(historyRes.data);

                const holidaysRes = await axios.get(`${API_BASE_URL}/holidays`);
                setUpcomingHolidays(holidaysRes.data);

            } catch (error) {
                console.error("Error fetching leave data:", error);
                setError("Failed to load data. Check server/MongoDB.");
            } finally {
                setLoading(false);
            }
        };

        fetchLeaveData();
    }, []);

    const getMonthName = (dateString) => dateString ? dateString.split(" ")[1] : "";

    const getAvailableMonths = () => {
        const months = new Set();
        historyLogs.forEach(item => {
            const month = getMonthName(item.from);
            if (month) months.add(month);
        });

        const order = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        return [...months].sort((a, b) => order.indexOf(a) - order.indexOf(b));
    };

    const filteredHistory = historyLogs.filter(item => {
        const typeMatch = filterType === 'All' || item.type === filterType;
        const statusMatch = filterStatus === 'All' || item.status === filterStatus;
        const monthMatch = filterMonth === 'All' || getMonthName(item.from) === filterMonth;
        return typeMatch && statusMatch && monthMatch;
    });

    const renderStatusBadge = (status) => {
        let badgeClass = 'badge-success';
        if (status === 'Pending') badgeClass = 'badge-warning';
        if (status === 'Rejected') badgeClass = 'badge-danger';
        return (
            <span className={`status-badge ${badgeClass}`}>
                <span className="dot"></span> {status}
            </span>
        );
    };

    const handleResetFilters = () => {
        setFilterType('All');
        setFilterStatus('All');
        setFilterMonth('All');
    };

    if (loading) {
        return <div className="leaves-page-wrapper" style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;
    }

    if (error) {
        return <div className="leaves-page-wrapper" style={{ textAlign: 'center', padding: '50px', color: 'red' }}>Error: {error}</div>;
    }

    return (
        <div className="leaves-page-wrapper">

            {/* APPLY LEAVE POPUP (MODAL) */}
            {showApplyForm && (
                <ApplyLeaveForm onClose={() => setShowApplyForm(false)} />
            )}

            {/* LEFT COLUMN */}
            <div className="leaves-col-left">
                <div className="left-header">
                    <h1 className="page-title">Leave Management</h1>
                    <p className="page-subtitle">Track your leave balances 📊</p>
                </div>

                {/* Apply Leave Button */}
                <button
                    className="apply-leave-main-btn"
                    onClick={() => setShowApplyForm(true)}
                >
                    <Plus size={18} /> <span>Apply New Leave</span>
                </button>

                <div className="vertical-balances">
                    {leaveBalances.map((leave, index) => {
                        const available = leave.total - leave.used;
                        const percentage = leave.total > 0 ? (available / leave.total) * 100 : 0;
                        return (
                            <div key={index} className="balance-card" style={{ borderLeftColor: leave.color }}>
                                <div className="balance-header">
                                    <div className="balance-header-left">
                                        <div className="balance-icon" style={{ backgroundColor: `${leave.color}15`, color: leave.color }}>
                                            {iconMap[leave.icon]}
                                        </div>
                                        <span className="balance-title">{leave.type}</span>
                                    </div>
                                    <div className="mini-ring-container">
                                        <svg className="mini-ring" viewBox="0 0 36 36">
                                            <path className="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                            <path className="ring-progress" strokeDasharray={`${Math.min(percentage, 100)}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" style={{ stroke: leave.color }} />
                                        </svg>
                                    </div>
                                </div>
                                <div className="balance-body">
                                    <div className="balance-stat">
                                        <span className="stat-label">Available</span>
                                        <span className="stat-val" style={{ color: leave.color }}>{available}</span>
                                    </div>
                                    <div className="balance-divider"></div>
                                    <div className="balance-stat">
                                        <span className="stat-label">Total</span>
                                        <span className="stat-val">{leave.total}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* CENTER COLUMN */}
            <div className="leaves-col-center">
                <div className="holiday-widget">
                    <div className="widget-header-row">
                        <span className="w-title">Upcoming Holidays</span>
                        <Calendar size={14} className="text-gray" />
                    </div>

                    <div className="holiday-list">
                        {upcomingHolidays.length > 0 ? (
                            upcomingHolidays.map((holiday, index) => (
                                <div key={index} className="holiday-item">
                                    <div className="h-date-box">
                                        <span className="h-date">{holiday.date.split(' ')[0]}</span>
                                        <span className="h-month">{holiday.date.split(' ')[1]}</span>
                                    </div>
                                    <div className="h-info">
                                        <span className="h-name">{holiday.name}</span>
                                        <span className="h-day">{holiday.day}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No upcoming holidays</p>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="filter-panel">
                    <div className="filter-header">
                        <h4 className="filter-title"><Filter size={16} /> Filters</h4>
                        <span className="reset-link" onClick={handleResetFilters}>Reset</span>
                    </div>

                    <div className="filter-row">
                        <label>Month</label>
                        <div className="select-wrapper">
                            <select className="custom-select" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
                                <option value="All">All Months</option>
                                {getAvailableMonths().map(month => (
                                    <option key={month} value={month}>{month}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="select-arrow" />
                        </div>
                    </div>

                    <div className="filter-row">
                        <label>Leave Type</label>
                        <div className="select-wrapper">
                            <select className="custom-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                                <option value="All">All Types</option>
                                {leaveBalances.map(b => (
                                    <option key={b.type} value={b.type}>{b.type}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="select-arrow" />
                        </div>
                    </div>

                    <div className="filter-row">
                        <label>Status</label>
                        <div className="select-wrapper">
                            <select className="custom-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                <option value="All">All Status</option>
                                <option value="Approved">Approved</option>
                                <option value="Pending">Pending</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                            <ChevronDown size={14} className="select-arrow" />
                        </div>
                    </div>

                    <button className="search-btn"><Search size={16} /> Apply Filters</button>
                </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="leaves-col-right">
                <div className="history-section-card">
                    <div className="history-header-row">
                        <h3 className="section-title">Leave History</h3>
                        <button className="export-btn-text">
                            <Download size={14} /> Export
                        </button>
                    </div>

                    <div className="table-wrapper">
                        <table className="leaves-table">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>From</th>
                                    <th>To</th>
                                    <th>Days</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredHistory.length > 0 ? (
                                    filteredHistory.map(item => (
                                        <tr key={item.id}>
                                            <td>
                                                <div className="type-wrapper">
                                                    <div className="type-indicator" style={{
                                                        backgroundColor:
                                                            item.type === "Sick Leave" ? "#EC4899" :
                                                                item.type === "Paid Leave" ? "#10B981" : "#4F46E5"
                                                    }}></div>
                                                    <span className="type-name">{item.type}</span>
                                                </div>
                                            </td>
                                            <td>{item.from}</td>
                                            <td>{item.to}</td>
                                            <td><span className="days-badge">{item.days} Days</span></td>
                                            <td>{item.reason}</td>
                                            <td>{renderStatusBadge(item.status)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '25px' }}>
                                            No Records Found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>

        </div>
    );
}

export default EmployeeLeaves;
