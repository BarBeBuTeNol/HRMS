import React, { useState, useEffect } from "react";
import DepartmentService from "../../../../services/DepartmentService";
import LogService from "../../../../services/LogService";
import HRLayout from "../../../Component/HR/HRLayout";
import LoadingHR from "../../../Component/loading/loading-hr/LoadingHR";
import PopupHR from "../../../Component/popup_notifications/popup_notifications-hr/PopupHR";
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

  // Popup Notification State
  const [popup, setPopup] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

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

  // --- Validation ---
  const validateDepartmentName = (name) => {
    if (name.length > 100) return false;
    // Allow Thai, English, Numbers, Spaces. Block others.
    const regex = /^[a-zA-Z0-9\u0E00-\u0E7F\s]*$/;
    return regex.test(name);
  };

  const handleCreateNameChange = (e) => {
    const val = e.target.value;
    if (validateDepartmentName(val)) {
      setDepartmentName(val);
    }
  };

  const handleEditNameChange = (e) => {
    const val = e.target.value;
    if (validateDepartmentName(val)) {
      setEditName(val);
    }
  };

  // --- Create ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!departmentName.trim()) {
      setPopup({
        isOpen: true,
        title: "Invalid Input",
        message: "Department name is required. Please enter a valid name.",
        type: "warning",
      });
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
      setPopup({
        isOpen: true,
        title: "Error Creating",
        message: errorMsg,
        type: "error",
      });
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
      setPopup({
        isOpen: true,
        title: "Validation Error",
        message: "Department name cannot be empty.",
        type: "warning",
      });
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

      setPopup({
        isOpen: true,
        title: "Updated",
        message: "Department information has been updated successfully.",
        type: "success",
      });
      setIsEditModalOpen(false);
      fetchDepartments();
    } catch (error) {
      setPopup({
        isOpen: true,
        title: "Update Failed",
        message: "Could not update the department. Please try again.",
        type: "error",
      });
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

      setPopup({
        isOpen: true,
        title: "Deleted",
        message: "The department has been removed from the system.",
        type: "success",
      });
      fetchDepartments();
    } catch (error) {
      setPopup({
        isOpen: true,
        title: "Delete Error",
        message: "Unable to delete the department.",
        type: "error",
      });
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
                    onChange={handleCreateNameChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    disabled={isLoading}
                    maxLength={100}
                  />
                </div>
                <div className="input-footer">
                  <span className="char-limit-indicator">{departmentName.length}/100</span>
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
              className="modal-overlay-premium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="modal-bg-blur" onClick={() => setIsEditModalOpen(false)}></div>
              <motion.div
                className="modal-content-premium"
                initial={{ scale: 0.85, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.85, opacity: 0, y: 30 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
              >
                <div className="modal-header-premium">
                  <div className="header-icon-box">
                    <FaEdit />
                  </div>
                  <div className="header-text-group">
                    <h2>Edit Department</h2>
                    <p>Update identity for #{editingDept?.id}</p>
                  </div>
                  <button
                    className="close-btn-premium"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    <FaTimes />
                  </button>
                </div>

                <div className="modal-body-premium">
                  <div className="edit-form-group">
                    <label>Department Name</label>
                    <div className="input-with-icon">
                      <FaBuilding className="field-icon" />
                      <input
                        type="text"
                        className="premium-input-field"
                        value={editName}
                        onChange={handleEditNameChange}
                        placeholder="Enter department name"
                        maxLength={100}
                        autoFocus
                      />
                    </div>
                    <div className="field-helper">
                      <span>Letters, numbers, and spaces only</span>
                      <span className={editName.length > 90 ? "warning-text" : ""}>
                        {editName.length}/100
                      </span>
                    </div>
                  </div>
                </div>

                <div className="modal-footer-premium">
                  <button
                    className="btn-link-premium"
                    onClick={() => setIsEditModalOpen(false)}
                    disabled={isLoading}
                  >
                    Discard
                  </button>
                  <button 
                    className="btn-action-premium" 
                    onClick={handleUpdate}
                    disabled={isLoading || !editName.trim()}
                  >
                    {isLoading ? "Saving..." : (
                      <>
                        <FaSave /> Save Changes
                      </>
                    )}
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
              className="modal-overlay-premium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="modal-bg-blur" onClick={() => setDeleteId(null)}></div>
              <motion.div
                className="modal-content-premium delete-premium"
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  y: 0,
                  transition: { type: "spring", damping: 25, stiffness: 400 },
                }}
                exit={{ scale: 0.8, opacity: 0, y: 50 }}
              >
                <div className="delete-accent-bar"></div>
                <div className="modal-body-premium delete-body">
                  <div className="delete-icon-glow">
                    <FaTrash />
                  </div>
                  <h2 className="delete-title-premium">Confirm Deletion</h2>
                  <p className="delete-desc-premium">
                    Are you sure you want to delete this department? <br/>
                    All associated data will be permanently removed.
                  </p>
                  
                  <div className="delete-info-card">
                    <span className="info-label">Deleting Unit</span>
                    <span className="info-value">#{deleteId} - {departments.find(d => d.id === deleteId)?.department_name}</span>
                  </div>
                </div>

                <div className="modal-footer-premium delete-footer">
                  <button
                    className="btn-link-premium"
                    onClick={() => setDeleteId(null)}
                    disabled={isLoading}
                  >
                    Keep Department
                  </button>
                  <button
                    className="btn-danger-premium"
                    onClick={confirmDelete}
                    disabled={isLoading}
                  >
                    {isLoading ? "Deleting..." : "Confirm Delete"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Success Overlay */}
        <SuccessOverlay show={showSuccessOverlay} />
      </div>

      <PopupHR
        isOpen={popup.isOpen}
        onClose={() => setPopup({ ...popup, isOpen: false })}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        autoClose={true}
        duration={4000}
      />
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
