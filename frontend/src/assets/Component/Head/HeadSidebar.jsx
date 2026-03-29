import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaThLarge,
  FaUserTie,
  FaUsers,
  FaClipboardList,
  FaCalendarCheck,
  FaExchangeAlt,
  FaChartPie,
  FaFileInvoice,
  FaBell,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaCalendarAlt,
  FaTasks,
  FaPenSquare,
  FaChartLine,
  FaBullhorn,
  FaProjectDiagram,
  FaFileAlt,
} from "react-icons/fa";
import "./HeadSidebar.css";
import LoadingHead from "../loading/loading-head/LoadingHead";

const HeadSidebar = ({ unreadCount = 0, onToggle }) => {
  const [open, setOpen] = useState(() => window.innerWidth > 1024);
  const [loading, setLoading] = useState(true);
  const sidebarRef = useRef(null);

  useEffect(() => {
    // Page transition loader since Sidebar remounts on nav
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setOpen(false);
      } else {
        setOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleToggle = () => {
    setOpen(!open);
    if (onToggle) onToggle(!open);
  };

  // --- Fetch User Data ---
  const currentUserStr = localStorage.getItem("currentUser");
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : {};
  const displayName =
    currentUser.username || currentUser.name || "Head Manager";
  const displayRole = "Head of Department";
  const displayAvatar =
    currentUser.profile_image_url ||
    currentUser.avatar ||
    `https://ui-avatars.com/api/?name=${displayName}&background=c5a059&color=fff&size=128`;

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // --- Auto-scroll active item into view ---
  useEffect(() => {
    if (sidebarRef.current) {
      const activeItem = sidebarRef.current.querySelector(".head-menu-item.active");
      if (activeItem) {
        activeItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [location.pathname]);

  const menuGroups = [
    {
      title: "Overview",
      items: [
        // ภาพรวมสรุปสถิติแผนก
        { path: "/head/dashboard", icon: <FaThLarge />, label: "Dashboard" },
        // ข้อมูลส่วนตัวของ Head
        { path: "/head/profile", icon: <FaUserTie />, label: "My Profile" },
      ],
    },
    {
      title: "Leaves",
      items: [
        // ขอลา (Head)
        { path: "/head/request-leave", icon: <FaFileAlt />, label: "Request Leave" },
      ],
    },
    {
      title: "Team Management",
      items: [
        // รายชื่อและรายละเอียดพนักงาน
        {
          path: "/head/employee-list",
          icon: <FaUsers />,
          label: "Employee List",
        },
        // ตารางเวร/ตารางทำงาน
        {
          path: "/head/team-schedule",
          icon: <FaCalendarCheck />,
          label: "Team Schedule",
        },
        // มอบหมายและติดตามงาน (New)
        {
          path: "/head/task-assignment",
          icon: <FaTasks />,
          label: "Task Assignment",
        },
        // จัดการการสลับเวร (Delegate Shift)
        {
          path: "/head/delegate-shift",
          icon: <FaExchangeAlt />,
          label: "Delegate Shift",
        },
        // สร้างโปรเจกต์ใหม่ (Create Project) (New)
        {
          path: "/head/create-project",
          icon: <FaProjectDiagram />,
          label: "Create Project",
        },
      ],
    },
    {
      title: "Approvals",
      items: [
        // อนุมัติการลา
        {
          path: "/head/leave-approvals",
          icon: <FaClipboardList />,
          label: "Leave Approvals",
        },
        // อนุมัติการขอแก้ไขข้อมูล (Change Requests) (New)
        {
          path: "/head/data-approvals",
          icon: <FaPenSquare />,
          label: "Data Approvals",
        },
        // อนุมัติการสลับงาน (task_replacements) (New)
        {
          path: "/head/shift-replacements",
          icon: <FaExchangeAlt />,
          label: "Shift Requests",
        },
      ],
    },
    {
      title: "Analytics",
      items: [
        // สถิติการลาของคนในทีม
        {
          path: "/head/leave-stats",
          icon: <FaChartPie />,
          label: "Leave Stats",
        },
        // สรุปผลงานของพนักงาน (New)
        {
          path: "/head/team-performance",
          icon: <FaChartLine />,
          label: "Team Performance",
        },
      ],
    },
    {
      title: "Organization",
      items: [
        // ปฏิทินบริษัท/วันหยุด
        {
          path: "/head/calendar",
          icon: <FaCalendarAlt />,
          label: "Company Calendar",
        },
        // ประกาศภายในแผนก (New)
        {
          path: "/head/department-news",
          icon: <FaBullhorn />,
          label: "Department News",
        },
      ],
    },
  ];

  const sidebarVariants = {
    expanded: { width: "260px" },
    collapsed: { width: "80px" },
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
            <LoadingHead />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.aside
        className="head-sidebar"
        initial="expanded"
        animate={open ? "expanded" : "collapsed"}
        variants={sidebarVariants}
        transition={{ duration: 0.4, type: "spring", damping: 12 }}
      >
        {/* Toggle Button */}
        <motion.button
          className="head-toggle-btn"
          onClick={handleToggle}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {open ? <FaChevronLeft /> : <FaChevronRight />}
        </motion.button>

        {/* Profile Section */}
        <div className="head-profile-section">
          <motion.div
            className="head-avatar-wrapper"
            animate={{
              width: open ? 70 : 40,
              height: open ? 70 : 40,
              marginBottom: open ? "1rem" : "0.5rem",
            }}
          >
            <img
              src={displayAvatar}
              alt="Profile"
              className="head-avatar"
              style={{ width: "100%", height: "100%" }}
            />
          </motion.div>

          <AnimatePresence>
            {open && (
              <motion.div
                className="head-user-info"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="head-user-name">{displayName}</h3>
                <p className="head-user-role">{displayRole}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="head-divider" />

        {/* Menu Items */}
        <nav className="head-menu-container" ref={sidebarRef}>
          {menuGroups.map((group, idx) => (
            <div key={idx} className="head-menu-group">
              {open && group.title && (
                <motion.h4
                  className="head-group-title"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.1 * idx }}
                >
                  {group.title}
                </motion.h4>
              )}

              <ul>
                {group.items.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `head-menu-item ${isActive ? "active" : ""}`
                      }
                    >
                      <span className="head-icon">{item.icon}</span>
                      <AnimatePresence>
                        {open && (
                          <motion.span
                            className="head-label"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>

                      {/* Badge Handling */}
                      {open && item.badge > 0 && (
                        <motion.span
                          className="head-badge"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          {item.badge}
                        </motion.span>
                      )}
                      {!open && item.badge > 0 && (
                        <span className="head-dot-badge" />
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="head-footer">
          <div className="head-menu-item logout" onClick={handleLogout}>
            <span className="head-icon">
              <FaSignOutAlt />
            </span>
            <AnimatePresence>
              {open && (
                <motion.span
                  className="head-label"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default HeadSidebar;
