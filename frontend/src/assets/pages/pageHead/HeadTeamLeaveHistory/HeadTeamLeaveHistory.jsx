import React, { useEffect, useState } from "react";
import axios from "axios";
import HeadSidebar from "../../../Component/Head/HeadSidebar";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./HeadTeamLeaveHistory.css";

const HeadTeamLeaveHistory = () => {
  const [leaves, setLeaves] = useState([]);
  const headId = localStorage.getItem("userId");

  useEffect(() => {
    fetchLeaveHistory();
  }, []);

  const fetchLeaveHistory = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/leave-history/department/${headId}`
      );
      setLeaves(res.data);
    } catch (err) {
      console.error("❌ Error fetching leave history:", err);
    }
  };

const handleExportExcel = () => {
  const exportData = leaves.map((leave, index) => ({
    ลำดับ: index + 1,
    รหัสพนักงาน: leave.employeeId,
    ชื่อพนักงาน: leave.employeeName,
    ตำแหน่ง: leave.position,
    ประเภทการลา: leave.leaveType,
    วันที่ลา: `${new Date(leave.startDate).toLocaleDateString("th-TH")} ถึง ${new Date(
      leave.endDate
    ).toLocaleDateString("th-TH")}`,
    เหตุผล: leave.reason,
    ส่งคำขอลาเมื่อ: leave.createdAt
      ? new Date(leave.createdAt).toLocaleString("th-TH", {
          dateStyle: "short",
          timeStyle: "short",
        })
      : "—",
    สถานะ:
      leave.status === "pending"
        ? "รอดำเนินการ"
        : leave.status === "approved"
        ? "อนุมัติแล้ว"
        : "ไม่อนุมัติ",
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "LeaveHistory");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, `leave_history_${new Date().toISOString().split("T")[0]}.xlsx`);
};



  return (
    <div className="layout-container">
      <HeadSidebar />
      <main className="history-main">
        <div className="header-actions">
          <h1>📄   ประวัติการลาของพนักงานในแผนก</h1>
          <button className="export-btn" onClick={handleExportExcel}>
            ⬇️ Export Excel
          </button>
        </div>

        {leaves.length === 0 ? (
          <p>— ไม่มีประวัติการลา —</p>
        ) : (
          <table className="history-table">
  <thead>
    <tr>
      <th>ลำดับ</th>
      <th>รหัสพนักงาน</th>
      <th>ชื่อพนักงาน</th>
      <th>ตำแหน่ง</th>
      <th>ประเภทการลา</th>
      <th>วันที่ลา</th>
      <th>เหตุผล</th>
      <th>ส่งตำขอลาเมื่อวันที่</th>
      <th>สถานะ</th>
    </tr>
  </thead>
  <tbody>
    {leaves.map((leave, index) => (
      <tr key={leave.id}>
        <td>{index + 1}</td> {/* ✅ ลำดับ */}
        <td>{leave.employeeId}</td> {/* ✅ รหัสพนักงาน */}
        <td>{leave.employeeName}</td>
        <td>{leave.position}</td>
        <td>{leave.leaveType}</td>
        <td>
          {new Date(leave.startDate).toLocaleDateString("th-TH")} ถึง{" "}
          {new Date(leave.endDate).toLocaleDateString("th-TH")}
        </td>
        <td>{leave.reason}</td>
        <td>{leave.updatedAt ? new Date(leave.updatedAt).toLocaleDateString("th-TH") : "—"}</td>
        <td className={`status ${leave.status}`}>
          {leave.status === "pending"
            ? "รอดำเนินการ"
            : leave.status === "approved"
            ? "อนุมัติแล้ว"
            : "ไม่อนุมัติ"}
        </td>
      </tr>
    ))}
  </tbody>
</table>

        )}
      </main>
    </div>
  );
};

export default HeadTeamLeaveHistory;
