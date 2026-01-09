import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaHome,
  FaUserPlus,
  FaUsers,
  FaCalendarAlt,
  FaClipboardList,
  FaExchangeAlt,
  FaBell,
  FaBullhorn,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaUserCircle,
} from "react-icons/fa";
import "./Sidebar_HR.css";

const Sidebar_HR = () => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const displayUsername = currentUser.username || "Guest";
  const displayRole = currentUser.role || "HR";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    {
      title: "HR Management",
      width: "100%",
      items: [
        { path: "/hr/dashboard", icon: <FaHome />, label: "Dashboard" },
        { path: "/hr/add-user", icon: <FaUserPlus />, label: "Create User" },

        { path: "/hr/show-emp", icon: <FaUsers />, label: "Show Employees" },
      ],
    },
    {
      title: "Leave & Shifts",
      items: [
        {
          path: "/hr/leave-info",
          icon: <FaCalendarAlt />,
          label: "Leave Requests",
        },
        {
          path: "/hr/show-leave",
          icon: <FaClipboardList />,
          label: "Show Leave",
        },
        {
          path: "/hr/show-static-switch",
          icon: <FaExchangeAlt />,
          label: "Static / Switch Job",
        },
      ],
    },
    {
      title: "Communication",
      items: [
        {
          path: "/hr/send-notification",
          icon: <FaBell />,
          label: "Notification",
        },
        {
          path: "/hr/announcements",
          icon: <FaBullhorn />,
          label: "Announcements",
        },
      ],
    },
  ];

  return (
    <motion.div
      animate={{ width: open ? "260px" : "80px" }}
      transition={{ duration: 0.5, type: "spring", damping: 12 }}
      className="sidebar-hr-container"
    >
      <div className="sidebar-header">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="user-info"
            >
              <FaUserCircle className="user-avatar" />
              <div className="user-text">
                <h3 className="user-name">{displayUsername}</h3>
                <span className="user-role">{displayRole}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button className="toggle-btn" onClick={() => setOpen(!open)}>
          {open ? <FaChevronLeft /> : <FaChevronRight />}
        </button>
      </div>

      <div className="sidebar-menu">
        {menuItems.map((group, index) => (
          <div key={index} className="menu-group">
            {open && <h4 className="group-title">{group.title}</h4>}
            {group.items.map((item) => (
              <div
                key={item.path}
                className={`menu-item ${isActive(item.path) ? "active" : ""}`}
                onClick={() => navigate(item.path)}
                title={!open ? item.label : ""}
              >
                <span className="menu-icon">{item.icon}</span>
                <AnimatePresence>
                  {open && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="menu-label"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive(item.path) && (
                  <motion.div
                    layoutId="active-pill"
                    className="active-indicator"
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="menu-item logout" onClick={handleLogout} title="Logout">
          <span className="menu-icon">
            <FaSignOutAlt />
          </span>
          <AnimatePresence>
            {open && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="menu-label"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar_HR;
