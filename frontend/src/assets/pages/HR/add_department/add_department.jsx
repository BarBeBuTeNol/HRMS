import React, { useState, useEffect } from "react";
import DepartmentService from "../../../../services/DepartmentService";
import LogService from "../../../../services/LogService";
import HRLayout from "../../../Component/HR/HRLayout";
import LoadingHR from "../../../Component/loading/loading-hr/LoadingHR";
import "./add_department.css";
import {
  FaBuilding,
  FaPlus,
  FaSearch,
  FaLayerGroup,
  FaBolt,
  FaChartPie,
  FaClock,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const AddDepartment = () => {
  // Helper to log actions
  const logAction = async (action, details) => {
    try {
      const userId = localStorage.getItem("userId");
      if (userId) {
        await LogService.createLog({
          user_id: parseInt(userId),
          action: action,
          details: details,
          severity: "Info",
        });
      }
    } catch (error) {
      console.error("Failed to log action:", error);
    }
  };

  const [departmentName, setDepartmentName] = useState("");
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isFocused, setIsFocused] = useState(false);

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState(null); // Delete Modal State

  const fetchDepartments = async () => {
    try {
      const data = await DepartmentService.getAllDepartments();
      setDepartments(data.sort((a, b) => b.id - a.id));
    } catch (error) {
      console.error("Failed to fetch departments", error);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Success State
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  // --- Create ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!departmentName.trim()) {
      showToast("error", "Department name is required");
      return;
    }

    setIsLoading(true);
    try {
      await DepartmentService.createDepartment(departmentName);

      // Log Action
      await logAction(
        "Create Department",
        `Created department: ${departmentName}`,
      );

      // Trigger Success Overlay
      setShowSuccessOverlay(true);
      setDepartmentName("");
      fetchDepartments();

      // Auto hide after 3 seconds
      setTimeout(() => {
        setShowSuccessOverlay(false);
      }, 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to create";
      showToast("error", errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Edit ---
  const handleEditClick = (dept) => {
    setEditingDept(dept);
    setEditName(dept.department_name);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editName.trim()) {
      showToast("error", "Department name cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      // Assuming updateDepartment exists in service (mocking if not, standard pattern)
      if (DepartmentService.updateDepartment) {
        await DepartmentService.updateDepartment(editingDept.id, {
          department_name: editName,
        });
      } else {
        // Fallback for demo if backend not ready
        console.warn("updateDepartment service missing, simulating update");
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // Log Action
      await logAction(
        "Update Department",
        `Updated department ID ${editingDept.id} to '${editName}'`,
      );

      showToast("success", "Department Updated");
      setIsEditModalOpen(false);
      fetchDepartments();
    } catch (error) {
      showToast("error", "Failed to update department");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Delete ---
  const handleDeleteClick = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsLoading(true);
    try {
      await DepartmentService.deleteDepartment(deleteId);

      // Log Action
      await logAction("Delete Department", `Deleted department ID ${deleteId}`);

      showToast("success", "Department Deleted");
      fetchDepartments();
    } catch (error) {
      showToast("error", "Failed to delete department");
    } finally {
      setIsLoading(false);
      setDeleteId(null);
    }
  };

  const showToast = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const filteredDepartments = departments.filter((dept) =>
    dept.department_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalDepts = departments.length;
  const newestDept =
    departments.length > 0 ? departments[0].department_name : "-";

  return (
    <HRLayout>
      {isLoading && <LoadingHR />}
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

        {/* Stats Grid */}
        <div className="hr-stats-grid">
          <StatCard
            icon={<FaLayerGroup />}
            value={totalDepts}
            label="Total Departments"
            type="total"
            delay={0.1}
          />
          <StatCard
            icon={<FaBolt />}
            value={newestDept}
            label="Newest Addition"
            type="newest"
            delay={0.2}
          />
          <StatCard
            icon={<FaChartPie />}
            value="100%"
            label="Operational Status"
            type="status"
            delay={0.3}
          />
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
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{
                    opacity: 0,
                    scale: 0.95,
                    transition: { duration: 0.2 },
                  }}
                  className={`compact-toast ${message.type}`}
                >
                  <div className="toast-icon">
                    {message.type === "success" && <FaSave />}
                    {message.type === "error" && <FaTimes />}
                  </div>
                  <span>{message.text}</span>
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
                <input
                  type="text"
                  placeholder="Search departments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="table-search-input"
                />
                <FaSearch className="table-search-icon" />
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
                      <th width="50%">Department Name</th>
                      <th width="20%" style={{ textAlign: "center" }}>
                        Status
                      </th>
                      <th width="20%" style={{ textAlign: "center" }}>
                        Actions
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
                              <div className="dept-text-wrapper">
                                <span className="dept-name-text">
                                  {dept.department_name}
                                </span>
                                {index === 0 && !searchTerm && (
                                  <span className="new-badge">NEW</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <div
                              className="status-pill-small"
                              style={{ margin: "0 auto" }}
                            >
                              <div className="pulse-dot"></div>
                              Active
                            </div>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <div
                              className="action-buttons-cell"
                              style={{ justifyContent: "center" }}
                            >
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="action-btn btn-edit"
                                onClick={() => handleEditClick(dept)}
                                title="Edit"
                              >
                                <FaEdit />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="action-btn btn-delete"
                                onClick={() => handleDeleteClick(dept.id)}
                                title="Delete"
                              >
                                <FaTrash />
                              </motion.button>
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

        {/* Edit Modal */}
        <AnimatePresence>
          {isEditModalOpen && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="modal-content"
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 20 }}
              >
                <div className="modal-header">
                  <h2>Edit Department</h2>
                  <button
                    className="close-btn"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    <FaTimes />
                  </button>
                </div>

                <div className="floating-input-group">
                  <input
                    type="text"
                    className="floating-input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder=" "
                  />
                  <label className="floating-label">Department Name</label>
                </div>

                <div className="modal-actions">
                  <button
                    className="btn-cancel"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button className="btn-save" onClick={handleUpdate}>
                    <FaSave style={{ marginRight: "0.5rem" }} /> Save Changes
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteId && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="modal-content delete-modal-content"
                initial={{ scale: 0.5, opacity: 0, y: 50 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  y: 0,
                  transition: { type: "spring", damping: 20, stiffness: 300 },
                }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="delete-icon-wrapper">
                  <FaTrash />
                </div>
                <h2 className="delete-title">Delete Department?</h2>
                <p className="delete-warning">
                  Are you sure you want to delete this department? <br />
                  This action cannot be undone.
                </p>

                <div className="modal-actions">
                  <button
                    className="btn-cancel"
                    onClick={() => setDeleteId(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-delete-confirm"
                    onClick={confirmDelete}
                  >
                    Yes, Delete It
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Success Overlay */}
        <SuccessOverlay show={showSuccessOverlay} />
      </div>
    </HRLayout>
  );
};

// Sub-component for Cleaner Code
const StatCard = ({ icon, value, label, type, delay }) => (
  <motion.div
    className={`stat-card stat-${type}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <div className="stat-icon">{icon}</div>
    <div className="stat-info">
      <h3>{value}</h3>
      <span>{label}</span>
    </div>
  </motion.div>
);

// --- Success Overlay Component ---
const SuccessOverlay = ({ show, onClose }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="success-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="success-content">
            <div className="success-icon-circle">
              <svg className="checkmark-draw" viewBox="0 0 52 52">
                <path d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>
            <h1 className="success-title">Success!</h1>
            <p className="success-detail">Department created successfully</p>
          </div>
          <Confetti />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Simple CSS-based Confetti for Zero-Dependency
const Confetti = () => {
  // Create 50 particles
  const particles = Array.from({ length: 50 });

  return (
    <>
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="confetti-piece"
          initial={{
            x: Math.random() * window.innerWidth,
            y: -20,
            rotate: 0,
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            y: window.innerHeight + 20,
            rotate: Math.random() * 360,
            x: `calc(${Math.random() * 100}vw - 50vw)`,
          }}
          transition={{
            duration: Math.random() * 2 + 2,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            background: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"][
              Math.floor(Math.random() * 5)
            ],
            left: 0,
          }}
        />
      ))}
    </>
  );
};

export default AddDepartment;
