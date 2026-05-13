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
import Swal from 'sweetalert2';
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
    const searchLower = searchTerm.toLowerCase();
    const fullName = (member.first_name + " " + member.last_name).toLowerCase();
    const matchesName = fullName.includes(searchLower) || (member.id && member.id.toString().includes(searchLower));
    
    const matchesPos = filterPosition === "All" || member.position_name === filterPosition;
    return matchesName && matchesPos;
  });

  const uniquePositions = ["All", ...new Set(members.map(m => m.position_name).filter(Boolean))];

  // Find Top Performer
  const maxCompleted = members.length > 0 ? Math.max(...members.map(m => parseInt(m.total_completed) || 0)) : 0;
  const topPerformer = maxCompleted > 0 
    ? members.find(m => (parseInt(m.total_completed) || 0) === maxCompleted)
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
                   <option value="All">All Positions</option>
                   {uniquePositions.filter(p => p !== 'All').map(pos => (
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

                    <div className="member-actions" style={{ gap: '0.5rem' }}>
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="action-btn-text" 
                            onClick={() => openModal(member, 'profile')}
                        >
                            Profile
                        </motion.button>
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="action-btn-text"
                            onClick={() => openModal(member, 'assign')}
                        >
                            Assign
                        </motion.button>
                        <motion.button 
                           whileHover={{ scale: 1.05 }}
                           whileTap={{ scale: 0.95 }}
                           className="action-btn-text primary-action" 
                           onClick={() => openModal(member, 'details')}
                        >
                            Stats
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
    const [taskTitle, setTaskTitle] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setPriority('Medium');
            setTaskTitle('');
            setDueDate('');
        }
    }, [isOpen]);

    const handleAssignTask = async () => {
        if (!taskTitle.trim() || !dueDate) {
            Swal.fire({
                icon: 'warning',
                title: 'Incomplete Information',
                text: 'Please enter a Task Title and select a Due Date.',
                background: '#1e293b',
                color: '#fff'
            });
            return;
        }

        try {
            setIsSubmitting(true);
            const userStr = localStorage.getItem("user") || localStorage.getItem("currentUser");
            const user = userStr ? JSON.parse(userStr) : null;
            const headId = user?.id || user?.userId;

            const description = `${priority} Priority Task`;

            const res = await api.post('/task_assignments', {
                user_id: data.id,
                task_name: taskTitle,
                description: description,
                deadline: dueDate
            });

            if (res.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Task Assigned',
                    text: `Task has been assigned to ${data.first_name} successfully.`,
                    background: '#1e293b',
                    color: '#fff',
                    timer: 2000,
                    showConfirmButton: false
                });
                onClose();
            } else {
                throw new Error(res.data.message || 'Failed to assign task');
            }
        } catch (error) {
            console.error('Error assigning task:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Something went wrong while assigning the task.',
                background: '#1e293b',
                color: '#fff'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !data) return null;

    const renderContent = () => {
        switch(type) {
            case 'profile':
                return (
                    <div className="modal-content-body flex flex-col items-center w-full">
                        <div style={{ position: 'relative', marginBottom: '1.5rem', marginTop: '1rem' }}>
                            <Avatar m={data} large />
                            <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', background: '#10b981', border: '4px solid #1e293b', borderRadius: '50%', width: '28px', height: '28px' }}></div>
                        </div>

                        <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', marginBottom: '0.25rem', textAlign: 'center' }}>
                            {data.first_name} {data.last_name}
                        </h3>
                        <p style={{ color: '#c5a059', fontSize: '1rem', fontWeight: '600', letterSpacing: '0.5px' }}>
                            {data.position_name || 'Employee'}
                        </p>
                        
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', marginBottom: '2.5rem' }}>
                             <span style={{ padding: '0.35rem 1rem', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '500', border: '1px solid rgba(255,255,255,0.1)' }}>
                                 {data.department_name || 'Department N/A'}
                             </span>
                             <span style={{ padding: '0.35rem 1rem', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                 {data.employment_status || 'Active'}
                             </span>
                        </div>

                        <div className="modal-info-grid" style={{ width: '100%', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '20px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}><Mail size={20}/></div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', marginBottom: '0.15rem' }}>Email Address</div>
                                    <div style={{ color: '#fff', fontWeight: '500', fontSize: '1rem' }}>{data.email || 'No Email Provided'}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}><Phone size={20}/></div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', marginBottom: '0.15rem' }}>Phone Number</div>
                                    <div style={{ color: '#fff', fontWeight: '500', fontSize: '1rem' }}>{data.phone || 'No Phone Provided'}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}><User size={20}/></div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', marginBottom: '0.15rem' }}>Employee ID</div>
                                    <div style={{ color: '#fff', fontWeight: '500', fontSize: '1rem' }}>{data.id || 'N/A'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'assign':
                return (
                    <div className="modal-content-body">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem', padding: '1.25rem', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <Avatar m={data} />
                            <div>
                                <h4 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#fff', marginBottom: '0.25rem' }}>
                                    Assign to {data.first_name}
                                </h4>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#c5a059', fontWeight: '600' }}>
                                    <Briefcase size={14} /> {data.position_name || 'Member'}
                                </div>
                            </div>
                        </div>
                        
                        <h3 className="section-title" style={{ fontSize: '1.15rem', paddingBottom: '0.75rem', borderBottomColor: 'rgba(255,255,255,0.1)', color: '#e2e8f0' }}>
                            <Briefcase size={20} style={{ color: '#60a5fa' }}/> Task Specifications
                        </h3>
                        
                        <div className="form-group" style={{ marginTop: '1.5rem' }}>
                            <label style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8' }}>Task Title</label>
                            <input 
                                type="text" 
                                className="modal-input" 
                                placeholder="e.g. Update Documentation" 
                                style={{ fontSize: '1rem', padding: '1rem' }}
                                value={taskTitle}
                                onChange={(e) => setTaskTitle(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8' }}>Priority Level</label>
                            <div className="priority-select">
                                <span 
                                    className={`p-badge p-low ${priority === 'Low' ? 'active' : ''}`}
                                    onClick={() => setPriority('Low')}
                                >
                                    Low Priority
                                </span>
                                <span 
                                    className={`p-badge p-med ${priority === 'Medium' ? 'active' : ''}`}
                                    onClick={() => setPriority('Medium')}
                                >
                                    Medium Priority
                                </span>
                                <span 
                                    className={`p-badge p-high ${priority === 'High' ? 'active' : ''}`}
                                    onClick={() => setPriority('High')}
                                >
                                    High Priority
                                </span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8' }}>Target Due Date</label>
                            <input 
                                type="date" 
                                className="modal-input" 
                                min={new Date().toISOString().split("T")[0]}
                                style={{ fontSize: '1rem', padding: '1rem' }}
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>
                         <div className="mt-8">
                            <button 
                                className="modal-btn-primary w-full" 
                                style={{ padding: '1rem', fontSize: '1.05rem', letterSpacing: '0.5px' }}
                                onClick={handleAssignTask}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Assigning...' : 'Confirm Assignment'}
                            </button>
                         </div>
                    </div>
                );
            case 'details':
                return (
                    <div className="modal-content-body">
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '1.5rem', width: '100%' }}>
                            <Avatar m={data} large />
                            <h4 style={{ fontSize: '1.35rem', fontWeight: 'bold', color: '#ffffff', marginTop: '0.75rem', marginBottom: '0.25rem' }}>
                                {data.first_name}'s Stats
                            </h4>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                <Calendar size={14} /> Current Month
                            </div>
                        </div>
                        
                        <div className="premium-stats-grid">
                            <div className="premium-stat-card completed">
                                <div className="stat-icon"><CheckCircle size={20} /></div>
                                <div className="stat-info">
                                    <span className="lbl">Completed</span>
                                    <span className="val text-emerald-400">{data.total_completed}</span>
                                </div>
                            </div>
                            <div className="premium-stat-card delay">
                                <div className="stat-icon"><AlertCircle size={20} /></div>
                                <div className="stat-info">
                                    <span className="lbl">Overdue</span>
                                    <span className="val text-red-400">{data.total_overdue}</span>
                                </div>
                            </div>
                            <div className="premium-stat-card ontime" style={{ gridColumn: 'span 2' }}>
                                <div className="flex items-center justify-between w-full ontime-content">
                                    <div className="flex items-center gap-3">
                                        <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}><Clock size={20} /></div>
                                        <div className="stat-info">
                                            <span className="lbl" style={{ textAlign: "left" }}>On-Time Delivered</span>
                                            <span className="val text-amber-400">{data.on_time_completed} Tasks</span>
                                        </div>
                                    </div>
                                    <div className="efficiency-badge">
                                        <Zap size={16} />
                                        {data.total_completed ? Math.round((data.on_time_completed / data.total_completed) * 100) : 0}% Efficiency
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                         <div className="mt-8">
                            <button className="modal-btn-secondary w-full" onClick={onClose}>Close Overview</button>
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
