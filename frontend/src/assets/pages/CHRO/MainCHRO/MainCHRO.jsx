import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import CHROLayout from "../../../Component/CHRO/CHROLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUsers,
  FaUserTie,
  FaBuilding,
  FaChartLine,
  FaSearch,
  FaSortAmountDown,
  FaThLarge,
  FaList,
  FaTrashAlt,
  FaEye,
  FaBriefcase,
  FaVenusMars,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaBullhorn,
  FaExchangeAlt,
  FaTasks,
  FaCheckCircle,
  FaMoneyBillWave,
} from "react-icons/fa";
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import "./MainCHRO.css";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

const MainCHRO = () => {
  const navigate = useNavigate();

  // --- State ---
  const [currentUser, setCurrentUser] = useState({});
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    departments: 0,
    turnoverRate: 0,
    avgSalary: 0,
    genderDistribution: { male: 0, female: 0, other: 0 },
    departmentStats: [],
    ageDistribution: {},
    // New Metrics
    budgetOverview: [],
    leaveTrends: [],
    departmentTaskStats: [],
    workforceInsights: {
      swapRequests: 0,
      announcementReach: 0,
      taskReplacements: 0,
    },
    resourceStats: [],
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [activityPage, setActivityPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard | workforce | departments | employees

  // --- Filter/Sort State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // grid | list
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  // --- Modal State ---
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  // --- Effects ---
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    setCurrentUser(user);
    fetchDashboardStats();
    fetchEmployees();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get("/chro/stats");
      const data = res.data;
      setAnalytics({
        ...data,
        ageDistribution: data.ageDistribution || {},
        budgetOverview: data.budgetOverview || [],
        leaveTrends: data.leaveTrends || [],
        departmentTaskStats: data.departmentTaskStats || [],
        workforceInsights: data.workforceInsights || {
          swapRequests: 0,
          announcementReach: 0,
          taskReplacements: 0,
        },
        resourceStats: data.resourceStats || [],
      });
      setDepartments(data.departmentStats.filter((d) => d.name));
      setRecentActivities(data.recentActivities);
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/users");
      setEmployees(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch employees", err);
    }
  };

  // --- Helpers ---
  const getInitials = (firstName) => {
    return firstName ? firstName.charAt(0).toUpperCase() : "?";
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // --- Filtering Logic ---
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const fName = emp.first_name || "";
      const lName = emp.last_name || "";
      const eId = emp.emp_code || emp.username || "";
      const deptName = emp.department_name || "";
      const matchSearch =
        fName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eId.includes(searchTerm);
      const matchDept =
        filterDepartment === "all" || deptName === filterDepartment;
      return matchSearch && matchDept;
    });
  }, [employees, searchTerm, filterDepartment]);

  const sortedEmployees = useMemo(() => {
    return [...filteredEmployees].sort((a, b) => {
      let valA = "",
        valB = "";
      if (sortKey === "name") {
        valA = a.first_name || "";
        valB = b.first_name || "";
      } else if (sortKey === "dept") {
        valA = a.department_name || "";
        valB = b.department_name || "";
      } else if (sortKey === "role") {
        valA = a.role_name || "";
        valB = b.role_name || "";
      }

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredEmployees, sortKey, sortDir]);

  // --- Actions ---
  const handleEmployeeClick = (emp) => setSelectedEmployee(emp);
  const initiateDelete = (emp) => {
    setEmployeeToDelete(emp);
    setShowDeleteModal(true);
    setDeletePassword("");
    setDeleteError("");
  };
  const confirmDelete = () => {
    if (deletePassword === "0123") {
      const updated = employees.filter(
        (e) =>
          e.id !== employeeToDelete.id &&
          e.username !== employeeToDelete.username,
      );
      setEmployees(updated);
      // localStorage code removed as backend integration is primary now,
      // but keeping mockup logic for immediate feedback if API fails not really needed if API works.
      // Assuming API call would be here.
      alert("Employee profile terminated.");
      setShowDeleteModal(false);
    } else {
      setDeleteError("Invalid Executive Authorization Code");
    }
  };

  return (
    <CHROLayout>
      <div className="chro-content-wrapper">
        {/* Header */}
        <header className="chro-header-section">
          <div className="chro-welcome-text">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {getGreeting()}, {currentUser.firstName || "Executive"}
            </motion.h1>
            <p>Strategic Workforce Intelligence Dashboard</p>
          </div>
          <div className="chro-date-badge">
            📅{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="chro-tabs-centered">
          <nav className="chro-tabs-nav">
            <button
              className={`chro-tab-btn ${
                activeTab === "dashboard" ? "active" : ""
              }`}
              onClick={() => setActiveTab("dashboard")}
            >
              <FaChartLine /> Executive Dashboard
            </button>
            <button
              className={`chro-tab-btn ${
                activeTab === "workforce" ? "active" : ""
              }`}
              onClick={() => setActiveTab("workforce")}
            >
              <FaUsers /> Workforce Management
            </button>
            <button
              className={`chro-tab-btn ${
                activeTab === "departments" ? "active" : ""
              }`}
              onClick={() => setActiveTab("departments")}
            >
              <FaBuilding /> Department Analytics
            </button>
            <button
              className={`chro-tab-btn ${
                activeTab === "employees" ? "active" : ""
              }`}
              onClick={() => setActiveTab("employees")}
            >
              <FaList /> Personnel Directory
            </button>
          </nav>
        </div>

        {/* Content */}
        <main className="chro-content-area">
          <AnimatePresence mode="wait">
            {/* 1. Executive Dashboard */}
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                className="chro-dashboard-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Top Stats Row */}
                <div className="chro-metrics-grid">
                  <div className="chro-metric-card">
                    <div className="chro-metric-icon-wrapper">
                      <FaUsers />
                    </div>
                    <div className="chro-metric-info">
                      <div className="chro-metric-value">
                        {analytics.totalEmployees}
                      </div>
                      <div className="chro-metric-label">Total Workforce</div>
                    </div>
                  </div>
                  <div className="chro-metric-card">
                    <div className="chro-metric-icon-wrapper">
                      <FaCheckCircle />
                    </div>
                    <div className="chro-metric-info">
                      <div className="chro-metric-value">
                        {analytics.activeEmployees}
                      </div>
                      <div className="chro-metric-label">Active Personnel</div>
                    </div>
                  </div>
                  <div className="chro-metric-card">
                    <div className="chro-metric-icon-wrapper">
                      <FaBuilding />
                    </div>
                    <div className="chro-metric-info">
                      <div className="chro-metric-value">
                        {analytics.departments}
                      </div>
                      <div className="chro-metric-label">Departments</div>
                    </div>
                  </div>
                  <div className="chro-metric-card">
                    <div className="chro-metric-icon-wrapper">
                      <FaMoneyBillWave />
                    </div>
                    <div className="chro-metric-info">
                      <div className="chro-metric-value">
                        ${analytics.avgSalary.toLocaleString()}
                      </div>
                      <div className="chro-metric-label">Avg Salary</div>
                    </div>
                  </div>
                </div>

                {/* Charts Row 1: Budget & Leaves */}
                <div className="chro-charts-row">
                  <div className="chro-chart-card">
                    <h4>Budget Overview (Salary Breakdown)</h4>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={analytics.budgetOverview}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {analytics.budgetOverview.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) =>
                              `$${Number(value).toLocaleString()}`
                            }
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="chro-chart-card">
                    <h4>Leave Trends (Monthly)</h4>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={analytics.leaveTrends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#8884d8"
                            fill="#8884d8"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Row 2: Demographics */}
                {/* Row 2: Demographics */}
                <div className="chro-panel glass">
                  <h3>Demographics Overview</h3>
                  <div className="chro-demographics-grid">
                    {/* Age Distribution - Bar Chart */}
                    <div className="chro-demo-card">
                      <h4>Age Distribution</h4>
                      <div
                        className="chart-container-small"
                        style={{ height: 250 }}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={Object.entries(
                              analytics.ageDistribution || {},
                            ).map(([k, v]) => ({ name: k, value: v }))}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                            />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar
                              dataKey="value"
                              fill="#8884d8"
                              radius={[5, 5, 0, 0]}
                            >
                              {Object.keys(analytics.ageDistribution || {}).map(
                                (entry, index) => (
                                  <Cell
                                    key={`age-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                  />
                                ),
                              )}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Gender Ratio - Donut Chart */}
                    <div className="chro-demo-card">
                      <h4>Gender Ratio</h4>
                      <div
                        className="chart-container-small"
                        style={{ height: 250 }}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={Object.entries(
                                analytics.genderDistribution || {},
                              ).map(([k, v]) => ({ name: k, value: v }))}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={90}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {Object.keys(
                                analytics.genderDistribution || {},
                              ).map((key, index) => (
                                <Cell
                                  key={`gender-${index}`}
                                  fill={
                                    key.toLowerCase() === "female"
                                      ? "#f43f5e"
                                      : key.toLowerCase() === "male"
                                        ? "#3b82f6"
                                        : "#10b981"
                                  }
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. Workforce Management */}
            {activeTab === "workforce" && (
              <motion.div
                key="workforce"
                className="chro-dashboard-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="chro-metrics-grid">
                  <div className="chro-metric-card warning">
                    <div className="chro-metric-icon-wrapper">
                      <FaExchangeAlt />
                    </div>
                    <div className="chro-metric-info">
                      <div className="chro-metric-value">
                        {analytics.workforceInsights.swapRequests}
                      </div>
                      <div className="chro-metric-label">
                        Swap Requests (Pending)
                      </div>
                    </div>
                  </div>
                  <div className="chro-metric-card success">
                    <div className="chro-metric-icon-wrapper">
                      <FaBullhorn />
                    </div>
                    <div className="chro-metric-info">
                      <div className="chro-metric-value">
                        {analytics.workforceInsights.announcementReach}%
                      </div>
                      <div className="chro-metric-label">
                        Announcement Reach
                      </div>
                    </div>
                  </div>
                  <div className="chro-metric-card danger">
                    <div className="chro-metric-icon-wrapper">
                      <FaTasks />
                    </div>
                    <div className="chro-metric-info">
                      <div className="chro-metric-value">
                        {analytics.workforceInsights.taskReplacements}
                      </div>
                      <div className="chro-metric-label">Task Replacements</div>
                    </div>
                  </div>
                </div>

                <div className="chro-panel glass">
                  <h3>
                    <FaBriefcase /> Workforce Activities Feed
                  </h3>
                  <div className="chro-feed-list">
                    {recentActivities.slice(0, 10).map((act) => (
                      <div key={act.id} className="chro-feed-item">
                        <div className="chro-feed-icon">
                          <FaBriefcase />
                        </div>
                        <div className="chro-feed-content">
                          <p>{act.message}</p>
                          <span className="chro-feed-time">{act.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. Department Analytics */}
            {activeTab === "departments" && (
              <motion.div
                key="departments"
                className="chro-dashboard-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="chro-charts-row">
                  <div className="chro-chart-card wide">
                    <h4>Task Efficiency by Department (Completion Rate)</h4>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart
                          data={analytics.departmentTaskStats}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis
                            dataKey="department"
                            type="category"
                            width={100}
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip />
                          <Legend />
                          <Bar
                            dataKey="completed"
                            stackId="a"
                            fill="#10b981"
                            name="Completed"
                          />
                          <Bar
                            dataKey="inProgress"
                            stackId="a"
                            fill="#3b82f6"
                            name="In Progress"
                          />
                          <Bar
                            dataKey="pending"
                            stackId="a"
                            fill="#f59e0b"
                            name="Pending"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="chro-charts-row">
                  <div className="chro-chart-card wide">
                    <h4>Resource Allocation (Headcount vs Avg Tasks)</h4>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics.resourceStats}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis
                            yAxisId="left"
                            orientation="left"
                            stroke="#8884d8"
                          />
                          <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke="#82ca9d"
                          />
                          <Tooltip />
                          <Legend />
                          <Bar
                            yAxisId="left"
                            dataKey="headcount"
                            fill="#8884d8"
                            name="Headcount"
                          />
                          <Bar
                            yAxisId="right"
                            dataKey="tasks"
                            fill="#82ca9d"
                            name="Tasks Assigned"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. Personnel Directory (Existing Employee Grid) */}
            {activeTab === "employees" && (
              <motion.div
                key="employees"
                className="chro-panel glass"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="chro-controls-toolbar">
                  <div className="chro-search-box">
                    <FaSearch className="chro-search-icon" />
                    <input
                      type="text"
                      placeholder="Search personnel..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="chro-search-input"
                    />
                  </div>
                  <select
                    className="chro-select"
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                  >
                    <option value="all">All Departments</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <div className="chro-divider-v" />
                  <button
                    className="chro-btn-secondary"
                    onClick={() =>
                      setViewMode(viewMode === "grid" ? "list" : "grid")
                    }
                  >
                    {viewMode === "grid" ? <FaList /> : <FaThLarge />}
                  </button>
                  <button
                    className="chro-btn-secondary"
                    onClick={() =>
                      setSortDir(sortDir === "asc" ? "desc" : "asc")
                    }
                  >
                    <FaSortAmountDown
                      style={{
                        transform:
                          sortDir === "desc" ? "rotate(180deg)" : "none",
                      }}
                    />
                  </button>
                </div>

                {viewMode === "grid" ? (
                  <motion.div
                    className="chro-emp-grid"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {sortedEmployees.map((emp) => (
                      <motion.div
                        key={emp.id}
                        className="chro-emp-card active-status"
                        onClick={() => handleEmployeeClick(emp)}
                        variants={itemVariants}
                        whileHover={{ y: -5 }}
                      >
                        <div className="chro-avatar-large">
                          {getInitials(emp.first_name)}
                        </div>
                        <h4 className="chro-emp-name">
                          {emp.first_name} {emp.last_name}
                        </h4>
                        <span className="chro-emp-role">{emp.role_name}</span>
                        <span className="chro-emp-dept">
                          {emp.department_name}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="chro-table-container">
                    <table className="chro-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Role</th>
                          <th>Dept</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedEmployees.map((emp) => (
                          <tr key={emp.id}>
                            <td>{emp.emp_code || emp.username}</td>
                            <td>
                              {emp.first_name} {emp.last_name}
                            </td>
                            <td>{emp.role_name}</td>
                            <td>{emp.department_name}</td>
                            <td>
                              <button
                                onClick={() => handleEmployeeClick(emp)}
                                className="chro-btn-view"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Modals */}
      <div
        className={`chro-modal-overlay ${selectedEmployee ? "open" : ""}`}
        onClick={() => setSelectedEmployee(null)}
      >
        {selectedEmployee && (
          <div
            className="chro-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="chro-modal-header">
              <h3>{selectedEmployee.first_name}'s Profile</h3>
              <button
                className="chro-modal-close"
                onClick={() => setSelectedEmployee(null)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="chro-modal-body">
              <div className="chro-info-row">
                <span>ID</span>
                <span>
                  {selectedEmployee.emp_code || selectedEmployee.username}
                </span>
              </div>
              <div className="chro-info-row">
                <span>Role</span>
                <span>{selectedEmployee.role_name}</span>
              </div>
              <div className="chro-info-row">
                <span>Dept</span>
                <span>{selectedEmployee.department_name}</span>
              </div>
              <div className="chro-info-row">
                <span>Email</span>
                <span>{selectedEmployee.email}</span>
              </div>
              <div className="chro-info-row">
                <span>Phone</span>
                <span>{selectedEmployee.phone || "-"}</span>
              </div>
            </div>
            <div className="chro-modal-actions">
              <button
                className="chro-btn-danger"
                onClick={() => initiateDelete(selectedEmployee)}
              >
                Terminate Profile
              </button>
            </div>
          </div>
        )}
      </div>

      <div
        className={`chro-modal-overlay ${showDeleteModal ? "open" : ""}`}
        onClick={() => setShowDeleteModal(false)}
      >
        {showDeleteModal && (
          <div
            className="chro-modal-content delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="chro-modal-header"
              style={{
                background: "linear-gradient(135deg, #dc2626, #991b1b)",
              }}
            >
              <h3>
                <FaTrashAlt /> Confirm Termination
              </h3>
            </div>
            <div className="chro-modal-body">
              <p style={{ textAlign: "center", marginBottom: 20 }}>
                Authorized to remove{" "}
                <strong>
                  {employeeToDelete?.firstName} {employeeToDelete?.lastName}
                </strong>
                ?
              </p>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Auth Code (0123)"
                className="chro-search-input"
                style={{ textAlign: "center", letterSpacing: 4 }}
              />
              {deleteError && (
                <p className="error-message" style={{ textAlign: "center" }}>
                  {deleteError}
                </p>
              )}
            </div>
            <div className="chro-modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button className="confirm-delete-btn" onClick={confirmDelete}>
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </CHROLayout>
  );
};

export default MainCHRO;
