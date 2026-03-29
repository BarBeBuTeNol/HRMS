import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import HRLayout from "../../../Component/HR/HRLayout";
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
    } catch (err) {
      alert("Failed to delete announcement");
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
    } catch (err) {
      alert("Failed to update announcement");
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
      <div className="ann-wrapper">
        <motion.div
          className="ann-header-section"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="ann-title-box">
            <h2 className="ann-page-title">Company Hub</h2>
            <p className="ann-subtitle">Stay updated with the latest news</p>
          </div>

          <div className="ann-actions">
            <button
              className="btn-primary"
              style={{
                padding: "0.8rem 1.5rem",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              onClick={() => navigate("/hr/create-announcement")}
            >
              ➕ Create New Announcement
            </button>
          </div>
        </motion.div>

        <div className="ann-content">
          <AnimatePresence mode="wait">
              <motion.div
                key="announcements"
                className="ann-grid"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {announcements.length === 0 && !loading && (
                  <div className="empty-state">No announcements yet.</div>
                )}
                {announcements.map((item) => (
                  <motion.div
                    className="ann-card glass-card"
                    key={item.id}
                    whileHover={{ y: -5 }}
                  >
                    <div className="ann-card-header">
                      <div className="ann-author">
                        <div className="avatar-placeholder">
                          {item.poster_name ? item.poster_name.charAt(0) : "A"}
                        </div>
                        <div>
                          <span className="author-name">
                            {item.poster_name || "Admin"}
                          </span>
                          <span className="post-date">
                            {timeAgo(item.created_at)}
                          </span>
                        </div>
                      </div>
                      {item.department_name && (
                        <span className="dept-badge">
                          {item.department_name}
                        </span>
                      )}
                    </div>

                    <div className="ann-card-body">
                      <h3 className="ann-post-title">{item.title}</h3>
                      <p className="ann-post-content">{item.content}</p>
                    </div>

                    <div className="ann-card-footer">
                      <button
                        className="icon-btn edit"
                        onClick={() => openModal("edit", item)}
                      >
                        ✏️
                      </button>
                      <button
                        className="icon-btn trash"
                        onClick={() => openModal("delete", item)}
                      >
                        🗑️
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
          </AnimatePresence>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="modal-overlay" onClick={closeModal}>
              <motion.div
                className="modal-box glass-modal"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                {modalType === "delete" ? (
                  <div className="confirm-delete">
                    <h3>Confirm Deletion</h3>
                    <p>Are you sure you want to delete this announcement?</p>
                    <div className="modal-actions">
                      <button onClick={closeModal}>Cancel</button>
                      <button
                        className="btn-danger"
                        onClick={handleDeleteAnnouncement}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleEditAnnouncement} className="edit-form">
                    <h3>Edit Announcement</h3>
                    <div className="form-group">
                      <label>Title</label>
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Content</label>
                      <textarea
                        value={editMessage}
                        onChange={(e) => setEditMessage(e.target.value)}
                        rows={5}
                        required
                      />
                    </div>
                    <div className="modal-actions">
                      <button type="button" onClick={closeModal}>
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary">
                        Save Changes
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </HRLayout>
  );
};

export default Announcements;
