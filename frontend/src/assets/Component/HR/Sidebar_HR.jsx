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
  FaBuilding,
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
        {
          path: "/hr/add-department",
          icon: <FaBuilding />,
          label: "Add Department",
        },
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
        {
          path: "/calendar",
          icon: <FaCalendarAlt />,
          label: "Company Calendar",
        },
      ],
    },
  ];

  return (
    <motion.div
      animate={{ width: open ? "280px" : "80px" }}
      transition={{ duration: 0.5, type: "spring", damping: 12 }}
      className={`hr-sidebar-container ${!open ? "collapsed" : ""}`}
    >
      <div className="hr-sidebar-header">
        <div className="hr-user-avatar">
          {currentUser.profile_image_url ? (
            <img
              src={currentUser.profile_image_url}
              alt="Profile"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            <FaUserCircle />
          )}
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="hr-user-info"
            >
              <div className="hr-user-name">{displayUsername}</div>
              <div className="hr-user-role">{displayRole}</div>
            </motion.div>
          )}
        </AnimatePresence>

        <button className="hr-toggle-btn" onClick={() => setOpen(!open)}>
          {open ? <FaChevronLeft /> : <FaChevronRight />}
        </button>
      </div>

      <div className="hr-sidebar-menu">
        {menuItems.map((group, index) => (
          <div key={index} className="hr-menu-group">
            {open && <h4 className="hr-group-title">{group.title}</h4>}
            {group.items.map((item) => (
              <div
                key={item.path}
                className={`hr-menu-item ${
                  isActive(item.path) ? "active" : ""
                }`}
                onClick={() => navigate(item.path)}
                title={!open ? item.label : ""}
              >
                <span className="hr-menu-icon">{item.icon}</span>
                <AnimatePresence>
                  {open && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="hr-menu-label"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="hr-sidebar-footer">
        <div
          className="hr-menu-item logout"
          onClick={handleLogout}
          title="Logout"
        >
          <span className="hr-menu-icon">
            <FaSignOutAlt />
          </span>
          <AnimatePresence>
            {open && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="hr-menu-label"
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
