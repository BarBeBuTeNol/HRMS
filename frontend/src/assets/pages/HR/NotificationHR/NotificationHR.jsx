import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HRLayout from "../../../Component/HR/HRLayout";
import "./NotificationHR.css";
import api from "../../../../services/api";
import { FaRegEnvelope, FaRegEnvelopeOpen } from "react-icons/fa";

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

const NotificationHR = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const userId = localStorage.getItem("userId") || 1;

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/notifications/${userId}`);
      // Sort by latest first if backend doesn't sort
      const sorted = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setNotifications(sorted);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
    } catch (err) {
      console.error("Error marking read:", err);
    }
  };

  const totalPages = Math.ceil(notifications.length / itemsPerPage);
  const currentNotifications = notifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <HRLayout>
      <div className="noti-hr-wrapper">
        <motion.div
          className="noti-hr-header-section"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="noti-hr-title-box">
            <h2 className="noti-hr-page-title">Notifications</h2>
            <p className="noti-hr-subtitle">Stay updated with your latest alerts and requests</p>
          </div>
          <div className="noti-hr-stats">
            <div className="stat-badge">
              <span className="stat-value">{notifications.filter(n => !n.is_read).length}</span>
              <span className="stat-label">Unread</span>
            </div>
            <div className="stat-badge total">
              <span className="stat-value">{notifications.length}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>
        </motion.div>

        <div className="noti-hr-content">
          <AnimatePresence mode="wait">
            <motion.div
              className="noti-list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {notifications.length === 0 && !loading && (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <p>No notifications right now.</p>
                </div>
              )}
              
              {loading && (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading your notifications...</p>
                </div>
              )}
              
              {!loading && currentNotifications.map((noti) => (
                <motion.div
                  key={noti.id}
                  className={`noti-item ${noti.is_read ? "read" : "unread"}`}
                  onClick={() => markAsRead(noti.id)}
                  whileHover={{ scale: 1.01, translateX: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="noti-icon" style={{ color: noti.is_read ? "#94a3b8" : "#fbbf24" }}>
                    {noti.is_read ? <FaRegEnvelopeOpen /> : <FaRegEnvelope />}
                  </div>
                  <div className="noti-content">
                    <p className="noti-msg">{noti.message}</p>
                    <span className="noti-time">
                      {timeAgo(noti.created_at)}
                    </span>
                  </div>
                  {!noti.is_read && <div className="unread-pulse" />}
                </motion.div>
              ))}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="noti-pagination">
                  <button 
                    className="page-btn" 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    &laquo; Previous
                  </button>
                  <span className="page-info">
                    Page <span className="highlight">{currentPage}</span> of {totalPages}
                  </span>
                  <button 
                    className="page-btn" 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next &raquo;
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </HRLayout>
  );
};

export default NotificationHR;
