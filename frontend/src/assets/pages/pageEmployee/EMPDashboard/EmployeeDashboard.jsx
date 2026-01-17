import React, { useState, useEffect } from "react";
import EmployeeSidebar from "../../../Component/Employee/EmployeeSidebar";
import "../../../../App.css";
import "./EmployeeDashboard.css";
import dayjs from "dayjs";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion"; // Import Framer Motion
import {
  Calendar,
  CheckCircle,
  Clock,
  Bell,
  User,
  Briefcase,
  FileText,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  Zap,
  Trophy,
  Target,
} from "lucide-react";

const EmployeeDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(dayjs());

  useEffect(() => {
    // Clock timer
    const timer = setInterval(() => setCurrentTime(dayjs()), 60000);

    const fetchDashboardData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("currentUser"));
        if (!storedUser || !storedUser.id) {
          setError("User not found");
          setLoading(false);
          return;
        }

        const res = await axios.get(
          `http://localhost:5000/api/employees/dashboard/${storedUser.id}`
        );
        setDashboardData(res.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    return () => clearInterval(timer);
  }, []);

  if (loading)
    return (
      <div className="loading-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="loader-spinner"
        />
        <p>Loading Your Dashboard...</p>
      </div>
    );

  if (error) return <div className="error-screen">{error}</div>;

  const {
    todayShift,
    taskStats,
    calendarData,
    actionableTasks,
    announcements,
    notifications,
  } = dashboardData;
  const user = JSON.parse(localStorage.getItem("currentUser"));

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const getGreeting = () => {
    const hour = dayjs().hour();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="dashboard-layout">
      <EmployeeSidebar />
      <motion.div
        className="dashboard-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.header className="dashboard-header" variants={itemVariants}>
          <div className="welcome-text">
            <h1>
              {getGreeting()}, {user?.username} <span className="wave">👋</span>
            </h1>
            <p className="subtitle">
              {dayjs().format("dddd, MMMM D, YYYY")} • Let's make today count!
            </p>
          </div>
          <div className="header-actions">
            <Link to="/employee/notifications">
              <motion.div
                className="notification-bell"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Bell size={24} />
                {notifications.length > 0 && (
                  <span className="badge">{notifications.length}</span>
                )}
              </motion.div>
            </Link>
            <div className="user-profile">
              <div className="avatar">
                <User size={24} />
              </div>
            </div>
          </div>
        </motion.header>

        {/* 1. Highlights Section (Overview) */}
        <motion.section className="overview-section" variants={itemVariants}>
          {/* Shift Card */}
          <motion.div className="shift-card" whileHover={{ y: -5 }}>
            <div className="card-bg-glow"></div>
            <div className="shift-header">
              <div className="icon-box blue">
                <Clock size={22} />
              </div>
              <h3>Today's Shift</h3>
            </div>
            <div className="shift-body">
              {todayShift ? (
                <>
                  <div className="time-display text-gradient">
                    {todayShift.shift}
                  </div>
                  <motion.div
                    className={`status-badge ${
                      todayShift.shift_type === "Day Off" ? "off" : "active"
                    }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    {todayShift.status}
                  </motion.div>
                  {todayShift.note && (
                    <p className="shift-note">📝 {todayShift.note}</p>
                  )}
                </>
              ) : (
                <div className="no-shift">
                  <p>Relax! No shift scheduled today. ☕</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Task Progress Card */}
          <motion.div className="task-summary-card" whileHover={{ y: -5 }}>
            <div className="card-bg-glow orange"></div>
            <div className="shift-header">
              <div className="icon-box orange">
                <Target size={22} />
              </div>
              <h3>Task Progress</h3>
            </div>

            <div className="stats-row">
              <div className="stat-pill">
                <span className="val">{taskStats.pending}</span>
                <span className="lbl">Pending</span>
              </div>
              <div className="stat-pill">
                <span className="val">{taskStats.in_progress}</span>
                <span className="lbl">In Progress</span>
              </div>
              <div className="stat-pill">
                <span className="val">{taskStats.completed}</span>
                <span className="lbl">Done</span>
              </div>
            </div>

            <div className="progress-container">
              <div className="progress-labels">
                <span>Performance</span>
                <span>{taskStats.progress}%</span>
              </div>
              <div className="progress-bar-bg">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${taskStats.progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                ></motion.div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* 5. Quick Actions (Moved up for better access) */}
        <motion.section className="quick-actions-bar" variants={itemVariants}>
          <Link to="/employee/leave-request">
            <motion.div
              className="quick-action-btn leave"
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(244, 114, 182, 0.2)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <FileText size={20} /> Request Leave
            </motion.div>
          </Link>
          <Link to="/employee/change-request">
            <motion.div
              className="quick-action-btn update"
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(96, 165, 250, 0.2)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw size={20} /> Update Profile
            </motion.div>
          </Link>
          <Link to="/employee/shift-swap">
            <motion.div
              className="quick-action-btn swap"
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(167, 139, 250, 0.2)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Briefcase size={20} /> Swap Shift
            </motion.div>
          </Link>
        </motion.section>

        <div className="dashboard-grid">
          {/* Left Column */}
          <div className="left-column">
            {/* 3. Actionable Tasks */}
            <motion.section
              className="section-container"
              variants={itemVariants}
            >
              <div className="section-header">
                <h2>🔥 Actionable Tasks</h2>
                <Link to="/employee/tasks" className="view-all">
                  View All <ChevronRight size={16} />
                </Link>
              </div>
              <div className="tasks-list">
                {actionableTasks.length > 0 ? (
                  actionableTasks.map((task, i) => (
                    <motion.div
                      key={task.id}
                      className="task-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="task-info">
                        <h4>{task.title}</h4>
                        <div className="task-meta">
                          <span className="due-date">
                            <Clock size={12} />{" "}
                            {dayjs(task.due_date).format("MMM D")}
                          </span>
                          <span
                            className={`status-dot ${task.status
                              .toLowerCase()
                              .replace(" ", "-")}`}
                          ></span>
                          <span className="status-text">{task.status}</span>
                        </div>
                      </div>
                      <div className="task-actions">
                        {task.status === "Pending" && (
                          <>
                            <motion.button
                              className="btn-icon accept"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Accept"
                            >
                              <CheckCircle size={18} />
                            </motion.button>
                            <motion.button
                              className="btn-icon reject"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Reject"
                            >
                              <AlertCircle size={18} />
                            </motion.button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="empty-state">
                    <Trophy size={48} className="text-yellow-500 mb-2" />
                    <p>All clear! You're doing great. 🌟</p>
                  </div>
                )}
              </div>
            </motion.section>

            {/* 2. Integrated Calendar */}
            <motion.section
              className="section-container"
              variants={itemVariants}
            >
              <div className="section-header">
                <h2>📅 Upcoming Schedule</h2>
              </div>
              <div className="calendar-list">
                {calendarData.length > 0 ? (
                  calendarData.map((event, idx) => (
                    <motion.div
                      key={idx}
                      className={`calendar-item ${event.type}`}
                      whileHover={{
                        x: 5,
                        backgroundColor: "rgba(255,255,255,0.08)",
                      }}
                    >
                      <div className="date-badge">
                        <span className="day">
                          {dayjs(event.date).format("D")}
                        </span>
                        <span className="month">
                          {dayjs(event.date).format("MMM")}
                        </span>
                      </div>
                      <div className="event-details">
                        <h4>{event.title}</h4>
                        <span className="event-type">{event.type}</span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    No upcoming events.
                  </p>
                )}
              </div>
            </motion.section>
          </div>

          {/* Right Column: Announcements */}
          <div className="right-column">
            {/* 4. Announcements */}
            <motion.section
              className="section-container announcements-section"
              variants={itemVariants}
            >
              <div className="section-header">
                <h2>📢 Announcements</h2>
              </div>
              <div className="announcements-list">
                {announcements.length > 0 ? (
                  announcements.map((item, idx) => (
                    <motion.div
                      key={idx}
                      className="announcement-item"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 + idx * 0.1 }}
                    >
                      <div className="announcement-header">
                        <div className="announcement-icon">
                          <Zap size={16} />
                        </div>
                        <span className="announcement-date">
                          {dayjs(item.created_at).fromNow()}
                        </span>
                      </div>
                      <div className="announcement-content">
                        <h4>{item.title}</h4>
                        <p>{item.content}</p>
                        <small
                          style={{
                            color: "#94a3b8",
                            display: "block",
                            marginTop: "4px",
                          }}
                        >
                          Posted by: {item.first_name} {item.last_name}
                        </small>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-center text-gray-500">
                    No new announcements.
                  </p>
                )}
              </div>
            </motion.section>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmployeeDashboard;
