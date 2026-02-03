import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPaperPlane,
  FaCalendarCheck,
  FaUserClock,
  FaArrowLeft,
  FaUser,
  FaUsers,
  FaSearch,
  FaTimes,
  FaCheckCircle,
} from "react-icons/fa";
import HRLayout from "../../../Component/HR/HRLayout";
import PopupErrorHR from "../../../Component/popup-error/popup-error-hr/PopupErrorHR";
import PopupSentDataHR from "../../../Component/popup-sent-data/popup-sent-data-hr/PopupSentDataHR";
import PopupDoneHR from "../../../Component/poup_done/poup_done-hr/PopupDoneHR";
import LogService from "../../../../services/LogService";
import "./Leave_info.css";

const Leave_info = () => {
  const navigate = useNavigate();
  const currentHrId = localStorage.getItem("userId");
  const currentHrUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Toggle State: false = Self, true = On Behalf
  const [isOnBehalf, setIsOnBehalf] = useState(false);

  const [formData, setFormData] = useState({
    user_id: "",
    leave_type: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
    reason: "",
  });
  const [isLeaveTypeOpen, setIsLeaveTypeOpen] = useState(false);
  const leaveTypes = [
    "Sick Leave",
    "Personal Leave",
    "Vacation Leave",
    "Other",
  ];

  const handleLeaveTypeSelect = (type) => {
    setFormData((prev) => ({ ...prev, leave_type: type }));
    setIsLeaveTypeOpen(false);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Popup States
  const [showSentData, setShowSentData] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorTitle, setErrorTitle] = useState("System Error");

  // Check login
  useEffect(() => {
    if (!currentHrId) {
      alert("Please log in first.");
      navigate("/login");
    }
    fetchUsers();
  }, [currentHrId, navigate]);

  // Reset form when toggling mode
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      user_id: isOnBehalf ? (selectedUser ? selectedUser.id : "") : currentHrId,
    }));
    if (!isOnBehalf) {
      setSearchTerm("");
      setSelectedUser(null);
      setShowDropdown(false);
    }
  }, [isOnBehalf, currentHrId, selectedUser]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        const userList = Array.isArray(data) ? data : data.data || [];
        setUsers(userList);
        setFilteredUsers(userList);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setShowDropdown(true);

    if (term.trim() === "") {
      setFilteredUsers(users);
      return;
    }

    const lowerTerm = term.toLowerCase();
    const filtered = users.filter((u) => {
      const fullName = `${u.first_name} ${u.last_name}`.toLowerCase();
      const empId = u.empId || u.emp_code || String(u.id);
      return fullName.includes(lowerTerm) || String(empId).includes(lowerTerm);
    });
    setFilteredUsers(filtered);
  };

  const selectUser = (user) => {
    const empId = user.empId || user.emp_code || user.id;
    setFormData((prev) => ({ ...prev, user_id: user.id }));
    setSelectedUser(user);
    setSearchTerm(`${user.first_name} ${user.last_name}`);
    setShowDropdown(false);
  };

  const clearSelectedUser = () => {
    setSelectedUser(null);
    setSearchTerm("");
    setFormData((prev) => ({ ...prev, user_id: "" }));
    setFilteredUsers(users);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e, status = "Pending") => {
    e.preventDefault();
    if (!formData.user_id) {
      setErrorTitle("Selection Required");
      setErrorMessage("Please select an employee to continue.");
      setShowError(true);
      return;
    }

    setIsSubmitting(true);
    setShowSentData(true); // Show spinning plane

    try {
      // payload now uses the SELECTED user_id, not the logged-in HR id
      let finalReason = formData.reason;
      if (status === "approved" || status === "Approved") {
        status = "approved"; // Ensure lowercase for DB Enum Compatibility
        const hrName =
          `${currentHrUser.first_name || "HR"} ${currentHrUser.last_name || ""}`.trim();
        finalReason = `${formData.reason} [Approved by HR: ${hrName}]`;
      }

      const payload = { ...formData, reason: finalReason, status }; // Add status and updated reason

      const res = await fetch("/api/leave-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // LOGGING
        try {
          let logDetails = "";
          if (status === "Approved") {
            // force approve logging
            const hrName =
              `${currentHrUser.first_name || ""} ${currentHrUser.last_name || ""}`.trim();
            const empName =
              isOnBehalf && selectedUser
                ? `${selectedUser.first_name} ${selectedUser.last_name}`
                : "Employee";
            logDetails = `รายการนี้ถูกอนุมัติโดย HR ${hrName} แทนพนักงาน`;
          } else {
            logDetails = `Submitted ${formData.leave_type} for ${
              isOnBehalf && selectedUser ? selectedUser.first_name : "Self"
            } (${formData.start_date} to ${formData.end_date})`;
          }

          await LogService.createLog({
            userId: currentHrId, // HR who submitted
            action:
              status === "Approved" ? "Force Approve (Admin)" : "Leave Request",
            details: logDetails,
            target:
              isOnBehalf && selectedUser
                ? `${selectedUser.first_name} ${selectedUser.last_name}`
                : "Self",
            severity: status === "Approved" ? "Warning" : "Info",
          });
        } catch (logErr) {
          console.warn("Logging failed", logErr);
        }

        setShowSentData(false); // Hide spinner
        setTimeout(() => setShowDone(true), 500); // Show Success after short delay
      } else {
        const errData = await res.json();
        setShowSentData(false);
        setErrorTitle("Submission Failed");
        setErrorMessage(errData.message || "Failed to submit request");
        setShowError(true);
      }
    } catch (err) {
      console.error("Submission error:", err);
      setShowSentData(false);
      setErrorTitle("Network Error");
      setErrorMessage("Could not connect to server. Please try again.");
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <HRLayout>
      <div className="leave-wrapper">
        <PopupSentDataHR
          isOpen={showSentData}
          onClose={() => setShowSentData(false)}
        />
        <PopupDoneHR
          isOpen={showDone}
          onClose={() => {
            setShowDone(false);
            navigate("/hr/show-leave");
          }}
          message={`Leave request submitted successfully for ${
            isOnBehalf && selectedUser ? selectedUser.first_name : "yourself"
          }!`}
        />
        <PopupErrorHR
          isOpen={showError}
          onClose={() => setShowError(false)}
          title={errorTitle}
          message={errorMessage}
        />

        <motion.div
          className="leave-card premium-glass"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="card-header-actions">
            <button
              className="btn-back-link"
              onClick={() => navigate("/hr/show-leave")}
            >
              <FaArrowLeft /> Back to List
            </button>
          </div>

          <div className="card-header-compact">
            <div className="header-icon-glare">
              <FaPaperPlane className="header-icon-svg" />
            </div>
            <div className="header-text">
              <h1 className="header-title">Submit Leave Request</h1>
              <p className="header-subtitle">
                Fill in the details below to process a new leave request.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="compact-form">
            {/* Selection Cards */}
            <div className="section-label">
              <span>Request For</span>
              <div className="h-line"></div>
            </div>

            <div className="selection-grid">
              <div
                className={`selection-card ${!isOnBehalf ? "active" : ""}`}
                onClick={() => setIsOnBehalf(false)}
              >
                <div className="card-icon-container">
                  <FaUser className="card-icon" />
                </div>
                <div className="card-info">
                  <span className="card-title">Myself</span>
                  <span className="card-desc">For your own leave</span>
                </div>
                <div className="selection-checkbox"></div>
              </div>

              <div
                className={`selection-card ${isOnBehalf ? "active" : ""}`}
                onClick={() => setIsOnBehalf(true)}
              >
                <div className="card-icon-container">
                  <FaUsers className="card-icon" />
                </div>
                <div className="card-info">
                  <span className="card-title">On Behalf</span>
                  <span className="card-desc">For another employee</span>
                </div>
                <div className="selection-checkbox"></div>
              </div>
            </div>

            {/* Employee Section */}
            <AnimatePresence mode="wait">
              {!isOnBehalf ? (
                <motion.div
                  key="myself"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="form-group"
                >
                  <div className="user-badge self-badge">
                    <div className="user-badge-icon">
                      <FaUser />
                    </div>
                    <div className="user-badge-info">
                      <h4>
                        {currentHrUser.first_name} {currentHrUser.last_name}
                      </h4>
                      <p>Role: HR Operator (You)</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="onbehalf"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="on-behalf-wrapper"
                >
                  <div className="form-group search-container">
                    <label className="input-label">Select Employee</label>
                    {!selectedUser ? (
                      <div className="input-group-search">
                        <FaSearch className="search-icon" />
                        <input
                          type="text"
                          className="input-field search-input"
                          placeholder="Search by name or ID..."
                          value={searchTerm}
                          onChange={handleSearch}
                          onFocus={() => setShowDropdown(true)}
                        />
                        {searchTerm && (
                          <button
                            type="button"
                            className="clear-btn"
                            onClick={() => {
                              setSearchTerm("");
                              setFilteredUsers(users);
                            }}
                          >
                            <FaTimes />
                          </button>
                        )}

                        {showDropdown && filteredUsers.length > 0 && (
                          <motion.div
                            className="search-dropdown"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {filteredUsers.map((user) => (
                              <div
                                key={user.id}
                                className="dropdown-item"
                                onClick={() => selectUser(user)}
                              >
                                <div className="item-avatar">
                                  {user.first_name.charAt(0)}
                                </div>
                                <div className="item-info">
                                  <span className="item-name">
                                    {user.first_name} {user.last_name}
                                  </span>
                                  <span className="item-id">
                                    ID: {user.empId || user.emp_code || user.id}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    ) : (
                      <motion.div
                        className="selected-user-card"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                      >
                        <div className="selected-avatar">
                          {selectedUser.first_name.charAt(0)}
                        </div>
                        <div className="selected-info">
                          <h4>
                            {selectedUser.first_name} {selectedUser.last_name}
                          </h4>
                          <p>
                            ID:{" "}
                            {selectedUser.empId ||
                              selectedUser.emp_code ||
                              selectedUser.id}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="remove-user-btn"
                          onClick={clearSelectedUser}
                        >
                          Change
                        </button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Logistics Row: Type + Dates */}
            <div className="section-label mt-4">
              <span>Leave Details</span>
              <div className="h-line"></div>
            </div>

            <div className="form-row-3">
              <div className="form-group" style={{ zIndex: 20 }}>
                <label>Leave Type</label>
                <div className="custom-dropdown-container">
                  <div
                    className={`custom-select-trigger ${
                      formData.leave_type ? "filled" : ""
                    } ${isLeaveTypeOpen ? "open" : ""}`}
                    onClick={() => setIsLeaveTypeOpen(!isLeaveTypeOpen)}
                  >
                    <span>{formData.leave_type || "Select Type..."}</span>
                    <motion.div
                      animate={{ rotate: isLeaveTypeOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="arrow-icon"
                    >
                      <FaArrowLeft style={{ transform: "rotate(-90deg)" }} />
                    </motion.div>
                  </div>

                  <AnimatePresence>
                    {isLeaveTypeOpen && (
                      <motion.div
                        className="custom-options-list"
                        initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
                        animate={{ opacity: 1, y: 0, scaleY: 1 }}
                        exit={{ opacity: 0, y: -10, scaleY: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        {leaveTypes.map((type) => (
                          <div
                            key={type}
                            className={`custom-option ${
                              formData.leave_type === type ? "selected" : ""
                            }`}
                            onClick={() => handleLeaveTypeSelect(type)}
                          >
                            {type}
                            {formData.leave_type === type && (
                              <FaCheckCircle className="check-icon" />
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split("T")[0]}
                  required
                  className="input-field cursor-pointer"
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  min={
                    formData.start_date ||
                    new Date().toISOString().split("T")[0]
                  }
                  required
                  className="input-field cursor-pointer"
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Reason</label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                placeholder="Please describe the reason for this leave request..."
                required
                className="input-field textarea"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate("/hr/show-leave")}
                className="btn-hr-cancel"
              >
                Cancel
              </button>

              {isOnBehalf ? (
                <>
                  <button
                    type="button"
                    className="btn-hr-submit"
                    onClick={(e) => handleSubmit(e, "Pending")}
                    disabled={isSubmitting}
                    style={{ backgroundColor: "#3b82f6" }} // Blue for normal submit
                  >
                    {isSubmitting ? (
                      <span className="loading-spinner-hr"></span>
                    ) : (
                      <>
                        <span>Submit for Approval</span>
                        <div className="icon-wrapper-hr">
                          <FaPaperPlane />
                        </div>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn-hr-submit"
                    onClick={(e) => handleSubmit(e, "approved")}
                    disabled={isSubmitting}
                    style={{ backgroundColor: "#ef4444" }} // Red for Force Approve
                  >
                    {isSubmitting ? (
                      <span className="loading-spinner-hr"></span>
                    ) : (
                      <>
                        <span>Force Approve</span>
                        <div className="icon-wrapper-hr">
                          <FaCheckCircle />
                        </div>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  type="submit"
                  className="btn-hr-submit"
                  disabled={isSubmitting}
                  onClick={(e) => handleSubmit(e, "Pending")}
                >
                  {isSubmitting ? (
                    <span className="loading-spinner-hr"></span>
                  ) : (
                    <>
                      <span>Submit Request</span>
                      <div className="icon-wrapper-hr">
                        <FaPaperPlane />
                      </div>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </HRLayout>
  );
};

export default Leave_info;
