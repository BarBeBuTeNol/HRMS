import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar_HR from '../../../Component/HR/Sidebar_HR';
import './MainHR.css';

const MainHR = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!user.username) {
      navigate('/login'); // ✅ เรียก navigate ใน useEffect
    } else {
      setCurrentUser(user);
    }
  }, [navigate]);

  if (!currentUser) return null; // รอเช็ค user

  return (
    <div className="mainhr-root">
      <Sidebar_HR />
      <div className="mainhr-wrapper">
        <header className="mainhr-header">
          <div className="mainhr-title">HR Dashboard</div>
          <span className="mainhr-subtitle">Human Resources Management</span>
          <div className="mainhr-user">
            <span>{currentUser.firstName} {currentUser.lastName}</span>
            <span>{currentUser.role}</span>
            <button
              className="mainhr-logout-btn"
              onClick={() => {
                localStorage.removeItem('currentUser');
                navigate('/login');
              }}
            >
              Logout
            </button>
          </div>
        </header>

        <nav className="mainhr-nav">
          <button
            className={`mainhr-nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >📊 Dashboard</button>
          <button
            className={`mainhr-nav-tab ${activeTab === 'employees' ? 'active' : ''}`}
            onClick={() => setActiveTab('employees')}
          >👥 User</button>
          <button
            className={`mainhr-nav-tab ${activeTab === 'leave' ? 'active' : ''}`}
            onClick={() => setActiveTab('leave')}
          >🗓️ Leave/Attendance</button>
          <button
            className={`mainhr-nav-tab ${activeTab === 'activities' ? 'active' : ''}`}
            onClick={() => setActiveTab('activities')}
          >🕒 Activities</button>
        </nav>

        <main className="mainhr-main">
          {activeTab === 'dashboard' && <p>ยินดีต้อนรับ {currentUser.firstName}</p>}
          {activeTab === 'employees' && <p>ข้อมูลพนักงานจะโหลดเมื่อพร้อม</p>}
          {activeTab === 'leave' && <p>สถิติการลา/ขาดงานจะโหลดเมื่อพร้อม</p>}
          {activeTab === 'activities' && <p>กิจกรรม HR จะโหลดเมื่อพร้อม</p>}
        </main>
      </div>
    </div>
  );
};

export default MainHR;
