import React, { useState } from "react";
import "../Style/Reports.css";

const HRReports = () => {
  const [dateRange, setDateRange] = useState({
    from: "2024-12-01",
    to: "2024-12-31",
  });

  const summaryCards = [
    { title: "Total Employees", value: 314, sub: "+5% this month" },
    { title: "Avg. Attendance", value: "92%", sub: "Past 30 days" },
    { title: "Total Leave Requests", value: 48, sub: "This month" },
    { title: "Attrition Rate", value: "3.1%", sub: "Last 12 months" },
  ];

  const departmentData = [
    { name: "Sales", value: 78 },
    { name: "Engineering", value: 120 },
    { name: "HR", value: 18 },
    { name: "Marketing", value: 40 },
    { name: "Operations", value: 58 },
  ];

  const recentReports = [
    { name: "Monthly Attendance Summary", type: "Attendance", period: "Dec 2024", generatedOn: "2024-12-30" },
    { name: "Leave Utilization Report", type: "Leave", period: "Q4 2024", generatedOn: "2024-12-28" },
    { name: "Headcount & Attrition", type: "HR Analytics", period: "2024", generatedOn: "2024-12-26" },
  ];

  return (
    <div className="reports-page">
      
      {/* 1. TOP SUMMARY SECTION */}
      <div className="reports-summary-row">
        {summaryCards.map((card, idx) => (
          <div className="report-card" key={idx}>
            <h3>{card.title}</h3>
            <h1>{card.value}</h1>
            <p>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* 2. MAIN SPLIT LAYOUT */}
      <div className="reports-main-layout">
        
        {/* LEFT PANE (Filters + Leave Breakdown) */}
        <div className="reports-left-pane">
          <div className="filter-section-card">
            <h3>Report Filters</h3>
            <div className="filter-group">
              <label>Date Range</label>
              <div className="date-inputs">
                <input type="date" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} />
                <input type="date" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} />
              </div>
            </div>
            <div className="filter-group">
              <label>Department</label>
              <select>
                <option>All Departments</option>
                <option>Sales</option>
                <option>Engineering</option>
                <option>HR</option>
              </select>
            </div>
            <button className="export-btn-full">⬇ Export CSV Report</button>
          </div>

          <div className="card leave-chart-card side-card">
            <div className="card-header">
              <h3>Leave Breakdown</h3>
            </div>
            <div className="leave-chart-body vertical-layout">
              <div className="donut-wrapper">
                <div className="donut">
                  <div className="donut-center">
                    <h2>48</h2>
                    <p>Total</p>
                  </div>
                </div>
              </div>
              <div className="leave-legend">
                <div><span className="dot sick"></span> Sick (35%)</div>
                <div><span className="dot casual"></span> Casual (30%)</div>
                <div><span className="dot emergency"></span> Emergency (20%)</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANE (Headcount Chart + Table below it) */}
        <div className="reports-right-pane">
          
          {/* Headcount Chart */}
          <div className="card dept-card">
            <div className="card-header">
              <h3>Headcount by Department</h3>
              <span>Current Distribution</span>
            </div>
            <div className="dept-bars">
              {departmentData.map((dept, i) => (
                <div className="dept-bar-row" key={i}>
                  <span className="dept-name">{dept.name}</span>
                  <div className="dept-bar-wrapper">
                    <div className="dept-bar-fill" style={{ width: `${(dept.value / 120) * 100}%` }}></div>
                  </div>
                  <span className="dept-value">{dept.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recently Generated Table (MOVED HERE) */}
          <div className="card reports-table-card">
            <div className="card-header">
              <h3>Recently Generated Reports</h3>
            </div>
            <div className="table-responsive">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Report Name</th>
                    <th>Category</th>
                    <th>Period</th>
                    <th>Download</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReports.map((r, i) => (
                    <tr key={i}>
                      <td>{r.name}</td>
                      <td>{r.type}</td>
                      <td>{r.period}</td>
                      <td><button className="download-btn">Download</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default HRReports;