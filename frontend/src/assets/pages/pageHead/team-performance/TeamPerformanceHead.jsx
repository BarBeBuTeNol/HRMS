import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import api from "../../../../services/api";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import {
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  Award,
  BookOpen,
  Search,
  Users,
  Briefcase,
  TrendingUp,
  Filter,
  BarChart2,
  ChevronRight,
  MoreHorizontal,
  RefreshCw,
  Zap,
  X,
  Mail,
  Phone,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import HeadSidebar from "../../../Component/Head/HeadSidebar";
import "./TeamPerformanceHead.css";

const TeamPerformanceHead = () => {
  const [overview, setOverview] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Interactive Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPosition, setFilterPosition] = useState("All");

  // Modal State
  const [selectedMember, setSelectedMember] = useState(null);
  const [modalType, setModalType] = useState(null); // 'profile', 'assign', 'details'

  // Head Theme Colors
  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"]; 
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userStr = localStorage.getItem("user") || localStorage.getItem("currentUser");
      const user = userStr ? JSON.parse(userStr) : null;
      const headId = user?.id || user?.userId;

      if (!headId) {
        console.error("User not found in localStorage");
        setLoading(false);
        return;
      }

      // Parallel fetching for speed
      const [overviewRes, membersRes] = await Promise.all([
        api.get(`/head/team-performance-overview/${headId}`),
        api.get(`/head/team-performance-members/${headId}`)
      ]);

      setOverview(overviewRes.data.stats);
      setMembers(membersRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching performance data:", error);
      setLoading(false);
    }
  };

  // Process Chart Data
  const pieData = overview
    ? [
        { name: "Completed", value: parseInt(overview.completed || 0) },
        { name: "In Progress", value: parseInt(overview.in_progress || 0) },
        { name: "Pending", value: parseInt(overview.pending || 0) },
      ]
    : [];

  const calculateOnTimeRate = (completed, onTime) => {
    if (!completed || completed === 0) return 0;
    return Math.round((onTime / completed) * 100);
  };

  // Filter Members
  const filteredMembers = members.filter((member) => {
    const matchesName = (member.first_name + " " + member.last_name)
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesPos = filterPosition === "All" || member.position_name === filterPosition;
    return matchesName && matchesPos;
  });

  const uniquePositions = ["All", ...new Set(members.map(m => m.position_name).filter(Boolean))];

  // Find Top Performer
  const topPerformer = members.length > 0 
    ? members.reduce((prev, current) => (prev.total_completed > current.total_completed) ? prev : current)
    : null;

  const openModal = (member, type) => {
    setSelectedMember(member);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedMember(null);
    setModalType(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="spinner"
        ></motion.div>
      </div>
    );
  }

  return (
    <div className={`team-performance-container ${isSidebarOpen ? "" : "sidebar-collapsed"}`}>
      <HeadSidebar onToggle={setIsSidebarOpen} />
      
      {/* 1. Header & Title */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-header"
      >
        <div className="header-flex-wrapper flex justify-between items-end">
            <div>
                <h1 className="page-title">Team <span>Performance</span></h1>
                <p className="page-subtitle">Real-time command center for team productivity and wellness</p>
            </div>
            <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchData}
                className="refresh-btn"
            >
                <RefreshCw size={18} /> Refresh
            </motion.button>
        </div>
      </motion.div>

      {/* 2. Hero Stats Cards */}
      <div className="hero-stats-grid">
        <StatCard 
          icon={<CheckCircle size={24} />} 
          label="Tasks Completed" 
          value={overview?.completed || 0} 
          trend="positive"
          delay={0.1}
        />
        <StatCard 
          icon={<Briefcase size={24} />} 
          label="In Progress" 
          value={overview?.in_progress || 0} 
          trend="neutral"
          delay={0.2}
        />
        <StatCard 
          icon={<Clock size={24} />} 
          label="Pending Review" 
          value={overview?.pending || 0} 
          trend={parseInt(overview?.pending) > 5 ? "negative" : "positive"}
          delay={0.3}
        />
        <StatCard 
          icon={<Zap size={24} />} 
          label="Efficiency Rate" 
          value={`${overview?.efficiency || 0}%`} 
          trend="positive"
          delay={0.4}
        />
      </div>

      {/* 3. Main Dashboard Grid */}
      <div className="dashboard-main-grid">
        
        {/* Left: Overall Progress Chart */}
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel chart-panel"
        >
          <div className="panel-header">
            <h3 className="panel-title">
              <BarChart2 size={22} />
              Workload Distribution
            </h3>
            <button className="text-gray-400 hover:text-white transition-colors">
                <MoreHorizontal size={20} />
            </button>
          </div>
          
          <div className="chart-container">
             <div className="chart-content-wrapper">
                 <div className="chart-wrapper-inner">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Pie
                            data={pieData}
                            innerRadius={70}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <RechartsTooltip 
                            contentStyle={{ 
                            backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                            border: '1px solid rgba(197, 160, 89, 0.3)', 
                            borderRadius: '12px',
                            color: '#fff',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.5)'
                            }} 
                            itemStyle={{ color: '#fff' }}
                        />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Centered Total */}
                    <div className="chart-center-text">
                        <span className="total-number">
                            {pieData.reduce((acc, curr) => acc + curr.value, 0)}
                        </span>
                        <span className="total-label">Total Tasks</span>
                    </div>
                 </div>

                 {/* Improved Legend */}
                 <div className="chart-legend">
                    {pieData.map((entry, index) => (
                      <motion.div 
                        key={index} 
                        className="legend-item"
                        whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.08)" }}
                      >
                        <div className="legend-indicator" style={{ background: COLORS[index % COLORS.length] }}></div>
                        <div className="flex flex-col">
                            <span className="legend-value">{entry.value}</span>
                            <span className="legend-name">{entry.name}</span>
                        </div>
                      </motion.div>
                    ))}
                 </div>
             </div>
          </div>
        </motion.div>

        {/* Right: Attention / Risk Radar */}
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel"
        >
          <div className="panel-header">
            <h3 className="panel-title text-red-400">
              <AlertCircle size={22} className="text-red-400" />
              Attention Required
            </h3>
            <span className="risk-badge">
                Live Monitor
            </span>
          </div>
          
          <div className="attendance-list">
             {members.filter(m => m.total_overdue > 0 || m.days_absent > 1).length === 0 ? (
               <div className="empty-state">
                 <div className="empty-icon-wrapper">
                    <CheckCircle size={32} className="text-emerald-500"/>
                 </div>
                 <p>Excellent! No immediate risks detected.</p>
               </div>
             ) : (
                <AnimatePresence>
                {members
                    .filter(m => m.total_overdue > 0 || m.approved_leaves > 0)
                    .slice(0, 5)
                    .map((m, idx) => {
                    const riskLevel = m.total_overdue > 2 ? 'critical' : 'warning';
                    return (
                        <motion.div 
                            key={m.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`attendance-item ${riskLevel}`}
                        >
                            <div className="flex items-center gap-3">
                                <Avatar m={m} />
                                <div>
                                    <div className="font-semibold text-white text-sm">{m.first_name} {m.last_name}</div>
                                    <div className="text-xs text-gray-400">
                                        {m.total_overdue} Overdue • {m.approved_leaves || 0} Leaves
                                    </div>
                                </div>
                            </div>
                            {riskLevel === 'critical' ? (
                                <button className="action-btn-sm critical" onClick={() => openModal(m, 'assign')}>Remind</button>
                            ) : (
                                <button className="action-btn-sm warning" onClick={() => openModal(m, 'details')}>View</button>
                            )}
                        </motion.div>
                    );
                    })}
                </AnimatePresence>
             )}
          </div>
        </motion.div>
      </div>

      {/* 4. Top Performer Highlight */}
      {topPerformer && (
         <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="top-performer-banner"
            onClick={() => openModal(topPerformer, 'details')}
            style={{ cursor: 'pointer' }}
         >
            <div className="trophy-section">
                <div className="trophy-icon"><Award size={32} /></div>
                <div>
                     <h3>Top Performer of the Month</h3>
                     <p>Outstanding contribution to team goals</p>
                </div>
            </div>
            <div className="performer-details">
                 <Avatar m={topPerformer} large />
                 <div>
                      <h4>{topPerformer.first_name} {topPerformer.last_name}</h4>
                      <span className="text-amber-300 font-bold">{topPerformer.total_completed} Tasks Completed</span>
                 </div>
            </div>
         </motion.div>
      )}

      {/* 5. Members Grid */}
      <div className="glass-panel" style={{ minHeight: 'auto', marginTop: '2rem' }}>
        <div className="panel-header">
           <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h3 className="panel-title">
                    <Users size={22} />
                    Team Roster
                </h3>
                <span className="text-sm text-gray-400 ml-2">({filteredMembers.length} Members)</span>
           </div>
           
           <div className="members-filter-bar">
              <div className="search-wrapper fancy-input">
                 <Search className="search-icon" size={16} />
                 <input 
                   type="text" 
                   placeholder="Search members..." 
                   className="search-input"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
                 <div className="input-glow"></div>
              </div>
              <div className="relative fancy-select-wrapper">
                 <Filter className="filter-icon" size={16}/>
                 <select 
                   className="filter-select pl-9"
                   value={filterPosition}
                   onChange={(e) => setFilterPosition(e.target.value)}
                 >
                   {uniquePositions.map(pos => (
                     <option key={pos} value={pos}>{pos}</option>
                   ))}
                 </select>
              </div>
           </div>
        </div>

        <motion.div layout className="members-grid-view">
          <AnimatePresence>
            {filteredMembers.map(member => {
                const onTimeRate = calculateOnTimeRate(member.total_completed, member.on_time_completed);
                const avgProgress = member.avg_progress ? Math.round(member.avg_progress) : 0;
                
                return (
                <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={member.id} 
                    className="member-card group"
                >
                    <div className="member-header">
                        <Avatar m={member} large />
                        <div className="member-info">
                            <h4>{member.first_name} {member.last_name}</h4>
                            <span className="member-role">{member.position_name || 'Member'}</span>
                        </div>
                    </div>
                    
                    <div className="member-stats">
                        <div className="stat-row">
                            <span>Tasks</span>
                            <span className="font-mono">{member.total_completed} <span className="text-gray-500 text-xs">/ {member.total_assigned}</span></span>
                        </div>
                        <div className="w-full bg-gray-700 h-1.5 rounded-full mb-3 overflow-hidden">
                            <div className="bg-gradient-to-r from-amber-500 to-yellow-300 h-full rounded-full" style={{ width: `${avgProgress}%` }}></div>
                        </div>

                        <div className="stat-row">
                            <span>On-Time</span>
                            <span className={`font-bold ${onTimeRate >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>{onTimeRate}%</span>
                        </div>
                    </div>

                    <div className="member-actions">
                        <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="action-btn-icon" 
                            title="View Profile"
                            onClick={() => openModal(member, 'profile')}
                        >
                            <User size={18} />
                        </motion.button>
                        <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="action-btn-icon" 
                            title="Assign Task"
                            onClick={() => openModal(member, 'assign')}
                        >
                            <Briefcase size={18} />
                        </motion.button>
                        <motion.button 
                           whileHover={{ scale: 1.1 }}
                           whileTap={{ scale: 0.9 }}
                           className="action-btn-icon text-white bg-amber-500/20" 
                           title="Details"
                           onClick={() => openModal(member, 'details')}
                        >
                            <ChevronRight size={18} />
                        </motion.button>
                    </div>
                </motion.div>
                );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Modal Render */}
      <MemberActionModal 
        isOpen={!!selectedMember} 
        onClose={closeModal} 
        data={selectedMember} 
        type={modalType} 
      />

    </div>
  );
};

// Reusable Avatar Component with Error Handling
// Reusable Avatar Component with Error Handling
function Avatar({ m, large = false }) {
    const [imgError, setImgError] = useState(false);
    
    const imgSrc = m.image 
        ? (m.image.startsWith('http') ? m.image : `http://localhost:3000${m.image}`)
        : null;

    const wrapperClass = large ? "member-avatar-lg-wrapper" : "avatar-wrapper";
    const placeholderClass = large ? "member-avatar-lg-placeholder" : "avatar-placeholder";

    return (
        <div className={wrapperClass}>
            {m.image && !imgError ? (
                <img 
                    src={imgSrc} 
                    alt={m.first_name} 
                    className={large ? "member-avatar-lg" : "avatar-img"}
                    onError={() => setImgError(true)}
                />
            ) : (
                <div className={placeholderClass}>
                    {m.first_name ? m.first_name[0].toUpperCase() : 'U'}
                </div>
            )}
        </div>
    );
}

// Sub-component for clean code
function StatCard({ icon, label, value, trend, delay }) {
  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="hero-stat-card"
    >
        <div className="stat-header">
        <div className="stat-icon-wrapper">{icon}</div>
        <div className={`stat-trend ${trend}`}>
            <TrendingUp size={14} />
        </div>
        </div>
        <div className="stat-content">
        <h2>{value}</h2>
        <p>{label}</p>
        </div>
    </motion.div>
  );
}

// --- Modal Component ---
// Helper for date formatting
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
};

function MemberActionModal({ isOpen, onClose, data, type }) {
    // State for Priority (Assignment)
    const [priority, setPriority] = useState('Medium');

    useEffect(() => {
        if (isOpen) {
            setPriority('Medium');
        }
    }, [isOpen]);

    if (!isOpen || !data) return null;

    const renderContent = () => {
        switch(type) {
            case 'profile':

                return (
                    <div className="modal-content-body">
                         <div className="modal-profile-header">
                             <Avatar m={data} large />
                             <div className="text-center mt-3">
                                <h3 className="text-xl font-bold text-white">{data.first_name} {data.last_name}</h3>
                                <div className="flex flex-col items-center gap-1 mt-1">
                                    <span className="text-amber-400 font-medium">{data.position_name}</span>
                                    <span className="text-gray-400 text-xs">{data.department_name || 'Department N/A'}</span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold mt-1 
                                        ${!data.employment_status || data.employment_status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-400'}`}>
                                        {data.employment_status || 'Active'}
                                    </span>
                                </div>
                             </div>
                         </div>
                         <div className="modal-info-grid">
                            <div className="info-item">
                                <Mail size={16} className="text-gray-400" />
                                <span>{data.email || 'No Email'}</span>
                            </div>
                             <div className="info-item">
                                <Phone size={16} className="text-gray-400" />
                                <span>{data.phone || 'No Phone'}</span>
                            </div>
                             <div className="info-item">
                                <Calendar size={16} className="text-gray-400" />
                                <span>Joined: {formatDate(data.join_date)}</span>
                            </div>
                         </div>
                    </div>
                );
            case 'assign':
                return (
                    <div className="modal-content-body">
                        <div className="flex items-center gap-4 mb-6 border-b border-gray-700 pb-4">
                            <Avatar m={data} />
                            <div>
                                <h4 className="text-lg font-bold text-white">Assign to {data.first_name}</h4>
                                <p className="text-xs text-amber-400">{data.position_name}</p>
                            </div>
                        </div>
                        
                        <h3 className="section-title"><Briefcase size={18}/> New Task Details</h3>
                        <div className="form-group">
                            <label>Task Title</label>
                            <input type="text" className="modal-input" placeholder="e.g. Update Documentation" />
                        </div>
                        <div className="form-group">
                            <label>Priority</label>
                            <div className="priority-select">
                                <span 
                                    className={`p-badge p-low ${priority === 'Low' ? 'active' : ''}`}
                                    onClick={() => setPriority('Low')}
                                >
                                    Low
                                </span>
                                <span 
                                    className={`p-badge p-med ${priority === 'Medium' ? 'active' : ''}`}
                                    onClick={() => setPriority('Medium')}
                                >
                                    Medium
                                </span>
                                <span 
                                    className={`p-badge p-high ${priority === 'High' ? 'active' : ''}`}
                                    onClick={() => setPriority('High')}
                                >
                                    High
                                </span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Due Date</label>
                            <input type="date" className="modal-input" />
                        </div>
                         <div className="mt-6">
                            <button className="modal-btn-primary w-full">Confirm Assignment</button>
                         </div>
                    </div>
                );
            case 'details':
                return (
                    <div className="modal-content-body">
                        <div className="flex items-center gap-4 mb-6">
                            <Avatar m={data} />
                            <div>
                                <h4 className="text-lg font-bold text-white">Performance Stats</h4>
                                <p className="text-xs text-gray-400">Current Month</p>
                            </div>
                        </div>
                        <div className="stats-grid-mini">
                            <div className="stat-mini">
                                <span className="lbl">Completed</span>
                                <span className="val text-emerald-400">{data.total_completed}</span>
                            </div>
                             <div className="stat-mini">
                                <span className="lbl">On-Time</span>
                                <span className="val text-amber-400">{data.on_time_completed}</span>
                            </div>
                             <div className="stat-mini">
                                <span className="lbl">Overdue</span>
                                <span className="val text-red-400">{data.total_overdue}</span>
                            </div>
                             <div className="stat-mini">
                                <span className="lbl">Efficiency</span>
                                <span className="val text-blue-400">
                                   {data.total_completed ? Math.round((data.on_time_completed / data.total_completed) * 100) : 0}%
                                </span>
                            </div>
                        </div>
                         <div className="mt-6">
                            <button className="modal-btn-secondary w-full" onClick={onClose}>Close Details</button>
                         </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return createPortal(
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 99999, display: 'flex', opacity: 1, visibility: 'visible' }}>
            <div 
                className="modal-container"
                onClick={(e) => e.stopPropagation()}
                style={{ opacity: 1, transform: 'none', zIndex: 100000 }}
            >
                <button className="modal-close-btn" onClick={onClose}>
                    <X size={20} />
                </button>
                {renderContent()}
            </div>
        </div>,
        document.body
    );
}



export default TeamPerformanceHead;
