import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SidebarCHRO from "../../../Component/CHRO/SidebarCHRO";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUsers,
  FaUserTie,
  FaBuilding,
  FaChartLine,
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaThLarge,
  FaList,
  FaFileCsv,
  FaTimes,
  FaTrashAlt,
  FaEye,
  FaStar,
  FaBriefcase,
  FaBirthdayCake,
  FaVenusMars,
} from "react-icons/fa";
import "./MainCHRO.css";

const MainCHRO = () => {
  const navigate = useNavigate();

  // --- Sidebar State ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (window.innerWidth < 1024) return false; // Default closed on mobile
    const saved = localStorage.getItem("chroSidebarOpen");
    return saved !== null ? JSON.parse(saved) : false; // Default closed if no save (per user request "we open it ourselves") OR true? "We must open it ourselves" might mean they want it closed by default. Let's stick to respecting save, defaulting to true or false.
    // User said: "It opens itself... we must open it ourselves right?" -> Implies they expect it to be closed unless they open it? Or they just want it to NOT open if they closed it.
    // I will default to `true` (standard dashboard) BUT respect the save.
    // The previous bug was `handleResize` running on mount.
  });

  // --- Effects ---
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
      // Removed 'else setIsSidebarOpen(true)' to prevent overriding user preference on desktop
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard | employees | departments | analytics

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
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const newState = !prev;
      localStorage.setItem("chroSidebarOpen", JSON.stringify(newState));
      return newState;
    });
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    setCurrentUser(user);
    fetchDashboardStats();
    fetchEmployees();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/chro/stats");
      const data = res.data;
      setAnalytics({
        totalEmployees: data.totalEmployees,
        activeEmployees: data.activeEmployees,
        departments: data.departments,
        turnoverRate: data.turnoverRate,
        avgSalary: data.avgSalary,
        genderDistribution: data.genderDistribution,
        departmentStats: data.departmentStats,
        ageDistribution: {}, // Not implemented in backend yet
      });
      setDepartments(data.departmentStats);
      setRecentActivities(data.recentActivities);
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users");
      // Assuming api/users returns { data: [...] } structure based on userController
      setEmployees(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch employees", err);
    }
  };

  // --- Filtering & Sorting ---
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchSearch =
        (emp.firstName?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (emp.lastName?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (emp.empId || "").includes(searchTerm);
      const matchDept =
        filterDepartment === "all" || emp.department === filterDepartment;
      return matchSearch && matchDept;
    });
  }, [employees, searchTerm, filterDepartment]);

  const sortedEmployees = useMemo(() => {
    return [...filteredEmployees].sort((a, b) => {
      let valA = "",
        valB = "";
      if (sortKey === "name") {
        valA = a.firstName;
        valB = b.firstName;
      } else if (sortKey === "dept") {
        valA = a.department;
        valB = b.department;
      } else if (sortKey === "role") {
        valA = a.role;
        valB = b.role;
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
      // Mock password check
      const updated = employees.filter(
        (e) =>
          e.id !== employeeToDelete.id &&
          e.username !== employeeToDelete.username
      );
      setEmployees(updated);
      localStorage.setItem("employees", JSON.stringify(updated));

      // Also update Users list
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const updatedUsers = users.filter(
        (u) => u.username !== employeeToDelete.username
      );
      localStorage.setItem("users", JSON.stringify(updatedUsers));

      setShowDeleteModal(false);
      setSelectedEmployee(null);
      alert("Employee profile terminated.");
      generateAnalytics(updated, departments);
    } else {
      setDeleteError("Invalid Executive Authorization Code");
    }
  };

  // --- Render Helpers ---
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="main-chro-container">
      <SidebarCHRO isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div
        className={`chro-dashboard-container ${
          !isSidebarOpen ? "expanded-view" : ""
        }`}
      >
        <div className="chro-content-wrapper">
          {/* Header */}
          <header className="chro-header-section">
            <div className="chro-welcome-text">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                {getGreeting()}, {currentUser.firstName || "Executive"}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Here is your daily workforce intelligence report.
              </motion.p>
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

          {/* Metrics Cards */}
          <motion.section
            className="chro-metrics-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {[
              {
                label: "Total Workforce",
                value: analytics.totalEmployees,
                icon: <FaUsers />,
                delay: 0,
              },
              {
                label: "Active Personnel",
                value: analytics.activeEmployees,
                icon: <FaUserTie />,
                delay: 0.1,
              },
              {
                label: "Departments",
                value: analytics.departments,
                icon: <FaBuilding />,
                delay: 0.2,
              },
              {
                label: "Turnover Rate",
                value: `${analytics.turnoverRate}%`,
                icon: <FaChartLine />,
                delay: 0.3,
              },
            ].map((metric, idx) => (
              <motion.div
                key={idx}
                className="chro-metric-card"
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="chro-metric-icon-wrapper">{metric.icon}</div>
                <div className="chro-metric-info">
                  <div className="chro-metric-value">{metric.value}</div>
                  <div className="chro-metric-label">{metric.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.section>

          {/* Navigation Tabs */}
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
                activeTab === "employees" ? "active" : ""
              }`}
              onClick={() => setActiveTab("employees")}
            >
              <FaUsers /> Workforce Management
            </button>
            <button
              className={`chro-tab-btn ${
                activeTab === "departments" ? "active" : ""
              }`}
              onClick={() => setActiveTab("departments")}
            >
              <FaBuilding /> Department Performance
            </button>
          </nav>

          {/* --- Content Area --- */}
          <main className="chro-content-area">
            <AnimatePresence mode="wait">
              {/* Dashboard View */}
              {activeTab === "dashboard" && (
                <motion.div
                  key="dashboard"
                  className="chro-grid-layout"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="chro-panel glass"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="chro-panel-header">
                      <h3>
                        <FaVenusMars /> Demographics Overview
                      </h3>
                    </div>
                    <div className="chro-chart-wrapper">
                      <div className="chro-bar-group">
                        <div className="chro-bar-header">
                          <span>Male</span>
                          <span>{analytics.genderDistribution.male}</span>
                        </div>
                        <div className="chro-bar-track">
                          <motion.div
                            className="chro-bar-fill"
                            initial={{ width: 0 }}
                            animate={{ width: "55%" }}
                            transition={{ duration: 1, delay: 0.5 }}
                          ></motion.div>
                        </div>
                      </div>
                      <div className="chro-bar-group">
                        <div className="chro-bar-header">
                          <span>Female</span>
                          <span>{analytics.genderDistribution.female}</span>
                        </div>
                        <div className="chro-bar-track">
                          <motion.div
                            className="chro-bar-fill"
                            style={{ background: "#f43f5e" }}
                            initial={{ width: 0 }}
                            animate={{ width: "40%" }}
                            transition={{ duration: 1, delay: 0.6 }}
                          ></motion.div>
                        </div>
                      </div>
                      <div className="chro-bar-group">
                        <div className="chro-bar-header">
                          <span>Avg Salary</span>
                          <span>${analytics.avgSalary.toLocaleString()}</span>
                        </div>
                        <div className="chro-bar-track">
                          <motion.div
                            className="chro-bar-fill"
                            style={{ background: "#10b981" }}
                            initial={{ width: 0 }}
                            animate={{ width: "75%" }}
                            transition={{ duration: 1, delay: 0.7 }}
                          ></motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="chro-panel"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="chro-panel-header">
                      <h3>
                        <FaList /> Recent Activities
                      </h3>
                    </div>
                    <div className="chro-feed-list">
                      {recentActivities.map((act) => (
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
                  </motion.div>
                </motion.div>
              )}

              {/* Employees View */}
              {activeTab === "employees" && (
                <motion.div
                  key="employees"
                  className="chro-panel glass"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="chro-controls-toolbar">
                    <div className="chro-search-box">
                      <FaSearch className="chro-search-icon" />
                      <input
                        type="text"
                        placeholder="Search personnel..."
                        className="chro-search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                          whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        >
                          <div className="chro-avatar-large">
                            {emp.firstName?.[0]}
                          </div>
                          <h4 className="chro-emp-name">
                            {emp.firstName} {emp.lastName}
                          </h4>
                          <span className="chro-emp-role">{emp.role}</span>
                          <span className="chro-emp-dept">
                            {emp.department || "No Dept"}
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
                            <th>Department</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedEmployees.map((emp) => (
                            <tr key={emp.id}>
                              <td>{emp.empId || "N/A"}</td>
                              <td className="emp-name">
                                <span className="mini-avatar">
                                  {emp.firstName?.[0]}
                                </span>
                                {emp.firstName} {emp.lastName}
                              </td>
                              <td>{emp.role}</td>
                              <td>{emp.department || "General"}</td>
                              <td className="chro-row-actions">
                                <button
                                  className="chro-btn-view"
                                  onClick={() => handleEmployeeClick(emp)}
                                >
                                  View
                                </button>
                                <button
                                  className="chro-btn-delete"
                                  onClick={() => initiateDelete(emp)}
                                >
                                  <FaTrashAlt />
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

              {/* Departments View */}
              {activeTab === "departments" && (
                <motion.div
                  key="departments"
                  className="chro-dept-grid"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {departments.map((dept) => (
                    <motion.div
                      key={dept.id}
                      className="chro-dept-card"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ y: -5 }}
                    >
                      <div className="chro-dept-header">
                        <h3>{dept.name}</h3>
                        <div
                          className="chro-dept-score"
                          style={{
                            color: dept.score > 90 ? "#10b981" : "#f59e0b",
                          }}
                        >
                          {dept.score}
                        </div>
                      </div>
                      <div className="chro-dept-stats">
                        <div className="dept-stat-box">
                          <span className="dept-stat-val">{dept.count}</span>
                          <span className="dept-stat-lbl">Staff</span>
                        </div>
                        <div className="dept-stat-box">
                          <span className="dept-stat-val">
                            ${(dept.budget / 1000).toFixed(0)}k
                          </span>
                          <span className="dept-stat-lbl">Budget</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* --- Modals --- */}
      {/* Employee Details Modal */}
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
              <h3>{selectedEmployee.firstName}'s Profile</h3>
              <button
                className="chro-modal-close"
                onClick={() => setSelectedEmployee(null)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="chro-modal-body">
              <div className="chro-info-row">
                <span>Employee ID</span>
                <span>{selectedEmployee.empId}</span>
              </div>
              <div className="chro-info-row">
                <span>Details</span>
                <span>{selectedEmployee.email}</span>
              </div>
              <div className="chro-info-row">
                <span>Position</span>
                <span>{selectedEmployee.role}</span>
              </div>
              <div className="chro-info-row">
                <span>Department</span>
                <span>{selectedEmployee.department}</span>
              </div>
              <div className="chro-info-row">
                <span>Phone</span>
                <span>{selectedEmployee.telephone}</span>
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

      {/* Delete Confirmation Modal */}
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
              <p
                style={{
                  textAlign: "center",
                  marginBottom: "20px",
                  color: "#cbd5e1",
                }}
              >
                Are you authorized to remove{" "}
                <strong>
                  {employeeToDelete?.firstName} {employeeToDelete?.lastName}
                </strong>
                ?
              </p>
              <input
                type="password"
                className="chro-search-input"
                placeholder="Enter Auth Code (0123)"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                style={{ textAlign: "center", letterSpacing: "4px" }}
              />
              {deleteError && (
                <p
                  className="error-message"
                  style={{ textAlign: "center", marginTop: "10px" }}
                >
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
    </div>
  );
};

export default MainCHRO;
