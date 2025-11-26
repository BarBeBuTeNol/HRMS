import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar_HR.css";

const Sidebar_HR = () => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  // ดึงข้อมูล currentUser จาก localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const displayUsername = currentUser.username || "Guest";
  const displayRole = currentUser.role || "HR";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  // ปุ่ม toggle สำหรับขยาย/ย่อ
  const ToggleButton = (
    <button
      className="sidebar-hr-toggle-btn"
      onClick={() => setOpen((prev) => !prev)}
      aria-label={open ? "ย่อ Sidebar" : "ขยาย Sidebar"}
      style={{ position: "absolute", top: 18, right: open ? -18 : -18, zIndex: 1100, background: "#4f8cff", color: "#fff", border: "none", borderRadius: "50%", width: 36, height: 36, boxShadow: "0 2px 8px #23272f33", cursor: "pointer", transition: "right 0.3s" }}
    >
      {open ? "←" : "→"}
    </button>
  );

  return (
    <div className={`sidebar-hr-fixed${open ? " open" : " closed"}`} style={{ position: "relative" }}>
      {open ? (
        <>
          {ToggleButton}
          <div className="sidebar-hr">
            <div className="sidebar-hr-username" title={displayUsername}>
              👤 {displayUsername}
              <div className="sidebar-hr-role">{displayRole}</div>
            </div>
            <button className="sidebar-hr-btn" onClick={() => navigate("/hr/dashboard")}>Home</button>
<button className="sidebar-hr-btn" onClick={() => navigate("/hr/add-user")}>Create User</button>
<button className="sidebar-hr-btn" onClick={() => navigate("/hr/add-emp-personal")}>Create Employee</button>
<button className="sidebar-hr-btn" onClick={() => navigate("/hr/show-emp")}>Show Employees</button>
<button className="sidebar-hr-btn" onClick={() => navigate("/hr/leave-info")}>Leave</button>
<button className="sidebar-hr-btn" onClick={() => navigate("/hr/show-leave")}>Show Leave </button>
<button className="sidebar-hr-btn" onClick={() => navigate("/hr/show-static-switch")}>Show Static And Switch Job</button>
<button className="sidebar-hr-btn" onClick={() => navigate("/hr/send-notification")}>Notification</button>
<button className="sidebar-hr-btn" onClick={() => navigate("/hr/announcements")}>Announcements</button>

            <div className="sidebar-hr-spacer" />
            <button className="sidebar-hr-btn logout" onClick={handleLogout}>Logout</button>
          </div>
        </>
      ) : (
        <div
          className="sidebar-hr sidebar-hr-collapsed sidebar-hr-collapsed-clickable"
          style={{ cursor: "pointer", width: "64px", minWidth: "64px", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
          onClick={() => setOpen(true)}
          title="ขยาย Sidebar"
        >
          <div className="sidebar-hr-username" style={{ fontSize: "2rem", margin: 0, padding: 0 }}>
            →
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar_HR;