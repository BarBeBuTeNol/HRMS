import React, { useState, useEffect } from "react";
import api from "../../../../services/api";
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
  FaChevronDown,
  FaChartPie,
  FaHourglassHalf,
  FaCheckDouble,
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
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
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

  // Derived Stats
  const totalRequests = history.length;
  const pendingRequests = history.filter((h) => h.status === "Pending").length;
  const approvedRequests = history.filter((h) => h.status === "Approved").length;

  // Gimmick: Staggered input animations
  const formGroupVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [workRes, candidatesRes, historyRes] = await Promise.all([
        api.get("/replacements/eligible-work"),
        api.get("/replacements/candidates"),
        api.get("/replacements/my-history"),
      ]);

      setTasks(workRes.data.tasks || []);
      setShifts(workRes.data.shifts || []);
      setCandidates(candidatesRes.data || []);
      setHistory(historyRes.data || []);
    } catch (err) {
      console.error("Error loading data:", err);
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

      await api.post("/replacements", payload);

      // Simple alert for now, could be a toast in production
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
                <div className="header-icon-box">
                  <FaExchangeAlt />
                </div>
                <div className="header-text">
                  <span className="text-gradient">Shift & Task Exchange</span>
                  <p>ระบบจัดการคำขอเปลี่ยนกะและงาน</p>
                </div>
              </h1>
            </div>
            
            {/* Stats Gimmick */}
            <div className="header-stats">
              <div className="stat-item">
                <div className="stat-icon total"><FaChartPie /></div>
                <div className="stat-info">
                  <span className="stat-value">{totalRequests}</span>
                  <span className="stat-label">Total</span>
                </div>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <div className="stat-icon pending"><FaHourglassHalf /></div>
                <div className="stat-info">
                  <span className="stat-value">{pendingRequests}</span>
                  <span className="stat-label">Pending</span>
                </div>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <div className="stat-icon approved"><FaCheckDouble /></div>
                <div className="stat-info">
                  <span className="stat-value">{approvedRequests}</span>
                  <span className="stat-label">Approved</span>
                </div>
              </div>
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
              <motion.section variants={itemVariants} className="premium-card request-section">
                <div className="card-header-premium">
                  <div className="icon-wrapper">
                    <FaPlusCircle />
                  </div>
                  <h2>New Request / สร้างคำขอ</h2>
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
                      <div className="type-bg-glow"></div>
                      <div className="type-icon-wrapper task">
                        <FaTasks />
                      </div>
                      <div className="type-info">
                        <h3>เปลี่ยนงาน</h3>
                        <p>Task Exchange</p>
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
                      <div className="type-bg-glow"></div>
                      <div className="type-icon-wrapper shift">
                        <FaCalendarAlt />
                      </div>
                      <div className="type-info">
                        <h3>เปลี่ยนกะ</h3>
                        <p>Shift Exchange</p>
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
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
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
                            ? "Select Task (เลือกงาน)"
                            : "Select Shift (เลือกกะ)"}
                        </label>
                        <div className="select-wrapper-premium">
                          <select
                            className="form-control-premium"
                            value={formData.itemId}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                itemId: e.target.value,
                              })
                            }
                            required
                          >
                            <option value="">-- Select Item --</option>
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
                    <label>Replacement (ผู้มาแทน)</label>
                    <div className="select-wrapper-premium">
                      <select
                        className="form-control-premium"
                        value={formData.replacementId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            replacementId: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">-- Select Employee --</option>
                        {candidates.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.first_name} {u.last_name} ({u.department || "General"})
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
                    <label>Reason (เหตุผล)</label>
                    <textarea
                      className="form-control-premium textarea"
                      rows={3}
                      value={formData.reason}
                      onChange={(e) =>
                        setFormData({ ...formData, reason: e.target.value })
                      }
                      placeholder="อธิบายเหตุผลของคุณ..."
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
                        <FaSpinner className="animate-spin" /> Processing...
                      </>
                    ) : (
                      <>
                        Submit Request
                        <div className="btn-glow"></div>
                      </>
                    )}
                  </button>
                </form>
              </motion.section>

              {/* Right Column: History */}
              <motion.section variants={itemVariants} className="premium-card history-section">
                <div className="card-header-premium">
                  <div className="icon-wrapper history">
                    <FaHistory />
                  </div>
                  <h2>History / ประวัติ</h2>
                </div>

                <div className="history-list-premium">
                  {history.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon"><FaHistory /></div>
                      <p>No Reqeust History</p>
                      <span>ยังไม่มีประวัติการยื่นคำขอ</span>
                    </div>
                  ) : (
                    <div className="history-timeline">
                      {history.map((req, index) => (
                        <motion.div 
                          key={req.id} 
                          className="timeline-item"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div className="timeline-line"></div>
                          <div className="timeline-dot"></div>
                          
                          <div className="history-card-inner">
                            <div className="history-header-row">
                              <span className="history-date">
                                {new Date(req.created_at).toLocaleDateString("th-TH", {
                                  day: 'numeric', month: 'short', year: 'numeric'
                                })}
                              </span>
                              {getStatusBadge(req.status)}
                            </div>
                            
                            <div className="history-info-row">
                              <div className="info-group">
                                <span className="label">Type</span>
                                <div className="value-box">
                                  {req.task_id ? (
                                    <span className="type-tag task"><FaTasks /> Task</span>
                                  ) : (
                                    <span className="type-tag shift"><FaCalendarAlt /> Shift</span>
                                  )}
                                </div>
                              </div>
                              <div className="info-group right">
                                <span className="label">To</span>
                                <span className="value-name">
                                  {req.replacement_first_name} {req.replacement_last_name}
                                </span>
                              </div>
                            </div>
                            
                            <div className="history-detail-text">
                              Item: {req.task_title ||
                                (req.shift_date &&
                                  new Date(req.shift_date).toLocaleDateString("th-TH")) ||
                                "Unknown"}
                            </div>
                          </div>
                        </motion.div>
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
