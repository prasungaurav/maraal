import React, { useState } from "react";
import "./Login.css";
import { Mail, Lock, CheckCircle, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./App";

axios.defaults.withCredentials = true;

const Login = () => {
  const navigate = useNavigate();
  const { setIsLoggedIn, setUserRole } = useAuth();

  // Define API Base URL from environment variables
  const API_BASE_URL = process.env.REACT_APP_API_URL;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Updated the URL to use the dynamic API_BASE_URL
      const res = await axios.post(
        `${API_BASE_URL}/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      if (res.data.success) {
        setSuccess(true);
        setLoading(false);
        setIsLoggedIn(true);
        setUserRole(res.data.user.role);

        const userRole = res.data.user.role;
        setTimeout(() => {
          if (userRole === "Admin") navigate("/admin", { replace: true });
          else if (userRole === "HR") navigate("/hr", { replace: true });
          else navigate("/", { replace: true });
        }, 200);
      }
    } catch (err) {
      setLoading(false);
      setSuccess(false);
      setError(err.response?.data?.message || "Login failed. Check your connection.");
      console.error("Login error:", err);
    }
  };

  return (
    <div className="maraal-login-wrapper">
      <div className="morph-blob blob1"></div>
      <div className="morph-blob blob2"></div>
      <div className="stars"></div>
      <div className="holo-ring"></div>

      <div className="login-glass-card">
        <img src="logo.png" alt="Maraal Aerospace" className="maraal-logo" />
        <h2 className="erp-title">MARAAL PORTAL</h2>
        <p className="erp-subtitle">Secure access to your dashboard</p>

        {error && <p className="login-error">{error}</p>}

        <form onSubmit={handleLogin} className="login-form-modern">
          <div className="input-box">
            <Mail size={18} className="input-icon" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-box password-box">
            <Lock size={18} className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="password-toggle-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          <button
            className={`login-btn-modern ${loading ? "loading" : ""} ${
              success ? "success" : ""
            }`}
            type="submit"
            disabled={loading || success}
          >
            {loading ? (
              <div className="spinner"></div>
            ) : success ? (
              <CheckCircle size={22} />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="footer-note">© 2025 Maraal Aerospace</p>
      </div>
    </div>
  );
};

export default Login;