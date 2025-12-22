import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import {
  Gift, Search, PieChart
} from 'lucide-react';
import '../Style/Holidays.css';

function AdminHolidays() {
  // Get API Base URL from environment variables
  const API_BASE_URL = process.env.REACT_APP_API_URL;
  const API = `${API_BASE_URL}/api/admin/holidays`;

  /* ------------------ HOLIDAY STATES ------------------ */
  const [holidays, setHolidays] = useState([]);
  const [newHoliday, setNewHoliday] = useState({
    name: '',
    date: '',
    type: 'Mandatory'
  });
  const [isEditing, setIsEditing] = useState(null);
  const [filterType, setFilterType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  /* ------------------ TOTAL LEAVE STATES ------------------ */
  const [totalLeave, setTotalLeave] = useState(null);
  const [editTotalLeave, setEditTotalLeave] = useState(false);

  /* ------------------ FETCH DATA ------------------ */
  useEffect(() => {
    if (API_BASE_URL) {
      fetchHolidays();
      fetchTotalLeave();
    }
  }, [API_BASE_URL]);

  const fetchHolidays = async () => {
    try {
      const res = await axios.get(API, { withCredentials: true });
      setHolidays(res.data);
    } catch {
      console.error('Failed to fetch holidays');
    }
  };

  const fetchTotalLeave = async () => {
    try {
      const res = await axios.get(`${API}/total-leave`, { withCredentials: true });
      setTotalLeave(res.data);
    } catch {
      console.error('Failed to fetch total leave');
    }
  };

  /* ------------------ HOLIDAY CRUD ------------------ */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewHoliday(prev => ({ ...prev, [name]: value }));
  };

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(API, newHoliday, { withCredentials: true });
      setHolidays([...holidays, res.data]);
      setNewHoliday({ name: '', date: '', type: 'Mandatory' });
    } catch {
      alert('Failed to add holiday');
    }
  };

  const handleEditStart = (holiday) => {
    setIsEditing(holiday._id);
    setNewHoliday({
      name: holiday.name,
      date: holiday.date.substring(0, 10),
      type: holiday.type
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${API}/${isEditing}`, newHoliday, { withCredentials: true });
      setHolidays(holidays.map(h => h._id === isEditing ? res.data : h));
      setIsEditing(null);
      setNewHoliday({ name: '', date: '', type: 'Mandatory' });
    } catch {
      alert('Failed to update holiday');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) return;
    try {
      await axios.delete(`${API}/${id}`, { withCredentials: true });
      setHolidays(holidays.filter(h => h._id !== id));
    } catch {
      alert('Failed to delete holiday');
    }
  };

  /* ------------------ TOTAL LEAVE HANDLERS ------------------ */
  const handleTotalLeaveChange = (e) => {
    const { name, value } = e.target;
    setTotalLeave(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleSaveTotalLeave = async () => {
    try {
      await axios.put(`${API}/total-leave`, totalLeave, { withCredentials: true });
      setEditTotalLeave(false);
    } catch {
      alert('Failed to update leave policy');
    }
  };

  /* ------------------ HELPERS ------------------ */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredHolidays = useMemo(() => {
    return holidays
      .filter(h => filterType === 'All' || h.type === filterType)
      .filter(h => h.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [holidays, filterType, searchTerm]);

  return (
    <div className="admin-holidays">
      <header className="admin-header">
        <h1>
          <Gift size={26} />
          Company Time-Off Configuration
        </h1>
        <p>Manage holidays and leave entitlement policies</p>
      </header>

      <div className="admin-grid">
        {/* LEFT PANEL */}
        <aside className="card">
          <h3 className="card-title">Filters</h3>
          <div className="search-box">
            <Search size={16} />
            <input
              placeholder="Search holiday..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="input"
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Mandatory">Mandatory</option>
            <option value="Optional">Optional</option>
          </select>

          <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid var(--border)' }} />

          <h3 className="card-title">
            {isEditing ? 'Edit Holiday' : 'Add Holiday'}
          </h3>

          <form onSubmit={isEditing ? handleEditSubmit : handleAddHoliday}>
            <input
              className="input"
              name="name"
              value={newHoliday.name}
              onChange={handleInputChange}
              placeholder="Holiday Name"
              required
            />
            <input
              className="input"
              type="date"
              name="date"
              value={newHoliday.date}
              onChange={handleInputChange}
              required
            />
            <select
              className="input"
              name="type"
              value={newHoliday.type}
              onChange={handleInputChange}
            >
              <option value="Mandatory">Mandatory</option>
              <option value="Optional">Optional</option>
            </select>
            <button className="btn primary" style={{ width: '100%', marginBottom: '0.5rem' }}>
              {isEditing ? 'Save Changes' : 'Add Holiday'}
            </button>
            {isEditing && (
              <button
                type="button"
                className="btn ghost"
                style={{ width: '100%' }}
                onClick={() => {
                  setIsEditing(null);
                  setNewHoliday({ name: '', date: '', type: 'Mandatory' });
                }}
              >
                Cancel
              </button>
            )}
          </form>
        </aside>

        {/* CENTER TABLE */}
        <main className="card table-card">
          <h3 className="card-title">Holiday Calendar</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Date</th>
                <th>Type</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHolidays.length ? filteredHolidays.map(h => (
                <tr key={h._id}>
                  <td>{h.name}</td>
                  <td>{formatDate(h.date)}</td>
                  <td>
                    <span className={`badge ${h.type.toLowerCase()}`}>
                      {h.type}
                    </span>
                  </td>
                  <td>
                    <div className="actions" style={{ justifyContent: 'flex-end' }}>
                      <button className="btn-edit" onClick={() => handleEditStart(h)}>
                        Edit
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(h._id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="empty">No holidays found</td>
                </tr>
              )}
            </tbody>
          </table>
        </main>

        {/* RIGHT POLICY */}
        <aside className="card">
          <h3 className="card-title">
            <PieChart size={18} /> Leave Policy
          </h3>
          {totalLeave ? (
            <div className="policy-grid">
              {['paidLeave', 'sickLeave', 'casualLeave'].map(field => (
                <div className="policy-item" key={field}>
                  <span style={{ textTransform: 'capitalize' }}>
                    {field.replace(/([A-Z])/g, ' $1')}
                  </span>
                  {editTotalLeave ? (
                    <input
                      style={{ width: '60px', marginBottom: 0 }}
                      type="number"
                      name={field}
                      value={totalLeave[field]}
                      onChange={handleTotalLeaveChange}
                    />
                  ) : (
                    <strong>{totalLeave[field]} Days</strong>
                  )}
                </div>
              ))}
              <button
                className="btn primary"
                style={{ marginTop: '1rem' }}
                onClick={editTotalLeave ? handleSaveTotalLeave : () => setEditTotalLeave(true)}
              >
                {editTotalLeave ? 'Save Policy' : 'Edit Policy'}
              </button>
            </div>
          ) : (
            <p className="loading">Loading policy...</p>
          )}
        </aside>
      </div>
    </div>
  );
}

export default AdminHolidays;