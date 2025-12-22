import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Style/Profile.css";

function EmployeeProfile() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/header/data`, { withCredentials: true });
        setUser(res.data.user);
        setFormData(res.data.user); // populate form data dynamically
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/user/update`,
        formData,
        { withCredentials: true }
      );
      setUser(res.data.user);
      setEditMode(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    }
  };

  if (!user) return <p>Loading profile...</p>;

  return (
    <div className="profile-wrapper">
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar">
            <img src={user.avatar || "/default-avatar.png"} alt="Profile" />
          </div>
          <div className="profile-name">
            <h2>{editMode ? <input name="name" value={formData.name} onChange={handleChange} /> : user.name}</h2>
            <p>{user.role}</p>
          </div>
        </div>

        <div className="profile-body">
          <div className="profile-row">
            <span>Email:</span>
            {editMode ? (
              <input type="email" name="email" value={formData.email} onChange={handleChange} />
            ) : (
              <p>{user.email}</p>
            )}
          </div>

          <div className="profile-row">
            <span>Phone:</span>
            {editMode ? (
              <input type="text" name="phone" value={formData.phone || ""} onChange={handleChange} />
            ) : (
              <p>{user.phone || "-"}</p>
            )}
          </div>

          <div className="profile-row">
            <span>Department:</span>
            {editMode ? (
              <input type="text" name="department" value={formData.department || ""} onChange={handleChange} />
            ) : (
              <p>{user.department || "-"}</p>
            )}
          </div>

          <div className="profile-row">
            <span>Joining Date:</span>
            {editMode ? (
              <input type="date" name="joiningDate" value={formData.joiningDate || ""} onChange={handleChange} />
            ) : (
              <p>{user.joiningDate || "-"}</p>
            )}
          </div>

          <div className="profile-row">
            <span>Address:</span>
            {editMode ? (
              <input type="text" name="address" value={formData.address || ""} onChange={handleChange} />
            ) : (
              <p>{user.address || "-"}</p>
            )}
          </div>

          {/* Add more fields here as your schema grows */}
        </div>

        <div className="profile-footer">
          {editMode ? (
            <>
              <button className="btn save" onClick={handleSave}>Save</button>
              <button className="btn cancel" onClick={() => setEditMode(false)}>Cancel</button>
            </>
          ) : (
            <button className="btn edit" onClick={() => setEditMode(true)}>Edit Profile</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployeeProfile;
