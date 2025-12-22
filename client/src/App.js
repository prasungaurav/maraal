import React, { createContext, useContext, useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./App.css";
import Login from "./Login";

/* EMPLOYEE */
import EmployeeHeader from "./employee/Compoent/Header";
import EmployeeDashboard from "./employee/Compoent/Dashboard";
import EmployeeAttendance from "./employee/Compoent/Attendance";
import EmployeeLeave from "./employee/Compoent/Leave";
import EmployeeTerms from "./employee/Compoent/Term";
import EmployeeProfile from "./employee/Compoent/Profile";
import EmployeeSettings from "./employee/Compoent/Settings";
import EmployeeHelp from "./employee/Compoent/Help";

/* ADMIN */
import AdminHeader from "./admin/Component/Header";
import AdminDashboard from "./admin/Component/Dashboard";
import AdminManageUsers from "./admin/Component/ManageUsers";
import AdminApprovals from "./admin/Component/Approval";
import AdminHolidays from "./admin/Component/Holidays";
import AdminEmployeeExportSummary from "./admin/Component/Export";

/* HR */
import HRNavbar from "./hr/Component/Navbar";
import HREmployee from "./hr/Component/Employee";
import HRLeaveManagement from "./hr/Component/LeaveManagement";
import HRReports from "./hr/Component/Reports";
import HRSettings from "./hr/Component/Settings";
import HRAttendance from "./hr/Component/Attendace";

/* AUTH */
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

/* PROTECTED ROUTE */
const ProtectedRoute = ({ children, role }) => {
  const { isLoggedIn, userRole, loading } = useAuth();

  if (loading) return <div>Checking authentication...</div>;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (role && userRole !== role) return <Navigate to="/login" replace />;

  return children;
};

function App() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

// Get API Base URL from environment variables
  const API_BASE_URL = process.env.REACT_APP_API_URL;

  // Check session on page load
  useEffect(() => {
    const checkSession = async () => {
      // Ensure we don't attempt a fetch if the URL isn't loaded yet
      if (!API_BASE_URL) return;

      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          credentials: "include",
        });

        if (!res.ok) {
          setIsLoggedIn(false);
          setUserRole(null);
          return;
        }

        const data = await res.json();
        console.log(data);
        setIsLoggedIn(true);
        setUserRole(data.user.role);
      } catch (error) {
        console.error("Session check failed:", error);
        setIsLoggedIn(false);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [API_BASE_URL]); // Add API_BASE_URL as a dependency

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      // Always clear local state even if the network request fails
      setIsLoggedIn(false);
      setUserRole(null);
    }
  };

  const renderHeader = () => {
    if (!isLoggedIn || location.pathname === "/login") return null;
    if (userRole === "Admin") return <AdminHeader />;
    if (userRole === "HR") return <HRNavbar />;
    return <EmployeeHeader />;
  };
  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, userRole, setUserRole, loading, logout }}>
      <div className="App">
        {renderHeader()}

        <Routes>
          <Route path="/login" element={<Login />} />

          {/* EMPLOYEE */}
          <Route path="/" element={<ProtectedRoute role="Employee"><EmployeeDashboard /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute role="Employee"><EmployeeAttendance /></ProtectedRoute>} />
          <Route path="/leaves" element={<ProtectedRoute role="Employee"><EmployeeLeave /></ProtectedRoute>} />
          <Route path="/terms" element={<ProtectedRoute role="Employee"><EmployeeTerms /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute role="Employee"><EmployeeProfile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute role="Employee"><EmployeeSettings /></ProtectedRoute>} />
          <Route path="/help" element={<ProtectedRoute role="Employee"><EmployeeHelp /></ProtectedRoute>} />

          {/* HR */}
          <Route path="/hr" element={<ProtectedRoute role="HR"><HRAttendance /></ProtectedRoute>} />
          <Route path="/hr/employees" element={<ProtectedRoute role="HR"><HREmployee /></ProtectedRoute>} />
          <Route path="/hr/leaves" element={<ProtectedRoute role="HR"><HRLeaveManagement /></ProtectedRoute>} />
          <Route path="/hr/reports" element={<ProtectedRoute role="HR"><HRReports /></ProtectedRoute>} />
          <Route path="/hr/settings" element={<ProtectedRoute role="HR"><HRSettings /></ProtectedRoute>} />

          {/* ADMIN */}
          <Route path="/admin" element={<ProtectedRoute role="Admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute role="Admin"><AdminManageUsers /></ProtectedRoute>} />
          <Route path="/admin/approvals" element={<ProtectedRoute role="Admin"><AdminApprovals /></ProtectedRoute>} />
          <Route path="/admin/holidays" element={<ProtectedRoute role="Admin"><AdminHolidays /></ProtectedRoute>} />
          <Route path="/admin/export" element={<ProtectedRoute role="Admin"><AdminEmployeeExportSummary /></ProtectedRoute>} />
        </Routes>
      </div>
    </AuthContext.Provider>
  );
}

export default App;
