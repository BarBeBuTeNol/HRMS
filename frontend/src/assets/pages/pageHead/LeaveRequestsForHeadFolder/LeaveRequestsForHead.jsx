import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./LeaveRequestsForHead.css";
import HeadSidebar from "../../../Component/Head/HeadSidebar";

const LeaveRequestsForHead = () => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  const headId = localStorage.getItem("userId"); // ✅ userId ของหัวหน้า

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/leave-requests/for-head/${headId}`
      );
      setRequests(res.data);
    } catch (err) {
      console.error("❌ Error fetching requests:", err);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/leave-requests/${id}/status`, {
        status: "approved",
      });
      setRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status: "approved" } : req
        )
      );
      setSelectedRequest(null);
    } catch (err) {
      console.error("❌ Approve failed:", err);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/leave-requests/${id}/status`, {
        status: "rejected",
      });
      setRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status: "rejected" } : req
        )
      );
      setSelectedRequest(null);
    } catch (err) {
      console.error("❌ Reject failed:", err);
    }
  };

  return (
    <div className="leave-request-container">
      <HeadSidebar />

      <button
        className="btn-back"
        onClick={() => navigate("/head/dashboard")}
      >
        ← กลับแดชบอร์ด
      </button>

      <h2>คำขอลาของพนักงานในแผนก</h2>

      {!selectedRequest && (
        <table className="leave-table">
          <thead>
            <tr>
              <th>ชื่อพนักงาน</th>
              <th>ประเภทการลา</th>
              <th>วันที่ลา</th>
              <th>สถานะ</th>
              <th>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td>{req.employeeName}</td>
                <td>{req.leaveType}</td>
                <td>
                  {req.startDate} - {req.endDate}
                </td>
                <td className={`status ${req.status}`}>
                  {req.status === "pending"
                    ? "รอดำเนินการ"
                    : req.status === "approved"
                    ? "อนุมัติแล้ว"
                    : "ไม่อนุมัติ"}
                </td>
                <td>
                  {req.status === "pending" && (
                    <button
                      className="btn-view"
                      onClick={() => setSelectedRequest(req)}
                    >
                      ดูรายละเอียด
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedRequest && (
        <div className="leave-detail">
          <h3>รายละเอียดคำขอลา</h3>
          <p>
            <strong>ชื่อ:</strong> {selectedRequest.employeeName}
          </p>
          <p>
            <strong>แผนก:</strong> {selectedRequest.department}
          </p>
          <p>
            <strong>ประเภทการลา:</strong> {selectedRequest.leaveType}
          </p>
          <p>
            <strong>วันที่ลา:</strong> {selectedRequest.startDate} ถึง{" "}
            {selectedRequest.endDate}
          </p>
          <p>
            <strong>เหตุผล:</strong> {selectedRequest.reason}
          </p>

          <div className="detail-buttons">
            <button
              className="btn-approve"
              onClick={() => handleApprove(selectedRequest.id)}
            >
              ✅ อนุมัติ
            </button>
            <button
              className="btn-reject"
              onClick={() => handleReject(selectedRequest.id)}
            >
              ❌ ไม่อนุมัติ
            </button>
            <button onClick={() => setSelectedRequest(null)}>🔙 กลับ</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequestsForHead;
