import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { User, Download, Eye, Calendar, Mail, X, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import '../Style/Export.css';

const AdminEmployeeExportSummary = () => {
  const printRef = useRef(null);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPrintButtons, setShowPrintButtons] = useState(false);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  // Get the base URL from .env file
  const API_BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchExportData();
  }, [month]);

  const fetchExportData = async () => {
    try {
      // Updated URL to use API_BASE_URL from env
      const res = await axios.get(
        `${API_BASE_URL}/api/admin/export/employee-summary?month=${month}`,
        { withCredentials: true }
      );
      setEmployees(res.data);
    } catch (err) {
      console.error('Fetch failed', err);
    }
  };

  const handlePrintTrigger = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Attendance_Report_${selectedEmployee?.name}_${month}`,
  });

  const getDaysToDisplay = (monthString) => {
    const [year, monthNum] = monthString.split('-').map(Number);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const date = new Date(year, monthNum - 1, 1);
    const days = [];

    while (date.getMonth() === monthNum - 1) {
      const currentLoopDate = new Date(date);
      currentLoopDate.setHours(0, 0, 0, 0);
      if (currentLoopDate <= today) {
        days.push(currentLoopDate);
      }
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const toLocalDateString = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isWeekOff = (date) => {
    const day = date.getDay();
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const weekNumber = Math.floor((date.getDate() + firstDayOfMonth - 1) / 7) + 1;

    if (weekNumber % 2 === 1) {
      return day === 0 || day === 6;
    } else {
      return day === 0;
    }
  };

  const calculateTotals = (attendanceDetails) => {
    const relevantDays = getDaysToDisplay(month);
    let totals = { present: 0, absent: 0, leave: 0, holiday: 0, late: 0 };

    relevantDays.forEach((date) => {
      const dateKey = toLocalDateString(date);
      const dayRecords = attendanceDetails.filter(d => toLocalDateString(d.date) === dateKey);

      const holidayRec = dayRecords.find(r => r.status?.toLowerCase() === 'holiday');
      const leaveRec = dayRecords.find(r => r.status?.toLowerCase() === 'leave');
      const presentRec = dayRecords.find(r => r.status?.toLowerCase() === 'present');

      if (holidayRec || isWeekOff(date)) {
        totals.holiday++;
      } else if (presentRec) {
        totals.present++;
        if (presentRec.late) totals.late++;
      } else if (leaveRec) {
        totals.leave++;
      } else {
        totals.absent++;
      }
    });

    return totals;
  };

  const formatTime = (time) => {
    if (!time) return '-';
    return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div className="employee-export-page">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .modal-overlay { background: none !important; position: static !important; }
          .modal-content { box-shadow: none !important; border: none !important; margin: 0 !important; width: 100% !important; }
          .print-area { padding: 0 !important; }
        }
      `}</style>

      <header className="export-header">
        <h1>Employee Attendance Export</h1>
        <div className="month-picker">
          <Calendar size={16} />
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>
      </header>

      <div className="employee-grid">
        {employees.map((emp) => {
          const totals = calculateTotals(emp.attendanceDetails);
          return (
            <div className="employee-card" key={emp.id}>
              <div className="employee-top">
                <div className="avatar"><User size={22} /></div>
                <div>
                  <h4>{emp.name}</h4>
                  <p>{emp.role} | <Mail size={12} /> {emp.email}</p>
                </div>
              </div>

              <div className="employee-stats holiday-stats">
                <div><strong>{totals.present}</strong><span>Present</span></div>
                <div><strong>{totals.holiday}</strong><span>Holidays</span></div>
                <div><strong>{totals.leave}</strong><span>Leaves</span></div>
                <div><strong>{totals.absent}</strong><span>Absent</span></div>
              </div>

              <div className="employee-actions">
                <button className="btn ghost" onClick={() => { setSelectedEmployee(emp); setShowModal(true); setShowPrintButtons(false); }}>
                  <Eye size={16} /> View
                </button>
                <button className="btn primary" onClick={() => { setSelectedEmployee(emp); setShowModal(true); setShowPrintButtons(true); }}>
                  <Download size={16} /> PDF
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && selectedEmployee && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close no-print" onClick={() => setShowModal(false)}><X size={18} /></button>

            <div ref={printRef} className="print-area" style={{ padding: '30px', color: '#333', backgroundColor: '#fff' }}>
              <div className="print-header-info" style={{ marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                <h2 style={{ margin: '0 0 5px 0' }}>Attendance Report: {selectedEmployee.name}</h2>
                <p style={{ margin: '2px 0' }}><strong>Role:</strong> {selectedEmployee.role} | <strong>Email:</strong> {selectedEmployee.email}</p>
                <p style={{ margin: '2px 0' }}><strong>Reporting Month:</strong> {month}</p>
              </div>

              {(() => {
                const totals = calculateTotals(selectedEmployee.attendanceDetails);
                return (
                  <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: '#666' }}>PRESENT</div>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>{totals.present}</div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center', borderLeft: '1px solid #ddd' }}>
                      <div style={{ fontSize: '12px', color: '#666' }}>HOLIDAYS</div>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#17a2b8' }}>{totals.holiday}</div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center', borderLeft: '1px solid #ddd' }}>
                      <div style={{ fontSize: '12px', color: '#666' }}>LEAVES</div>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffc107' }}>{totals.leave}</div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center', borderLeft: '1px solid #ddd' }}>
                      <div style={{ fontSize: '12px', color: '#666' }}>ABSENT</div>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#d9534f' }}>{totals.absent}</div>
                    </div>
                  </div>
                );
              })()}

              <table className="print-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f4f4f4', textAlign: 'left' }}>
                    <th style={{ border: '1px solid #ddd', padding: '10px' }}>Date</th>
                    <th style={{ border: '1px solid #ddd', padding: '10px' }}>Status</th>
                    <th style={{ border: '1px solid #ddd', padding: '10px' }}>In</th>
                    <th style={{ border: '1px solid #ddd', padding: '10px' }}>Out</th>
                    <th style={{ border: '1px solid #ddd', padding: '10px' }}>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {getDaysToDisplay(month).map((dateObj, idx) => {
                    const dateKey = toLocalDateString(dateObj);
                    const dayRecords = selectedEmployee.attendanceDetails.filter(d => toLocalDateString(d.date) === dateKey);

                    const holidayRec = dayRecords.find(r => r.status?.toLowerCase() === 'holiday');
                    const leaveRec = dayRecords.find(r => r.status?.toLowerCase() === 'leave');
                    const presentRec = dayRecords.find(r => r.status?.toLowerCase() === 'present');

                    let status = "Absent";
                    let inTime = "--";
                    let outTime = "--";
                    let note = "-";
                    let statusColor = "#d9534f";

                    if (holidayRec || isWeekOff(dateObj)) {
                      status = "Holiday";
                      statusColor = "#17a2b8";
                      note = holidayRec?.name || "Week Off";
                    } else if (presentRec) {
                      status = 'Present';
                      statusColor = "#28a745";
                      inTime = formatTime(presentRec.inTime);
                      outTime = formatTime(presentRec.outTime);
                      note = presentRec.late ? 'Late' : '-';
                    } else if (leaveRec) {
                      status = 'Leave';
                      statusColor = "#ffc107";
                      note = leaveRec.leaveType || 'Approved';
                    }

                    return (
                      <tr key={idx}>
                        <td style={{ border: '1px solid #ddd', padding: '10px' }}>{dateObj.toLocaleDateString('en-GB')}</td>
                        <td style={{ border: '1px solid #ddd', padding: '10px', fontWeight: 'bold', color: statusColor }}>{status}</td>
                        <td style={{ border: '1px solid #ddd', padding: '10px' }}>{inTime}</td>
                        <td style={{ border: '1px solid #ddd', padding: '10px' }}>{outTime}</td>
                        <td style={{ border: '1px solid #ddd', padding: '10px' }}>{note}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {showPrintButtons && (
              <div className="modal-footer no-print" style={{ padding: '20px', display: 'flex', gap: '10px', borderTop: '1px solid #eee' }}>
                <button className="btn primary" onClick={() => handlePrintTrigger()}>
                  <Printer size={16} /> Print / Save PDF
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmployeeExportSummary;