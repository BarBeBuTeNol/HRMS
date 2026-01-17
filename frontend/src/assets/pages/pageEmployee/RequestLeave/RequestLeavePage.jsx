import React, { useState, useEffect } from "react";
import api from "../../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFileMedical,
  FaHistory,
  FaPaperPlane,
  FaExclamationTriangle,
  FaSpinner,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaCalendarAlt,
  FaUpload,
  FaPlane,
  FaUser,
  FaPray,
  FaTimes, // Close icon
} from "react-icons/fa";
import EmployeeSidebar from "../../../Component/Employee/EmployeeSidebar";
import "./RequestLeavePage.css";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const RequestLeavePage = () => {
  const [userId, setUserId] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    leaveType: "ลากิจ/ลาป่วย", // Default generic value as user removed choice
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [checkingSchedule, setCheckingSchedule] = useState(false);
  const [scheduleConflict, setScheduleConflict] = useState(null);

  useEffect(() => {
    // Get user_id
    const token = localStorage.getItem("token");
    if (token) {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (storedUser.id) {
        setUserId(storedUser.id);
        fetchHistory(storedUser.id);
      } else {
        setLoading(false); // Stop loading if no user ID
      }
    } else {
      setLoading(false); // Stop loading if no token
    }
  }, []);

  const fetchHistory = async (uid) => {
    try {
      const res = await api.get(`/leave-requests/${uid}`);
      setHistory(res.data);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoading(false);
    }
  };

  // Check schedule conflict
  useEffect(() => {
    if (userId && formData.startDate && formData.endDate) {
      checkScheduleConflict();
    } else {
      setScheduleConflict(null);
    }
  }, [formData.startDate, formData.endDate, userId]);

  const checkScheduleConflict = async () => {
    setCheckingSchedule(true);
    try {
      const res = await api.get(`/work-schedules/my-schedules`, {
        params: {
          userId,
          startDate: formData.startDate,
          endDate: formData.endDate,
        },
      });

      if (res.data.length > 0) {
        setScheduleConflict(res.data);
      } else {
        setScheduleConflict(null);
      }
    } catch (err) {
      console.error("Error checking schedule:", err);
    } finally {
      setCheckingSchedule(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.leaveType ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.reason
    ) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/leave-requests", {
        user_id: userId,
        leave_type: formData.leaveType,
        start_date: formData.startDate,
        end_date: formData.endDate,
        reason: formData.reason,
      });

      alert("✔️ ส่งคำขอลาเรียบร้อยแล้ว!");
      // Reset form (keep default type or reset to sick)
      setFormData({
        leaveType: "sick",
        startDate: "",
        endDate: "",
        reason: "",
      });
      fetchHistory(userId);
    } catch (err) {
      console.error("Error submitting leave request:", err);
      alert(
        "❌ ส่งคำขอไม่สำเร็จ: " + (err.response?.data?.message || err.message),
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Helpers
  const getLeaveTypeInfo = (type) => {
    switch (type) {
      case "sick":
        return { label: "ลาป่วย", icon: <FaFileMedical />, class: "card-sick" };
      case "personal":
        return { label: "ลากิจ", icon: <FaUser />, class: "card-personal" };
      case "vacation":
        return {
          label: "ลาพักร้อน",
          icon: <FaPlane />,
          class: "card-vacation",
        };
      case "ordination":
        return { label: "ลาบวช", icon: <FaPray />, class: "card-ordination" };
      default:
        return { label: type, icon: <FaCalendarAlt />, class: "" };
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="status-badge pending">
            <FaClock /> รออนุมัติ
          </span>
        );
      case "approved":
        return (
          <span className="status-badge approved">
            <FaCheckCircle /> อนุมัติแล้ว
          </span>
        );
      case "rejected":
        return (
          <span className="status-badge rejected">
            <FaTimesCircle /> ถูกปฏิเสธ
          </span>
        );
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <div className="request-leave-container">
      <EmployeeSidebar />

      <main className="request-leave-main">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="content-wrapper"
        >
          <header className="page-header">
            <div className="header-content">
              <h1>
                <FaFileMedical className="header-icon" />
                <span className="text-gradient">
                  ส่งคำขอลา (Submit Request)
                </span>
              </h1>
              <p>กรอกแบบฟอร์มด้านล่างเพื่อส่งคำขอลาไปยังหัวหน้าแผนก</p>
            </div>
          </header>

          <div className="layout-grid-custom">
            {/* Form Section */}
            <motion.section
              variants={itemVariants}
              className="form-section-premium"
            >
              <div className="section-header-sm">
                <FaPaperPlane className="text-indigo-400" />
                <h3>แบบฟอร์มการลา</h3>
              </div>

              <form onSubmit={handleSubmit} className="leave-form">
                {/* Leave Type section removed per user request */}

                <div className="date-row">
                  <div className="form-group">
                    <label>ตั้งแต่วันที่</label>
                    <div className="input-wrapper">
                      <FaCalendarAlt className="input-icon" />
                      <input
                        type="date"
                        className="form-control"
                        value={formData.startDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startDate: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>ถึงวันที่</label>
                    <div className="input-wrapper">
                      <FaCalendarAlt className="input-icon" />
                      <input
                        type="date"
                        className="form-control"
                        value={formData.endDate}
                        min={formData.startDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            endDate: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Conflict Warning */}
                {checkingSchedule && (
                  <p className="text-sm text-gray-400 mb-2">
                    {" "}
                    <FaSpinner className="animate-spin" />{" "}
                    กำลังตรวจสอบตารางงาน...
                  </p>
                )}
                {scheduleConflict && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="warning-box"
                  >
                    <FaExclamationTriangle className="warning-icon" />
                    <div>
                      <strong>แจ้งเตือน:</strong> มีตารางงานในวันที่เลือกรวม{" "}
                      {scheduleConflict.length} กะ
                    </div>
                  </motion.div>
                )}

                <div className="form-group">
                  <label>เหตุผลการลา</label>
                  <textarea
                    className="form-control textarea"
                    placeholder="ระบุเหตุผลที่ต้องการลา..."
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                    required
                  />
                </div>

                {/* File Upload - Custom UI */}
                <div className="form-group">
                  <label>แนบเอกสาร (ใบรับรองแพทย์/สลิป)</label>
                  <div className="file-upload-wrapper">
                    <input
                      type="file"
                      id="file-upload"
                      className="file-upload-input"
                      onChange={(e) => {
                        // Just a visual handler for now as we don't have file state in backend payload yet
                        const fileName = e.target.files[0]?.name;
                        // Ideally set this to state to show the name
                        // For now, let's use a local DOM manipulation or state if available.
                        // I'll assume we can add a local state for visual feedback quickly or just let the user know.
                        // But for now, let's just make the UI nice.
                        if (fileName)
                          document.getElementById(
                            "file-name-display",
                          ).innerText = fileName;
                      }}
                    />
                    <label htmlFor="file-upload" className="file-upload-label">
                      <FaUpload className="file-icon-large" />
                      <span className="file-upload-text">
                        คลิกเพื่ออัปโหลดไฟล์ (Click to Upload)
                      </span>
                      <div
                        id="file-name-display"
                        className="text-sm text-indigo-300 mt-2 font-medium"
                      ></div>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-submit-premium full-width"
                  disabled={submitting}
                >
                  {submitting ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <>
                      <FaPaperPlane /> ส่งคำขอลา
                    </>
                  )}
                </button>
              </form>
            </motion.section>

            {/* History Section */}
            <motion.section
              variants={itemVariants}
              className="history-section-compact"
            >
              <div className="section-header-sm">
                <FaHistory className="text-emerald-400" />
                <h3>ประวัติการลาล่าสุด</h3>
              </div>

              {loading ? (
                <div className="empty-state">
                  <FaSpinner className="animate-spin" />
                  <p>กำลังโหลดข้อมูล...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="empty-state">
                  <FaHistory />
                  <p>ยังไม่มีประวัติการลา</p>
                </div>
              ) : (
                <div className="table-container-scroll">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>ประเภท</th>
                        <th>วันที่ลา</th>
                        <th>สถานะ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((req) => (
                        <tr key={req.id}>
                          <td>
                            <span
                              className={`leave-type-badge type-${req.leave_type}`}
                            >
                              {getLeaveTypeInfo(req.leave_type).label}
                            </span>
                          </td>
                          <td>
                            <div className="text-sm text-gray-300">
                              {new Date(req.start_date).toLocaleDateString(
                                "th-TH",
                              )}
                            </div>
                          </td>
                          <td>{getStatusBadge(req.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.section>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default RequestLeavePage;
