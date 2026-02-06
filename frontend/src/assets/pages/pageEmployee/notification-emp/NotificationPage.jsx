import React, { useState, useEffect } from "react";
import api from "../../../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import EmployeeSidebar from "../../../Component/Employee/EmployeeSidebar";
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
  FaRegCalendarAlt,
  FaTimes,
  FaCheck
} from "react-icons/fa";

// --- Detail Modal Component ---
const NotificationDetailModal = ({ notification, onClose, onRead }) => {
  if (!notification) return null;

  const handleRead = () => {
    onRead(notification.id);
    onClose();
  };

  const safeType = notification.type || "system";
  
  // Icon and Label Helpers specific to modal usage
  const getModalIcon = (type) => {
    switch (type) {
      case "announcement": return <FaBullhorn />;
      case "task_assignment": return <FaTasks />;
      case "leave_status": return <FaCalendarCheck />;
      case "system": return <FaInfoCircle />;
      default: return <FaBell />;
    }
  };

  return (
    <motion.div 
      className="notification-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="notification-modal-content"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-decoration">
           <div className="modal-icon-large">
             {getModalIcon(safeType)}
           </div>
        </div>
        
        <div className="modal-type-badge">
          {safeType.replace("_", " ")}
        </div>

        <p className="modal-time">
          {new Date(notification.created_at).toLocaleString("th-TH")}
        </p>

        <p className="modal-message">
          {notification.message}
        </p>

        <div className="modal-actions">
           <button className="modal-btn secondary" onClick={onClose}>
             Close
           </button>
           
           {!notification.is_read && (
             <button className="modal-btn primary" onClick={handleRead}>
               <FaCheck style={{marginRight:'8px'}}/> Mark as Read
             </button>
           )}
        </div>

      </motion.div>
    </motion.div>
  );
};


