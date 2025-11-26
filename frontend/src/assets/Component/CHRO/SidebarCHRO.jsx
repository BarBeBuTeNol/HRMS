import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SidebarCHRO.css';

const SidebarCHRO = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  // ดึงข้อมูล currentUser จาก localStorage
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const displayUsername = currentUser.username || 'Guest';
  const displayRole = currentUser.role || 'CHRO';

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <>
      <div className={`sidebar-chro${isOpen ? ' open' : ' closed'}`}>
        <div className="sidebar-chro-header">
          <div className="sidebar-chro-username">
            👤 {displayUsername}
            <div className="sidebar-chro-role">{displayRole}</div>
          </div>
        </div>

        <nav className="sidebar-chro-nav">
          <button
            className="sidebar-chro-button"
            onClick={() => navigate('/chro/dashboard')}
          >
            <span className="sidebar-chro-icon">🏠</span> Home
          </button>

          <button
            className="sidebar-chro-button"
            onClick={() => navigate('/chro/decide')}
          >
            <span className="sidebar-chro-icon">✅</span> อนุมัติ/ปฏิเสธการลา
          </button>

          <button
            className="sidebar-chro-button"
            onClick={() => navigate('/chro/direct-position')}
          >
            <span className="sidebar-chro-icon">👥</span> Direct Position
          </button>

          <button
            className="sidebar-chro-button"
            onClick={() => navigate('/chro/show-log')}
          >
            <span className="sidebar-chro-icon">📋</span> Show Log
          </button>

          <div className="sidebar-chro-spacer" />

          <button className="sidebar-chro-button logout" onClick={handleLogout}>
            🚪 Logout
          </button>
        </nav>
      </div>

      {/* ปุ่ม toggle ขยาย/ย่อ Sidebar */}
      <button
        className="sidebar-chro-toggle-btn"
        onClick={toggleSidebar}
        aria-label={isOpen ? 'ปิด Sidebar' : 'เปิด Sidebar'}
      >
        {isOpen ? '←' : '→'}
      </button>
    </>
  );
};

export default SidebarCHRO;
