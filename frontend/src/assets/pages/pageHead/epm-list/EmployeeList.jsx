import React, { useState, useEffect } from "react";
import api from "../../../../services/api";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaUserTie,
  FaEnvelope,
  FaPhoneAlt,
  FaBriefcase,
  FaGraduationCap,
  FaList,
  FaThLarge,
  FaEllipsisV,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import HeadSidebar from "../../../Component/Head/HeadSidebar";
import CustomDropdown from "./CustomDropdown";
import "../../../theam/head_theam/HeadTheme.css";
import "./EmployeeList.css";
import EmployeeInsightModal from "./EmployeeInsightModal";

const HeadEmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // View Mode: 'grid' | 'list'
  const [viewMode, setViewMode] = useState("grid");
  const [selectedEmpId, setSelectedEmpId] = useState(null);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState("");

  // Get current user (Head)
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const headId = currentUser.id;

  // Stats Logic
  const totalEmp = filteredEmployees.length;
  const activeEmp = filteredEmployees.filter(
    (e) => e.employment_status === "Active",
  ).length;
  const onLeaveEmp = filteredEmployees.filter(
    (e) =>
      e.account_status === "Inactive" || e.employment_status === "On Leave",
  ).length;

  useEffect(() => {
    fetchEmployees();
  }, [headId]);

  useEffect(() => {
    filterData();
  }, [searchTerm, positionFilter, employees]);

  const fetchEmployees = async () => {
    try {
      if (!headId) return;
      setLoading(true);
      const response = await api.get(`/head/employees/${headId}`);
      setEmployees(response.data);
    } catch (error) {
      console.error("Failed to fetch employees", error);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let temp = [...employees];

    if (searchTerm) {
      temp = temp.filter(
        (e) =>
          e.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.emp_code?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (positionFilter) {
      temp = temp.filter((e) => e.position_name === positionFilter);
    }

    setFilteredEmployees(temp);
  };

  // Get unique positions for filter
  const positions = [
    ...new Set(employees.map((e) => e.position_name).filter(Boolean)),
  ];

  return (
    <div className="head-emp-list-wrapper">
      <HeadSidebar onToggle={setIsSidebarOpen} />

      <main
        className={`head-emp-list-content ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
      >
        <motion.div
          className="head-emp-list-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header Section */}
          <header className="head-emp-header">
            <div className="head-emp-title-row">
              <h1 className="head-emp-title">Department Employees</h1>

              <div className="header-actions-row">
                <div className="head-emp-date">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>

            <div className="head-emp-stats-row">
              <StatsCard
                label="Total Employees"
                value={totalEmp}
                icon={<FaUserTie />}
              />
              <StatsCard
                label="Active Now"
                value={activeEmp}
                icon={<FaBriefcase />}
                color="#10b981"
              />
              <StatsCard
                label="On Leave / Inactive"
                value={onLeaveEmp}
                icon={<FaUserTie />}
                color="#ef4444"
              />
            </div>
          </header>

          {/* Controls */}
          <div className="head-emp-controls">
            <div className="head-emp-search">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by name or Employee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="head-emp-filter">
              <CustomDropdown
                options={positions}
                value={positionFilter}
                onChange={setPositionFilter}
                placeholder="All Positions"
              />
            </div>

            <div className="view-toggle-group">
              <button
                className={`view-toggle-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
                title="Grid View"
              >
                <FaThLarge />
              </button>
              <button
                className={`view-toggle-btn ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
                title="List View"
              >
                <FaList />
              </button>
            </div>
          </div>

          {/* Status Legend */}
          <div className="status-legend">
            <div className="legend-item">
              <span className="dot active"></span>
              <span>Active: Currently employed and working</span>
            </div>
            <div className="legend-item">
              <span className="dot inactive"></span>
              <span>Inactive: Resigned or Account Disabled</span>
            </div>
            <div className="legend-item">
              <span className="dot on-leave"></span>
              <span>On Leave: Currently on approved leave</span>
            </div>
          </div>

          {/* Employee Content */}
          {loading ? (
            <div className="loading-wrapper">Loading employees...</div>
          ) : (
            <AnimatePresence mode="wait">
              {viewMode === "grid" ? (
                <motion.div
                  key="grid"
                  className="head-emp-grid"
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.05,
                      },
                    },
                  }}
                >
                  {filteredEmployees.map((emp) => (
                    <EmployeeCard
                      key={emp.id}
                      emp={emp}
                      onOpenInsight={(id) => setSelectedEmpId(id)}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  className="head-emp-list-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="emp-table-header">
                    <div>Employee</div>
                    <div>ID</div>
                    <div>Position</div>
                    <div>Status</div>
                    <div>Contact</div>
                    <div>Action</div>
                  </div>
                  <div className="emp-table-body">
                    {filteredEmployees.map((emp) => (
                      <EmployeeListItem
                        key={emp.id}
                        emp={emp}
                        onOpenInsight={(id) => setSelectedEmpId(id)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </motion.div>
      </main>

      {selectedEmpId && (
        <EmployeeInsightModal
          empId={selectedEmpId}
          onClose={() => setSelectedEmpId(null)}
        />
      )}
    </div>
  );
};

// Sub-components
const StatsCard = ({ label, value, icon, color }) => (
  <motion.div className="head-emp-stat-card" whileHover={{ y: -5 }}>
    <div className="stat-icon-wrapper" style={{ color: color }}>
      {icon}
    </div>
    <div className="stat-info">
      <h4>{label}</h4>
      <p>{value}</p>
    </div>
  </motion.div>
);

const EmployeeCard = ({ emp, onOpenInsight }) => {
  const avatarUrl =
    emp.profile_image_url ||
    emp.avatar ||
    `https://ui-avatars.com/api/?name=${emp.first_name}+${emp.last_name}&background=1e293b&color=c5a059`;

  return (
    <motion.div
      className="head-emp-card"
      variants={{
        hidden: { opacity: 0, scale: 0.9 },
        show: { opacity: 1, scale: 1 },
      }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      layout
    >
      <div className="card-shine-effect"></div>
      <div className="card-header-bg"></div>

      <div className="card-content">
        <div className="avatar-container">
          <div className="avatar-glow"></div>
          <img
            src={avatarUrl}
            alt={emp.first_name}
            className="emp-avatar"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${emp.first_name}+${emp.last_name}&background=1e293b&color=c5a059`;
            }}
          />
        </div>

        <h3 className="emp-name">
          {emp.first_name} {emp.last_name}
        </h3>
        <p className="emp-pos">{emp.position_name || "No Position"}</p>

        <span
          className={`emp-status ${
            emp.employment_status === "Active"
              ? "status-active"
              : emp.employment_status === "On Leave"
                ? "status-on-leave"
                : "status-inactive"
          }`}
        >
          <span className="status-dot"></span>
          {emp.employment_status || emp.account_status}
        </span>

        <div className="emp-details">
          <div className="detail-row">
            <FaBriefcase className="detail-icon" />{" "}
            <span>
              {emp.emp_code
                ? `ID: ${emp.emp_code}`
                : `ID: ${String(emp.id).padStart(4, "0")}`}
            </span>
          </div>
          <div className="detail-row">
            <FaEnvelope className="detail-icon" />{" "}
            <span className="text-truncate" title={emp.email}>
              {emp.email}
            </span>
          </div>
          <div className="detail-row">
            <FaPhoneAlt className="detail-icon" />{" "}
            <span>{emp.phone || "N/A"}</span>
          </div>
        </div>

        <div className="emp-actions">
          <button
            onClick={() => onOpenInsight(emp.id)}
            className="action-btn btn-secondary"
            title="View Insights"
          >
            <FaGraduationCap /> Detail
          </button>
          <Link
            to="/head/schedule"
            className="action-btn btn-primary"
            title="Check Schedule"
          >
            Schedule
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

const EmployeeListItem = ({ emp, onOpenInsight }) => {
  const avatarUrl =
    emp.profile_image_url ||
    emp.avatar ||
    `https://ui-avatars.com/api/?name=${emp.first_name}+${emp.last_name}&background=1e293b&color=c5a059`;

  return (
    <motion.div
      className="emp-list-item"
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.03)" }}
    >
      <div className="cell-employee">
        <img
          src={avatarUrl}
          alt="avatar"
          className="list-avatar"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://ui-avatars.com/api/?name=${emp.first_name}+${emp.last_name}&background=1e293b&color=c5a059`;
          }}
        />
        <div className="list-info">
          <div className="list-name">
            {emp.first_name} {emp.last_name}
          </div>
          <div className="list-email">{emp.email}</div>
        </div>
      </div>
      <div className="cell-id">
        <span className="id-badge">
          {emp.emp_code
            ? `${emp.emp_code}`
            : `${String(emp.id).padStart(4, "0")}`}
        </span>
      </div>
      <div className="cell-pos">{emp.position_name || "-"}</div>
      <div className="cell-status">
        <span
          className={`emp-status-badge ${
            emp.employment_status === "Active"
              ? "status-active"
              : emp.employment_status === "On Leave"
                ? "status-on-leave"
                : "status-inactive"
          }`}
        >
          {emp.employment_status || emp.account_status}
        </span>
      </div>
      <div className="cell-contact">{emp.phone || "-"}</div>
      <div className="cell-action">
        <div className="action-dropdown-trigger">
          <button
            onClick={() => onOpenInsight(emp.id)}
            className="mini-action-btn"
            title="View Insights"
          >
            <FaGraduationCap />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default HeadEmployeeList;
