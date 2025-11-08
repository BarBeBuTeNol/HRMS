import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar_HR from "../../../Component/HR/Sidebar_HR";
import "./Leave_info.css";

const Leave_info = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    employeeId: "",
    leaveDate: new Date().toISOString().split('T')[0], // Set current date
    reason: "",
    employeeName: "",
    leaveYear: new Date().getFullYear(),
    attachment: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      attachment: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Create leave request data
    const leaveRequest = {
      ...formData,
      requestDate: new Date().toISOString(),
      status: "pending",
      requestedBy: "HR",
      approvedBy: "CHRO",
      requestId: `LR-${Date.now()}`,
      attachmentName: formData.attachment ? formData.attachment.name : null,
      attachmentSize: formData.attachment ? formData.attachment.size : null
    };
    
    // Simulate API call to save leave request
    setTimeout(() => {
      console.log("Leave request submitted:", leaveRequest);
      
      // Save to localStorage for demo purposes (in real app, this would be API call)
      const existingRequests = JSON.parse(localStorage.getItem("leaveRequests") || "[]");
      console.log("Existing requests before adding:", existingRequests);
      
      existingRequests.push(leaveRequest);
      localStorage.setItem("leaveRequests", JSON.stringify(existingRequests));
      
      // Log the saved data for debugging
      const savedData = JSON.parse(localStorage.getItem("leaveRequests") || "[]");
      console.log("All leave requests after saving:", savedData);
      console.log("Total requests count:", savedData.length);
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('leaveRequestsUpdated'));
      
      // Update HR dashboard statistics
      const hrStats = JSON.parse(localStorage.getItem("hrStats") || "{}");
      hrStats.totalLeaveRequests = (hrStats.totalLeaveRequests || 0) + 1;
      hrStats.pendingRequests = (hrStats.pendingRequests || 0) + 1;
      localStorage.setItem("hrStats", JSON.stringify(hrStats));
      
      // Create notification for CHRO
      const announcements = JSON.parse(localStorage.getItem("announcements") || "[]");
      const notification = {
        id: `NOTIF-${Date.now()}`,
        type: "leave_request",
        title: `คำขอการลาใหม่ - ${formData.employeeName}`,
        message: `มีคำขอการลาจาก HR: ${formData.employeeName} (${formData.employeeId}) วันที่ลา: ${new Date(formData.leaveDate).toLocaleDateString('th-TH')} เหตุผล: ${formData.reason}`,
        sender: "HR",
        target: "chro",
        requestId: leaveRequest.requestId,
        timestamp: new Date().toISOString(),
        views: 0,
        priority: "high",
        leaveData: {
          employeeId: formData.employeeId,
          employeeName: formData.employeeName,
          leaveDate: formData.leaveDate,
          leaveYear: formData.leaveYear,
          reason: formData.reason,
          attachmentName: formData.attachment ? formData.attachment.name : null
        }
      };
      announcements.unshift(notification);
      localStorage.setItem("announcements", JSON.stringify(announcements));
      
      setIsSubmitting(false);
      setSubmittedRequest(leaveRequest);
      setShowSuccess(true);
      
      // Auto hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
        navigate("/show_leave");
      }, 5000);
      
      // Also navigate immediately if user clicks view requests
      // This ensures the data is properly loaded in Show_leave component
    }, 2000);
  };

  const handleCancel = () => {
    navigate("/mainhr");
  };

  const handleViewRequests = () => {
    setShowSuccess(false);
    // Force reload of leave data when navigating to show_leave
    localStorage.setItem("forceRefreshLeaveData", "true");
    console.log("Navigating to show_leave with force refresh");
    console.log("Current leaveRequests in localStorage:", JSON.parse(localStorage.getItem("leaveRequests") || "[]"));
    navigate("/show_leave");
  };

  const handleNewRequest = () => {
    setShowSuccess(false);
    setSubmittedRequest(null);
    // Reset form but keep current date and year
    setFormData({
      employeeId: "",
      leaveDate: new Date().toISOString().split('T')[0],
      reason: "",
      employeeName: "",
      leaveYear: new Date().getFullYear(),
      attachment: null
    });
  };

  return (
    <div className="leave-info-page">
      <Sidebar_HR />
      <div className="leave-info-container">
        {showSuccess ? (
          <div className="success-card">
            <div className="success-icon">✅</div>
            <h2 className="success-title">ส่งคำขอการลาสำเร็จ!</h2>
            <div className="success-details">
              <p><strong>หมายเลขคำขอ:</strong> {submittedRequest?.requestId}</p>
              <p><strong>ชื่อผู้ลา:</strong> {submittedRequest?.employeeName}</p>
              <p><strong>รหัสพนักงาน:</strong> {submittedRequest?.employeeId}</p>
              <p><strong>วันที่ลา:</strong> {new Date(submittedRequest?.leaveDate).toLocaleDateString('th-TH')}</p>
              <p><strong>ปีที่ลา:</strong> {submittedRequest?.leaveYear}</p>
              <p><strong>เหตุผลการลา:</strong></p>
              <div className="reason-display">
                {submittedRequest?.reason}
              </div>
              <p><strong>สถานะ:</strong> รอการอนุมัติจาก CHRO</p>
              <p><strong>วันที่ส่งคำขอ:</strong> {new Date(submittedRequest?.requestDate).toLocaleDateString('th-TH')}</p>
            </div>
            <div className="success-actions">
              <button onClick={handleViewRequests} className="btn btn-primary">
                <span className="btn-icon">👁️</span>
                ดูรายการคำขอ
              </button>
              <button onClick={handleNewRequest} className="btn btn-secondary">
                <span className="btn-icon">📝</span>
                ส่งคำขอใหม่
              </button>
            </div>
            <div className="auto-navigate">
              <p>จะนำคุณไปยังหน้ารายการคำขอในอีก 5 วินาที...</p>
            </div>
          </div>
        ) : (
          <div className="leave-info-card">
            <div className="leave-info-header">
              <h1 className="leave-info-title">
                <span className="leave-icon">📋</span>
                ส่งคำขอการลา
              </h1>
              <p className="leave-info-subtitle">กรุณากรอกข้อมูลการลาของคุณ</p>
              <div className="approval-workflow">
                <div className="workflow-step active">
                  <span className="step-icon">📝</span>
                  <span className="step-text">HR ส่งคำขอ</span>
                </div>
                <div className="workflow-arrow">→</div>
                <div className="workflow-step">
                  <span className="step-icon">👑</span>
                  <span className="step-text">CHRO อนุมัติ</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="leave-info-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="employeeId" className="form-label">
                    <span className="label-icon">🆔</span>
                    รหัสพนักงาน
                  </label>
                  <input
                    type="text"
                    id="employeeId"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="กรอกรหัสพนักงาน"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="employeeName" className="form-label">
                    <span className="label-icon">👤</span>
                    ชื่อผู้ลา
                  </label>
                  <input
                    type="text"
                    id="employeeName"
                    name="employeeName"
                    value={formData.employeeName}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="กรอกชื่อผู้ลา"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="leaveDate" className="form-label">
                    <span className="label-icon">📅</span>
                    วันที่ลา
                  </label>
                  <input
                    type="date"
                    id="leaveDate"
                    name="leaveDate"
                    value={formData.leaveDate}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="leaveYear" className="form-label">
                    <span className="label-icon">📆</span>
                    ปีที่ลา
                  </label>
                  <input
                    type="number"
                    id="leaveYear"
                    name="leaveYear"
                    value={formData.leaveYear}
                    onChange={handleInputChange}
                    className="form-input"
                    min={new Date().getFullYear() - 1}
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="reason" className="form-label">
                  <span className="label-icon">💭</span>
                  เหตุผลการลา
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="กรอกรายละเอียดเหตุผลการลา..."
                  rows="4"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="attachment" className="form-label">
                  <span className="label-icon">📎</span>
                  แนบไฟล์ (เอกสารการลาหรือคำจากแพทย์)
                </label>
                <div className="file-upload-container">
                  <input
                    type="file"
                    id="attachment"
                    name="attachment"
                    onChange={handleFileChange}
                    className="file-input"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <label htmlFor="attachment" className="file-upload-label">
                    <span className="upload-icon">📤</span>
                    <span className="upload-text">
                      {formData.attachment ? formData.attachment.name : "เลือกไฟล์"}
                    </span>
                  </label>
                </div>
                {formData.attachment && (
                  <div className="file-info">
                    <span className="file-name">📄 {formData.attachment.name}</span>
                    <span className="file-size">
                      ({(formData.attachment.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  <span className="btn-icon">❌</span>
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading-spinner"></span>
                      กำลังส่ง...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">✅</span>
                      ส่งคำขอ
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leave_info; 