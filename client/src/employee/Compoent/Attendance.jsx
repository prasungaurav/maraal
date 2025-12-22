import React, { useState, useEffect, useMemo, useCallback } from 'react';
import '../Style/Attendance.css';
import {
    Calendar, Clock, Filter, Download, Search, Briefcase, ChevronDown, CheckCircle2, AlertCircle, XCircle
} from 'lucide-react';
import axios from 'axios';

// Helper to get month name (Long format: 'December') for filtering
const getMonthNameFromDate = (dateString) => {
    try {
        const date = new Date(dateString);
        return date.toLocaleString('default', { month: 'long' });
    } catch (e) {
        return '';
    }
};

// Helper to get YYYY-MM format for API call
const getYYYYMMFromMonthName = (monthName) => {
    const monthIndex = new Date(Date.parse(monthName + " 1, 2000")).getMonth();
    const currentYear = new Date().getFullYear();
    return `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}`;
}

function EmployeeAttendance() {
    const [allLogs, setAllLogs] = useState([]);
    const [stats, setStats] = useState({ avgHours: '--h --m', presentDays: '--', lateMarks: '--' });
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);

    const initialMonth = getMonthNameFromDate(new Date());
    const [filterMonth, setFilterMonth] = useState(initialMonth);
    const [filterWorkType, setFilterWorkType] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');

    const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api/attendance`;

    // ---------------- FETCH DATA ----------------
    const fetchAttendanceData = useCallback(async (selectedMonth) => {
        setLoading(true);
        try {
            let apiUrl = `${API_BASE_URL}/all`;
            if (selectedMonth !== 'All' && selectedMonth) {
                const yearMonth = getYYYYMMFromMonthName(selectedMonth);
                apiUrl = `${API_BASE_URL}/all?startMonth=${yearMonth}`;
            }

            console.log("API URL being called:", apiUrl); // 🔹 Debug URL

            const logsRes = await axios.get(apiUrl);
            console.log("Logs API Response:", logsRes.data); // 🔹 Debug logs
            setAllLogs(logsRes.data);

            const statsRes = await axios.get(`${API_BASE_URL}/stats-summary`);
            console.log("Stats API Response:", statsRes.data); // 🔹 Debug stats
            setStats(statsRes.data);

            const chartRes = await axios.get(`${API_BASE_URL}/weekly-chart`);
            console.log("Chart API Response:", chartRes.data); // 🔹 Debug chart data
            setChartData(chartRes.data);

        } catch (error) {
            console.error("Error fetching attendance data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAttendanceData(filterMonth);
    }, [filterMonth, fetchAttendanceData]);

    // ---------------- DYNAMIC FILTER OPTIONS ----------------
    const availableMonths = useMemo(() => {
        const months = new Set(['All']);
        allLogs.forEach(log => {
            if (log.date) {
                const month = getMonthNameFromDate(log.fullDate || log.date);
                if (month) months.add(month);
            }
        });
        const monthOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const sortedMonths = Array.from(months).filter(m => m !== 'All').sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
        return ['All', ...sortedMonths];
    }, [allLogs]);

    const availableWorkTypes = useMemo(() => {
        const types = new Set(['All']);
        allLogs.forEach(log => { if (log.type && log.type !== '--') types.add(log.type); });
        return Array.from(types);
    }, [allLogs]);

    const availableStatuses = useMemo(() => {
        const statuses = new Set(['All']);
        allLogs.forEach(log => { if (log.status) statuses.add(log.status); });
        return Array.from(statuses);
    }, [allLogs]);

    // ---------------- FILTER & SORT ----------------
    const filteredAndSortedLogs = useMemo(() => {
        let currentLogs = [...allLogs];
        currentLogs = currentLogs.filter(log => {
            const monthMatch = filterMonth === 'All' || getMonthNameFromDate(log.fullDate || log.date) === filterMonth;
            const typeMatch = filterWorkType === 'All' || log.type === filterWorkType;
            const statusMatch = filterStatus === 'All' || log.status === filterStatus;
            return monthMatch && typeMatch && statusMatch;
        });

        currentLogs.sort((a, b) => new Date(b.fullDate || b.date) - new Date(a.fullDate || a.date));

        console.log("Filtered & Sorted Logs:", currentLogs); // 🔹 Debug filtered logs
        return currentLogs;
    }, [allLogs, filterMonth, filterWorkType, filterStatus]);

    const handleResetFilters = () => {
        setFilterMonth(initialMonth);
        setFilterWorkType('All');
        setFilterStatus('All');
    };

    // ---------------- CLOCK ----------------
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const secondsRotation = time.getSeconds() * 6;
    const minutesRotation = time.getMinutes() * 6 + time.getSeconds() * 0.1;
    const hoursRotation = (time.getHours() % 12) * 30 + time.getMinutes() * 0.5;

    const renderClockTicks = () => [...Array(60)].map((_, i) => (
        <div key={i} className={`clock-tick ${i % 5 === 0 ? 'major' : ''}`} style={{ transform: `rotate(${i * 6}deg)` }}></div>
    ));

    const renderStatusBadge = (status) => {
        let badgeClass = 'badge-success';
        let Icon = CheckCircle2;
        if (status === 'Absent') { badgeClass = 'badge-danger'; Icon = XCircle; }
        if (status === 'Half Day') { badgeClass = 'badge-warning'; Icon = AlertCircle; }
        if (status === 'Holiday' || status === 'Leave') { badgeClass = 'badge-neutral'; Icon = Calendar; }
        return (
            <span className={`status-badge ${badgeClass}`}>
                <Icon size={12} className="badge-icon" /> {status}
            </span>
        );
    };

    return (
        <div className="attendance-page-wrapper">
            {/* LEFT SECTION */}
            <div className="att-col-left">
                <h1 className="page-title">Attendance</h1>
                <div className="vertical-stats">
                    <div className="stat-card accent-indigo">
                        <div className="stat-icon bg-indigo"><Clock size={20} /></div>
                        <div className="stat-info"><h3>{stats.avgHours}</h3><p>Avg Hours</p></div>
                    </div>
                    <div className="stat-card accent-green">
                        <div className="stat-icon bg-green"><Calendar size={20} /></div>
                        <div className="stat-info"><h3>{stats.presentDays}</h3><p>Present</p></div>
                    </div>
                    <div className="stat-card accent-orange">
                        <div className="stat-icon bg-orange"><Filter size={20} /></div>
                        <div className="stat-info"><h3>{stats.lateMarks}</h3><p>Late Marks</p></div>
                    </div>
                </div>

                <div className="clock-card-small">
                    <div className="analog-clock-small">
                        <div className="clock-face">
                            {renderClockTicks()}
                            <div className="hand hour-hand" style={{ transform: `rotate(${hoursRotation}deg)` }} />
                            <div className="hand min-hand" style={{ transform: `rotate(${minutesRotation}deg)` }} />
                            <div className="hand sec-hand" style={{ transform: `rotate(${secondsRotation}deg)` }} />
                            <div className="center-dot"></div>
                        </div>
                    </div>
                    <div className="digital-display-small">
                        <h2>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h2>
                        <span className="live-indicator">LIVE</span>
                    </div>
                </div>
            </div>

            {/* CENTER SECTION */}
            <div className="att-col-center">
                <div className="filter-panel">
                    <div className="filter-header">
                        <h4 className="filter-title"><Filter size={16} /> Filters</h4>
                        <span className="reset-link" onClick={handleResetFilters}>Reset</span>
                    </div>
                    <div className="filter-row">
                        <label>Select Month</label>
                        <div className="select-wrapper">
                            <select className="custom-select" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
                                {availableMonths.map(month => (<option key={month} value={month}>{month}</option>))}
                            </select>
                            <ChevronDown size={14} className="select-arrow" />
                        </div>
                    </div>
                    <div className="filter-row">
                        <label>Work Type</label>
                        <div className="select-wrapper">
                            <select className="custom-select" value={filterWorkType} onChange={(e) => setFilterWorkType(e.target.value)}>
                                {availableWorkTypes.map(type => (<option key={type} value={type}>{type}</option>))}
                            </select>
                            <ChevronDown size={14} className="select-arrow" />
                        </div>
                    </div>
                    <div className="filter-row">
                        <label>Status</label>
                        <div className="select-wrapper">
                            <select className="custom-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                {availableStatuses.map(status => (<option key={status} value={status}>{status}</option>))}
                            </select>
                            <ChevronDown size={14} className="select-arrow" />
                        </div>
                    </div>
                    <button className="search-btn"><Search size={16} /> Apply Filters</button>
                </div>

                <div className="center-widgets">
                    <div className="widget-card shift-widget">
                        <div className="widget-header">
                            <div className="icon-box-sm bg-indigo"><Briefcase size={14} /></div>
                            <span>Current Shift</span>
                        </div>
                        <div className="shift-body">
                            <div className="shift-time">10:00 AM - 07:00 PM</div>
                            <div className="shift-name">General Shift A</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT SECTION */}
            <div className="att-col-right">
                <div className="table-header">
                    <h3>History Log ({filteredAndSortedLogs.length} Records)</h3>
                    <button className="export-icon"><Download size={16} /></button>
                </div>
                <div className="scrollable-table">
                    {loading ? <p style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>Loading history...</p> :
                        <table className="gui-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Type</th>
                                    <th>In Time</th>
                                    <th>Out Time</th>
                                    <th>Hrs</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAndSortedLogs.length > 0 ? filteredAndSortedLogs.map(log => (
                                    <tr key={log.id}>
                                        <td>
                                            <div className="gui-date">
                                                <span className="d-date">{new Date(log.date).toLocaleDateString('en-GB')}</span>
                                                <span className="d-day">{log.day}</span>
                                            </div>
                                        </td>
                                        <td>{renderStatusBadge(log.status)}</td>
                                        <td>
                                            <span className={`type-text ${log.type === 'WFO' ? 'text-blue' : log.type === 'WFH' ? 'text-purple' : ''}`}>
                                                {log.type}
                                            </span>
                                        </td>
                                        <td>{log.inTime ? new Date(log.inTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}</td>
                                        <td>{log.outTime ? new Date(log.outTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}</td>
                                        <td className="bold">{log.duration || '--'}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#6B7280' }}>
                                            No attendance logs found for current filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>}
                </div>
            </div>
        </div>
    );
}

export default EmployeeAttendance;
