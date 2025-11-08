import React, { useState, useEffect } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // เพิ่ม Admin user ถ้ายังไม่มี
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (!users.find(u => u.username === "Admin")) {
      users.push({
        username: "Admin",
        password: "123456",
        firstName: "Admin",
        lastName: "System",
        email: "admin@example.com",
        role: "HR"
      });
      localStorage.setItem("users", JSON.stringify(users));
    }
    
    // เพิ่ม CHRO user ถ้ายังไม่มี
    if (!users.find(u => u.username === "CHRO")) {
      users.push({
        username: "CHRO",
        password: "0123",
        firstName: "CHRO",
        lastName: "User",
        email: "chro@example.com",
        role: "CHRO"
      });
      localStorage.setItem("users", JSON.stringify(users));
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    // ดึง users ทั้งหมดจาก localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    // หา user ที่ username และ password ตรงกัน
    const foundUser = users.find(
      u => u.username === username && u.password === password
    );
    if (foundUser) {
      // เก็บข้อมูล user ทั้งหมด (รวม role) ลง currentUser
      localStorage.setItem("currentUser", JSON.stringify(foundUser));
      
      // ตรวจสอบ role เพื่อ redirect ไปยังหน้าที่เหมาะสม
      if (foundUser.role === "CHRO") {
        navigate('/MainCHRO');
      } else {
        navigate('/mainhr');
      }
    } else {
      alert("Username หรือ Password ไม่ถูกต้อง");
    }
  };

  const isFormValid = username.trim() !== '' && password.trim() !== '';

  return (
    <>
      <div className="login-body-bg"></div>
      <div className="login-container">
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Login</h2>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <div className="forgot-password">
            <a href="#">Forgot Password?</a>
          </div>
          <button type="submit" className="login-page-submit-btn">เข้าสู่ระบบ</button>
        </form>
      </div>
    </>
  );
};

export default Login;