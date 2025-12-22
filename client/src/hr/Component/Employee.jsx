import React, { useEffect, useState } from "react";
import "../Style/Employee.css";

const HREmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    position: "",
  });

  // ----------------------------
  // FETCH EMPLOYEES
  // ----------------------------
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/hr/employee`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => setEmployees(data.employees || []))
      .catch(err => console.error(err));
  }, []);

  // ----------------------------
  // ADD EMPLOYEE
  // ----------------------------
  const addEmployee = async () => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/hr/employee`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (res.ok) {
      setEmployees([...employees, data.employee]);
      setShowAddModal(false);
      setForm({ name: "", email: "", department: "", position: "" });
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="employee-page">

      {/* HEADER */}
      <div className="employee-header">
        <h1 className="emp-title">Employees</h1>
        <button className="add-btn" onClick={() => setShowAddModal(true)}>
          + Add Employee
        </button>
      </div>

      {/* GRID */}
      <div className="employee-grid">
        {employees.map((emp, i) => (
          <div className="emp-card smooth-card" key={i}>
            <img
              src="https://cdn-icons-png.flaticon.com/512/2922/2922510.png"
              className="emp-img"
              alt=""
            />

            <h3>{emp.name}</h3>
            <p className="emp-position">{emp.position || "Employee"}</p>
            <span className="emp-dept">{emp.department || "N/A"}</span>

            <button
              className="view-btn"
              onClick={() => {
                setSelectedEmployee(emp);
                setShowProfileModal(true);
              }}
            >
              View Profile
            </button>
          </div>
        ))}
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Add Employee</h3>

            <input
              className="modal-input"
              placeholder="Name"
              onChange={e => setForm({ ...form, name: e.target.value })}
            />

            <input
              className="modal-input"
              placeholder="Email"
              onChange={e => setForm({ ...form, email: e.target.value })}
            />

            <input
              className="modal-input"
              placeholder="Position"
              onChange={e => setForm({ ...form, position: e.target.value })}
            />

            <select
              className="modal-input"
              onChange={e => setForm({ ...form, department: e.target.value })}
            >
              <option>Select Department</option>
              <option>Sales</option>
              <option>HR</option>
              <option>IT</option>
            </select>

            <button className="modal-save" onClick={addEmployee}>
              Save
            </button>
          </div>
        </div>
      )}

      {/* PROFILE MODAL */}
      {showProfileModal && selectedEmployee && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>{selectedEmployee.name}</h3>
            <p>{selectedEmployee.position}</p>
            <p>{selectedEmployee.department}</p>

            <button
              className="modal-save"
              onClick={() => setShowProfileModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HREmployee;
