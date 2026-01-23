import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaHome,
  FaUser,
  FaChartBar,
  FaCalendarAlt,
  FaFileAlt,
  FaExchangeAlt,
  FaBell,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaIdBadge,
} from "react-icons/fa";
import "./EmployeeSidebar.css";
import "../../theam/epm_theam/EmployeeTheme.css";
import LoadingEmp from "../loading/loading-emp/LoadingEmp";

const EmployeeSidebar = () => {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  // --- Fetch User Data ---
  // Try to get data from multiple potential sources to ensure robustness
  const empId = localStorage.getItem("userId") || "EMP001";
  const currentUserStr = localStorage.getItem("currentUser");
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : {};

  // Fallback defaults if data is missing
  const displayName = currentUser.username || currentUser.name || "Employee";
  const displayRole = currentUser.role || "Staff Member";
  const displayAvatar =
    currentUser.avatar ||
    "https://ui-avatars.com/api/?name=" +
      displayName +
      "&background=6366f1&color=fff";

  useEffect(() => {
    // Mock notification count
    const stored =
      JSON.parse(localStorage.getItem(`employeeNotifications_${empId}`)) || [];
    const unread = stored.filter((n) => !n.read).length;
    setUnreadCount(unread);
  }, [empId]);

  const handleLogout = () => {
    // Optionally clear specific keys or just navigate
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  // --- Menu Structure ---
  const menuGroups = [
    {
      title: "Main",
      items: [
        { path: "/employee/dashboard", icon: <FaHome />, label: "Dashboard" },
        { path: "/employee/my-info", icon: <FaUser />, label: "Personal Info" },
      ],
    },
    {
      title: "Work & Shifts",
      items: [
        { path: "/employee/mywork", icon: <FaChartBar />, label: "My Work" },
        {
          path: "/employee/schedule",
          icon: <FaCalendarAlt />,
          label: "Schedule",
        },
        {
          path: "/employee/shift-requests",
          icon: <FaExchangeAlt />,
          label: "Shift Request",
        },

        {
          path: "/calendar",
          icon: <FaCalendarAlt />,
          label: "Company Calendar",
        },
      ],
    },
    {
      title: "Leaves",
      items: [
        {
          path: "/employee/request-leave",
          icon: <FaFileAlt />,
          label: "Request Leave",
        },
      ],
    },
    {
      title: "Other",
      items: [
        {
          path: "/employee/notifications",
          icon: <FaBell />,
          label: "Notifications",
          badge: unreadCount,
        },
      ],
    },
  ];

  const sidebarVariants = {
    expanded: { width: "280px" },
    collapsed: { width: "85px" },
  };

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ position: "fixed", zIndex: 9999, inset: 0 }}
          >
            <LoadingEmp />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.aside
        initial="expanded"
        animate={open ? "expanded" : "collapsed"}
        variants={sidebarVariants}
        transition={{ duration: 0.4, type: "spring", damping: 13 }}
        className="emp-sidebar"
      >
        {/* --- Toggle Button --- */}
        <button
          className="emp-toggle-btn"
          onClick={() => setOpen(!open)}
          aria-label="Toggle Sidebar"
        >
          {open ? <FaChevronLeft /> : <FaChevronRight />}
        </button>

        {/* --- Profile Header --- */}
        <div className="emp-profile-section">
          <motion.div
            className="emp-avatar-wrapper"
            whileHover={{ scale: 1.05 }}
          >
            <img src={displayAvatar} alt="Profile" className="emp-avatar" />
            <span className="emp-status-indicator"></span>
          </motion.div>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="emp-user-info"
              >
                <h3 className="emp-user-name">{displayName}</h3>
                <p className="emp-user-role">{displayRole}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="emp-divider" />

        {/* --- Menu Items --- */}
        <nav className="emp-menu-container">
          {menuGroups.map((group, idx) => (
            <div key={idx} className="emp-menu-group">
              {open && group.title && (
                <motion.h4
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="emp-group-title"
                >
                  {group.title}
                </motion.h4>
              )}

              <ul>
                {group.items.map((item) => (
                  <li key={item.path}>
                    <div
                      onClick={() => navigate(item.path)}
                      className={`emp-menu-item ${
                        isActive(item.path) ? "active" : ""
                      }`}
                    >
                      <span className="emp-icon">{item.icon}</span>

                      <AnimatePresence>
                        {open && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="emp-label"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>

                      {/* Badge */}
                      {open && item.badge > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="emp-badge"
                        >
                          {item.badge}
                        </motion.span>
                      )}
                      {!open && item.badge > 0 && (
                        <span className="emp-dot-badge" />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* --- Logout Section --- */}
        <div className="emp-footer">
          <div className="emp-menu-item logout" onClick={handleLogout}>
            <span className="emp-icon">
              <FaSignOutAlt />
            </span>
            <AnimatePresence>
              {open && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="emp-label"
                >
                  Log Out
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default EmployeeSidebar;
