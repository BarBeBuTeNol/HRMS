import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaGraduationCap,
  FaBriefcase,
  FaUser,
  FaTimes,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaCalendarAlt,
  FaStar,
} from "react-icons/fa";
import api from "../../../../services/api"; // Adjust import path
import "./EmployeeInsightModal.css";

const EmployeeInsightModal = ({ empId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("education");

  useEffect(() => {
    if (empId) {
      fetchInsights();
    }
  }, [empId]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/head/employee-insights/${empId}`);
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch insights", error);
    } finally {
      setLoading(false);
    }
  };

  if (!empId) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="insight-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="insight-modal-content"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="insight-header">
            <div className="insight-header-left">
              <div className="insight-avatar-wrapper">
                <img
                  src={
                    data?.profile_image_url ||
                    `https://ui-avatars.com/api/?name=${data?.first_name}+${data?.last_name}&background=c5a059&color=fff`
                  }
                  alt="Profile"
                  className="insight-avatar"
                />
              </div>
              <div className="insight-title-group">
                <h2>
                  {data?.first_name} {data?.last_name}
                </h2>
                <span className="insight-subtitle">
                  {data?.position_name || "No Position"}
                </span>
              </div>
            </div>
            <button className="insight-close-btn" onClick={onClose}>
              <FaTimes />
            </button>
          </div>

          {/* Tabs */}
          <div className="insight-tabs">
            <button
              className={`tab-btn ${activeTab === "education" ? "active" : ""}`}
              onClick={() => setActiveTab("education")}
            >
              <FaGraduationCap /> Education & Skills
            </button>
            <button
              className={`tab-btn ${activeTab === "work" ? "active" : ""}`}
              onClick={() => setActiveTab("work")}
            >
              <FaBriefcase /> Work Insights
            </button>
            <button
              className={`tab-btn ${activeTab === "personal" ? "active" : ""}`}
              onClick={() => setActiveTab("personal")}
            >
              <FaUser /> Personal Info
            </button>
          </div>

          {/* Body */}
          <div className="insight-body">
            {loading ? (
              <div className="insight-loading">
                <div className="spinner"></div>
                <p>Loading insights...</p>
              </div>
            ) : (
              <div className="insight-panel">
                {activeTab === "education" && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="panel-content"
                  >
                    <div className="insight-section">
                      <h3>
                        <FaGraduationCap /> Education
                      </h3>
                      <div className="info-grid">
                        <InfoItem label="Level" value={data?.education_level} />
                        <InfoItem
                          label="Institution"
                          value={data?.institution}
                        />
                        {/* Program isn't in SQL yet, but good to have if added later */}
                      </div>
                    </div>
                    <div className="insight-section">
                      <h3>
                        <FaStar /> Skills
                      </h3>
                      <div className="skills-tags">
                        {data?.skills ? (
                          data.skills.split(",").map((skill, i) => (
                            <span key={i} className="skill-tag">
                              {skill.trim()}
                            </span>
                          ))
                        ) : (
                          <span className="no-data">No skills listed</span>
                        )}
                      </div>
                    </div>
                    <div className="insight-section">
                      <h3>
                        <FaBriefcase /> Previous Experience
                      </h3>
                      <p className="text-desc">
                        {data?.previous_experience ||
                          "No previous experience record."}
                      </p>
                    </div>
                  </motion.div>
                )}

                {activeTab === "work" && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="panel-content"
                  >
                    <div className="insight-section">
                      <h3>
                        <FaBriefcase /> Performance Review
                      </h3>
                      <p className="text-desc">
                        {data?.performance_review || "No reviews recorded."}
                      </p>
                    </div>
                    <div className="insight-section">
                      <h3>
                        <FaGraduationCap /> Training History
                      </h3>
                      <p className="text-desc">
                        {data?.training_info || "No training records."}
                      </p>
                    </div>
                    <div className="insight-section">
                      <h3>Status</h3>
                      <span
                        className={`status-badge status-${data?.employment_status?.toLowerCase().replace(" ", "-") || "inactive"}`}
                      >
                        {data?.employment_status || "Unknown"}
                      </span>
                    </div>
                  </motion.div>
                )}

                {activeTab === "personal" && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="panel-content"
                  >
                    <div className="insight-section">
                      <h3>
                        <FaUser /> Contact Details
                      </h3>
                      <div className="info-list">
                        <InfoItemIcon
                          icon={<FaPhoneAlt />}
                          label="Phone"
                          value={data?.phone}
                        />
                        <InfoItemIcon
                          icon={<FaEnvelope />}
                          label="Email"
                          value={data?.email}
                        />
                        <InfoItemIcon
                          icon={<FaMapMarkerAlt />}
                          label="Address"
                          value={data?.address}
                        />
                        <InfoItemIcon
                          icon={<FaCalendarAlt />}
                          label="Birthdate"
                          value={
                            data?.birthdate
                              ? new Date(data.birthdate).toLocaleDateString()
                              : "N/A"
                          }
                        />
                      </div>
                    </div>
                    <div className="insight-section">
                      <h3>
                        <FaPhoneAlt /> Emergency Contact
                      </h3>
                      <div className="info-grid">
                        <InfoItem
                          label="Name"
                          value={data?.emergency_contact_name}
                        />
                        <InfoItem
                          label="Phone"
                          value={data?.emergency_contact_phone}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const InfoItem = ({ label, value }) => (
  <div className="info-item">
    <span className="label">{label}</span>
    <span className="value">{value || "-"}</span>
  </div>
);

const InfoItemIcon = ({ icon, label, value }) => (
  <div className="info-item-icon">
    <div className="icon-box">{icon}</div>
    <div className="text-box">
      <span className="label">{label}</span>
      <span className="value">{value || "-"}</span>
    </div>
  </div>
);

export default EmployeeInsightModal;
