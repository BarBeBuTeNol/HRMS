import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SidebarCHRO.css';

const SidebarCHRO = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(true);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const handleHomeClick = () => {
        navigate('/MainCHRO');
    };

    const handleDecideClick = () => {
        navigate('/decide-chro');
    };

    const handleDirectPositionClick = () => {
        navigate('/direct-position');
    };

    const handleShowLogClick = () => {
        navigate('/show-log');
    };

    return (
        <>
            <div className={`sidebar-chro ${!isOpen ? 'closed' : ''}`}>
                <div className="sidebar-chro-header">
                    <h2>CHRO Dashboard</h2>
                </div>
                
                <nav className="sidebar-chro-nav">
                    <button 
                        className="sidebar-chro-button"
                        onClick={handleHomeClick}
                    >
                        <span className="sidebar-chro-icon">🏠</span>
                        Home
                    </button>
                    
                    <button 
                        className="sidebar-chro-button"
                        onClick={handleDecideClick}
                    >
                        <span className="sidebar-chro-icon">✅</span>
                        อนุมัติ/ปฏิเสธการลา
                    </button>
                    
                    <button 
                        className="sidebar-chro-button"
                        onClick={handleDirectPositionClick}
                    >
                        <span className="sidebar-chro-icon">👥</span>
                        Direct Position
                    </button>
                    
                    <button 
                        className="sidebar-chro-button"
                        onClick={handleShowLogClick}
                    >
                        <span className="sidebar-chro-icon">📋</span>
                        Show Log
                    </button>
                </nav>
            </div>
            
            <button 
                className="sidebar-toggle"
                onClick={toggleSidebar}
                aria-label={isOpen ? 'ปิด Sidebar' : 'เปิด Sidebar'}
            >
                {isOpen ? '✕' : '☰'}
            </button>
        </>
    );
};

export default SidebarCHRO;
