import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import HRLayout from "../../../Component/HR/HRLayout";
import ProfileModal from "../../../Component/common/ProfileModal/ProfileModal";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUsers,
  FaUserCheck,
  FaEnvelopeOpenText,
  FaUserCircle,
  FaSignOutAlt,
  FaCircle,
  FaBullhorn,
  FaTimes, // Add this
} from "react-icons/fa";
import "./MainHR.css";

dayjs.extend(relativeTime);

const MainHR = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  // Announcements State
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  // Real Data States
  const [userList, setUserList] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    onlineCount: 0,
    pendingLeave: 0,
  });

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Users & Status
      const res = await axios.get(
        "http://localhost:5000/api/users/active-status"
      );
      if (res.data?.ok) {
        setUserList(res.data.users);
        setStats((prev) => ({
          ...prev,
          totalUsers: res.data.totalUsers,
          onlineCount: res.data.onlineCount,
        }));
      }

      // 2. Pending Leave (Mock logic currently, can be replaced with real API later)
      const leaveRequests = JSON.parse(
        localStorage.getItem("leave_requests") || "[]"
      );
      const pendingCount = leaveRequests.filter(
        (req) => req.status === "Pending"
      ).length;
      setStats((prev) => ({ ...prev, pendingLeave: pendingCount }));

      // 3. Fetch Announcements
      try {
        // Pass userId if available to check read status
        const userId =
          currentUser?.id || JSON.parse(localStorage.getItem("userId"));
        const annRes = await axios.get(
          `http://localhost:5000/api/announcements${
            userId ? `?userId=${userId}` : ""
          }`
        );
        setAnnouncements(annRes.data);
      } catch (e) {
        console.error("Error fetching announcements:", e);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!user?.id) {
      navigate("/login");
    } else {
      setCurrentUser(user);
    }

    fetchDashboardData();
    // Auto-refresh every 30 seconds for status updates
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const handleViewAnnouncement = async (ann) => {
    setSelectedAnnouncement(ann);
    // Mark as read in DB
    try {
      if (currentUser?.id) {
        await axios.put(
          `http://localhost:5000/api/announcements/${ann.id}/read`,
          {
            userId: currentUser.id,
          }
        );
        // Remove from list immediately (or mark as read if you want to keep it but style it different)
        // User requested it to "disappear", so we filter or update state.
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === ann.id ? { ...a, is_read: 1 } : a))
        );
      }
    } catch (err) {
      console.error("Error marking announcement as read", err);
    }
  };

  const closeAnnouncement = () => setSelectedAnnouncement(null);

  if (!currentUser) return null;

  // Stats Card Data
  const statCards = [
    {
      title: "Total Employees",
      value: stats.totalUsers,
      icon: <FaUsers />,
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      shadow: "0 10px 20px -10px rgba(118, 75, 162, 0.5)",
    },
    {
      title: "Active Now",
      value: stats.onlineCount,
      icon: <FaUserCheck />,
      color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      shadow: "0 10px 20px -10px rgba(0, 242, 254, 0.5)",
    },
    {
      title: "Pending Leave",
      value: stats.pendingLeave,
      icon: <FaEnvelopeOpenText />,
      color: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)",
      shadow: "0 10px 20px -10px rgba(255, 154, 158, 0.5)",
      textColor: "#d946ef", // Text darker for visibility on light gradient
    },
  ];

  return (
    <HRLayout>
      <div className="main-hr-container">
        <header className="hr-header">
          <div className="header-greeting">
            <h1>Dashboard</h1>
            <p>
              Welcome back,{" "}
              <span className="highlight-name">{currentUser.username}</span> 👋
            </p>
          </div>
          <div className="header-actions">
            <button
              className="btn-icon"
              onClick={() => setShowProfile(true)}
              title="Profile"
            >
              <FaUserCircle size={24} />
            </button>
            <button
              className="btn-icon logout"
              onClick={handleLogout}
              title="Logout"
            >
              <FaSignOutAlt size={22} />
            </button>
          </div>
        </header>

        {/* --- Stats Grid --- */}
        <div className="stats-grid">
          {statCards.map((card, idx) => (
            <motion.div
              key={idx}
              className="stat-card-modern"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              style={{ background: card.color, boxShadow: card.shadow }}
            >
              <div className="stat-icon-wrapper">{card.icon}</div>
              <div className="stat-content">
                <h3 style={{ color: card.textColor || "white" }}>
                  {card.value}
                </h3>
                <p style={{ color: card.textColor || "rgba(255,255,255,0.9)" }}>
                  {card.title}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* --- Main Content Split --- */}
        <div className="content-grid">
          {/* User Status List */}
          <motion.div
            className="panel user-status-panel"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="panel-header">
              <h2>User Status</h2>
              <span className="live-badge">
                {" "}
                <span className="pulsing-dot"></span> Live Updates
              </span>
            </div>

            <div className="user-list-scroll">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {userList.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="user-info-cell">
                          <div
                            className={`avatar-initials ${
                              u.role_name === "Admin" || u.role_name === "CHRO"
                                ? "admin-bg"
                                : "emp-bg"
                            }`}
                          >
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <span>{u.username}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`role-badge ${u.role_name}`}>
                          {u.role_name}
                        </span>
                      </td>
                      <td>
                        <div
                          className={`status-indicator ${
                            u.status === "Online" ? "online" : "offline"
                          }`}
                        >
                          <FaCircle size={10} />
                          <span>{u.status}</span>
                        </div>
                      </td>
                      <td className="text-secondary">
                        {u.last_login ? dayjs(u.last_login).fromNow() : "Never"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Quick Actions / Announcements */}
          <motion.div
            className="right-column"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="panel quick-actions-panel">
              <h3>Quick Actions</h3>
              <div className="quick-btn-group">
                <button onClick={() => navigate("/hr/add-user")}>
                  Create User
                </button>

                <button onClick={() => navigate("/hr/announcements")}>
                  Post Announcement
                </button>
              </div>
            </div>

            <div className="panel announcement-mini">
              <h3>Announcements</h3>
              {announcements.filter((ann) => !ann.is_read).length === 0 ? (
                <div className="empty-state">
                  <p>No new announcements.</p>
                </div>
              ) : (
                <ul className="announcement-list">
                  {announcements
                    .filter((ann) => !ann.is_read)
                    .map((ann) => (
                      <li
                        key={ann.id}
                        onClick={() => handleViewAnnouncement(ann)}
                        className={`ann-item ${
                          ann.is_read ? "read" : "unread"
                        } priority-${ann.priority?.toLowerCase() || "normal"}`}
                      >
                        <div className="ann-icon-wrapper">
                          {ann.priority === "Urgent" ? (
                            <span className="priority-dot urgent"></span>
                          ) : ann.priority === "Important" ? (
                            <span className="priority-dot important"></span>
                          ) : null}
                          <FaBullhorn />
                        </div>
                        <div className="ann-info">
                          <div className="ann-header-row">
                            <h4
                              className={!ann.is_read ? "text-highlight" : ""}
                            >
                              {ann.title}
                            </h4>
                            {!ann.is_read && (
                              <span className="new-badge">NEW</span>
                            )}
                          </div>
                          <span className="ann-date">
                            {dayjs(ann.created_at).fromNow()} •{" "}
                            <span className={`priority-text ${ann.priority}`}>
                              {ann.priority || "Normal"}
                            </span>
                          </span>
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {selectedAnnouncement && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAnnouncement}
          >
            <motion.div
              className={`modal-content-ann priority-border-${
                selectedAnnouncement.priority?.toLowerCase() || "normal"
              }`}
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close-btn" onClick={closeAnnouncement}>
                <FaTimes />
              </button>

              <div className="ann-modal-header">
                <span
                  className={`modal-priority-badge ${selectedAnnouncement.priority}`}
                >
                  {selectedAnnouncement.priority || "Normal"}
                </span>
                <h2>{selectedAnnouncement.title}</h2>
              </div>

              <div className="ann-meta">
                <div className="meta-item">
                  <FaUserCircle /> {selectedAnnouncement.poster_name || "Admin"}
                </div>
                <div className="meta-divider">•</div>
                <div className="meta-item">
                  {dayjs(selectedAnnouncement.created_at).format(
                    "DD MMM YYYY, h:mm A"
                  )}
                </div>
              </div>

              <div className="ann-body">{selectedAnnouncement.content}</div>

              <div className="ann-footer">
                <button className="btn-acknowledge" onClick={closeAnnouncement}>
                  Acknowledge
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        user={currentUser}
      />
    </HRLayout>
  );
};

export default MainHR;
