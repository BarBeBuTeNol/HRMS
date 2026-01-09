// src/assets/pages/pageEmployee/EMPDashboard/EmployeeDashboard.jsx
import React, { useState, useEffect } from "react";
import EmployeeSidebar from "../../../Component/Employee/EmployeeSidebar";
import "../../../../App.css";
import dayjs from "dayjs";
import axios from "axios";

const EmployeeDashboard = () => {
  const [employeeUser, setEmployeeUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ ฟังก์ชันออกจากระบบ
  const handleLogout = () => {
    localStorage.clear(); // ล้างข้อมูลที่เก็บไว้
    window.location.href = "/login"; // redirect ไปหน้า login
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!storedUser || !storedUser.id) {
      setError("ไม่พบข้อมูลผู้ใช้ในระบบ");
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/users/${storedUser.id}`
        );
        setEmployeeUser(res.data);
      } catch (err) {
        console.error(err);
        setError("ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <div>กำลังโหลดข้อมูลผู้ใช้...</div>;
  if (error) return <div>{error}</div>;
  if (!employeeUser) return <div>ไม่มีข้อมูลผู้ใช้</div>;

  // ✅ คำนวณวันลา
  const maxLeavePerYear = 15;
  const totalUsedLeave =
    maxLeavePerYear - (employeeUser.leaveLeft ?? maxLeavePerYear);
  const remainingLeave = employeeUser.leaveLeft ?? maxLeavePerYear;
  const usedLeaveThisMonth = employeeUser.leaveUsedThisMonth ?? 0;
  const currentMonthLabel = dayjs().format("MMMM YYYY");

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <div className="sidebar">
        <EmployeeSidebar />
      </div>

      {/* Content */}
      <div className="content-area">
        {/* Profile (มุมขวาบน) */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "1rem",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div className="user-info-display">
            <span style={{ fontWeight: "bold" }}>
              {employeeUser.username || "Employee"}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "0.25rem",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>

        <main className="main-content">
          <h1 className="textDashboard">แดชบอร์ดพนักงาน</h1>

          {/* การ์ดสรุปวันลา */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            <div className="card-leave-summary">
              <h2>ภาพรวมปี</h2>
              <p>สิทธิวันลาต่อปี: {maxLeavePerYear} วัน</p>
              <p>ใช้ไปแล้ว: {totalUsedLeave} วัน</p>
              <p className="text-green-600 font-bold">
                วันลาที่เหลือ: {remainingLeave} วัน
              </p>
            </div>

            <div className="card-leave-summary">
              <h2>เดือน {currentMonthLabel}</h2>
              <p>ลาทั้งหมดเดือนนี้: {usedLeaveThisMonth} ครั้ง</p>
            </div>
          </div>

          {/* ข่าวสารบริษัท */}
          <section style={{ marginTop: "2rem" }}>
            <h2>ข่าวสารบริษัท</h2>
            <p>พื้นที่สำหรับแสดงข่าวสารและลิงก์สื่อต่าง ๆ ของบริษัทในอนาคต</p>
          </section>
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
