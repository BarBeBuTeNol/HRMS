// src/assets/pages/pageEmployee/LeaveHistory/LeaveHistoryPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import EmployeeSidebar from "../../../Component/Employee/EmployeeSidebar";
import "./LeaveHistoryPage.css";

const LeaveHistoryPage = () => {
  const navigate = useNavigate();
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [loading, setLoading] = useState(true);

  // สมมุติว่า user_id เก็บไว้ใน localStorage หลัง login
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchLeaveHistory = async () => {
      try {
        const res = await api.get(`/leave-requests/${userId}`);
        setLeaveHistory(res.data);
      } catch (err) {
        console.error("Error fetching leave history:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchLeaveHistory();
    }
  }, [userId]);

  if (loading) return <div className="loading">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="leave-history-container">
      <EmployeeSidebar />

      <main className="leave-history-main">
        <button
          className="back-button"
          onClick={() => navigate("/employee/dashboard")}
        >
          ⬅ กลับไปหน้าหลัก
        </button>

        <h1>ประวัติการลาของคุณ</h1>

        {leaveHistory.length === 0 ? (
          <p>ยังไม่มีประวัติการลา</p>
        ) : (
          <ul className="leave-list">
            {leaveHistory.map((leave) => (
              <li
                key={leave.id}
                className={`leave-item ${selectedLeaveId === leave.id ? "active" : ""}`}
                onClick={() =>
                  setSelectedLeaveId((prev) =>
                    prev === leave.id ? null : leave.id,
                  )
                }
              >
                <strong>{leave.leave_type}</strong> | {leave.start_date} ถึง{" "}
                {leave.end_date} | สถานะ: {leave.status}
                {selectedLeaveId === leave.id && (
                  <div className="leave-details">
                    <p>
                      <strong>ประเภทการลา:</strong> {leave.leave_type}
                    </p>
                    <p>
                      <strong>วันที่เริ่ม:</strong> {leave.start_date}
                    </p>
                    <p>
                      <strong>วันที่สิ้นสุด:</strong> {leave.end_date}
                    </p>
                    <p>
                      <strong>สถานะ:</strong> {leave.status}
                    </p>
                    <p>
                      <strong>เหตุผล:</strong> {leave.reason}
                    </p>
                    <p>
                      <strong>วันที่ส่งคำขอ:</strong>{" "}
                      {new Date(leave.created_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default LeaveHistoryPage;
