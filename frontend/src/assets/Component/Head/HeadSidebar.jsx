import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./HeadSidebar.css";
import { FaChartPie } from "react-icons/fa";

const HeadSidebar = ({ unreadCount = 0 }) => {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <h2>หัวหน้าแผนก</h2>

      <nav className="sidebar-menu">
        <ul>
          <li>
            <NavLink to="/head/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
              🏠 Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/head/profile" className={({ isActive }) => (isActive ? "active" : "")}>
              👤 ข้อมูลส่วนตัว
            </NavLink>
          </li>
          <li>
            <NavLink to="/head/employee-list" className={({ isActive }) => (isActive ? "active" : "")}>
              👥 รายชื่อพนักงาน
            </NavLink>
          </li>
          <li>
            <NavLink to="/head/request-leave" className={({ isActive }) => (isActive ? "active" : "")}>
              📝 ยื่นขอลา
            </NavLink>
          </li>
          <li>
            <NavLink to="/head/leave-approvals" className={({ isActive }) => (isActive ? "active" : "")}>
              ✅ อนุมัติการลา
            </NavLink>
          </li>
          <li>
            <NavLink to="/head/delegate-shift" className={({ isActive }) => (isActive ? "active" : "")}>
              🔄 มอบหมายงานแทน
            </NavLink>
          </li>
          <li>
            <NavLink to="/head/schedule" className={({ isActive }) => (isActive ? "active" : "")}>
              📅 จัดตารางการทำงาน
            </NavLink>
          </li>

          <li>
            <NavLink to="/head/leave-stats" className={({ isActive }) => (isActive ? "active" : "")}>
              <FaChartPie /> <span>สถิติการลา</span>
            </NavLink>
          </li>

          {/* ✅ เมนูใหม่ */}
          <li>
            <NavLink to="/head/team-leave-history" className={({ isActive }) => (isActive ? "active" : "")}>
              📄 ประวัติการลาของทีม
            </NavLink>
          </li>

          <li>
            <NavLink to="/head/notifications" className={({ isActive }) => (isActive ? "active" : "")}>
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

export default HeadSidebar;
