import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaExchangeAlt,
  FaHistory,
  FaPlusCircle,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaTasks,
  FaCalendarAlt,
  FaUserClock,
  FaChevronDown,
} from "react-icons/fa";
import EmployeeSidebar from "../../../Component/Employee/EmployeeSidebar";
import "./ShiftRequestsPage.css";

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

const ShiftRequestsPage = () => {
  const [tasks, setTasks] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    type: "task", // 'task' or 'shift'
    itemId: "",
    replacementId: "",
    reason: "",
  });

  // Gimmick: Staggered input animations
  const formGroupVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { headers: getAuthHeader() };

      const [workRes, candidatesRes, historyRes] = await Promise.all([
        axios.get(
          "http://localhost:5000/api/replacements/eligible-work",
          headers
        ),
        axios.get("http://localhost:5000/api/replacements/candidates", headers),
        axios.get("http://localhost:5000/api/replacements/my-history", headers),
      ]);

      setTasks(workRes.data.tasks || []);
      setShifts(workRes.data.shifts || []);
      setCandidates(candidatesRes.data || []);
      setHistory(historyRes.data || []);
    } catch (err) {
      console.error("Error loading data:", err);
      // More friendly error message
      setError("ไม่สามารถโหลดข้อมูลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.itemId || !formData.replacementId || !formData.reason) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        replacement_id: formData.replacementId,
        reason: formData.reason,
        task_id: formData.type === "task" ? formData.itemId : null,
        shift_id: formData.type === "shift" ? formData.itemId : null,
      };

      await axios.post("http://localhost:5000/api/replacements", payload, {
        headers: getAuthHeader(),
      });

      // Success Alert/Notification could be improved here
      alert("✔️ ส่งคำขอสำเร็จ! ระบบได้บันทึกรายการของคุณแล้ว");

      setFormData({ ...formData, itemId: "", replacementId: "", reason: "" });
      fetchInitialData();
    } catch (err) {
      console.error("Error submitting request:", err);
      alert(
        "❌ เกิดข้อผิดพลาด: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return (
          <span className="status-badge pending">
            <FaClock /> รออนุมัติ
          </span>
        );
      case "Approved":
        return (
          <span className="status-badge approved">
            <FaCheckCircle /> อนุมัติแล้ว
          </span>
        );
      case "Rejected":
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
    <div className="shift-requests-container">
      <EmployeeSidebar />

      <main className="shift-requests-main">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="content-wrapper"
        >
          {/* Header */}
          <motion.header variants={itemVariants} className="page-header">
            <div className="header-content">
              <h1>
                <FaExchangeAlt className="header-icon" />
                <span className="text-gradient">ระบบเปลี่ยนกะ/งาน</span>
              </h1>
              <p>จัดการคำขอเปลี่ยนแปลงผู้รับผิดชอบงานหรือกะการทำงาน</p>
            </div>
          </motion.header>

          {loading ? (
            <div className="loading-state">
              <FaSpinner className="loading-spinner" />
              <p>กำลังโหลดข้อมูล...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <h3>⚠️ {error}</h3>
              <button onClick={fetchInitialData} className="btn-retry">
                ลองใหม่อีกครั้ง
              </button>
            </div>
          ) : (
            <div className="dashboard-grid">
              {/* Left Column: Form */}
              <motion.section variants={itemVariants} className="request-card">
                <div className="card-header">
                  <FaPlusCircle className="card-icon" />
                  <h2>สร้างคำขอใหม่</h2>
                </div>

                <form onSubmit={handleSubmit} className="request-form">
                  {/* Type Selection Cards */}
                  <div className="type-selection-grid">
                    <div
                      className={`type-card ${
                        formData.type === "task" ? "active" : ""
                      }`}
                      onClick={() =>
                        setFormData({ ...formData, type: "task", itemId: "" })
                      }
                    >
                      <div className="type-icon-wrapper task">
                        <FaTasks />
                      </div>
                      <div className="type-info">
                        <h3>งาน (Task)</h3>
                        <p>เปลี่ยนผู้รับผิดชอบงาน</p>
                      </div>
                      {formData.type === "task" && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="active-indicator"
                        />
                      )}
                    </div>

                    <div
                      className={`type-card ${
                        formData.type === "shift" ? "active" : ""
                      }`}
                      onClick={() =>
                        setFormData({ ...formData, type: "shift", itemId: "" })
                      }
                    >
                      <div className="type-icon-wrapper shift">
                        <FaCalendarAlt />
                      </div>
                      <div className="type-info">
                        <h3>กะ (Shift)</h3>
                        <p>เปลี่ยนกะการทำงาน</p>
                      </div>
                      {formData.type === "shift" && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="active-indicator"
                        />
                      )}
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={formData.type}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="form-dynamic-content"
                    >
                      <motion.div
                        className="form-group"
                        variants={formGroupVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.1 }}
                      >
                        <label>
                          {formData.type === "task"
                            ? "เลือกงานที่ต้องการโอน (Select Task)"
                            : "เลือกกะวันที่ (Select Shift)"}
                        </label>
                        <div className="select-wrapper">
                          <select
                            className="form-control"
                            value={formData.itemId}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                itemId: e.target.value,
                              })
                            }
                            required
                          >
                            <option value="">-- กรุณาเลือกรายการ --</option>
                            {formData.type === "task" ? (
                              tasks.length > 0 ? (
                                tasks.map((t) => (
                                  <option key={t.id} value={t.id}>
                                    {t.task_name} (Deadline:{" "}
                                    {new Date(t.deadline).toLocaleDateString(
                                      "th-TH"
                                    )}
                                    )
                                  </option>
                                ))
                              ) : (
                                <option disabled>
                                  ไม่มีงานที่สามารถเปลี่ยนได้
                                </option>
                              )
                            ) : shifts.length > 0 ? (
                              shifts.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {new Date(s.shift_date).toLocaleDateString(
                                    "th-TH"
                                  )}{" "}
                                  ({s.shift_type})
                                </option>
                              ))
                            ) : (
                              <option disabled>ไม่มีกะในอนาคต</option>
                            )}
                          </select>
                          <FaChevronDown className="select-arrow" />
                        </div>
                      </motion.div>
                    </motion.div>
                  </AnimatePresence>

                  <motion.div
                    className="form-group"
                    variants={formGroupVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.2 }}
                  >
                    <label>ผู้ที่จะมาทำงานแทน (Replacement)</label>
                    <div className="select-wrapper">
                      <select
                        className="form-control"
                        value={formData.replacementId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            replacementId: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">-- เลือกเพื่อนร่วมงาน --</option>
                        {candidates.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.first_name} {u.last_name} (
                            {u.department || "General"})
                          </option>
                        ))}
                      </select>
                      <FaChevronDown className="select-arrow" />
                    </div>
                  </motion.div>

                  <motion.div
                    className="form-group"
                    variants={formGroupVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.3 }}
                  >
                    <label>เหตุผล (Reason)</label>
                    <textarea
                      className="form-control textarea"
                      rows={3}
                      value={formData.reason}
                      onChange={(e) =>
                        setFormData({ ...formData, reason: e.target.value })
                      }
                      placeholder="ระบุเหตุผลที่ต้องการเปลี่ยน..."
                      required
                    />
                  </motion.div>

                  <button
                    type="submit"
                    className="btn-submit-premium"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin" /> กำลังส่ง...
                      </>
                    ) : (
                      <>
                        ยืนยันการส่งคำขอ{" "}
                        <FaChevronDown
                          style={{ transform: "rotate(-90deg)" }}
                        />
                      </>
                    )}
                  </button>
                </form>
              </motion.section>

              {/* Right Column: History */}
              <motion.section variants={itemVariants} className="history-card">
                <div className="card-header">
                  <FaHistory className="card-icon" />
                  <h2>ประวัติรายการ</h2>
                </div>

                <div className="history-list">
                  {history.length === 0 ? (
                    <div className="empty-state">
                      <FaHistory />
                      <p>ยังไม่มีประวัติการยื่นคำขอ</p>
                    </div>
                  ) : (
                    <div className="history-items">
                      {history.map((req) => (
                        <div key={req.id} className="history-item">
                          <div className="history-item-header">
                            <span className="history-date">
                              {new Date(req.created_at).toLocaleDateString(
                                "th-TH"
                              )}
                            </span>
                            {getStatusBadge(req.status)}
                          </div>
                          <div className="history-details">
                            <div className="detail-row">
                              <span className="label">รายการ:</span>
                              <span className="value">
                                {req.task_id ? (
                                  <span className="tag task">Task</span>
                                ) : (
                                  <span className="tag shift">Shift</span>
                                )}
                                {req.task_title ||
                                  (req.shift_date &&
                                    new Date(req.shift_date).toLocaleDateString(
                                      "th-TH"
                                    )) ||
                                  "Unknown"}
                              </span>
                            </div>
                            <div className="detail-row">
                              <span className="label">แทนโดย:</span>
                              <span className="value">
                                {req.replacement_first_name}{" "}
                                {req.replacement_last_name}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.section>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default ShiftRequestsPage;
