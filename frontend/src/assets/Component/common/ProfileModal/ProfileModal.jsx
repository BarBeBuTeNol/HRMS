import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaUserCircle,
  FaIdBadge,
  FaEnvelope,
  FaPhone,
  FaUserTag,
} from "react-icons/fa";
import "./ProfileModal.css";

const ProfileModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

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
          className="profile-modal-content"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="profile-close-btn" onClick={onClose}>
            <FaTimes />
          </button>

          <div className="profile-header-bg">
            <div className="profile-avatar-wrapper">
              <FaUserCircle className="profile-avatar-icon" />
            </div>
          </div>

          <div className="profile-body">
            <h2 className="profile-name">{user.username || "User"}</h2>
            <span className="profile-role-badge">
              {user.role || "Employee"}
            </span>

            <div className="profile-details-grid">
              <div className="detail-item">
                <FaIdBadge className="detail-icon" />
                <div className="detail-text">
                  <label>Emp ID</label>
                  <span>{user.empId || user.id || "-"}</span>
                </div>
              </div>

              <div className="detail-item">
                <FaUserTag className="detail-icon" />
                <div className="detail-text">
                  <label>First Name</label>
                  <span>{user.firstName || "-"}</span>
                </div>
              </div>

              <div className="detail-item">
                <FaUserTag className="detail-icon" />
                <div className="detail-text">
                  <label>Last Name</label>
                  <span>{user.lastName || "-"}</span>
                </div>
              </div>

              <div className="detail-item">
                <FaEnvelope className="detail-icon" />
                <div className="detail-text">
                  <label>Email</label>
                  <span>{user.email || "-"}</span>
                </div>
              </div>

              <div className="detail-item full-width">
                <FaPhone className="detail-icon" />
                <div className="detail-text">
                  <label>Telephone</label>
                  <span>{user.telephone || "-"}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfileModal;
