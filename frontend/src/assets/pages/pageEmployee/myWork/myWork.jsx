import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTasks,
  FaRegCalendarAlt,
  FaCheckCircle,
  FaSpinner,
  FaExclamationTriangle,
  FaClock,
  FaTimesCircle,
  FaEdit,
  FaUserTimes,
  FaUserCheck,
} from "react-icons/fa";
import EmployeeSidebar from "../../../Component/Employee/EmployeeSidebar";
import "./myWork.css";

// Helper to get current User ID robustly
const getCurrentUserId = () => {
  try {
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id;
    }
    const userId = localStorage.getItem("userId");
    if (userId && !isNaN(userId)) return userId;
  } catch (e) {
    console.error("Error parsing user data", e);
  }
  // Fallback
  return 1;
};

export default function MyWork() {
  const [stats, setStats] = useState({});
  const [pendingTasks, setPendingTasks] = useState([]);
  const [activeTasks, setActiveTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectTaskId, setRejectTaskId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [replaceTaskId, setReplaceTaskId] = useState(null);
  const [replaceReason, setReplaceReason] = useState("");

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const id = getCurrentUserId();
    if (id) {
      setUserId(id);
      fetchDashboardData(id);
    } else {
      setError("ไม่พบข้อมูลผู้ใช้งาน (กรุณา Login ใหม่)");
      setLoading(false);
    }
  }, []);

  const fetchDashboardData = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/users/${id}/my-work-dashboard`
      );
      if (response.data.success) {
        setStats(response.data.stats || {});
        setPendingTasks(response.data.pendingTasks || []);
        setActiveTasks(response.data.activeTasks || []);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("ไม่สามารถโหลดข้อมูลงานได้ (Server Error)");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTask = async (taskId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/task_assignments/${taskId}/accept`
      );
      alert("รับงานเรียบร้อยแล้ว!");
      fetchDashboardData(userId);
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการรับงาน");
    }
  };

  const handleRejectTask = async () => {
    if (!rejectTaskId || !rejectReason) return alert("กรุณาระบุเหตุผล");
    try {
      await axios.post(
        `http://localhost:5000/api/task_assignments/${rejectTaskId}/reject`,
        {
          reason: rejectReason,
        }
      );
      alert("ปฏิเสธงานเรียบร้อยแล้ว");
      setIsRejectModalOpen(false);
      setRejectReason("");
      fetchDashboardData(userId);
    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    }
  };

  const saveProgress = async () => {
    if (!selectedTask) return;
    try {
      let newStatus = selectedTask.status;
      if (selectedTask.progress === 100) newStatus = "Completed";
      else if (selectedTask.progress === 0) newStatus = "In Progress"; // Or logic if we had 'Not Started'

      await axios.patch(
        `http://localhost:5000/api/task_assignments/${selectedTask.id}`,
        {
          progress: selectedTask.progress,
          status: newStatus,
        }
      );

      alert("บันทึกเรียบร้อย!");
      setIsUpdateModalOpen(false);
      fetchDashboardData(userId);
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  const handleRequestReplacement = async () => {
    if (!replaceTaskId || !replaceReason) return alert("กรุณาระบุเหตุผล");
    try {
      await axios.post(`http://localhost:5000/api/task_replacements`, {
        task_id: replaceTaskId,
        existing_user_id: userId,
        reason: replaceReason,
      });
      alert("ส่งคำขอเปลี่ยนตัวแล้ว รอการอนุมัติ");
      setIsReplaceModalOpen(false);
      setReplaceReason("");
      fetchDashboardData(userId);
    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    }
  };

  // Status Badge Helper
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "status-completed";
      case "In Progress":
        return "status-inprogress";
      case "Pending":
        return "status-pending";
      case "Rejected":
        return "status-rejected";
      default:
        return "status-default";
    }
  };

  const getDeadlineClass = (deadline) => {
    if (!deadline) return "";
    const d = new Date(deadline);
    const now = new Date();
    const diff = (d - now) / (1000 * 60 * 60 * 24);
    if (diff < 0) return "text-red-400 font-bold"; // Overdue
    if (diff < 3) return "text-orange-400 font-bold"; // Due Soon
    return "text-gray-300";
  };

  return (
    <div className="emp-mywork-layout">
      <EmployeeSidebar />

      <main className="emp-mywork-main">
        <motion.header
          className="emp-mywork-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="emp-header-left">
            <div className="emp-header-icon">
              <FaTasks />
            </div>
            <div>
              <h1 className="emp-mywork-title">ติดตามงานของฉัน</h1>
              <p className="emp-mywork-subtitle">
                User ID: {userId || "Guest"} | จัดการภาระงานของคุณ
              </p>
            </div>
          </div>
          <button
            className="emp-btn-refresh"
            onClick={() => userId && fetchDashboardData(userId)}
          >
            <FaSpinner className={loading ? "animate-spin" : ""} /> รีเฟรชข้อมูล
          </button>
        </motion.header>

        {loading ? (
          <div className="emp-loading-state">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <FaSpinner size={40} className="text-indigo-400" />
            </motion.div>
            <p>กำลังโหลดข้อมูล...</p>
          </div>
        ) : error ? (
          <div className="emp-error-state">
            <FaExclamationTriangle size={48} className="text-red-400 mb-4" />
            <h3 className="text-lg font-bold text-gray-200">
              ล้มเหลวในการโหลด
            </h3>
            <p className="text-gray-400">{error}</p>
            <button
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
              onClick={() => window.location.reload()}
            >
              ลองใหม่อีกครั้ง
            </button>
          </div>
        ) : (
          <div className="emp-dashboard-content">
            {/* 1. Task Statistics */}
            <section className="emp-stats-section">
              <div className="stat-card">
                <h3>ทั้งหมด</h3>
                <div className="stat-value">{stats.total || 0}</div>
                <div className="stat-icon">
                  <FaTasks />
                </div>
              </div>
              <div className="stat-card in-progress">
                <h3>กำลังดำเนินการ</h3>
                <div className="stat-value">{stats.in_progress || 0}</div>
                <div className="stat-icon">
                  <FaSpinner />
                </div>
              </div>
              <div className="stat-card pending">
                <h3>รอกดยอมรับ</h3>
                <div className="stat-value">{stats.pending || 0}</div>
                <div className="stat-icon">
                  <FaClock />
                </div>
              </div>
              <div className="stat-card due-soon">
                <h3>ใกล้ถึงกำหนด</h3>
                <div className="stat-value">{stats.due_soon || 0}</div>
                <div className="stat-icon">
                  <FaExclamationTriangle />
                </div>
              </div>
            </section>

            {/* 2. Pending Tasks */}
            {pendingTasks.length > 0 && (
              <section className="emp-pending-section">
                <h2 className="section-title">
                  งานที่รอดำเนินการ (Pending Accept)
                </h2>
                <div className="pending-tasks-grid">
                  {pendingTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="pending-task-card"
                    >
                      <div className="pending-header">
                        <h4>{task.task_name}</h4>
                        <span className="deadline-badge">
                          Deadline:{" "}
                          {new Date(task.deadline).toLocaleDateString("th-TH")}
                        </span>
                      </div>
                      <p className="pending-desc">
                        {task.description || "ไม่มีรายละเอียด"}
                      </p>
                      <p className="pending-assigner">
                        มอบหมายโดย: {task.fname} {task.lname}
                      </p>
                      <div className="pending-actions">
                        <button
                          className="btn-accept"
                          onClick={() => handleAcceptTask(task.id)}
                        >
                          <FaCheckCircle /> ยอมรับงาน
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => {
                            setRejectTaskId(task.id);
                            setIsRejectModalOpen(true);
                          }}
                        >
                          <FaTimesCircle /> ไม่รับงาน
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* 3. Active Tasks List */}
            <section className="emp-active-section">
              <h2 className="section-title">
                รายการงานปัจจุบัน (Active Tasks)
              </h2>
              <div className="active-tasks-table-wrapper">
                {activeTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    ไม่มีงานที่กำลังดำเนินการ
                  </div>
                ) : (
                  <table className="active-tasks-table">
                    <thead>
                      <tr>
                        <th>ชื่อโปรเจ็ค</th>
                        <th>ชื่องาน</th>
                        <th>กำหนดส่ง</th>
                        <th style={{ width: "25%" }}>ความคืบหน้า</th>
                        <th>สถานะ</th>
                        <th>จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeTasks.map((task) => (
                        <tr key={task.id}>
                          <td>{task.project_name || "-"}</td>
                          <td>
                            <div className="font-semibold">
                              {task.task_name}
                            </div>
                            <div className="text-xs text-gray-400">
                              by {task.assigner_fname}
                            </div>
                          </td>
                          <td>
                            <span className={getDeadlineClass(task.deadline)}>
                              {new Date(task.deadline).toLocaleDateString(
                                "th-TH"
                              )}
                            </span>
                          </td>
                          <td>
                            <div className="progress-container">
                              <div className="progress-bar-bg">
                                <div
                                  className="progress-bar-fill"
                                  style={{ width: `${task.progress}%` }}
                                ></div>
                              </div>
                              <span className="progress-text">
                                {task.progress}%
                              </span>
                            </div>
                          </td>
                          <td>
                            <span
                              className={`status-pill ${getStatusColor(
                                task.status
                              )}`}
                            >
                              {task.status}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn-icon-update"
                                title="อัปเดตงาน"
                                onClick={() => {
                                  setSelectedTask(task);
                                  setIsUpdateModalOpen(true);
                                }}
                              >
                                <FaEdit />
                              </button>
                              <button
                                className={`btn-icon-replace ${
                                  task.replacement_status ? "disabled" : ""
                                }`}
                                title="ขอเปลี่ยนตัว"
                                onClick={() => {
                                  if (!task.replacement_status) {
                                    setReplaceTaskId(task.id);
                                    setIsReplaceModalOpen(true);
                                  }
                                }}
                                disabled={!!task.replacement_status}
                              >
                                {task.replacement_status ? (
                                  <FaUserCheck />
                                ) : (
                                  <FaUserTimes />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          </div>
        )}

        {/* --- Modals --- */}

        {/* Reject Modal */}
        <AnimatePresence>
          {isRejectModalOpen && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="modal-content">
                <h3>เหตุผลที่ปฏิเสธงาน</h3>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="กรุณาระบุเหตุผล..."
                  rows={4}
                />
                <div className="modal-actions">
                  <button onClick={() => setIsRejectModalOpen(false)}>
                    ยกเลิก
                  </button>
                  <button
                    className="btn-confirm-reject"
                    onClick={handleRejectTask}
                  >
                    ยืนยันปฏิเสธ
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Update Progress Modal */}
        <AnimatePresence>
          {isUpdateModalOpen && selectedTask && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="modal-content">
                <h3>อัปเดตความคืบหน้า: {selectedTask.task_name}</h3>
                <div className="progress-control-area">
                  <div className="slider-header">
                    <label>ความคืบหน้า</label>
                    <span className="percentage-display">
                      {selectedTask.progress}%
                    </span>
                  </div>
                  <input
                    type="range"
                    className="styled-slider"
                    min="0"
                    max="100"
                    value={selectedTask.progress}
                    onChange={(e) =>
                      setSelectedTask({
                        ...selectedTask,
                        progress: Number(e.target.value),
                      })
                    }
                  />
                  <div className="slider-labels">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
                <div className="modal-actions">
                  <button onClick={() => setIsUpdateModalOpen(false)}>
                    ยกเลิก
                  </button>
                  <button className="btn-confirm-update" onClick={saveProgress}>
                    บันทึก
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Replacement Modal */}
        <AnimatePresence>
          {isReplaceModalOpen && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="modal-content">
                <h3>ขอเปลี่ยนตัวผู้รับผิดชอบ</h3>
                <textarea
                  value={replaceReason}
                  onChange={(e) => setReplaceReason(e.target.value)}
                  placeholder="ระบุสาเหตุที่ต้องการเปลี่ยนตัว..."
                  rows={4}
                />
                <div className="modal-actions">
                  <button onClick={() => setIsReplaceModalOpen(false)}>
                    ยกเลิก
                  </button>
                  <button
                    className="btn-confirm-replace"
                    onClick={handleRequestReplacement}
                  >
                    ส่งคำขอ
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
