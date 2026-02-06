import React, { useState, useEffect, useMemo } from "react";
import api from "../../../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTasks,
  FaRegCalendarAlt,
  FaCheckCircle,
  FaSpinner,
  FaExclamationTriangle,
  FaClock,
  FaTimesCircle,
  FaEdit,
  FaUserTimes,
  FaUserCheck,
  FaThLarge,
  FaList,
  FaSearch,
  FaSortAmountDown,
  FaTrophy,
  FaFilter,
} from "react-icons/fa";
import EmployeeSidebar from "../../../Component/Employee/EmployeeSidebar";
import "./myWork.css";

// --- Helper Functions ---
const getCurrentUserId = () => {
  try {
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id;
    }
    const userId = localStorage.getItem("userId");
    if (userId && !isNaN(userId)) return userId;
  } catch (e) {
    console.error("Error parsing user data", e);
  }
  return 1;
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

export default function MyWork() {
  // --- State ---
  const [stats, setStats] = useState({});
  const [pendingTasks, setPendingTasks] = useState([]);
  const [activeTasks, setActiveTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // UI State
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'grid'
  const [filterStatus, setFilterStatus] = useState("All"); // All, In Progress, Review, Completed
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectTaskId, setRejectTaskId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [replaceTaskId, setReplaceTaskId] = useState(null);
  const [replaceReason, setReplaceReason] = useState("");

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // --- Effects ---
  useEffect(() => {
    const id = getCurrentUserId();
    if (id) {
      setUserId(id);
      fetchDashboardData(id);
    } else {
      setError("ไม่พบข้อมูลผู้ใช้งาน (กรุณา Login ใหม่)");
      setLoading(false);
    }

    // Clock Timer
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async (id) => {
    try {
      setLoading(true);
      const response = await api.get(`/users/${id}/my-work-dashboard`);
      if (response.data.success) {
        setStats(response.data.stats || {});
        setPendingTasks(response.data.pendingTasks || []);
        setActiveTasks(response.data.activeTasks || []);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("ไม่สามารถโหลดข้อมูลงานได้ (Server Error)");
    } finally {
      setLoading(false);
    }
  };

  // --- Actions ---
  const handleAcceptTask = async (taskId) => {
    try {
      await api.post(`/task_assignments/${taskId}/accept`);
      // alert("รับงานเรียบร้อยแล้ว!"); // Optional: Switch to toast if available
      fetchDashboardData(userId);
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการรับงาน");
    }
  };

  const handleRejectTask = async () => {
    if (!rejectTaskId || !rejectReason) return alert("กรุณาระบุเหตุผล");
    try {
      await api.post(`/task_assignments/${rejectTaskId}/reject`, {
        reason: rejectReason,
      });
      setIsRejectModalOpen(false);
      setRejectReason("");
      fetchDashboardData(userId);
    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    }
  };

  const saveProgress = async () => {
    if (!selectedTask) return;
    try {
      let newStatus = selectedTask.status;
      if (selectedTask.progress === 100) newStatus = "Completed";
      else if (selectedTask.progress === 0 && newStatus === "Completed")
        newStatus = "In Progress";

      await api.patch(`/task_assignments/${selectedTask.id}`, {
        progress: selectedTask.progress,
        status: newStatus,
      });

      setIsUpdateModalOpen(false);
      fetchDashboardData(userId);
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  const handleRequestReplacement = async () => {
    if (!replaceTaskId || !replaceReason) return alert("กรุณาระบุเหตุผล");
    try {
      await api.post(`/task_replacements`, {
        task_id: replaceTaskId,
        existing_user_id: userId,
        reason: replaceReason,
      });
      alert("ส่งคำขอเปลี่ยนตัวแล้ว รอการอนุมัติ");
      setIsReplaceModalOpen(false);
      setReplaceReason("");
      fetchDashboardData(userId);
    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    }
  };

  // --- Computed ---
  const filteredActiveTasks = useMemo(() => {
    return activeTasks.filter((task) => {
      const matchesSearch = task.task_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesFilter =
        filterStatus === "All" ||
        (filterStatus === "Completed" && task.status === "Completed") ||
        (filterStatus === "In Progress" && task.status !== "Completed"); // Simplified logic

      return matchesSearch && matchesFilter;
    });
  }, [activeTasks, searchQuery, filterStatus]);

  const productivityScore = useMemo(() => {
    // Simple mock calculation or real one if data available
    const total = activeTasks.length + pendingTasks.length;
    if (total === 0) return 100;
    const completed = activeTasks.filter(
      (t) => t.status === "Completed" || t.progress === 100
    ).length;
    return Math.round((completed / total) * 100);
  }, [activeTasks, pendingTasks]);

  // --- Render Helpers ---
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "status-completed";
      case "In Progress":
        return "status-inprogress";
      case "Pending":
        return "status-pending";
      case "Rejected":
        return "status-rejected";
      default:
        return "status-default";
    }
  };

  const getDeadlineClass = (deadline) => {
    if (!deadline) return "";
    const d = new Date(deadline);
    const now = new Date();
    const diff = (d - now) / (1000 * 60 * 60 * 24);
    if (diff < 0) return "text-overdue";
    if (diff < 3) return "text-duesoon";
    return "text-normal";
  };

  // --- Animations ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="emp-mywork-layout">
      <EmployeeSidebar />

      <main className="emp-mywork-main">
        {/* Header HUD */}
        <motion.header
          className="emp-mywork-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="header-greeting">
            <h1 className="greeting-title">
              {getGreeting()}, <span className="user-highlight">Hero</span>
            </h1>
            <p className="current-date">
              {currentTime.toLocaleDateString("th-TH", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          
          <div className="header-stats-hud">
             <div className="hud-item">
                <div className="hud-label">Productivity</div>
                <div className="hud-value glow-text">{productivityScore}%</div>
             </div>
             <div className="hud-divider"></div>
             <div className="hud-item">
                <div className="hud-label">Pending</div>
                <div className="hud-value text-warn">{stats.pending || 0}</div>
             </div>
             <div className="hud-divider"></div>
             <div className="hud-item">
                <div className="hud-label">Due Soon</div>
                <div className="hud-value text-danger">{stats.due_soon || 0}</div>
             </div>
          </div>

          <button
            className="emp-btn-refresh-icon"
            onClick={() => userId && fetchDashboardData(userId)}
            title="Refresh Data"
          >
             <FaSpinner className={loading ? "animate-spin" : ""} />
          </button>
        </motion.header>

        {/* Content Area */}
        {loading ? (
          <div className="emp-loading-container">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="loading-spinner-large"
            >
              <FaSpinner />
            </motion.div>
            <p>Loading Dashboard...</p>
          </div>
        ) : error ? (
           <div className="emp-error-state">
              <FaExclamationTriangle size={48} className="icon-error" />
              <h3>Oops! Something went wrong.</h3>
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Try Again</button>
           </div>
        ) : (
          <motion.div
            className="emp-dashboard-content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* 1. Pending Tasks (Attention Required) */}
            <AnimatePresence>
              {pendingTasks.length > 0 && (
                <motion.section 
                    className="section-pending"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                >
                  <div className="section-header">
                    <FaClock className="icon-pending" />
                    <h2>Attention Required ({pendingTasks.length})</h2>
                  </div>
                  <div className="pending-cards-scroll">
                    {pendingTasks.map((task) => (
                      <motion.div key={task.id} className="pending-card" layout>
                         <div className="pending-card-top">
                            <span className="badge-deadline">
                                {new Date(task.deadline).toLocaleDateString("th-TH")}
                            </span>
                         </div>
                         <h3>{task.task_name}</h3>
                         <p className="assigner">By: {task.fname} {task.lname}</p>
                         <div className="pending-actions">
                             <button onClick={() => handleAcceptTask(task.id)} className="btn-ok">
                                <FaCheckCircle /> Accept
                             </button>
                             <button onClick={() => {
                                 setRejectTaskId(task.id);
                                 setIsRejectModalOpen(true);
                             }} className="btn-no">
                                <FaTimesCircle /> Reject
                             </button>
                         </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            {/* 2. Active Tasks Controls */}
            <div className="tasks-toolbar">
               <div className="toolbar-left">
                  <div className="search-bar">
                      <FaSearch className="search-icon"/>
                      <input 
                        type="text" 
                        placeholder="Search tasks..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                  </div>
                  <div className="filter-tabs">
                      {['All', 'In Progress', 'Completed'].map(status => (
                          <button 
                            key={status}
                            className={`tab-btn ${filterStatus === status ? 'active' : ''}`}
                            onClick={() => setFilterStatus(status)}
                          >
                             {status}
                          </button>
                      ))}
                  </div>
               </div>
               <div className="toolbar-right">
                  <button 
                    className={`view-toggle ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                      <FaList />
                  </button>
                  <button 
                    className={`view-toggle ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                  >
                      <FaThLarge />
                  </button>
               </div>
            </div>

            {/* 3. Active Tasks Display */}
            <motion.div className="tasks-display-area" layout>
                {filteredActiveTasks.length === 0 ? (
                    <div className="empty-state">
                        <FaTasks size={40} />
                        <p>No tasks found.</p>
                    </div>
                ) : viewMode === 'list' ? (
                    /* LIST VIEW */
                    <div className="task-list-view">
                         {filteredActiveTasks.map(task => (
                             <motion.div 
                                key={task.id} 
                                className="task-list-item"
                                variants={itemVariants} 
                             >
                                <div className="task-info">
                                    <div className="task-project">{task.project_name || "General"}</div>
                                    <div className="task-name">{task.task_name}</div>
                                </div>
                                <div className="task-meta">
                                    <div className={`task-deadline ${getDeadlineClass(task.deadline)}`}>
                                        <FaRegCalendarAlt />
                                        {new Date(task.deadline).toLocaleDateString("th-TH")}
                                    </div>
                                    <div className="task-assigner">
                                        by {task.assigner_fname}
                                    </div>
                                </div>
                                <div className="task-progress-cell">
                                    <div className="progress-mini">
                                        <div className="bar-bg">
                                            <div className="bar-fill" style={{width: `${task.progress}%`}} />
                                        </div>
                                        <span>{task.progress}%</span>
                                    </div>
                                </div>
                                <div className="task-status-cell">
                                     <span className={`status-pill ${getStatusColor(task.status)}`}>{task.status}</span>
                                </div>
                                <div className="task-actions-cell">
                                    <button onClick={() => { setSelectedTask(task); setIsUpdateModalOpen(true); }}>
                                        <FaEdit />
                                    </button>
                                    <button 
                                        disabled={!!task.replacement_status}
                                        onClick={() => {
                                            if(!task.replacement_status) {
                                                setReplaceTaskId(task.id);
                                                setIsReplaceModalOpen(true);
                                            }
                                        }}
                                        className={task.replacement_status ? "disabled" : ""}
                                    >
                                        {task.replacement_status ? <FaUserCheck /> : <FaUserTimes />}
                                    </button>
                                </div>
                             </motion.div>
                         ))}
                    </div>
                ) : (
                    /* GRID VIEW */
                    <div className="task-grid-view">
                        {filteredActiveTasks.map(task => (
                             <motion.div 
                                key={task.id} 
                                className="task-card-item"
                                variants={itemVariants}
                                whileHover={{ y: -5 }}
                             >
                                <div className="card-header">
                                    <span className={`info-pill ${task.project_name ? 'project' : 'general'}`}>
                                        {task.project_name || "General"}
                                    </span>
                                    <button className="card-opt-btn" onClick={() => { setSelectedTask(task); setIsUpdateModalOpen(true); }}>
                                        <FaEdit />
                                    </button>
                                </div>
                                <h4>{task.task_name}</h4>
                                <div className="card-deadline">
                                    <FaRegCalendarAlt className="mr-1" />
                                    <span className={getDeadlineClass(task.deadline)}>
                                        {new Date(task.deadline).toLocaleDateString("th-TH")}
                                    </span>
                                </div>
                                
                                <div className="card-progress-section">
                                    <div className="flex justify-between text-xs mb-1 text-gray-400">
                                        <span>Progress</span>
                                        <span>{task.progress}%</span>
                                    </div>
                                    <div className="progress-bar-bg">
                                        <div className="progress-bar-fill" style={{ width: `${task.progress}%` }}></div>
                                    </div>
                                </div>

                                <div className="card-footer">
                                    <span className={`status-pill small ${getStatusColor(task.status)}`}>
                                        {task.status}
                                    </span>
                                    {task.replacement_status && (
                                        <span className="status-pill small status-pending" title="Requested Replacement">
                                            <FaUserCheck /> Rep. Pending
                                        </span>
                                    )}
                                </div>
                             </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

          </motion.div>
        )}

        {/* --- Modals (Re-used structure with updated classes) --- */}
        <AnimatePresence>
          {isRejectModalOpen && (
            <motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                <motion.div className="modal-glass" initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.95, opacity:0}}>
                    <h3>Why are you rejecting this task?</h3>
                    <textarea 
                        className="glass-input" 
                        rows={4} 
                        placeholder="Reason..." 
                        value={rejectReason}
                        onChange={(e)=>setRejectReason(e.target.value)}
                    />
                    <div className="modal-actions-right">
                        <button className="btn-text" onClick={()=>setIsRejectModalOpen(false)}>Cancel</button>
                        <button className="btn-primary-danger" onClick={handleRejectTask}>Reject Task</button>
                    </div>
                </motion.div>
            </motion.div>
          )}

          {isUpdateModalOpen && selectedTask && (
             <motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                <motion.div className="modal-glass" initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.95, opacity:0}}>
                    <h3>Update Progress</h3>
                    <p className="text-gray-400 mb-4">{selectedTask.task_name}</p>
                    
                    <div className="progress-slider-area">
                        <div className="slider-val">{selectedTask.progress}%</div>
                        <input 
                            type="range" 
                            min="0" max="100" 
                            value={selectedTask.progress} 
                            onChange={(e) => setSelectedTask({...selectedTask, progress: Number(e.target.value)})}
                            className="glass-slider"
                        />
                    </div>

                    <div className="modal-actions-right">
                        <button className="btn-text" onClick={()=>setIsUpdateModalOpen(false)}>Cancel</button>
                        <button className="btn-primary" onClick={saveProgress}>Save Changes</button>
                    </div>
                </motion.div>
            </motion.div>
          )}

          {isReplaceModalOpen && (
              <motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                <motion.div className="modal-glass" initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.95, opacity:0}}>
                    <h3>Request Replacement</h3>
                    <textarea 
                        className="glass-input" 
                        rows={4} 
                        placeholder="Reason for replacement request..." 
                        value={replaceReason}
                        onChange={(e)=>setReplaceReason(e.target.value)}
                    />
                    <div className="modal-actions-right">
                        <button className="btn-text" onClick={()=>setIsReplaceModalOpen(false)}>Cancel</button>
                        <button className="btn-primary-warn" onClick={handleRequestReplacement}>Submit Request</button>
                    </div>
                </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
