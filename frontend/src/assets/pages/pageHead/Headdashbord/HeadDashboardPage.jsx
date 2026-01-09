// src/pages/pageHead/HeadDashboard.jsx
import React from "react";
import HeadSidebar from "../../../Component/Head/HeadSidebar";
import dayjs from "dayjs";
import "./HeadDashboardPage.css";

const HeadDashboard = () => {
  // ✅ ฟังก์ชันออกจากระบบ
  const handleLogout = () => {
    localStorage.clear(); // เคลียร์ token/user
    window.location.href = "/login"; // กลับไปหน้า login
  };

  // ✅ ข้อมูลวันลา (mock หรือจะดึงจาก backend ก็ได้)
  const headLeaveData = {
    maxLeavePerYear: 30,
    totalUsedLeave: 12,
    usedLeaveThisMonth: 2,
  };

  const { maxLeavePerYear, totalUsedLeave, usedLeaveThisMonth } = headLeaveData;
  const remainingLeave = maxLeavePerYear - totalUsedLeave;
  const currentMonthLabel = dayjs().format("MMMM YYYY");

  return (
    <div className="layout-container">
      {/* Sidebar ฝั่งซ้าย */}
      <div className="sidebar">
        <HeadSidebar />
      </div>

      {/* Content ฝั่งขวา */}
      <div className="content-area">
        {/* มุมขวาบน: โปรไฟล์ + logout */}
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
              Head ID: {localStorage.getItem("userId")}
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
          <h1 className="textDashboard">แดชบอร์ดหัวหน้าแผนก</h1>

          {/* การ์ดแสดงข้อมูลวันลา */}
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

          {/* ข่าวสาร */}
          <section style={{ marginTop: "2rem" }}>
            <h2>ข่าวสารบริษัท</h2>
            <p>พื้นที่สำหรับแสดงข่าวสารและลิงก์สื่อต่าง ๆ ของบริษัทในอนาคต</p>
          </section>
        </main>
      </div>
    </div>
  );
};

export default HeadDashboard;
