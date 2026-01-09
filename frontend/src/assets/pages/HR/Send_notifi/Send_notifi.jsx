import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { FaGlobeAsia, FaBuilding, FaPaperPlane } from "react-icons/fa";
import { MdCheckCircle, MdNotificationsActive } from "react-icons/md";
import HRLayout from "../../../Component/HR/HRLayout";
import PopupDone from "../../../Component/poup_done/Popup_done";
import "./Send_notifi.css";

const Send_notifi = () => {
  const navigate = useNavigate();

  // State
  const [audience, setAudience] = useState("all");
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/departments");
        setDepartments(res.data);
      } catch (err) {
        console.error("Failed to load departments", err);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    let timer;
    if (success && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (success && countdown === 0) {
      setSuccess(false);
      navigate("/hr/announcements");
    }
    return () => clearTimeout(timer);
  }, [success, countdown, navigate]);

  const handleAudienceChange = (type) => {
    setAudience(type);
    if (type === "all") {
      setSelectedDept(""); // Clear department when switching to All
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (audience === "department" && !selectedDept) {
      setError("Please select a department.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        title: "General Announcement", // Default title since input was removed
        message: message,
        target: audience,
        departmentId: audience === "department" ? selectedDept : null,
        postedBy: JSON.parse(localStorage.getItem("currentUser") || "{}").id,
      };

      await axios.post("http://localhost:5000/api/notifications/send", payload);

      setSuccess(true);
      setMessage("");
      setCountdown(3);
      if (audience === "department") setSelectedDept("");
    } catch (err) {
      console.error(err);
      setError("Failed to send notification. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getDeptColor = (id) => {
    const colors = [
      "linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)",
      "linear-gradient(135deg, #8b5cf6 0%, #f472b6 100%)",
      "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
      "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
      "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
    ];
    return colors[id % colors.length];
  };

  return (
    <HRLayout>
      <div className="notifi-wrapper">
        <motion.div
          className="notifi-card"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="notifi-header-compact">
            <div className="notifi-icon">
              <MdNotificationsActive />
            </div>
            <div>
              <h1 className="notifi-title">Create Announcement</h1>
              <p
                style={{
                  margin: 0,
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                }}
              >
                Send updates to employees or departments
              </p>
            </div>
          </div>

          <form className="notifi-form-compact" onSubmit={handleSubmit}>
            {/* Audience Selection */}
            <div className="form-group">
              <label>Target Audience</label>
              <div className="audience-selection">
                <div
                  className={`audience-card ${
                    audience === "all" ? "active" : ""
                  }`}
                  onClick={() => handleAudienceChange("all")}
                >
                  <div className="audience-icon" style={{ color: "#3b82f6" }}>
                    <FaGlobeAsia />
                  </div>
                  <div className="audience-title">All Company</div>
                  <div className="audience-desc">Broadcast to everyone</div>
                  {audience === "all" && (
                    <motion.div
                      layoutId="active-check"
                      className="check-indicator"
                      style={{ color: "#3b82f6" }}
                    >
                      <MdCheckCircle />
                    </motion.div>
                  )}
                </div>

                <div
                  className={`audience-card ${
                    audience === "department" ? "active" : ""
                  }`}
                  onClick={() => handleAudienceChange("department")}
                >
                  <div className="audience-icon" style={{ color: "#ec4899" }}>
                    <FaBuilding />
                  </div>
                  <div className="audience-title">Department</div>
                  <div className="audience-desc">Specific team only</div>
                  {audience === "department" && (
                    <motion.div
                      layoutId="active-check"
                      className="check-indicator"
                      style={{ color: "#ec4899" }}
                    >
                      <MdCheckCircle />
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Department Selection Grid */}
            <AnimatePresence>
              {audience === "department" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="form-group"
                  style={{ overflow: "hidden" }}
                >
                  <label>Select Department</label>
                  <div className="dept-grid">
                    {departments.map((dept) => (
                      <motion.div
                        key={dept.id}
                        whileHover={{ scale: 1.05, rotate: 1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`dept-card ${
                          selectedDept === dept.id ? "selected" : ""
                        }`}
                        onClick={() => setSelectedDept(dept.id)}
                        style={{
                          background:
                            selectedDept === dept.id
                              ? getDeptColor(dept.id)
                              : "var(--bg-primary)",
                        }}
                      >
                        <span className="dept-name">
                          {dept.department_name}
                        </span>
                        {selectedDept === dept.id && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="dept-check"
                          >
                            <MdCheckCircle />
                          </motion.span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Message Field */}
            <div className="form-group">
              <label>Message</label>
              <textarea
                className="input-field textarea"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message details here..."
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <p style={{ color: "#ef4444", fontSize: "0.9rem", margin: 0 }}>
                {error}
              </p>
            )}

            {/* Action Buttons */}
            <div className="form-actions-right">
              <button
                type="submit"
                className="btn-primary"
                disabled={
                  loading || (audience === "department" && !selectedDept)
                }
              >
                {loading ? (
                  "Sending..."
                ) : (
                  <>
                    <FaPaperPlane /> Send Notification
                  </>
                )}
              </button>
            </div>

            {/* Success Popup */}
            <PopupDone
              isVisible={success}
              onClose={() => setSuccess(false)}
              text="Sent Successfully!"
              subText={`Redirecting to Announcements in ${countdown}...`}
            />
          </form>
        </motion.div>
      </div>
    </HRLayout>
  );
};

export default Send_notifi;
