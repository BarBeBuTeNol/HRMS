import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import EmployeeSidebar from "../../../Component/Employee/EmployeeSidebar"; // Integration
import "./NotificationPage.css";

// Import Icons
import {
  FaBell,
  FaBullhorn,
  FaTasks,
  FaCalendarCheck,
  FaInfoCircle,
  FaCheckDouble,
  FaClock,
  FaFilter,
  FaTrashAlt,
} from "react-icons/fa";

const NotificationPage = () => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all', 'unread', 'announcement'

  // Fetch Notifications
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("currentUser"));
    if (storedUser) {
      setUser(storedUser);
      fetchNotifications(storedUser.id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchNotifications = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/notifications/${userId}`
      );
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id, currentStatus) => {
    if (currentStatus === 1) return;

    try {
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`);

      // Optimistic Update
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, is_read: 1 } : notif
        )
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const getIconByType = (type) => {
    switch (type) {
      case "announcement":
        return <FaBullhorn />;
      case "task_assignment":
        return <FaTasks />;
      case "leave_status":
        return <FaCalendarCheck />;
      case "system":
        return <FaInfoCircle />;
      default:
        return <FaBell />;
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("th-TH", options);
  };

  // Filter Logic
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return n.is_read === 0;
    if (filter === "announcement") return n.type === "announcement";
    return true;
  });

  const unreadCount = notifications.filter((n) => n.is_read === 0).length;

  if (loading) {
    return (
      <div className="notification-layout loading">
        <div className="notification-loader"></div>
      </div>
    );
  }

  return (
    <div className="notification-layout">
      {/* 1. Sidebar Integration */}
      <EmployeeSidebar />

      <div className="notification-main-content">
        <div className="notification-container">
          {/* Header Section */}
          <header className="notification-page-header">
            <div className="header-title">
              <h1>Notifications</h1>
              <p>Stay updated with your latest alerts and announcements</p>
            </div>
            <div className="header-stats">
              <div className="stat-badge">
                <span className="stat-value">{unreadCount}</span>
                <span className="stat-label">Unread</span>
              </div>
            </div>
          </header>

          {/* Controls & Filter */}
          <div className="notification-controls">
            <div className="filter-tabs">
              <button
                className={`filter-btn ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                All
              </button>
              <button
                className={`filter-btn ${filter === "unread" ? "active" : ""}`}
                onClick={() => setFilter("unread")}
              >
                Unread
              </button>
              <button
                className={`filter-btn ${
                  filter === "announcement" ? "active" : ""
                }`}
                onClick={() => setFilter("announcement")}
              >
                Announcements
              </button>
            </div>

            {/* Visual Only for now */}
            <button className="clear-btn" disabled={unreadCount === 0}>
              <FaCheckDouble /> Mark all as read
            </button>
          </div>

          {/* List Section */}
          <div className="notification-scroll-area">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className={`notification-card ${
                      notif.is_read ? "read" : "unread"
                    } type-${notif.type}`}
                    onClick={() => handleMarkAsRead(notif.id, notif.is_read)}
                  >
                    {/* Glow Effect Element */}
                    <div className="card-glow"></div>

                    <div className="card-icon-wrapper">
                      {getIconByType(notif.type)}
                    </div>

                    <div className="card-content">
                      <div className="card-header-row">
                        <span className="card-type-label">
                          {notif.type.replace("_", " ")}
                        </span>
                        <span className="card-time">
                          <FaClock size={10} style={{ marginRight: "4px" }} />{" "}
                          {formatDate(notif.created_at)}
                        </span>
                      </div>
                      <p className="card-message">{notif.message}</p>
                    </div>

                    {!notif.is_read && <div className="unread-dot"></div>}
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="empty-state-container"
                >
                  <div className="empty-icon">
                    <FaBell />
                  </div>
                  <h3>No notifications found</h3>
                  <p>Try changing your filters or check back later.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
