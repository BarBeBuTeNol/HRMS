import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaIdBadge,
  FaEnvelope,
  FaPhone,
  FaBriefcase,
  FaBuilding,
  FaUserShield,
} from "react-icons/fa";
import "./ProfileModal.css";

const ProfileModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  // Mapping logic to handle both basic and enriched profile objects
  const profile = {
    name: user.full_name || user.username || "User",
    role: user.role_name || user.role || "HR",
    id: user.work?.empCode || user.empId || user.id || "-",
    email: user.email || "-",
    phone: user.phone || user.telephone || "-",
    department: user.work?.department || user.department || "General",
    jobTitle: user.work?.jobTitle || user.job_position || "Staff",
    avatar: user.profile_pic || user.profile_image_url || null
  };

  const isHR = profile.role.toLowerCase().includes("hr") || profile.role.toLowerCase().includes("human");
  const themeClass = isHR ? "theme-hr" : "theme-chro";
  const themeColorURL = isHR ? "3b82f6" : "c5a059";

  const avatarUrl = profile.avatar || `https://ui-avatars.com/api/?name=${profile.name}&background=${themeColorURL}&color=fff&bold=true`;

  return (
    <AnimatePresence>
      <motion.div
        className="profile-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={`profile-modal-content ${themeClass}`}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="profile-close-btn" onClick={onClose} title="Close">
            <FaTimes />
          </button>

          <div className="profile-header-premium">
             <div className="profile-banner"></div>
             <div className="profile-avatar-container">
               <div className="avatar-ring"></div>
               <img src={avatarUrl} alt="Avatar" className="premium-avatar-img" />
             </div>
          </div>

          <div className="profile-body-premium">
            <div className="profile-meta-top">
              <h2 className="premium-name">{profile.name}</h2>
              <span className="premium-role-badge">
                <FaUserShield size={10} style={{ marginRight: '6px' }} />
                {profile.role}
              </span>
            </div>

            <div className="premium-details-grid">
              <div className="prem-detail-card">
                <FaIdBadge className="prem-icon" />
                <div className="prem-text">
                  <label>Employee ID</label>
                  <span>{profile.id}</span>
                </div>
              </div>

              <div className="prem-detail-card">
                <FaBuilding className="prem-icon" />
                <div className="prem-text">
                  <label>Department</label>
                  <span>{profile.department}</span>
                </div>
              </div>

              <div className="prem-detail-card">
                <FaBriefcase className="prem-icon" />
                <div className="prem-text">
                  <label>Job Title</label>
                  <span>{profile.jobTitle}</span>
                </div>
              </div>

              <div className="prem-detail-card">
                <FaEnvelope className="prem-icon" />
                <div className="prem-text">
                  <label>Primary Email</label>
                  <span>{profile.email}</span>
                </div>
              </div>

              <div className="prem-detail-card full">
                <FaPhone className="prem-icon" />
                <div className="prem-text">
                  <label>Telephone</label>
                  <span>{profile.phone}</span>
                </div>
              </div>
            </div>
            
            <div className="profile-footer-premium">
              <p>Member of HR Management System</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfileModal;
