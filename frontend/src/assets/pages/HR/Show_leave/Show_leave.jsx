import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaFileAlt,
  FaPlaneDeparture,
  FaSearch,
  FaList,
  FaThLarge,
  FaSyncAlt,
  FaCopy,
  FaUserCircle,
} from "react-icons/fa";
import HRLayout from "../../../Component/HR/HRLayout";
import "./Show_leave.css";

// Helper to calculate days
const getDaysDifference = (start, end) => {
  const diff = new Date(end) - new Date(start);
  return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1, 1);
};

export default function ShowLeave() {
  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null); // For viewing details

  // Filter & UI State
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'grid'

  // New Request Form State
  const [formData, setFormData] = useState({
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
  });

  const userId = localStorage.getItem("userId");
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const isHR = currentUser.role_id === 2 || currentUser.role_name === "HR";

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const url = isHR
        ? "/api/leave-requests/all"
        : `/api/leave-requests/${userId}`;
      const res = await fetch(url);

      if (res.ok) {
        const data = await res.json();
        setLeaves(data);
      } else {
        console.error("Failed to fetch leaves", res.status);
      }
    } catch (err) {
      console.error("Error fetching leaves:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchLeaves();
  }, [userId]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return;
    setSubmitting(true);
    try {
      const payload = { ...formData, user_id: userId };
      const res = await fetch("/api/leave-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          leave_type: "",
          start_date: "",
          end_date: "",
          reason: "",
        });
        fetchLeaves();
        alert("Leave request submitted successfully!");
      } else {
        alert("Failed to create request.");
      }
    } catch (err) {
      console.error("Error submitting request:", err);
      alert("Error submitting request.");
    } finally {
      setSubmitting(false);
    }
  };

  const stats = {
    total: leaves.length,
    pending: leaves.filter((l) => l.status === "pending").length,
    approved: leaves.filter((l) => l.status === "approved").length,
    rejected: leaves.filter((l) => l.status === "rejected").length,
  };

  const getStatusConfig = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return {
          icon: <FaCheckCircle />,
          label: "Approved",
          className: "sl-status-approved",
        };
      case "pending":
      case "processing":
        return {
          icon: <FaHourglassHalf />,
          label: "Pending",
          className: "sl-status-pending",
        };
      case "rejected":
      case "cancelled":
        return {
          icon: <FaTimesCircle />,
          label: "Rejected",
          className: "sl-status-rejected",
        };
      default:
        return {
          icon: <FaList />,
          label: status,
          className: "sl-status-default",
        };
    }
  };

  const filteredLeaves = leaves.filter((leave) => {
    const matchesStatus =
      statusFilter === "all" || leave.status === statusFilter;
    const matchesSearch =
      leave.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.leave_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (leave.first_name &&
        `${leave.first_name} ${leave.last_name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <HRLayout>
      <div className="sl-wrapper">
        <div className="sl-header">
          <div>
            <h2 className="sl-page-title">
              {isHR ? "Leave Management Dashboard" : "My Leave Portal"}
            </h2>
            <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
              {isHR
                ? "Manage and review employee leave requests in real-time."
                : "Track and submit your leave requests efficiently."}
            </p>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <motion.button
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="sl-btn-refresh"
              onClick={fetchLeaves}
              title="Refresh Data"
            >
              <FaSyncAlt />
            </motion.button>
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
              }}
              whileTap={{ scale: 0.95 }}
              className="sl-btn-primary"
              onClick={() => setIsModalOpen(true)}
            >
              <FaPlus /> New Request
            </motion.button>
          </div>
        </div>

        <div className="sl-stats-grid">
          {[
            {
              key: "total",
              label: "Total Requests",
              icon: <FaFileAlt />,
              color: "blue",
            },
            {
              key: "pending",
              label: "Pending Review",
              icon: <FaHourglassHalf />,
              color: "yellow",
            },
            {
              key: "approved",
              label: "Approved",
              icon: <FaCheckCircle />,
              color: "green",
            },
            {
              key: "rejected",
              label: "Rejected",
              icon: <FaTimesCircle />,
              color: "red",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.key}
              className="sl-stat-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
            >
              <div className={`sl-stat-icon-wrapper sl-bg-${stat.color}`}>
                {stat.icon}
              </div>
              <div className="sl-stat-info">
                <h3>{stats[stat.key]}</h3>
                <p>{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="sl-filter-bar">
          <div className="sl-status-filters">
            {["all", "pending", "approved", "rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`sl-filter-btn ${
                  statusFilter === status ? "active" : ""
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          <div className="sl-search-wrapper">
            <FaSearch className="sl-search-icon" />
            <input
              type="text"
              placeholder="Search by reason, type, or employee..."
              className="sl-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="sl-view-toggles">
            <button
              className={`sl-view-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
              title="List View"
            >
              <FaList />
            </button>
            <button
              className={`sl-view-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid View"
            >
              <FaThLarge />
            </button>
          </div>
        </div>

        <div className="sl-content-area">
          {isLoading ? (
            <div
              className="sl-loading-state"
              style={{ color: "white", padding: "2rem", textAlign: "center" }}
            >
              Loading data...
            </div>
          ) : filteredLeaves.length === 0 ? (
            <div
              className="sl-empty-state"
              style={{ textAlign: "center", padding: "4rem", color: "#64748b" }}
            >
              <FaPlaneDeparture
                size={50}
                style={{
                  opacity: 0.4,
                  marginBottom: "1.5rem",
                  color: "#3b82f6",
                }}
              />
              <p style={{ fontSize: "1.2rem" }}>
                No leave requests found matching your filters.
              </p>
            </div>
          ) : viewMode === "list" ? (
            <motion.div
              className="sl-table-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <table className="sl-custom-table">
                <thead>
                  <tr>
                    {isHR && <th>Employee</th>}
                    <th>Leave Type</th>
                    <th>Duration & Dates</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Requested On</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredLeaves.map((leave, index) => {
                      const statusConfig = getStatusConfig(leave.status);
                      return (
                        <motion.tr
                          key={leave.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ delay: index * 0.03 }}
                        >
                          {isHR && (
                            <td style={{ fontWeight: 600, color: "white" }}>
                              {leave.first_name
                                ? `${leave.first_name} ${leave.last_name}`
                                : "Me"}
                              {leave.emp_code && (
                                <span
                                  style={{
                                    fontSize: "0.8rem",
                                    color: "var(--sl-text-secondary)",
                                    display: "block",
                                    marginTop: "0.2rem",
                                  }}
                                >
                                  {leave.emp_code}
                                </span>
                              )}
                            </td>
                          )}
                          <td>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.8rem",
                                fontWeight: 500,
                                color: "#e2e8f0",
                              }}
                            >
                              <span
                                style={{
                                  background: "rgba(59, 130, 246, 0.1)",
                                  padding: "8px",
                                  borderRadius: "8px",
                                  color: "var(--sl-primary)",
                                }}
                              >
                                <FaCalendarAlt />
                              </span>
                              {leave.leave_type}
                            </div>
                          </td>
                          <td>
                            <div
                              style={{ fontSize: "0.95rem", color: "#cbd5e1" }}
                            >
                              {new Date(leave.start_date).toLocaleDateString()}{" "}
                              - {new Date(leave.end_date).toLocaleDateString()}
                              <span
                                style={{
                                  display: "block",
                                  color: "var(--sl-primary)",
                                  fontSize: "0.85rem",
                                  fontWeight: 600,
                                  marginTop: "0.2rem",
                                }}
                              >
                                {getDaysDifference(
                                  leave.start_date,
                                  leave.end_date
                                )}{" "}
                                Days Duration
                              </span>
                            </div>
                          </td>
                          <td
                            style={{
                              maxWidth: "300px",
                              color: "var(--sl-text-secondary)",
                            }}
                          >
                            <span
                              className="sl-truncate-text"
                              onClick={() => setSelectedLeave(leave)}
                              title="Click to view full reason"
                            >
                              {leave.reason}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`sl-status-badge ${statusConfig.className}`}
                            >
                              {statusConfig.icon}
                              {statusConfig.label}
                            </span>
                          </td>
                          <td
                            style={{
                              color: "var(--sl-text-secondary)",
                              fontSize: "0.9rem",
                            }}
                          >
                            {new Date(leave.created_at).toLocaleDateString()}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </motion.div>
          ) : (
            <motion.div layout className="sl-leaves-grid">
              <AnimatePresence>
                {filteredLeaves.map((leave) => {
                  const statusConfig = getStatusConfig(leave.status);
                  return (
                    <motion.div
                      layout
                      key={leave.id}
                      className={`sl-leave-card sl-status-${leave.status}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{
                        y: -5,
                        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)",
                      }}
                    >
                      <div className="sl-card-header">
                        <div className="sl-card-type">
                          <FaCalendarAlt className="sl-card-type-icon" />
                          <span>{leave.leave_type}</span>
                        </div>
                        <span
                          className={`sl-status-badge ${statusConfig.className}`}
                        >
                          {statusConfig.icon}
                          {statusConfig.label}
                        </span>
                      </div>

                      <div className="sl-card-body">
                        {isHR && (
                          <div className="sl-card-emp-name">
                            {leave.first_name} {leave.last_name}
                          </div>
                        )}

                        <div className="sl-card-duration-badge">
                          {getDaysDifference(leave.start_date, leave.end_date)}{" "}
                          Days
                        </div>

                        <div className="sl-card-dates-row">
                          <div className="sl-card-date-group">
                            <span className="sl-card-date-label">From</span>
                            <span className="sl-card-date-value">
                              {new Date(leave.start_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="sl-card-date-separator">→</div>
                          <div className="sl-card-date-group">
                            <span className="sl-card-date-label">To</span>
                            <span className="sl-card-date-value">
                              {new Date(leave.end_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div
                          className="sl-card-reason"
                          onClick={() => setSelectedLeave(leave)}
                          title="Click to view full reason"
                        >
                          "{leave.reason}"
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* New Request Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="sl-modal-overlay">
              <motion.div
                className="sl-modal-content"
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 50 }}
              >
                <h3 className="sl-modal-title">New Leave Request</h3>
                <form onSubmit={handleSubmit}>
                  <div className="sl-form-group">
                    <label>Leave Type</label>
                    <select
                      name="leave_type"
                      className="sl-form-control"
                      required
                      value={formData.leave_type}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Type</option>
                      <option value="Sick Leave">Sick Leave</option>
                      <option value="Annual Leave">Annual Leave</option>
                      <option value="Personal Leave">Personal Leave</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1.5rem",
                    }}
                  >
                    <div className="sl-form-group">
                      <label>Start Date</label>
                      <input
                        type="date"
                        name="start_date"
                        className="sl-form-control"
                        required
                        value={formData.start_date}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="sl-form-group">
                      <label>End Date</label>
                      <input
                        type="date"
                        name="end_date"
                        className="sl-form-control"
                        required
                        value={formData.end_date}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="sl-form-group">
                    <label>Reason</label>
                    <textarea
                      name="reason"
                      className="sl-form-control"
                      rows="4"
                      required
                      placeholder="Please provide a detailed reason..."
                      value={formData.reason}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>

                  <div className="sl-modal-actions">
                    <button
                      type="button"
                      className="sl-btn-secondary"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="sl-btn-primary"
                      disabled={submitting}
                    >
                      {submitting ? "Submitting..." : "Submit Request"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Advanced Cinematic Details Modal */}
        <AnimatePresence>
          {selectedLeave && (
            <div
              className="sl-modal-overlay"
              onClick={() => setSelectedLeave(null)}
            >
              <motion.div
                className="sl-modal-content"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header with Status Color Accent */}
                <div
                  className="sl-modal-header-bar"
                  style={{
                    borderTop: `4px solid ${
                      selectedLeave.status === "approved"
                        ? "#34d399"
                        : selectedLeave.status === "rejected"
                        ? "#f87171"
                        : "#fbbf24"
                    }`,
                  }}
                >
                  <div className="sl-modal-title-group">
                    <h3 className="sl-modal-title">Leave Details</h3>
                    <div className="sl-modal-subtitle-row">
                      <span className="sl-header-badge">
                        <span className="sl-badge-label">ID</span>
                        <span className="sl-badge-value">
                          #{selectedLeave.id}
                        </span>
                      </span>
                      <span className="sl-header-badge">
                        <span className="sl-badge-label">Requested</span>
                        <span className="sl-badge-value">
                          {new Date(
                            selectedLeave.created_at
                          ).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </span>
                    </div>
                  </div>
                  <button
                    className="sl-modal-close-btn"
                    onClick={() => setSelectedLeave(null)}
                  >
                    &times;
                  </button>
                </div>

                <div className="sl-modal-body">
                  {/* Metadata Grid */}
                  <div className="sl-modal-meta-grid">
                    <div className="sl-meta-item">
                      <span className="sl-meta-label">Leave Type</span>
                      <div
                        className="sl-meta-value"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <FaCalendarAlt style={{ color: "var(--sl-primary)" }} />
                        {selectedLeave.leave_type}
                      </div>
                    </div>
                    <div className="sl-meta-item">
                      <span className="sl-meta-label">Duration</span>
                      <div className="sl-meta-value">
                        {getDaysDifference(
                          selectedLeave.start_date,
                          selectedLeave.end_date
                        )}{" "}
                        Days
                      </div>
                    </div>
                    <div className="sl-meta-item sl-meta-full">
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.2rem",
                        }}
                      >
                        <span className="sl-meta-label">Applicant</span>
                        <div className="sl-meta-value">
                          {selectedLeave.first_name
                            ? `${selectedLeave.first_name} ${selectedLeave.last_name}`
                            : "Me"}
                        </div>
                      </div>
                      <FaUserCircle
                        size={40}
                        style={{ opacity: 0.2, color: "white" }}
                      />
                    </div>
                  </div>

                  {/* Reason Box with Gimmick */}
                  <div className="sl-reason-container">
                    <span className="sl-reason-label">Reason for Request</span>
                    <div className="sl-reason-text">
                      "{selectedLeave.reason}"
                    </div>
                    <button
                      className="sl-copy-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedLeave.reason);
                        alert("Reason copied to clipboard!");
                      }}
                    >
                      <FaCopy /> Copy Text
                    </button>
                  </div>
                </div>

                {/* Footer Removed as per request */}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </HRLayout>
  );
}