const NotificationPage = () => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all', 'unread', 'announcement', 'task'
  const [selectedNotification, setSelectedNotification] = useState(null); // For Modal

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
      const response = await api.get(`/notifications/${userId}`);
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Actions ---
  const handleCardClick = (notif) => {
    setSelectedNotification(notif);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      // Optimistic Update
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, is_read: 1 } : notif
        )
      );
      // Update selected notification if it's the same one (to hide button)
      if (selectedNotification && selectedNotification.id === id) {
          setSelectedNotification({...selectedNotification, is_read: 1});
      }

    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (notifications.every(n => n.is_read === 1)) return;
    
    // Optimistic update all locally first
    const updated = notifications.map(n => ({ ...n, is_read: 1 }));
    setNotifications(updated);

    try {
       // Ideally you would have a bulk mark-read endpoint, 
       // but looping here if backend doesn't support bulk yet.
       const unread = notifications.filter(n => n.is_read === 0);
       for(let n of unread) {
          await api.put(`/notifications/${n.id}/read`);
       }

    } catch (error) {
       console.error("Error marking all read", error);
       // Revert on serious error if needed, or just let next fetch sync it.
       fetchNotifications(user.id);
    }
  }

  // Helper: Get Icon
  const getIconByType = (type) => {
    const safeType = type || "system";
    switch (safeType) {
      case "announcement": return <FaBullhorn />;
      case "task_assignment": return <FaTasks />;
      case "leave_status": return <FaCalendarCheck />;
      case "system": return <FaInfoCircle />;
      default: return <FaBell />;
    }
  };

  // Helper: Format Time
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Grouping Logic
  const getGroupedNotifications = () => {
    let filtered = notifications;
    
    // Filter Logic Fix
    if (filter === "unread") {
        filtered = notifications.filter(n => n.is_read === 0);
    } else if (filter === "announcement") {
        filtered = notifications.filter(n => n.type === "announcement");
    } else if (filter === "task") {
        filtered = notifications.filter(n => n.type === "task_assignment");
    }

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDate = (d1, d2) => 
      d1.getDate() === d2.getDate() && 
      d1.getMonth() === d2.getMonth() && 
      d1.getFullYear() === d2.getFullYear();

    const groups = {
      "Today": [],
      "Yesterday": [],
      "Earlier": []
    };

    filtered.forEach(notif => {
      const date = new Date(notif.created_at);
      if (isSameDate(date, today)) {
        groups["Today"].push(notif);
      } else if (isSameDate(date, yesterday)) {
        groups["Yesterday"].push(notif);
      } else {
        groups["Earlier"].push(notif);
      }
    });

    return groups;
  };

  const groupedNotifications = getGroupedNotifications();
  const unreadCount = notifications.filter((n) => n.is_read === 0).length;
  const readCount = notifications.filter((n) => n.is_read === 1).length;
  const totalCount = notifications.length;
  const hasNotifications = Object.values(groupedNotifications).some(arr => arr.length > 0);

  if (loading) {
    return (
      <div className="notification-layout loading">
         <div className="loading-container"> <div className="spinner"></div> </div>
      </div>
    );
  }

  return (
    <div className="notification-layout">
      {/* 1. Sidebar Integration */}
      <EmployeeSidebar />

      {/* Main Content */}
      <div className="notification-main-content">
        <div className="notification-container">
          {/* Header */}
          <header className="notification-page-header">
            <div className="header-title">
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Notifications
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Track your updates, tasks, and announcements.
              </motion.p>
            </div>
            
            <motion.div 
               className="header-stats"
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.3 }}
               style={{ display: 'flex', gap: '1rem' }}
            >
              <div className="stat-badge" style={{ borderColor: 'rgba(96, 165, 250, 0.3)', background: 'rgba(96, 165, 250, 0.1)' }}>
                <span className="stat-value" style={{ color: '#60a5fa' }}>{totalCount}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-badge">
                <span className="stat-value">{unreadCount}</span>
                <span className="stat-label">Unread</span>
              </div>
              <div className="stat-badge" style={{ borderColor: 'rgba(52, 211, 153, 0.3)', background: 'rgba(52, 211, 153, 0.1)' }}>
                <span className="stat-value" style={{ color: '#34d399' }}>{readCount}</span>
                <span className="stat-label">Read</span>
              </div>
            </motion.div>
          </header>

          {/* Controls */}
          <div className="notification-controls">
            <div className="filter-tabs">
              {['all', 'unread', 'announcement', 'task'].map((f) => (
                <button
                  key={f}
                  className={`filter-btn ${filter === f ? "active" : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {f === 'task' ? 'Tasks' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <button 
              className="mark-all-btn" 
              disabled={unreadCount === 0}
              onClick={handleMarkAllAsRead}
            >
              <FaCheckDouble /> Mark all read
            </button>
          </div>

          {/* List Area */}
          <div className="notification-scroll-area">
            <AnimatePresence mode="wait">
              {!hasNotifications ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="empty-state"
                >
                  <div className="empty-icon-box">
                    <FaRegCalendarAlt />
                  </div>
                  <h3>No notifications found</h3>
                  <p>You're all caught up! Check back later.</p>
                </motion.div>
              ) : (
                Object.entries(groupedNotifications).map(([groupTitle, items]) => (
                  items.length > 0 && (
                    <div key={groupTitle} className="notification-group">
                      <div className="group-header">
                         <span className="group-title">{groupTitle}</span>
                         <div className="group-line"></div>
                      </div>
                      
                      <AnimatePresence>
                        {items.map((notif, index) => (
                          <motion.div
                            key={notif.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className={`notification-card ${notif.is_read ? "read" : "unread"} type-${notif.type || 'system'}`}
                            onClick={() => handleCardClick(notif)}
                          >
                            <div className="card-icon-wrapper">
                              {getIconByType(notif.type)}
                            </div>

                            <div className="card-content">
                              <div className="card-header-row">
                                <span className="card-type-label">
                                  {notif.type ? notif.type.replace("_", " ") : "System"}
                                </span>
                                <span className="card-time">
                                  <FaClock size={10} style={{ marginRight: "4px" }} />
                                  {formatTime(notif.created_at)}
                                </span>
                              </div>
                              <p className="card-message">{notif.message}</p>
                            </div>
                            
                            {!notif.is_read && <div className="unread-dot-indicator"></div>}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Modal Integration */}
      <AnimatePresence>
          {selectedNotification && (
            <NotificationDetailModal 
              notification={selectedNotification} 
              onClose={() => setSelectedNotification(null)}
              onRead={handleMarkAsRead}
            />
          )}
      </AnimatePresence>

    </div>
  );
};

export default NotificationPage;
