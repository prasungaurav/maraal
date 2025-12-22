import React, { useEffect, useState } from "react";
import { Users, UserPlus, Filter, X, Search, Mail, Calendar, RefreshCw } from "lucide-react";
import axios from "axios";
import "../Style/ManageUsers.css";

const ROLES = ["Admin", "HR", "Employee"];

// Helper: normalize role
const normalizeRole = (r) => {
  const role = r?.toLowerCase();
  if (role === "admin") return "Admin";
  if (role === "hr") return "HR";
  return "Employee";
};

// Helper: get initials
const getInitials = (name) =>
  name ? name.split(" ").map((n) => n[0]).join("").toUpperCase() : "U";

// Helper: format date
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function AdminManageUsers() {
  // Define API Base URL from environment variables
  const API_BASE_URL = process.env.REACT_APP_API_URL;
  const API_ENDPOINT = `${API_BASE_URL}/api/admin/users`;

  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ role: "", search: "" });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "Employee",
    biometricId: "",
    password: "",
  });
  const [loading, setLoading] = useState(true);

  axios.defaults.withCredentials = true;

  // Fetch all users
  const fetchUsers = async () => {
    if (!API_BASE_URL) return;
    setLoading(true);
    try {
      const res = await axios.get(API_ENDPOINT);
      if (res.data.success) setUsers(res.data.data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [API_BASE_URL]);

  // Filtered users
  const filteredUsers = users.filter(
    (u) =>
      u &&
      (!filters.role || normalizeRole(u.role) === filters.role) &&
      (!filters.search ||
        u.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        u.email?.toLowerCase().includes(filters.search.toLowerCase()))
  );

  // Delete user
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await axios.delete(`${API_ENDPOINT}/${id}`);
      if (res.data.success) setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      alert("Error deleting user");
      console.error(err);
    }
  };

  // Add new user
  const handleAddUser = async () => {
    const { name, email, role, biometricId, password } = newUser;
    if (!name || !email || !role || !biometricId || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await axios.post(API_ENDPOINT, newUser);
      if (res.data.success) {
        setUsers([...users, res.data.data]);
        setShowAddModal(false);
        setNewUser({ name: "", email: "", role: "Employee", biometricId: "", password: "" });
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error adding user");
      console.error(err);
    }
  };

  return (
    <div className="mng-page-wrapper">
      {/* HEADER */}
      <header className="mng-main-header">
        <div className="mng-title-section">
          <h1 className="mng-page-title">Employee Directory</h1>
          <div className="mng-stats-container">
            <div className="mng-stat-tag">
              <span>Total :</span>
              <b>{users.length}</b>
            </div>
            <div className="mng-stat-tag">
              <span>Admin :</span>
              <b>{users.filter((u) => normalizeRole(u?.role) === "Admin").length}</b>
            </div>
            <div className="mng-stat-tag">
              <span>HR :</span>
              <b>{users.filter((u) => normalizeRole(u?.role) === "HR").length}</b>
            </div>
            <div className="mng-stat-tag">
              <span>Employee :</span>
              <b>{users.filter((u) => normalizeRole(u?.role) === "Employee").length}</b>
            </div>
          </div>
        </div>
        <button className="mng-btn-add-user" onClick={() => setShowAddModal(true)}>
          <UserPlus size={18} />
          <span>Add New Employee</span>
        </button>
      </header>

      {/* SEARCH & FILTER */}
      <div className="mng-toolbar">
        <div className="mng-search-input-group">
          <Search size={20} className="mng-search-icon" />
          <input
            className="mng-field-input"
            type="text"
            placeholder="Search by name, email..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <div className="mng-filter-actions">
          <div className="mng-select-custom">
            <Filter size={16} className="mng-filter-icon" />
            <select
              className="mng-dropdown"
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            >
              <option value="">All Roles</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <button className="mng-btn-refresh" onClick={() => setFilters({ role: "", search: "" })}>
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* USERS GRID */}
      {loading ? (
        <div className="mng-loading-indicator">Loading directory...</div>
      ) : (
        <div className="mng-employee-grid">
          {filteredUsers.map(
            (u) =>
              u && (
                <div key={u._id} className="mng-user-card">
                  <div className="mng-card-top">
                    <div className="mng-user-avatar">{getInitials(u.name)}</div>
                    <span className={`mng-role-badge mng-role-${normalizeRole(u.role).toLowerCase()}`}>
                      {normalizeRole(u.role)}
                    </span>
                  </div>
                  <div className="mng-card-content">
                    <h3 className="mng-user-full-name">{u.name}</h3>
                    <div className="mng-user-meta-item">
                      <Mail size={14} />
                      <span>{u.email}</span>
                    </div>
                    <div className="mng-user-meta-item">
                      <Calendar size={14} />
                      <span>Joined {formatDate(u.createdAt)}</span>
                    </div>
                  </div>
                  <div className="mng-card-footer">
                    <button
                      className="mng-action-btn mng-btn-view"
                      onClick={() => setSelectedUser(u)}
                      style={{ backgroundColor: "#4f46e5", color: "white" }}
                    >
                      View Details
                    </button>
                    <button className="mng-action-btn mng-btn-delete" onClick={() => handleDelete(u._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              )
          )}
        </div>
      )}

      {/* USER DETAILS MODAL */}
      {selectedUser && (
        <div className="mng-modal-backdrop" onClick={() => setSelectedUser(null)}>
          <div className="mng-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="mng-modal-header">
              <h3 className="mng-modal-title">User Profile</h3>
              <button className="mng-modal-close-x" onClick={() => setSelectedUser(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="mng-modal-content-body">
              <div className="mng-modal-avatar-big">{getInitials(selectedUser.name)}</div>
              <div className="mng-modal-data-grid">
                <div className="mng-data-block">
                  <label className="mng-data-label">Full Name</label>
                  <p className="mng-data-value">{selectedUser.name}</p>
                </div>
                <div className="mng-data-block">
                  <label className="mng-data-label">Email Address</label>
                  <p className="mng-data-value">{selectedUser.email}</p>
                </div>
                <div className="mng-data-block">
                  <label className="mng-data-label">Access Role</label>
                  <p className="mng-data-value mng-role-text">{normalizeRole(selectedUser.role)}</p>
                </div>
                <div className="mng-data-block">
                  <label className="mng-data-label">Biometric ID</label>
                  <p className="mng-data-value">{selectedUser.biometricId || "N/A"}</p>
                </div>
                <div className="mng-data-block">
                  <label className="mng-data-label">Temporary Password</label>
                  <p className="mng-data-value">{selectedUser.password || "N/A"}</p>
                </div>
                <div className="mng-data-block">
                  <label className="mng-data-label">Member Since</label>
                  <p className="mng-data-value">{formatDate(selectedUser.createdAt)}</p>
                </div>
              </div>
            </div>
            <div className="mng-modal-bottom-bar">
              <button className="mng-btn-modal-close" onClick={() => setSelectedUser(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW EMPLOYEE MODAL */}
      {showAddModal && (
        <div className="mng-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="mng-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="mng-modal-header">
              <h3 className="mng-modal-title">Add New Employee</h3>
              <button className="mng-modal-close-x" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="mng-modal-content-body">
              <div className="mng-add-form">
                <label>Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
                <label>Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
                <label>Role</label>
                <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <label>Biometric ID</label>
                <input
                  type="text"
                  value={newUser.biometricId}
                  onChange={(e) => setNewUser({ ...newUser, biometricId: e.target.value })}
                  placeholder="Enter Biometric ID"
                />
                <label>Temporary Password</label>
                <input
                  type="text"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Enter Temporary Password"
                />
              </div>
            </div>
            <div className="mng-modal-bottom-bar">
              <button className="mng-btn-modal-close" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="mng-btn-modal-save" onClick={handleAddUser}>
                Add Employee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}