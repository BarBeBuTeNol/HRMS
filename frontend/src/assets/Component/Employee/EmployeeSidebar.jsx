import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./EmployeeSidebar.css";

const EmployeeSidebar = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  // ใช้ userId ที่เหมาะสมตรงกับที่คุณใช้ใน localStorage
  const userId = localStorage.getItem("userId") || "emp001";

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(`employeeNotifications_${userId}`)) || [];
    const unread = stored.filter((n) => !n.read).length;
    setUnreadCount(unread);
  }, [userId]);

  return (
    <aside className="sidebar">
      <h2>พนักงาน</h2>
      <nav className="sidebar-menu">
        <ul>
          <li>
            <NavLink to="/employee/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
              🏠 Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/employee/profile" className={({ isActive }) => (isActive ? "active" : "")}>
              👤 ข้อมูลส่วนตัว
            </NavLink>
          </li>
          <li>
            <NavLink to="/employee/mywork" className={({ isActive }) => (isActive ? "active" : "")}>
              📊 ส่งความคืบหน้างาน
            </NavLink>
          </li>
          <li>
            <NavLink to="/employee/leave-history" className={({ isActive }) => (isActive ? "active" : "")}>
              📆 ประวัติการลา
            </NavLink>
          </li>
          <li>
            <NavLink to="/employee/request-leave" className={({ isActive }) => (isActive ? "active" : "")}>
              📝 ยื่นขอลา
            </NavLink>
          </li>
          <li>
            <NavLink to="/employee/shift-requests" className={({ isActive }) => (isActive ? "active" : "")}>
              ✅ คำขอให้ทำแทน
            </NavLink>
          </li>
          <li>
            <NavLink to="/employee/schedule" className={({ isActive }) => (isActive ? "active" : "")}>
              📅 ตารางงาน
            </NavLink>
          </li>
          <li>
            <NavLink to="/employee/notifications" className={({ isActive }) => (isActive ? "active" : "")}>
              🔔 แจ้งเตือน
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </NavLink>
          </li>
          <li className="logout" onClick={() => navigate("/login")}>
            🔴 ออกจากระบบ
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default EmployeeSidebar;
