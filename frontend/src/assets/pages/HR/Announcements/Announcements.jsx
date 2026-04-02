import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaEdit, 
  FaTrashAlt, 
  FaPlus, 
  FaBullhorn, 
  FaUserAlt, 
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle
} from "react-icons/fa";
import HRLayout from "../../../Component/HR/HRLayout";
import PopupHR from "../../../Component/popup_notifications/popup_notifications-hr/PopupHR";
import "./Announcements.css";
import api from "../../../../services/api";

// Helper for relative time (e.g., "2 hours ago")
const timeAgo = (dateMsg) => {
  const date = new Date(dateMsg);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const Announcements = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null); // 'edit' | 'delete'
  const [selectedItem, setSelectedItem] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editMessage, setEditMessage] = useState("");

  // Popup Notification State
  const [popup, setPopup] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const userId = localStorage.getItem("userId") || 1; // Fallback to 1 for dev

  const fetchData = async () => {
    setLoading(true);
    try {
      const annRes = await api.get("/announcements");
      setAnnouncements(annRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  // Handlers for Announcements (Edit/Delete)
  const handleDeleteAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await api.delete(`/announcements/${selectedItem.id}`);
      fetchData();
      closeModal();
      setPopup({
        isOpen: true,
        title: "Deleted",
        message: "The announcement has been removed successfully.",
        type: "success"
      });
    } catch (err) {
      setPopup({
        isOpen: true,
        title: "Delete Failed",
        message: "Could not remove announcement. Please try again.",
        type: "error"
      });
    }
  };

  const handleEditAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/announcements/${selectedItem.id}`, {
        title: editTitle,
        content: editMessage,
      });
      fetchData();
      closeModal();
      setPopup({
        isOpen: true,
        title: "Updated",
        message: "Announcement was updated successfully.",
        type: "success"
      });
    } catch (err) {
      setPopup({
        isOpen: true,
        title: "Update Failed",
        message: "Failed to save changes.",
        type: "error"
      });
    }
  };

  const openModal = (type, item) => {
    setModalType(type);
    setSelectedItem(item);
    if (type === "edit") {
      setEditTitle(item.title);
      setEditMessage(item.content);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  return (
    <HRLayout>
      <div className="ann-wrapper-premium">
        {/* Background Animation blobs */}
        <div className="ann-bg-blobs">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>

        <motion.div
          className="ann-header-premium"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="ann-title-group">
            <h2 className="ann-main-title">
              <FaBullhorn className="title-icon" /> Company Hub
            </h2>
            <p className="ann-subtitle-premium">Keep everyone informed and engaged</p>
          </div>

          <div className="ann-actions-premium">
            <button
              className="btn-create-premium"
              onClick={() => navigate("/hr/create-announcement")}
            >
              <FaPlus /> New Announcement
            </button>
          </div>
        </motion.div>

        <div className="ann-content-area">
          <AnimatePresence mode="wait">
            <motion.div
              key="announcements-grid"
              className="ann-grid-premium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {announcements.length === 0 && !loading && (
                <div className="empty-state-card">
                  <FaExclamationTriangle />
                  <p>No announcements found.</p>
                </div>
              )}
              {announcements.map((item) => (
                <motion.div
                  className="ann-card-premium"
                  key={item.id}
                  layout
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  <div className="card-accent-bar"></div>
                  <div className="ann-card-header-premium">
                    <div className="ann-author-box">
                      <div className="avatar-premium">
                        {item.poster_name ? item.poster_name.charAt(0) : "A"}
                      </div>
                      <div className="author-details">
                        <span className="name-premium">
                          {item.poster_name || "Admin"}
                        </span>
                        <span className="time-premium">
                          <FaClock /> {timeAgo(item.created_at)}
                        </span>
                      </div>
                    </div>
                    {item.department_name && (
                      <span className="dept-tag-premium">
                        {item.department_name}
                      </span>
                    )}
                  </div>

                  <div className="ann-card-body-premium">
                    <h3 className="ann-title-text">{item.title}</h3>
                    <p className="ann-body-text">{item.content}</p>
                  </div>

                  <div className="ann-card-footer-premium">
                    <button
                      className="icon-action-btn edit-btn"
                      onClick={() => openModal("edit", item)}
                      title="Edit Post"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="icon-action-btn delete-btn"
                      onClick={() => openModal("delete", item)}
                      title="Delete Post"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Modal System */}
        <AnimatePresence>
          {showModal && (
            <div className="modal-overlay-premium" onClick={closeModal}>
              <div className="modal-bg-blur"></div>
              <motion.div
                className={`modal-content-premium ${modalType === 'delete' ? 'delete-ann-modal' : ''}`}
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
              >
                {modalType === "delete" ? (
                  <div className="confirm-delete-box">
                    <div className="danger-icon-glow">
                      <FaTrashAlt />
                    </div>
                    <h3>Confirm Removal</h3>
                    <p>Are you sure you want to permanently delete this announcement?</p>
                    <div className="delete-target-card">
                       "{selectedItem.title}"
                    </div>
                    <div className="premium-modal-actions">
                      <button className="btn-cancel-premium" onClick={closeModal}>Cancel</button>
                      <button
                        className="btn-confirm-delete"
                        onClick={handleDeleteAnnouncement}
                      >
                        Delete Now
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleEditAnnouncement} className="premium-edit-form">
                    <div className="edit-modal-header">
                       <FaEdit /> <h3>Edit Post</h3>
                    </div>
                    <div className="premium-form-group">
                      <label>Headline</label>
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Enter catchy title..."
                        required
                      />
                    </div>
                    <div className="premium-form-group">
                      <label>Message</label>
                      <textarea
                        value={editMessage}
                        onChange={(e) => setEditMessage(e.target.value)}
                        rows={6}
                        placeholder="Share something with the company..."
                        required
                      />
                    </div>
                    <div className="premium-modal-actions">
                      <button type="button" className="btn-cancel-premium" onClick={closeModal}>
                        Withdraw
                      </button>
                      <button type="submit" className="btn-save-premium">
                        Apply Changes
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <PopupHR
          isOpen={popup.isOpen}
          onClose={() => setPopup({ ...popup, isOpen: false })}
          title={popup.title}
          message={popup.message}
          type={popup.type}
          autoClose={true}
          duration={3000}
        />
      </div>
    </HRLayout>
  );
};

export default Announcements;
