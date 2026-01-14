// src/assets/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        username,
        password,
      });

      if (res.data?.ok && res.data?.user) {
        const user = res.data.user;

        // ✅ เก็บข้อมูลผู้ใช้ใน localStorage
        localStorage.setItem("currentUser", JSON.stringify(user));
        localStorage.setItem("userId", String(user.id));
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
        }

        // ✅ เปลี่ยนหน้า dashboard ตาม role (ใช้ role_name จาก DB)
        const roleName = user.role_name || ""; // fallback
        switch (roleName) {
          case "HR":
            navigate("/hr/dashboard", { replace: true });
            break;
          case "CHRO":
          case "Admin": // Admin เข้าหน้าเดียวกับ CHRO
            navigate("/chro/dashboard", { replace: true });
            break;
          case "Head":
            navigate("/head/dashboard", { replace: true });
            break;
          case "Employee":
            navigate("/employee/dashboard", { replace: true });
            break;
          default:
            setError(`สิทธิ์ของผู้ใช้ไม่ถูกต้อง (${roleName})`);
        }
      } else {
        setError(res.data?.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch (err) {
      console.error("Login failed:", err);
      // ✅ แสดงข้อความจาก backend ถ้ามี
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleLogin}>
        {/* <img src={logoImage} alt="HRMS Logo" className="logo" /> */}
        <h2>เข้าสู่ระบบ HRMS</h2>

        <input
          type="text"
          placeholder="ชื่อผู้ใช้"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="รหัสผ่าน"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
