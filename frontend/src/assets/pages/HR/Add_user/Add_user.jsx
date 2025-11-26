import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar_HR from "../../../Component/HR/Sidebar_HR";
import "./Add_user.css";

const AddUser = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    empId: "", // เปลี่ยนจาก id เป็น empId เพื่อให้ตรงกับ MainHR.jsx
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    telephone: "",
    role: "",
  });

  // ฟังก์ชันสำหรับสร้าง empId ใหม่
  const generateEmpId = () => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.length === 0) return "001";
    // หา empId ที่มากที่สุด
    const maxId = users.reduce((max, user) => {
      const idNum = parseInt(user.empId, 10);
      return idNum > max ? idNum : max;
    }, 0);
    const nextId = (maxId + 1).toString().padStart(3, "0");
    return nextId;
  };

  // ตั้ง empId อัตโนมัติเมื่อโหลด component
  useEffect(() => {
    setForm((prev) => ({ ...prev, empId: generateEmpId() }));
  }, []);

  // ดึง username จาก localStorage หรือที่เหมาะสม
  const username = localStorage.getItem("username") || "HR";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleRoleChange = (e) => {
    setForm({ ...form, role: e.target.value });
  };

  const handleCancel = () => {
    navigate("/MainHR");
  };

  const handleDone = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    users.push(form); // form จะมี empId
    localStorage.setItem("users", JSON.stringify(users));
    // บังคับ reload เพื่อให้ MainHR อัปเดตข้อมูลทันที
    window.location.href = "/MainHR";
    // หรือใช้ navigate('/MainHR'); ถ้า router ตรงนี้รองรับ
    // navigate("/MainHR");
  };

  return (
    <div className="add-user-page" style={{ display: "flex" }}>
      <Sidebar_HR username={username} />
      <div className="add-user-container">
        <h2>New User</h2>
        <form onSubmit={handleDone}>
          <div className="form-group">
            <label>Employee ID</label>
            <input
              type="text"
              name="empId" // เปลี่ยนจาก name="id" เป็น name="empId"
              value={form.empId}
              readOnly // ป้องกันการแก้ไข
              required
            />
          </div>
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Telephone</label>
            <input
              type="tel"
              name="telephone"
              value={form.telephone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <div className="role-options">
              <label>
                <input
                  type="radio"
                  name="role"
                  value="Admin"
                  checked={form.role === "Admin"}
                  onChange={handleRoleChange}
                  required
                />
                Admin
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="HR"
                  checked={form.role === "HR"}
                  onChange={handleRoleChange}
                  required
                />
                HR
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="Manager"
                  checked={form.role === "Manager"}
                  onChange={handleRoleChange}
                />
                Manager
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="Employee"
                  checked={form.role === "Employee"}
                  onChange={handleRoleChange}
                />
                Employee
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="CHRO"
                  checked={form.role === "CHRO"}
                  onChange={handleRoleChange}
                />
                CHRO
              </label>
            </div>
          </div>
          <div className="button-group">
            <button type="button" onClick={handleCancel} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="done-btn">
              Done
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;