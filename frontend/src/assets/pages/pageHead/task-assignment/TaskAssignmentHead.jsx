import React, { useState, useEffect } from "react";
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
} from "lucide-react";

// Sidebar
import HeadSidebar from "../../../Component/Head/HeadSidebar";
import "./TaskAssignmentHead.css";

const TaskAssignmentHead = () => {
  // --- State ---
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [replacements, setReplacements] = useState([]);

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
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const headId = user.id; // Adjust based on your auth structure

  // --- Effects ---
  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [filterStatus, searchTerm]); // Re-fetch when filters change

  // --- API Calls ---
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [projRes, empRes, repRes] = await Promise.all([
        api.get("/head/projects"),
        api.get(`/head/employees/${headId}`), // Reuse employee list endpoint
        api.get(`/head/replacement-requests/${headId}`),
      ]);

      setProjects(projRes.data);
      setEmployees(empRes.data);
      setReplacements(repRes.data);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const params = {};
      if (filterStatus !== "All") params.status = filterStatus;
      if (searchTerm) params.search = searchTerm;

      const res = await api.get(`/head/department-tasks/${headId}`, { params });
      setTasks(res.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post("/head/tasks/create", {
        ...newTask,
        assigned_by_head_id: headId,
      });
      alert("Task assigned successfully!");
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
      alert("Failed to assign task");
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
      setReplacements(res.data);
    } catch (error) {
      console.error("Error processing request:", error);
      alert("Action failed");
    }
  };

  // --- Helper Functions ---
  const getProgressColor = (progress) => {
    if (progress >= 100) return "#10b981"; // Green
    if (progress >= 50) return "#f59e0b"; // Orange
    return "#ef4444"; // Red
  };

  // Stats Calculation
  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "Pending").length,
    inProgress: tasks.filter((t) => t.status === "In Progress").length,
    completed: tasks.filter((t) => t.status === "Completed").length,
  };

  return (
    <div className="task-assignment-container">
      <HeadSidebar /> {/* Fixed Sidebar */}
      <div className="main-content animate-fade-in">
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
            <div className="glass-card mb-4">
              <h3 className="card-title">
                <ClipboardList size={20} /> Assign New Task
              </h3>

              <form onSubmit={handleCreateTask} className="task-form">
                <div className="form-group">
                  <label className="form-label">Project</label>
                  <select
                    className="form-select"
                    value={newTask.project_id}
                    onChange={(e) =>
                      setNewTask({ ...newTask, project_id: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.project_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Assign To</label>
                  <select
                    className="form-select"
                    value={newTask.assigned_to_user_id}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        assigned_to_user_id: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.first_name} {e.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Task Name</label>
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

                <div className="form-group">
                  <label className="form-label">Deadline</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newTask.deadline}
                    onChange={(e) =>
                      setNewTask({ ...newTask, deadline: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-select"
                    value={newTask.priority}
                    onChange={(e) =>
                      setNewTask({ ...newTask, priority: e.target.value })
                    }
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
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
                className="stat-card"
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
                className="stat-card"
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
                className="stat-card"
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
                    className="form-select"
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

              {loading ? (
                <div className="text-center p-5">Loading tasks...</div>
              ) : (
                <div className="task-list">
                  {tasks.length === 0 ? (
                    <div className="text-center p-5 text-muted">
                      No tasks found.
                    </div>
                  ) : (
                    tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`task-item priority-${task.priority}`}
                      >
                        <div className="task-main">
                          <div className="task-header">
                            <span className="task-name">{task.task_name}</span>
                            <span className="task-project-badge">
                              {task.project_name || "No Project"}
                            </span>
                          </div>
                          <div className="task-assignee">
                            <Users size={14} /> {task.first_name}{" "}
                            {task.last_name}
                          </div>
                          <div className="task-meta">
                            <span>
                              Deadline:{" "}
                              {new Date(task.deadline).toLocaleDateString()}
                            </span>
                            <span>
                              Priority:{" "}
                              <span
                                className={`text-${
                                  task.priority === "High"
                                    ? "danger"
                                    : "success"
                                }`}
                              >
                                {task.priority}
                              </span>
                            </span>
                          </div>
                        </div>
                        <div className="task-side text-end">
                          <div className="status-badge mb-2">{task.status}</div>
                          <div className="progress-wrapper">
                            <div className="progress-bar-bg">
                              <div
                                className="progress-fill"
                                style={{
                                  width: `${task.progress}%`,
                                  backgroundColor: getProgressColor(
                                    task.progress,
                                  ),
                                }}
                              ></div>
                            </div>
                            <span style={{ fontSize: "0.8rem" }}>
                              {task.progress}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskAssignmentHead;
