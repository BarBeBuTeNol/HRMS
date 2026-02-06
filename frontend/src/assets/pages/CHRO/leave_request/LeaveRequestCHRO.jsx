import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import CHROLayout from "../../../Component/CHRO/CHROLayout";
import "./LeaveRequestCHRO.css";
import api from "../../../../services/api";
import LoadingCHRO from "../../../Component/loading/loading-chro/LoadingCHRO";
import { PopupDoneCHRO } from "../../../Component/poup_done/Popup_done";
import PopupSentDataChro from "../../../Component/popup-sent-data/popup-sent-data-chro/PopupSentDataChro";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Send,
  History,
  Briefcase,
  ChevronDown,
  CalendarDays,
} from "lucide-react";

const LeaveRequestCHRO = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [history, setHistory] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [formData, setFormData] = useState({
    leave_type: "Personal Leave",
    start_date: "",
    end_date: "",
    reason: "",
  });

  const userId = localStorage.getItem("userId") || 1; // Default fallback

  const fetchHistory = async () => {
    try {
      const response = await api.get(`/leave-requests/${userId}`);
      setHistory(response.data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.start_date || !formData.end_date || !formData.reason) {
      alert("Please fill all fields");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post("/chro/leave-request", {
        user_id: userId,
        ...formData,
      });

      // Show success popup
      setShowSuccess(true);

      // Reset form
      setFormData({
        leave_type: "Personal Leave",
        start_date: "",
        end_date: "",
        reason: "",
      });
      fetchHistory();
    } catch (err) {
      alert("Failed to submit request");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // CHRO Specific Popups
  // CHRO Specific Popups

  const CHROSuccessPopup = () => {
    const [timeLeft, setTimeLeft] = useState(3);

    useEffect(() => {
      if (showSuccess) {
        const timer = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              navigate("/chro/dashboard");
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        return () => clearInterval(timer);
      }
    }, [showSuccess]);

    return (
      <div style={{ position: "relative" }}>
        <PopupDoneCHRO
          isVisible={showSuccess}
          onClose={() => setShowSuccess(false)}
          text="Request Authorized"
          subText={`Redirecting to Dashboard in ${timeLeft}s...`}
        />
      </div>
    );
  };

  // Calculate stats
  const totalLeaves = history.length;
  // Assuming approved immediately
  const thisMonthLeaves = history.filter((item) => {
    const date = new Date(item.start_date);
    const now = new Date();
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }).length;

  return (
    <CHROLayout disableInitialLoading={true}>
      {loading ? (
        createPortal(
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#0f172a",
              zIndex: 99999, // Extremely high z-index
            }}
          >
            <LoadingCHRO />
          </div>,
          document.body,
        )
      ) : (
        <div className="chro-leave-request-container">
          {/* Header */}
          <div className="leave-header-section">
            <div className="leave-title-group">
              <h1>Executive Leave Portal</h1>
              <p>Manage your time off and schedule delegation</p>
            </div>
            <div className="leave-stats-row">
              <div className="stat-metric-card">
                <div className="stat-icon-circle">
                  <Briefcase size={24} />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{totalLeaves}</span>
                  <span className="stat-label">Total History</span>
                </div>
              </div>
              <div className="stat-metric-card">
                <div className="stat-icon-circle">
                  <Calendar size={24} />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{thisMonthLeaves}</span>
                  <span className="stat-label">This Month</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="leave-content-grid">
            {/* Left: Form */}
            <div className="leave-form-panel">
              <div className="panel-header">
                <h2>New Leave Request</h2>
                <p>
                  Submit a new request. This will be auto-approved and logged.
                </p>
              </div>
              <form onSubmit={handleSubmit}>
                <div
                  className="leave-form-group"
                  style={{ position: "relative", zIndex: 20 }}
                >
                  <label>Leave Type</label>
                  <div
                    className={`custom-select-trigger ${
                      isDropdownOpen ? "open" : ""
                    }`}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <span>{formData.leave_type}</span>
                    <ChevronDown
                      size={18}
                      className={`select-chevron ${
                        isDropdownOpen ? "rotate" : ""
                      }`}
                    />
                  </div>
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        className="custom-select-options"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {[
                          "Sick Leave",
                          "Personal Leave",
                          "Vacation Leave",
                          "Other",
                        ].map((type) => (
                          <div
                            key={type}
                            className={`custom-option ${
                              formData.leave_type === type ? "selected" : ""
                            }`}
                            onClick={() => {
                              setFormData({ ...formData, leave_type: type });
                              setIsDropdownOpen(false);
                            }}
                          >
                            {type}
                            {formData.leave_type === type && (
                              <CheckCircle size={14} color="#10b981" />
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="form-group-row">
                  <div className="leave-form-group">
                    <label>Start Date</label>
                    <div className="date-input-wrapper">
                      <input
                        type="date"
                        name="start_date"
                        min={new Date().toISOString().split("T")[0]} // Restrict past dates
                        value={formData.start_date}
                        onChange={handleChange}
                        className="leave-input date-field"
                        required
                      />
                      <CalendarDays className="field-icon" size={18} />
                    </div>
                  </div>
                  <div className="leave-form-group">
                    <label>End Date</label>
                    <div className="date-input-wrapper">
                      <input
                        type="date"
                        name="end_date"
                        min={new Date().toISOString().split("T")[0]} // Restrict past dates
                        value={formData.end_date}
                        onChange={handleChange}
                        className="leave-input date-field"
                        required
                      />
                      <CalendarDays className="field-icon" size={18} />
                    </div>
                  </div>
                </div>

                <div className="leave-form-group">
                  <label>Reason / Details</label>
                  <textarea
                    name="reason"
                    rows="4"
                    value={formData.reason}
                    onChange={handleChange}
                    className="leave-textarea"
                    placeholder="Official reason for record..."
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  <Send size={18} />
                  {loading ? "Processing..." : "Submit Request"}
                </button>
              </form>
            </div>

            {/* Right: History */}
            <div className="history-panel-container">
              <div className="panel-header" style={{ marginBottom: "1rem" }}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <History size={24} color="#fbbf24" />
                  <h2 style={{ margin: 0 }}>Recent Activity</h2>
                </div>
              </div>

              {history.length === 0 ? (
                <div className="empty-state">
                  <FileText
                    size={48}
                    style={{ opacity: 0.5, marginBottom: "1rem" }}
                  />
                  <h3>No Records Found</h3>
                  <p>Your leave history will appear here.</p>
                </div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="history-card">
                    <div className="history-info">
                      <span className="history-type">
                        {item.leave_type === "Sick Leave" && (
                          <AlertCircle size={18} color="#ef4444" />
                        )}
                        {item.leave_type === "Vacation Leave" && (
                          <Briefcase size={18} color="#22c55e" />
                        )}
                        {item.leave_type === "Personal Leave" && (
                          <Clock size={18} color="#fbbf24" />
                        )}
                        {item.leave_type}
                      </span>
                      <span className="history-dates">
                        {new Date(item.start_date).toLocaleDateString()} -{" "}
                        {new Date(item.end_date).toLocaleDateString()}
                        <span style={{ opacity: 0.5 }}>• {item.reason}</span>
                      </span>
                    </div>
                    <div
                      className={`history-status status-${item.status.toLowerCase()}`}
                    >
                      {item.status}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      <button style={{ display: "none" }} onClick={() => setShowSuccess(false)}>
        Close Popup Helper
      </button>

      {/* Render Popups */}
      <PopupSentDataChro isVisible={isSubmitting} />
      <CHROSuccessPopup />
    </CHROLayout>
  );
};

export default LeaveRequestCHRO;
