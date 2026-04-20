// src/assets/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../../services/api";
import logoImage from "../hrms-logo.png";
import "./LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ✅ เปลี่ยนจาก axios เป็น api และตัด /api ตัวหน้าออก
      const res = await api.post("/auth/login", {
        username,
        password,
      });

      if (res.data?.ok && res.data?.user) {
        const user = res.data.user;

        // ✅ Keep user data in localStorage
        localStorage.setItem("currentUser", JSON.stringify(user));
        localStorage.setItem("userId", String(user.id));
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
        }

        // ✅ Redirect based on role
        const roleName = user.role_name || ""; // fallback
        switch (roleName) {
          case "HR":
            navigate("/hr/dashboard", { replace: true });
            break;
          case "CHRO":
          case "Admin": // Admin goes to CHRO dashboard
            navigate("/chro/dashboard", { replace: true });
            break;
          case "Head":
            navigate("/head/dashboard", { replace: true });
            break;
          case "Employee":
            navigate("/employee/dashboard", { replace: true });
            break;
          default:
            setError(`Invalid user role (${roleName})`);
        }
      } else {
        setError(res.data?.message || "Invalid username or password");
      }
    } catch (err) {
      console.error("Login failed:", err);
      // ✅ Show error from backend if available
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Server connection error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hrms-login-page">
      <div className="hrms-login-background">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      
      <div className="hrms-login-card">
        <div className="hrms-login-header">
          <div className="hrms-logo-container">
             <img src={logoImage} alt="HRMS Logo" className="hrms-login-logo" /> 
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to HRMS</p>
        </div>

        <form className="hrms-login-form" onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="text"
              placeholder=" "
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="hrms-input"
              id="username"
            />
            <label htmlFor="username">Username</label>
          </div>

          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="hrms-input"
              id="password"
              style={{ paddingRight: "45px" }}
            />
            <label htmlFor="password">Password</label>
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && <div className="hrms-error-message">{error}</div>}

          <button type="submit" disabled={loading} className="hrms-login-btn">
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
