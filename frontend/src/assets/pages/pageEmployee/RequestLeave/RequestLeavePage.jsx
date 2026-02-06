import React, { useState, useEffect } from "react";
import api from "../../../../services/api";
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
  FaUmbrellaBeach,
  FaBriefcaseMedical,
  FaUserClock,
} from "react-icons/fa";
import EmployeeSidebar from "../../../Component/Employee/EmployeeSidebar";
import "./RequestLeavePage.css";
import PopupDoneEmp from "../../../Component/poup_done/poup_done-emp/PopupDoneEmp";
import PopupErrorEmp from "../../../Component/popup-error/popup-error-emp/PopupErrorEmp";
import PopupSentDataEmp from "../../../Component/popup-sent-data/popup-sent-data-emp/PopupSentDataEmp";
import PopupEmp from "../../../Component/popup_notifications/popup_notifications-emp/PopupEmp";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 12 },
  },
};

const cardHoverVariants = {
  hover: { y: -5, boxShadow: "0 15px 30px rgba(0,0,0,0.2)" },
};

const RequestLeavePage = () => {
  const [userId, setUserId] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaveTypesList, setLeaveTypesList] = useState([]);
  const [balances, setBalances] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    leaveType: "", // Will be set after fetch
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [checkingSchedule, setCheckingSchedule] = useState(false);
  const [scheduleConflict, setScheduleConflict] = useState(null);

  // Popup State
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [showWarningPopup, setShowWarningPopup] = useState(false); // For validation
  const [showSendingPopup, setShowSendingPopup] = useState(false); // For sending state
  const [popupMessage, setPopupMessage] = useState("");
  const [popupTitle, setPopupTitle] = useState("");



  // Mock Balances (Removed)
  // const leaveBalances = [...];

  useEffect(() => {
    // Get user_id
    const token = localStorage.getItem("token");
    if (token) {
      // 1. Try getting explicit userId
      const storedUserId = localStorage.getItem("userId");
      // 2. Try getting from currentUser object
      const storedUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
      
      const distinctId = storedUserId || storedUser.id;

      if (distinctId) {
        setUserId(distinctId);
        fetchHistory(distinctId);
        fetchLeaveTypes();
        fetchBalances(distinctId);
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchLeaveTypes = async () => {
    try {
        const res = await api.get("/leave-requests/types");
        if(res.data && res.data.length > 0) {
            setLeaveTypesList(res.data);
            // Set default to first option
            setFormData(prev => ({...prev, leaveType: res.data[0].name}));
        }
    } catch (err) {
        console.error("Error fetching leave types:", err);
    }
  };

  const fetchBalances = async (uid) => {
    try {
        const res = await api.get(`/leave-requests/summary/${uid}`);
        setBalances(res.data);
    } catch (err) {
        console.error("Error fetching balances:", err);
        // Fallback to empty or error state
        setBalances([]);
    }
  };

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
      setPopupTitle("Incomplete Data");
      setPopupMessage("Please fill in all required fields.");
      setShowWarningPopup(true); // Use Warning Popup
      return;
    }

    // Map frontend values to Database ENUM values
    // No longer needed as we use direct DB values
    const dbLeaveType = formData.leaveType || "Other";

    if (!userId) {
      setPopupTitle("Authentication Error");
      setPopupMessage("⚠️ User data not found. Please login again.");
      setShowErrorPopup(true);
      return;
    }

    setSubmitting(true);
    setShowSendingPopup(true); // Open Sending Popup
    try {
      await api.post("/leave-requests", {
        user_id: userId,
        leave_type: dbLeaveType,
        start_date: formData.startDate,
        end_date: formData.endDate,
        reason: formData.reason,
      });

      setShowSendingPopup(false); // Close Sending
      setPopupTitle("Success");
      setPopupMessage("✔️ Leave request submitted successfully!");
      setShowSuccessPopup(true);

      setFormData({
        leaveType: leaveTypesList.length > 0 ? leaveTypesList[0].name : "",
        startDate: "",
        endDate: "",
        reason: "",
      });
      fetchHistory(userId);
      fetchBalances(userId); // Refresh balances
    } catch (err) {
      console.error("Error submitting leave request:", err);
      setShowSendingPopup(false); // Close Sending
      setPopupTitle("Submission Failed");
      setPopupMessage("❌ Submission failed: " + (err.response?.data?.message || err.message));
      setShowErrorPopup(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Helpers
  const getLeaveTypeInfo = (type) => {
    // Basic mapping for known types, default for others
    const lowerType = type.toLowerCase();
    if (lowerType.includes("sick")) return { label: "Sick Leave", icon: <FaBriefcaseMedical />, class: "badge-sick", color: "from-rose-500 to-pink-600", bgAlert: "bg-rose-500/10 text-rose-400" };
    if (lowerType.includes("personal")) return { label: "Personal Leave", icon: <FaUserClock />, class: "badge-personal", color: "from-amber-400 to-orange-500", bgAlert: "bg-amber-500/10 text-amber-400" };
    if (lowerType.includes("vacation")) return { label: "Vacation", icon: <FaUmbrellaBeach />, class: "badge-vacation", color: "from-cyan-400 to-blue-500", bgAlert: "bg-cyan-500/10 text-cyan-400" };
    if (lowerType.includes("ordination")) return { label: "Ordination", icon: <FaPray />, class: "badge-ordination", color: "from-purple-500 to-indigo-600", bgAlert: "bg-purple-500/10 text-purple-400" };
    if (lowerType.includes("maternity")) return { label: "Maternity", icon: <FaFileMedical />, class: "badge-sick", color: "from-pink-400 to-rose-400", bgAlert: "bg-pink-500/10 text-pink-400" };
    
    return { label: type, icon: <FaCalendarAlt />, class: "badge-default", color: "from-slate-400 to-gray-500", bgAlert: "bg-slate-500/10 text-slate-400" };
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="status-badge pending">
            <FaClock /> Pending
          </span>
        );
      case "approved":
        return (
          <span className="status-badge approved">
            <FaCheckCircle /> Approved
          </span>
        );
      case "rejected":
        return (
          <span className="status-badge rejected">
            <FaTimesCircle /> Rejected
          </span>
        );
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <div className="request-leave-page">
      <EmployeeSidebar />

      <main className="request-leave-main">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="content-container"
        >
          {/* Header */}
          <header className="page-header">
            <div className="header-text">
              <h1>
                <span className="icon-wrapper-header">
                  <FaFileMedical />
                </span>
                <span className="text-highlight">Request Leave</span>
                <span className="subtitle">Submit Leave Application</span>
              </h1>
              <p>Manage your leave and check your request status here</p>
            </div>
          </header>

          {/* Balance Cards (Dynamic) */}
          <motion.section className="balance-cards-grid" variants={containerVariants}>
            {balances.map((item, index) => {
               const style = getLeaveTypeInfo(item.type);
               return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover="hover"
                className="balance-card"
              >
                <div className={`card-icon-bg ${style.class}`} style={{background: 'transparent'}}> {/* Fallback or custom gradient? Class usually handles it */}
                   <div style={{ fontSize: '2rem', color: style.class.includes('sick') ? '#f43f5e' : 'inherit' }}>
                     {/* We might need to adjust CSS or use inline styles for dynamic gradients if we don't have classes for all types. 
                         Let's use the `color` prop from helper for inline gradient if convenient, or rely on classes.
                         For now, let's assume classes like `badge-sick` exist or simple styling.
                         Actually, the mock used: color: "from-rose-500 to-pink-600".
                         Let's apply that as background-image linear-gradient.
                     */}
                     {style.icon}
                   </div>
                </div>
                <div className="card-info">
                  <h3>{style.label}</h3>
                  <div className="progress-bar-container">
                    <div
                      className={`progress-bar-fill`}
                      style={{ 
                          width: `${(item.used / item.limit) * 100}%`,
                          backgroundColor: style.class.includes('sick') ? '#f43f5e' : (style.class.includes('personal') ? '#fbbf24' : '#22d3ee') // Simple fallback colors
                      }}
                    ></div>
                  </div>
                  <div className="card-stats">
                    <span>Used <strong>{item.used}</strong> Days</span>
                    <span>Remaining <strong>{item.limit - item.used}</strong> Days</span>
                  </div>
                </div>
              </motion.div>
            )})}
          </motion.section>

          {/* Main Layout Grid */}
          <div className="main-layout-grid">
            {/* Left: Form */}
            <motion.div variants={itemVariants} className="form-panel">
               <div className="panel-header">
                  <FaPaperPlane className="panel-icon" />
                  <h2>Leave Request Form</h2>
               </div>
               
               <form onSubmit={handleSubmit} className="premium-form">
                  <div className="form-group-row">
                    <div className="form-group">
                        <label>Leave Type</label>
                        <div className="select-wrapper">
                            <select
                                value={formData.leaveType}
                                onChange={(e) => setFormData({...formData, leaveType: e.target.value})}
                                className="form-control"
                            >
                                {leaveTypesList.map((type) => (
                                    <option key={type.id} value={type.name}>
                                        {type.label_en || type.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                  </div>

                  <div className="form-group-row two-col">
                      <div className="form-group">
                          <label>Start Date</label>
                          <input
                            type="date"
                            className="form-control"
                            value={formData.startDate}
                            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                            required
                          />
                      </div>
                      <div className="form-group">
                          <label>End Date</label>
                          <input
                            type="date"
                            className="form-control"
                            value={formData.endDate}
                            min={formData.startDate}
                            onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                            required
                          />
                      </div>
                  </div>

                   {/* Conflict Warning */}
                   <AnimatePresence>
                    {checkingSchedule && (
                      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="status-msg loading">
                        <FaSpinner className="spin" /> Checking schedule...
                      </motion.div>
                    )}
                    {scheduleConflict && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="status-msg warning"
                      >
                        <FaExclamationTriangle />
                        <span>
                          <strong>Warning:</strong> Found {scheduleConflict.length} schedule conflict(s)
                        </span>
                      </motion.div>
                    )}
                   </AnimatePresence>

                  <div className="form-group">
                      <label>Reason</label>
                      <textarea
                        className="form-control textarea-autosize"
                        placeholder="Please specify the reason and additional details..."
                        value={formData.reason}
                        onChange={(e) => setFormData({...formData, reason: e.target.value})}
                        required
                        rows={4}
                      />
                  </div>

                  <div className="form-group">
                      <label>Attachment (If any)</label>
                      <div className="file-dropzone">
                          <input type="file" id="file" className="file-input" />
                          <label htmlFor="file" className="file-label">
                              <FaUpload className="upload-icon" />
                              <span>Click to upload or drag & drop</span>
                              <small>Supports PDF, JPG, PNG (Max 5MB)</small>
                          </label>
                      </div>
                  </div>

                  <div className="form-actions">
                      <button type="submit" className="btn-submit" disabled={submitting}>
                        {submitting ? <FaSpinner className="spin" /> : <>Submit Request <FaPaperPlane /></>}
                      </button>
                  </div>
               </form>
            </motion.div>

            {/* Right: History */}
            <motion.div variants={itemVariants} className="history-panel">
               <div className="panel-header">
                  <FaHistory className="panel-icon" />
                  <h2>Request History</h2>
               </div>
               
               <div className="history-list-wrapper">
                  {loading ? (
                    <div className="loading-state"><FaSpinner className="spin" /></div>
                  ) : history.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon"><FaHistory /></div>
                        <p>No request history found</p>
                    </div>
                  ) : (
                    <div className="history-cards">
                        {history.map((req) => (
                           <div key={req.id} className="history-card-item">
                              <div className="card-item-header">
                                  <div className="leave-type-pill">
                                     {getLeaveTypeInfo(req.leave_type).icon}
                                     {getLeaveTypeInfo(req.leave_type).label}
                                  </div>
                                  {getStatusBadge(req.status)}
                              </div>
                              <div className="card-item-body">
                                  <div className="date-range">
                                     <span>{new Date(req.start_date).toLocaleDateString("th-TH")}</span>
                                     <span className="arrow">→</span>
                                     <span>{new Date(req.endDate || req.end_date).toLocaleDateString("th-TH")}</span> 
                                  </div>
                                  <p className="reason-text">"{req.reason}"</p>
                              </div>
                           </div>
                        ))}
                    </div>
                  )}
               </div>
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* Popups */}
      <PopupDoneEmp
        isOpen={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        title={popupTitle}
        message={popupMessage}
      />
      
      <PopupErrorEmp
        isOpen={showErrorPopup}
        onClose={() => setShowErrorPopup(false)}
        title={popupTitle}
        message={popupMessage}
      />

      <PopupSentDataEmp
        isOpen={showSendingPopup}
        title="Sending Request..."
        message="Please wait, we are processing your request."
      />

      <PopupEmp
        isOpen={showWarningPopup}
        onClose={() => setShowWarningPopup(false)}
        title={popupTitle}
        message={popupMessage}
        type="warning"
      />
    </div>
  );
};

export default RequestLeavePage;
