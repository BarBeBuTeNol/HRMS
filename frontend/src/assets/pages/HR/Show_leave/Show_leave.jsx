import React, { useEffect, useState } from "react";
import Sidebar_HR from "../../../Component/HR/Sidebar_HR";
import "./Show_leave.css";

const statusText = {
  pending: "รออนุมัติ",
  approved: "อนุมัติแล้ว",
  rejected: "ไม่อนุมัติ",
};

export default function ShowLeave() {
  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hrPassword, setHrPassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  // เพิ่ม state สำหรับ modal ดูข้อความ
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [modalReasonText, setModalReasonText] = useState("");

  // Function to load leave data
  const loadLeaveData = () => {
    setIsLoading(true);
    const stored = JSON.parse(localStorage.getItem("leaveRequests") || "[]");
    console.log("Loading leave data from localStorage:", stored);
    
    // Sort by request date (newest first)
    const sortedLeaves = stored.sort((a, b) => 
      new Date(b.requestDate) - new Date(a.requestDate)
    );
    console.log("Sorted leaves:", sortedLeaves);
    setLeaves(sortedLeaves);
    setIsLoading(false);
  };

  // โหลดข้อมูลการลาจาก localStorage เมื่อ component mount
  useEffect(() => {
    console.log("Show_leave component mounted");
    console.log("Initial localStorage data:", localStorage.getItem("leaveRequests"));
    loadLeaveData();
    
    // Check if we need to force refresh (from Leave_info page)
    const forceRefresh = localStorage.getItem("forceRefreshLeaveData");
    console.log("Force refresh flag:", forceRefresh);
    if (forceRefresh === "true") {
      localStorage.removeItem("forceRefreshLeaveData");
      console.log("Force refresh detected, reloading data...");
      // Small delay to ensure data is saved
      setTimeout(() => {
        loadLeaveData();
      }, 100);
    }
  }, []);

  // อัปเดต localStorage เมื่อมีการอนุมัติ/ไม่อนุมัติ
  const updateLocalStorage = (updatedLeaves) => {
    localStorage.setItem("leaveRequests", JSON.stringify(updatedLeaves));
  };

  // Listen for storage changes from other components
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "leaveRequests") {
        loadLeaveData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (for same-tab updates)
    const handleCustomStorageChange = () => {
      console.log("Custom event 'leaveRequestsUpdated' received");
      loadLeaveData();
    };
    
    window.addEventListener('leaveRequestsUpdated', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('leaveRequestsUpdated', handleCustomStorageChange);
    };
  }, []);

  // Refresh data function
  const handleRefresh = () => {
    loadLeaveData();
  };

  // Delete all data function
  const handleDeleteAll = () => {
    setShowDeleteModal(true);
    setHrPassword("");
    setDeleteError("");
  };

  const confirmDeleteAll = () => {
    if (hrPassword === "123456") {
      localStorage.removeItem("leaveRequests");
      setLeaves([]);
      setShowDeleteModal(false);
      setHrPassword("");
      setDeleteError("");
      
      // Update HR stats
      const hrStats = JSON.parse(localStorage.getItem("hrStats") || "{}");
      hrStats.totalLeaveRequests = 0;
      hrStats.pendingRequests = 0;
      hrStats.approvedRequests = 0;
      hrStats.rejectedRequests = 0;
      localStorage.setItem("hrStats", JSON.stringify(hrStats));
      
      console.log("All leave requests deleted successfully");
    } else {
      setDeleteError("รหัส HR ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setHrPassword("");
    setDeleteError("");
  };

  // Delete single request function
  const handleDeleteSingle = (requestId) => {
    if (window.confirm("คุณต้องการลบคำขอนี้หรือไม่?")) {
      const updatedLeaves = leaves.filter(leave => leave.requestId !== requestId);
      setLeaves(updatedLeaves);
      updateLocalStorage(updatedLeaves);
      
      // Update HR stats
      const hrStats = JSON.parse(localStorage.getItem("hrStats") || "{}");
      const deletedLeave = leaves.find(leave => leave.requestId === requestId);
      if (deletedLeave) {
        hrStats.totalLeaveRequests = Math.max(0, (hrStats.totalLeaveRequests || 0) - 1);
        if (deletedLeave.status === 'pending') {
          hrStats.pendingRequests = Math.max(0, (hrStats.pendingRequests || 0) - 1);
        } else if (deletedLeave.status === 'approved') {
          hrStats.approvedRequests = Math.max(0, (hrStats.approvedRequests || 0) - 1);
        } else if (deletedLeave.status === 'rejected') {
          hrStats.rejectedRequests = Math.max(0, (hrStats.rejectedRequests || 0) - 1);
        }
        localStorage.setItem("hrStats", JSON.stringify(hrStats));
      }
      
      console.log(`Leave request ${requestId} deleted successfully`);
    }
  };

  // HR ไม่สามารถอนุมัติ/ปฏิเสธได้แล้ว เพราะต้องรอ CHRO อนุมัติ
  // ลบฟังก์ชัน handleApprove และ handleReject ออก

  return (
    <div className="show-leave-flex-root">
      <Sidebar_HR />
      <div className="show-leave-container minimal">
        <div className="show-leave-header">
          <div className="show-leave-title-section">
            <div className="show-leave-title">
              🗓️ รายการคำขอการลาของพนักงาน
            </div>
            {!isLoading && (
              <div className="request-count">
                รวม {leaves.length} คำขอ
                {leaves.length > 0 && (
                  <span className="count-breakdown">
                    (รออนุมัติ: {leaves.filter(l => l.status === 'pending').length}, 
                    อนุมัติแล้ว: {leaves.filter(l => l.status === 'approved').length}, 
                    ไม่อนุมัติ: {leaves.filter(l => l.status === 'rejected').length})
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="header-actions">
            <button onClick={handleRefresh} className="refresh-btn minimal" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  กำลังโหลด...
                </>
              ) : (
                <>
                  <span className="refresh-icon">🔄</span>
                  รีเฟรช
                </>
              )}
            </button>
            {leaves.length > 0 && (
              <button onClick={handleDeleteAll} className="delete-all-btn">
                <span>🗑️</span>
                ลบทั้งหมด
              </button>
            )}
          </div>
        </div>
        
        <div className="leave-table-card">
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner large"></div>
              <p>กำลังโหลดข้อมูล...</p>
            </div>
          ) : (
            <table className="leave-table minimal">
              <thead>
                <tr>
                  <th>รหัสพนักงาน</th>
                  <th>ชื่อผู้ลา</th>
                  <th>วันที่ลา</th>
                  <th>ปีที่ลา</th>
                  <th>เหตุผลการลา</th>
                  <th>ไฟล์แนบ</th>
                  <th>วันที่ส่งคำขอ</th>
                  <th>สถานะ</th>
                  <th>การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ 
                      textAlign: "center", 
                      color: "#ffffff", 
                      fontWeight: 800, 
                      fontSize: "1.3rem", 
                      padding: "50px 0",
                      textShadow: "0 3px 6px rgba(0,0,0,0.4)",
                      background: "rgba(255,255,255,0.15)",
                      borderRadius: "16px",
                      margin: "20px",
                      border: "1px solid rgba(255,255,255,0.3)",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
                    }}>
                      📋 ไม่พบข้อมูลคำขอการลา
                    </td>
                  </tr>
                ) : (
                  leaves.map((leave, index) => (
                    <tr key={leave.requestId} className={leave.status}>
                      <td>{leave.employeeId}</td>
                      <td>{leave.employeeName}</td>
                      <td>{new Date(leave.leaveDate).toLocaleDateString('th-TH')}</td>
                      <td>{leave.leaveYear}</td>
                      <td>
                        <div className="reason-cell">
                          <button className="view-reason-btn" onClick={() => { setModalReasonText(leave.reason); setShowReasonModal(true); }}>
                            👁️ ดูเหตุผลการลา
                          </button>
                          {index === 0 && leave.status === 'pending' && (
                            <span className="new-request-badge">🆕 ใหม่</span>
                          )}
                        </div>
                      </td>
                      <td>
                        {leave.attachmentName ? (
                          <a className="attachment-info" href={leave.attachmentUrl || '#'} target="_blank" rel="noopener noreferrer">
                            📎 {leave.attachmentName}
                          </a>
                        ) : (
                          <span className="no-attachment">ไม่มีไฟล์</span>
                        )}
                      </td>
                      <td>{new Date(leave.requestDate).toLocaleDateString('th-TH')}</td>
                      <td className={`status ${leave.status}`}>{statusText[leave.status]}</td>
                      <td>
                        <div className="action-btn-group">
                          {leave.status === "pending" ? (
                            <span className="pending-status">
                              ⏳ รอ CHRO อนุมัติ
                            </span>
                          ) : leave.status === "approved" ? (
                            <span className="approved-status">
                              ✅ อนุมัติโดย CHRO
                            </span>
                          ) : leave.status === "rejected" ? (
                            <span className="rejected-status">
                              ❌ ปฏิเสธโดย CHRO
                            </span>
                          ) : (
                            <span className="action-dash">-</span>
                          )}
                          <button className="delete-btn" onClick={() => handleDeleteSingle(leave.requestId)}>
                            ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete All Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">🗑️ ลบข้อมูลทั้งหมด</h3>
            <p style={{ 
              color: '#ffffff', 
              marginBottom: '20px', 
              textAlign: 'center',
              fontWeight: '700',
              textShadow: '0 2px 4px rgba(0,0,0,0.4)',
              fontSize: '1.1rem',
              lineHeight: '1.6'
            }}>
              ⚠️ การดำเนินการนี้จะลบข้อมูลการลาทั้งหมดอย่างถาวร
            </p>
            <div className="password-input-container">
              <label htmlFor="hrPassword" className="password-label">
                🔐 รหัสยืนยันการลบข้อมูล
              </label>
              <input
                id="hrPassword"
                type="password"
                className="modal-input"
                placeholder="กรอกรหัสยืนยันเพื่อลบข้อมูลทั้งหมด"
                value={hrPassword}
                onChange={(e) => setHrPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && confirmDeleteAll()}
                autoComplete="off"
              />
              <div className="password-hint">
                ⚠️ การลบข้อมูลนี้ไม่สามารถกู้คืนได้ กรุณาตรวจสอบให้แน่ใจก่อนดำเนินการ
              </div>
            </div>
            {deleteError && (
              <p style={{ 
                color: '#ff6b6b', 
                marginBottom: '20px', 
                textAlign: 'center', 
                fontSize: '1.1rem',
                fontWeight: '800',
                textShadow: '0 2px 4px rgba(0,0,0,0.4)',
                background: 'rgba(255,107,107,0.15)',
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(255,107,107,0.4)',
                boxShadow: '0 4px 15px rgba(255,107,107,0.2)'
              }}>
                ❌ {deleteError}
              </p>
            )}
            <div className="modal-actions">
              <button className="modal-btn confirm" onClick={confirmDeleteAll}>
                ยืนยันการลบ
              </button>
              <button className="modal-btn cancel" onClick={cancelDelete}>
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reason Modal */}
      {showReasonModal && (
        <div className="modal-overlay" onClick={() => setShowReasonModal(false)}>
          <div className="modal-content reason-modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">📋 เหตุผลการลา</h3>
            <div className="reason-text">
              {modalReasonText}
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setShowReasonModal(false)}>ปิด</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
