import React, { useRef, useEffect, useState } from "react";
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
  FaCalendarAlt,
} from "react-icons/fa";
import "./SidebarCHRO.css";

const SidebarCHRO = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);
  const [showMobileProfile, setShowMobileProfile] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.chro-sidebar-header')) {
        setShowMobileProfile(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (sidebarRef.current) {
      const activeItem = sidebarRef.current.querySelector(".chro-nav-item.active");
      if (activeItem) {
        activeItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [location.pathname]);

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
      path: "/chro/calendar",
      label: "Company Calendar",
      icon: <FaCalendarAlt />, 
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
          {/* User Profile Header */}
          <div className="chro-sidebar-header">
            <div 
              className="chro-user-profile"
              onClick={() => {
                if (window.innerWidth <= 1024) {
                  setShowMobileProfile(!showMobileProfile);
                }
              }}
              style={{ cursor: "pointer" }}
            >
              <div className="chro-avatar">
                {JSON.parse(localStorage.getItem("currentUser") || "{}")
                  .profile_image_url ? (
                  <img
                    src={
                      JSON.parse(localStorage.getItem("currentUser") || "{}")
                        .profile_image_url
                    }
                    alt="Profile"
                  />
                ) : (
                  (JSON.parse(localStorage.getItem("currentUser") || "{}").first_name?.charAt(0) || "C")
                )}
              </div>
              {isOpen && (() => {
                const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
                const role = localStorage.getItem("userRole") || "CHRO Admin";
                const name = user.first_name ? `${user.first_name} ${user.last_name || ""}` : "Executive User";
                
                return (
                  <div className="chro-user-info desktop-only">
                    <div className="chro-user-name">{name}</div>
                    <div className="chro-user-role-badge">
                      <span className="role-dot"></span>
                      {role}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Mobile Profile Popup */}
            {showMobileProfile && window.innerWidth <= 1024 && (
              <div className="chro-mobile-profile-popup">
                {(() => {
                  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
                  const role = localStorage.getItem("userRole") || "CHRO Admin";
                  const name = user.first_name ? `${user.first_name} ${user.last_name || ""}` : "Executive User";
                  
                  return (
                    <div className="mobile-popup-content">
                      <div className="popup-avatar">
                        {user.profile_image_url ? (
                          <img src={user.profile_image_url} alt="Profile" />
                        ) : (
                          (user.first_name?.charAt(0) || "C")
                        )}
                      </div>
                      <div className="popup-info">
                        <div className="popup-name">{name}</div>
                        <div className="popup-role">
                          <span className="role-dot"></span>
                          {role}
                        </div>
                        <div className="popup-status">Online</div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          <div className="chro-divider" />

          {/* Navigation Menu */}
          <nav className="chro-nav-menu" ref={sidebarRef}>
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

          {/* Sidebar Footer */}
          <div className="chro-sidebar-footer">
            <button className="chro-logout-btn" onClick={handleLogout}>
              <FaSignOutAlt />
              {isOpen && <span>Logout</span>}
            </button>
            
            {isOpen && (
              <div className="chro-footer-brand">
                <FaUserTie className="brand-icon" />
                <div className="brand-text">
                  <span className="brand-title">CHRO</span>
                  <span className="brand-subtitle">Executive Portal</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default SidebarCHRO;
