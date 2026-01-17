import React, { useState, useEffect } from "react";
import api from "../../../services/api";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaUserTie,
  FaEnvelope,
  FaPhoneAlt,
  FaBriefcase,
  FaGraduationCap,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import HeadSidebar from "../../../Component/Head/HeadSidebar";
import "../../../theam/head_theam/HeadTheme.css";
import "./EmployeeList.css";

const HeadEmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <HeadSidebar />

      <main className="head-emp-list-content">
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
              <div className="head-emp-date">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
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
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
              >
                <option value="">All Positions</option>
                {positions.map((pos, idx) => (
                  <option key={idx} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Employee Grid */}
          {loading ? (
            <div className="loading-wrapper">Loading employees...</div>
          ) : (
            <motion.div
              className="head-emp-grid"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              <AnimatePresence>
                {filteredEmployees.map((emp) => (
                  <EmployeeCard key={emp.id} emp={emp} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
      </main>
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

const EmployeeCard = ({ emp }) => {
  const avatarUrl =
    emp.avatar ||
    `https://ui-avatars.com/api/?name=${emp.first_name}+${emp.last_name}&background=1e293b&color=c5a059`;

  return (
    <motion.div
      className="head-emp-card"
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
      }}
      layout
    >
      <div className="card-header-bg"></div>

      <div className="card-content">
        <img src={avatarUrl} alt={emp.first_name} className="emp-avatar" />
        <h3 className="emp-name">
          {emp.first_name} {emp.last_name}
        </h3>
        <p className="emp-pos">{emp.position_name || "No Position"}</p>

        <span
          className={`emp-status ${
            emp.employment_status === "Active"
              ? "status-active"
              : "status-inactive"
          }`}
        >
          {emp.employment_status || emp.account_status}
        </span>

        <div className="emp-details">
          <div className="detail-row">
            <FaBriefcase /> <span>{emp.emp_code}</span>
          </div>
          <div className="detail-row">
            <FaEnvelope /> <span>{emp.email}</span>
          </div>
          <div className="detail-row">
            <FaPhoneAlt /> <span>{emp.phone || "N/A"}</span>
          </div>
        </div>

        <div className="emp-actions">
          <Link
            to={`/head/employee/${emp.id}`}
            className="action-btn btn-secondary"
            title="View Profile Detail"
          >
            <FaGraduationCap /> Detail
          </Link>
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

export default HeadEmployeeList;
