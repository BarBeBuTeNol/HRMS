import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaCheckDouble,
  FaUsers,
  FaClipboardList,
  FaSignOutAlt,
  FaBars,
  FaTimes, // Used for close if needed, but we use toggle
  FaUserTie, // For CHRO icon
} from "react-icons/fa";
import "./SidebarCHRO.css";

const SidebarCHRO = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState({});

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    setCurrentUser(user);
  }, []);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("currentUser");
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const navItems = [
    { label: "Dashboard", path: "/chro/dashboard", icon: <FaHome /> },
    { label: "Approvals", path: "/chro/decide", icon: <FaCheckDouble /> },
    {
      label: "Direct Position",
      path: "/chro/direct-position",
      icon: <FaUsers />,
    },
    { label: "Audit Logs", path: "/chro/show-log", icon: <FaClipboardList /> },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`chro-sidebar-overlay ${isOpen ? "active" : ""}`}
        onClick={toggleSidebar}
      />

      <aside className={`chro-sidebar ${isOpen ? "open" : "closed"}`}>
        {/* Toggle Button (Floating) */}
        {/* Toggle Button (Floating) */}
        <button
          className="chro-toggle-btn"
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          {isOpen ? <FaBars /> : <FaBars />}
        </button>

        <div className="chro-sidebar-content">
          {/* Header / Logo Area */}
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

          {/* Navigation */}
          <nav className="chro-nav-menu">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  className={`chro-nav-item ${isActive ? "active" : ""}`}
                  onClick={() => navigate(item.path)}
                  title={!isOpen ? item.label : ""}
                >
                  <span className="chro-nav-icon">{item.icon}</span>
                  {isOpen && (
                    <span className="chro-nav-label">{item.label}</span>
                  )}
                  {isActive && isOpen && (
                    <div className="chro-active-indicator" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile Footer */}
          <div className="chro-sidebar-footer">
            <div className={`chro-user-profile ${isOpen ? "expanded" : ""}`}>
              <div className="chro-avatar">
                {currentUser?.firstName?.[0] || "C"}
              </div>
              {isOpen && (
                <div className="chro-user-info">
                  <div className="chro-user-name">
                    {currentUser?.firstName || "User"}
                  </div>
                  <div className="chro-user-role">CHRO Admin</div>
                </div>
              )}
            </div>
            <button
              className="chro-logout-btn"
              onClick={handleLogout}
              title="Logout"
            >
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
