import React, { useState, useEffect } from "react";
import DepartmentService from "../../../../services/DepartmentService";
import HRLayout from "../../../Component/HR/HRLayout";
import "./add_department.css";
import {
  FaBuilding,
  FaPlus,
  FaSearch,
  FaLayerGroup,
  FaBolt,
  FaChartPie,
  FaClock,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const AddDepartment = () => {
  const [departmentName, setDepartmentName] = useState("");
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isFocused, setIsFocused] = useState(false);

  const fetchDepartments = async () => {
    try {
      const data = await DepartmentService.getAllDepartments();
      // Sort by ID desc
      setDepartments(data.sort((a, b) => b.id - a.id));
    } catch (error) {
      console.error("Failed to fetch departments", error);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!departmentName.trim()) {
      setMessage({ type: "error", text: "Department name is required" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return;
    }

    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await DepartmentService.createDepartment(departmentName);
      setMessage({ type: "success", text: "Department Added" });
      setDepartmentName("");
      fetchDepartments();

      setTimeout(() => setMessage({ type: "", text: "" }), 2500);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to create";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDepartments = departments.filter((dept) =>
    dept.department_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats for the "Gimmick" look
  const totalDepts = departments.length;
  const newestDept =
    departments.length > 0 ? departments[0].department_name : "-";

  return (
    <HRLayout>
      <div className="main-hr-container hr-add-dept-page">
        {/* Animated Background Blobs */}
        <div className="bg-blob blob-1"></div>
        <div className="bg-blob blob-2"></div>

        {/* Page Header */}
        <motion.div
          className="page-header-row"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="header-titles">
            <h1>Department Management</h1>
            <p>Configure and oversee organization structure</p>
          </div>
          <div className="header-date">
            <FaClock />{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              day: "numeric",
              month: "short",
            })}
          </div>
        </motion.div>

        {/* Stats Grid to fill space visually */}
        <div className="hr-stats-grid">
          <motion.div
            className="stat-card stat-total"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="stat-icon">
              <FaLayerGroup />
            </div>
            <div className="stat-info">
              <h3>{totalDepts}</h3>
              <span>Total Departments</span>
            </div>
          </motion.div>

          <motion.div
            className="stat-card stat-newest"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="stat-icon">
              <FaBolt />
            </div>
            <div className="stat-info">
              <h3>{newestDept}</h3>
              <span>Newest Addition</span>
            </div>
          </motion.div>

          <motion.div
            className="stat-card stat-status"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="stat-icon">
              <FaChartPie />
            </div>
            <div className="stat-info">
              <h3>100%</h3>
              <span>Operational Status</span>
            </div>
          </motion.div>
        </div>

        <div className="hr-add-dept-layout">
          {/* Create Form */}
          <motion.div
            className="hr-add-dept-card form-card neon-border"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="card-header-visual">
              <div className="stat-icon-wrapper form-icon-glow">
                <FaPlus />
              </div>
              <div className="header-text">
                <h2>Add Department</h2>
                <p>Expand organization</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="form-body">
              <div
                className={`hr-input-group ${
                  isFocused || departmentName ? "focused" : ""
                }`}
              >
                <label className="label-small">Department Name</label>
                <div className="input-wrapper-compact">
                  <FaBuilding className="input-icon-compact" />
                  <input
                    type="text"
                    className="hr-compact-input"
                    placeholder="e.g. Innovation Lab"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-spacer"></div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="hr-compact-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  "Processing..."
                ) : (
                  <>
                    <FaPlus /> Create Unit
                  </>
                )}
              </motion.button>
            </form>

            <AnimatePresence>
              {message.text && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`compact-toast ${message.type}`}
                >
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* List Card */}
          <motion.div
            className="hr-dept-list-card glass-panel"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="list-header-row">
              <div className="title-group">
                <h2>Directory</h2>
                <span className="count-tag">{departments.length} Active</span>
              </div>

              <div className="table-search-box">
                <FaSearch className="table-search-icon" />
                <input
                  type="text"
                  placeholder="Search departments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="table-search-input"
                />
              </div>
            </div>

            <div className="hr-dept-table-container custom-scroll">
              {departments.length === 0 ? (
                <div className="empty-state-compact">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                  >
                    <FaLayerGroup
                      size={40}
                      style={{ marginBottom: "1rem", opacity: 0.5 }}
                    />
                  </motion.div>
                  <span>System Empty</span>
                </div>
              ) : (
                <table className="hr-dept-table">
                  <thead>
                    <tr>
                      <th width="10%">ID</th>
                      <th width="70%">Department Name</th>
                      <th width="20%" style={{ textAlign: "right" }}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredDepartments.map((dept, index) => (
                        <motion.tr
                          key={dept.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{
                            backgroundColor: "rgba(255,255,255,0.05)",
                            x: 4,
                          }}
                          className="dept-row"
                        >
                          <td className="id-cell">#{dept.id}</td>
                          <td>
                            <div className="dept-name-cell">
                              <div
                                className={`mini-avatar avatar-style-${
                                  (dept.id % 4) + 1
                                }`}
                              >
                                {dept.department_name.charAt(0).toUpperCase()}
                              </div>
                              <span className="dept-name-text">
                                {dept.department_name}
                              </span>
                              {index === 0 && !searchTerm && (
                                <span className="new-badge">NEW</span>
                              )}
                            </div>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div className="status-pill-small">
                              <div className="pulse-dot"></div>
                              Active
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </HRLayout>
  );
};

export default AddDepartment;
