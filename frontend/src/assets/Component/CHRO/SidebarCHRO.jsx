import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaCheckCircle,
  FaUsers,
  FaBullhorn,
  FaChartPie,
  FaHistory,
  FaCogs,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaUserTie,
  FaFileSignature,
} from "react-icons/fa";
import "./SidebarCHRO.css";

const SidebarCHRO = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      path: "/chro/dashboard",
      label: "Dashboard",
      icon: <FaTachometerAlt />,
    },
    {
      path: "/chro/decide",
      label: "Approvals Center",
      icon: <FaCheckCircle />,
    },
    {
      path: "/chro/employee-directory",
      label: "Employee Directory",
      icon: <FaUsers />,
    },
    {
      path: "/chro/announcements",
      label: "Announcements",
      icon: <FaBullhorn />,
    },
    {
      path: "/chro/leave-request",
      label: "Request Leave",
      icon: <FaFileSignature />,
    },
    {
      path: "/chro/show-log",
      label: "Audit Logs",
      icon: <FaHistory />,
    },
    {
      path: "/chro/direct-position",
      label: "Settings / Roles",
      icon: <FaCogs />,
    },
    {
      path: "/calendar",
      label: "Company Calendar",
      icon: <FaChartPie />, // Reusing icon or importing new one if needed, but keeping simple
    },
  ];

  const handleLogout = () => {
    // Clear user session data
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`chro-sidebar-overlay ${isOpen ? "active" : ""}`}
        onClick={toggleSidebar}
      />

      <aside className={`chro-sidebar ${isOpen ? "open" : "closed"}`}>
        {/* Toggle Button (Floating) */}
        <button
          className="chro-sidebar-toggle-btn"
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          {isOpen ? <FaChevronLeft /> : <FaChevronRight />}
        </button>

        <div className="chro-sidebar-content">
          {/* Logo Section */}
          <div className="chro-logo-section">
            <div className="chro-logo-icon">
              <FaUserTie />
            </div>
            {isOpen && (
              <div className="chro-logo-text">
                <h2>CHRO</h2>
                <span>Executive Portal</span>
              </div>
            )}
          </div>

          <div className="chro-divider" />

          {/* Navigation Menu */}
          <nav className="chro-nav-menu">
            {menuItems.map((item) => {
              // Simple check for active path
              // For Dashboard tab params, we just check base path
              const isActive = location.pathname === item.path.split("?")[0];

              return (
                <button
                  key={item.path}
                  className={`chro-nav-item ${isActive ? "active" : ""}`}
                  onClick={() => navigate(item.path)}
                  title={!isOpen ? item.label : ""}
                >
                  <div className="chro-nav-icon">{item.icon}</div>
                  {isOpen && (
                    <span className="chro-nav-label">{item.label}</span>
                  )}
                  {isOpen && isActive && (
                    <div className="chro-active-indicator" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile Footer */}
          <div className="chro-sidebar-footer">
            <div className="chro-user-profile">
              <div className="chro-avatar">C</div>
              {isOpen && (
                <div className="chro-user-info">
                  <div className="chro-user-name">User</div>
                  <div className="chro-user-role">CHRO Admin</div>
                </div>
              )}
            </div>

            <button className="chro-logout-btn" onClick={handleLogout}>
              <FaSignOutAlt />
              {isOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SidebarCHRO;
