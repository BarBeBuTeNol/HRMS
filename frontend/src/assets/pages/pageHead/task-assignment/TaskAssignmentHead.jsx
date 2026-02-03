import React, { useState, useEffect, useRef } from "react";
import api from "../../../../services/api";
// Icons
import {
  ClipboardList,
  Users,
  Target,
  Search,
  AlertCircle,
  CheckCircle,
  Clock,
  Briefcase,
  ChevronDown,
  Calendar,
  Flag,
  FileText
} from "lucide-react";

// Sidebar
import HeadSidebar from "../../../Component/Head/HeadSidebar";
import "./TaskAssignmentHead.css";

// Popups
import PopupDoneHead from "../../../Component/poup_done/poup_done-head/PopupDoneHead";
import PopupErrorHead from "../../../Component/popup-error/popup-error-head/PopupErrorHead";

// --- Custom Dropdown Component ---
const CustomDropdown = ({
  options,
  value,
  onChange,
  placeholder,
  icon: Icon,
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="custom-dropdown-container" ref={dropdownRef}>
      <label className="form-label">
        {Icon && <Icon size={16} className="label-icon" />}
        {label}
      </label>
      <div
        className={`dropdown-trigger ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`selected-value ${!selectedOption ? "placeholder" : ""}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={18} className={`dropdown-arrow ${isOpen ? "rotate" : ""}`} />
      </div>
      
      {isOpen && (
        <div className="dropdown-menu animate-slide-down">
          {options.map((option) => (
            <div
              key={option.value}
              className={`dropdown-item ${value === option.value ? "selected" : ""}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
              {value === option.value && <CheckCircle size={14} className="item-check" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TaskAssignmentHead = () => {
  // --- State ---
  const [allTasks, setAllTasks] = useState([]); // Store ALL tasks for stats
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [replacements, setReplacements] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Popup State
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  // Form State
  const [newTask, setNewTask] = useState({
    project_id: "",
    assigned_to_user_id: "",
    task_name: "",
    description: "",
    priority: "Medium",
    deadline: "",
  });

  // Filters
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Loading
  const [loading, setLoading] = useState(true);

  // User Info (from localStorage)
  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const headId = user.id; // Adjust based on your auth structure

  // --- Effects ---
  useEffect(() => {
    fetchInitialData();
  }, []);

  // --- API Calls ---

  const fetchInitialData = async () => {
    try {
      console.log("Fetching initial data... Context User:", user);
      setLoading(true);

      if (!headId) {
        console.error("Head ID not found in localStorage user object.");
        setPopupMessage("User identification failed. Please try logging in again.");
        setShowErrorPopup(true);
        setLoading(false);
        return;
      }

      // Execute all requests in parallel
      const results = await Promise.allSettled([
        api.get("/head/projects"),
        api.get(`/head/employees/${headId}`),
        api.get(`/head/replacement-requests/${headId}`),
        // Fetch ALL tasks initially (no filters) for stats calculation
        api.get(`/head/department-tasks/${headId}`) 
      ]);

      // 1. Projects
      if (results[0].status === "fulfilled") {
        setProjects(results[0].value.data || []);
      }

      // 2. Employees
      if (results[1].status === "fulfilled") {
        setEmployees(results[1].value.data || []);
      }

      // 3. Replacements
      if (results[2].status === "fulfilled") {
        setReplacements(results[2].value.data || []);
      }
      
      // 4. Tasks (All)
      if (results[3].status === "fulfilled") {
        console.log("Tasks loaded (All):", results[3].value.data);
        setAllTasks(Array.isArray(results[3].value.data) ? results[3].value.data : []);
      } else {
        console.error("Failed to load tasks:", results[3].reason);
        setAllTasks([]);
      }

    } catch (error) {
      console.error("Error in fetchInitialData:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    // Only used for refreshing data (e.g. after add)
    try {
      const res = await api.get(`/head/department-tasks/${headId}`);
      if(Array.isArray(res.data)) {
         setAllTasks(res.data);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };


  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.project_id || !newTask.assigned_to_user_id || !newTask.task_name || !newTask.deadline) {
        setPopupMessage("Please fill in all required fields.");
        setShowErrorPopup(true);
        return;
    }

    try {
      await api.post("/head/tasks/create", {
        ...newTask,
        assigned_by_head_id: headId,
      });
      setPopupMessage("Task assigned successfully!");
      setShowSuccessPopup(true);
      
      setNewTask({
        project_id: "",
        assigned_to_user_id: "",
        task_name: "",
        description: "",
        priority: "Medium",
        deadline: "",
      });
      fetchTasks(); // Refresh list
    } catch (error) {
      console.error("Error creating task:", error);
      setPopupMessage("Failed to assign task");
      setShowErrorPopup(true);
    }
  };

  const handleReplacementAction = async (requestId, status) => {
    try {
      await api.put(`/head/replacement-requests/${requestId}`, {
        status,
        remarks: `Processed by Head`,
      });
      // Refresh Requests
      const res = await api.get(`/head/replacement-requests/${headId}`);
      setReplacements(res.data || []);
      
      setPopupMessage(`Request ${status} successfully.`);
      setShowSuccessPopup(true);
    } catch (error) {
      console.error("Error processing request:", error);
      setPopupMessage("Action failed");
      setShowErrorPopup(true);
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return "#10b981"; // Green
    if (progress >= 50) return "#f59e0b"; // Orange
    return "#ef4444"; // Red
  };

  // Stats Calculation (Derived from allTasks - ALWAYS correct)
  const stats = {
    total: allTasks?.length || 0,
    pending: allTasks?.filter((t) => t.status === "Pending").length || 0,
    inProgress: allTasks?.filter((t) => t.status === "In Progress").length || 0,
    completed: allTasks?.filter((t) => t.status === "Completed").length || 0,
  };

  // Filtered Tasks for Display
  const filteredTasks = (allTasks || []).filter(task => {
      const matchesStatus = filterStatus === "All" || task.status === filterStatus;
      const matchesSearch = task.task_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (task.first_name + " " + task.last_name)?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
  });

  // Prepare options for dropdowns
  const projectOptions = projects.map(p => ({ value: p.id, label: p.project_name }));
  const employeeOptions = employees.map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name}` }));
  const priorityOptions = [
    { value: "Low", label: "Low Priority" },
    { value: "Medium", label: "Medium Priority" },
    { value: "High", label: "High Priority" }
  ];

  return (
    <div className="task-assignment-container">
      <HeadSidebar onToggle={setIsSidebarOpen} />

      <div className={`main-content-wrapper ${isSidebarOpen ? "expanded" : "collapsed"}`}>

        {/* Header */}
        <header className="page-header">
          <h1 className="page-title">Task Management</h1>
          <p className="page-subtitle">
            Assign, monitor, and manage your team's workflow effectively.
          </p>
        </header>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Left Column: Assignment Form */}
          <div className="left-col">
            <div className="glass-card assignment-card mb-4">
              <h3 className="card-title">
                <ClipboardList size={22} className="text-accent" /> Assign New Task
              </h3>

              <form onSubmit={handleCreateTask} className="task-form">
                

                {/* Project Dropdown */}
                <div className="form-group">
                    <CustomDropdown
                        label="Project"
                        icon={Briefcase}
                        options={projectOptions}
                        value={newTask.project_id}
                        onChange={(val) => setNewTask({ ...newTask, project_id: val })}
                        placeholder={projects.length > 0 ? "Select Project" : "No Projects Available"}
                    />
                </div>

                {/* Employee Dropdown */}
                <div className="form-group">
                    <CustomDropdown
                        label="Assign To"
                        icon={Users}
                        options={employeeOptions}
                        value={newTask.assigned_to_user_id}
                        onChange={(val) => setNewTask({ ...newTask, assigned_to_user_id: val })}
                        placeholder={employees.length > 0 ? "Select Employee" : "No Employees Found"}
                    />
                </div>

                {/* Task Name */}
                <div className="form-group">
                  <label className="form-label">
                    <Target size={16} className="label-icon" /> Task Name
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Design Homepage"
                    value={newTask.task_name}
                    onChange={(e) =>
                      setNewTask({ ...newTask, task_name: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Deadline */}
                <div className="form-group">
                  <label className="form-label">
                    <Calendar size={16} className="label-icon" /> Deadline
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={newTask.deadline}
                    style={{ colorScheme: "dark" }}
                    onChange={(e) =>
                      setNewTask({ ...newTask, deadline: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Priority Dropdown */}
                <div className="form-group">
                    <CustomDropdown
                        label="Priority"
                        icon={Flag}
                        options={priorityOptions}
                        value={newTask.priority}
                        onChange={(val) => setNewTask({ ...newTask, priority: val })}
                        placeholder="Select Priority"
                    />
                </div>

                {/* Description */}
                <div className="form-group">
                  <label className="form-label">
                    <FileText size={16} className="label-icon" /> Description
                  </label>
                  <textarea
                    className="form-textarea"
                    rows="4"
                    placeholder="Enter task details..."
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask({ ...newTask, description: e.target.value })
                    }
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn">
                  Assign Task
                </button>
              </form>
            </div>

            {/* Replacements Section */}
            {replacements.length > 0 && (
              <div className="glass-card replacements-section">
                <h3 className="card-title text-warning">
                  <AlertCircle size={20} /> Replacement Requests
                </h3>
                <div className="replacement-list">
                  {replacements.map((req) => (
                    <div key={req.id} className="replacement-item">
                      <div className="req-info">
                        <h5>
                          {req.requester_name} {req.requester_lastname}
                        </h5>
                        <p className="req-reason">
                          Request to move task: <strong>{req.task_name}</strong>
                        </p>
                        <p className="req-reason">"{req.reason}"</p>
                      </div>
                      <div className="req-actions">
                        <button
                          className="btn-approve"
                          onClick={() =>
                            handleReplacementAction(req.id, "Approved")
                          }
                        >
                          Approve
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() =>
                            handleReplacementAction(req.id, "Rejected")
                          }
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Monitoring */}
          <div className="right-col">
            {/* Stats Row */}
            <div className="stats-row">
              <div
                className={`stat-card ${filterStatus === "Pending" ? "active" : ""}`}
                onClick={() => setFilterStatus("Pending")}
              >
                <div className="stat-icon-wrapper">
                  <Clock size={24} />
                </div>
                <div className="stat-info">
                  <h4>Pending</h4>
                  <p>{stats.pending}</p>
                </div>
              </div>
              <div
                className={`stat-card ${filterStatus === "In Progress" ? "active" : ""}`}
                onClick={() => setFilterStatus("In Progress")}
              >
                <div className="stat-icon-wrapper">
                  <Target size={24} />
                </div>
                <div className="stat-info">
                  <h4>In Progress</h4>
                  <p>{stats.inProgress}</p>
                </div>
              </div>
              <div
                className={`stat-card ${filterStatus === "Completed" ? "active" : ""}`}
                onClick={() => setFilterStatus("Completed")}
              >
                <div className="stat-icon-wrapper">
                  <CheckCircle size={24} />
                </div>
                <div className="stat-info">
                  <h4>Completed</h4>
                  <p>{stats.completed}</p>
                </div>
              </div>
            </div>

            {/* Main Task List */}
            <div className="glass-card">
              <div className="card-header-row mb-3 d-flex justify-content-between align-items-center">
                <h3 className="card-title mb-0">
                  <Briefcase size={20} /> Team Tasks
                </h3>
                <div className="filter-bar mb-0">
                  <div className="search-box">
                    <Search className="search-icon" size={16} />
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="form-select status-filter"
                    style={{ width: "120px" }}
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Header Row for Grid */}
              <div className="task-grid-header">
                <div>Task Name</div>
                <div>Assignee</div>
                <div>Deadline</div>
                <div>Priority</div>
                <div>Status</div>
                <div>Progress</div>
              </div>

              {loading ? (
                <div className="text-center p-5">Loading tasks...</div>
              ) : (
                <div className="task-list-container">
                  {filteredTasks.length === 0 ? (
                    <div className="text-center p-5 text-muted">
                      No tasks found.
                    </div>
                  ) : (
                    filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        className="task-grid-row"
                        data-priority={task.priority}
                        data-status={task.status}
                      >
                         {/* 1. Info: Name & Project */}
                        <div className="col-info">
                            <span className="task-name-text">{task.task_name}</span>
                            {task.project_name && (
                                <span className="task-project-pill">{task.project_name}</span>
                            )}
                        </div>

                        {/* 2. Assignee */}
                        <div className="col-assignee">
                            <div className="assignee-avatar">
                                {task.first_name?.[0]}{task.last_name?.[0]}
                            </div>
                            <span className="assignee-name">
                             {task.first_name} {task.last_name}
                            </span>
                        </div>

                        {/* 3. Deadline */}
                        <div className="col-deadline">
                            <Calendar size={14} className="me-1 text-muted"/>
                            {new Date(task.deadline).toLocaleDateString()}
                        </div>

                        {/* 4. Priority */}
                        <div className="col-priority">
                             <span className={`priority-tag priority-${task.priority.toLowerCase()}`}>
                                {task.priority}
                             </span>
                        </div>

                        {/* 5. Status */}
                        <div className="col-status">
                             <div className={`status-pill status-${task.status.toLowerCase().replace(" ", "-")}`}>
                                {task.status}
                             </div>
                        </div>

                        {/* 6. Progress */}
                        <div className="col-progress">
                            <div className="progress-bar-minimal">
                                <div 
                                    className="progress-fill-minimal" 
                                    style={{ 
                                        width: `${task.progress}%`,
                                        backgroundColor: getProgressColor(task.progress)
                                    }}
                                ></div>
                            </div>
                            <span className="progress-text-minimal">{task.progress}%</span>
                        </div>

                      </div>
                    ))
                  )}
                </div>
              )}

            </div>
          </div>
        </div>


        {/* --- CUSTOM POPUPS --- */}
        <PopupDoneHead
          isOpen={showSuccessPopup}
          onClose={() => setShowSuccessPopup(false)}
          message={popupMessage}
        />
        <PopupErrorHead
          isOpen={showErrorPopup}
          onClose={() => setShowErrorPopup(false)}
          message={popupMessage}
        />

      </div>
    </div>
  );
};

export default TaskAssignmentHead;
