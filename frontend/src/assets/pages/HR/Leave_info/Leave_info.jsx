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
} from "react-icons/fa";
import HRLayout from "../../../Component/HR/HRLayout";
import PopupNotification from "../../../Component/popup_notifications/popup_notifications-hr/PopupHR";
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Popup State
  const [popup, setPopup] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

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
      user_id: isOnBehalf ? "" : currentHrId,
    }));
    if (!isOnBehalf) {
      setSearchTerm("");
      setSelectedUser(null);
    }
  }, [isOnBehalf, currentHrId]);

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
    setSearchTerm(`${user.first_name} ${user.last_name} (ID: ${empId})`);
    setShowDropdown(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.user_id) {
      setPopup({
        isOpen: true,
        title: "Error",
        message: "Please select an employee.",
        type: "error",
      });
      return;
    }
    setIsSubmitting(true);

    try {
      // payload now uses the SELECTED user_id, not the logged-in HR id
      const res = await fetch("/api/leave-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        // LOGGING
        try {
          await LogService.createLog({
            userId: currentHrId, // HR who submitted
            action: "Leave Request",
            details: `Submitted ${formData.leave_type} for ${
              isOnBehalf && selectedUser ? selectedUser.first_name : "Self"
            } (${formData.start_date} to ${formData.end_date})`,
            target:
              isOnBehalf && selectedUser
                ? `${selectedUser.first_name} ${selectedUser.last_name}`
                : "Self",
            severity: "Info",
          });
        } catch (logErr) {
          console.warn("Logging failed", logErr);
        }

        setPopup({
          isOpen: true,
          title: "Success",
          message: `Leave request submitted successfully for ${
            isOnBehalf && selectedUser ? selectedUser.first_name : "yourself"
          }!`,
          type: "success",
        });
        // Auto-redirect handled by PopupNotification component
        // setTimeout(() => {
        //   setPopup({ ...popup, isOpen: false });
        //   navigate("/hr/show-leave");
        // }, 1500);
      } else {
        const errData = await res.json();
        setPopup({
          isOpen: true,
          title: "Submission Failed",
          message: errData.message || "Failed to submit request",
          type: "error",
        });
      }
    } catch (err) {
      console.error("Submission error:", err);
      setPopup({
        isOpen: true,
        title: "Network Error",
        message: "Could not connect to server. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewRequest = () => {
    setSearchTerm("");
    setSelectedUser(null);
    setFormData({
      user_id: isOnBehalf ? "" : currentHrId,
      leave_type: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date().toISOString().split("T")[0],
      reason: "",
    });
    setFilteredUsers(users);
  };

  return (
    <HRLayout>
      <div className="leave-wrapper">
        <PopupNotification
          isOpen={popup.isOpen}
          onClose={() => {
            setPopup({ ...popup, isOpen: false });
            if (popup.type === "success") {
              navigate("/hr/show-leave");
            }
          }}
          title={popup.title}
          message={popup.message}
          type={popup.type}
          autoClose={popup.type === "success"}
          duration={2000}
        />

        <motion.div
          className="leave-card form"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <button
            className="btn-text"
            style={{
              position: "absolute",
              top: "2rem",
              right: "2rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
            onClick={() => navigate("/hr/show-leave")}
          >
            <FaArrowLeft className="icon-blue" /> Back to List
          </button>

          <div className="card-header-compact">
            <div className="header-icon">
              <FaPaperPlane style={{ color: "white" }} />
            </div>
            <div>
              <h1 className="header-title">Submit Leave Request</h1>
              <p style={{ color: "#94a3b8", marginTop: "0.5rem" }}>
                Fill in the details below to process a leave request.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="compact-form">
            {/* Selection Cards */}
            <label
              style={{
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#94a3b8",
                marginBottom: "1rem",
                display: "block",
              }}
            >
              Who is this request for?
            </label>
            <div className="selection-grid">
              <div
                className={`selection-card ${!isOnBehalf ? "active" : ""}`}
                onClick={() => setIsOnBehalf(false)}
              >
                <FaUser className="card-icon" />
                <span className="card-title">Myself</span>
                <span className="card-desc">Submit for your own leave</span>
              </div>

              <div
                className={`selection-card ${isOnBehalf ? "active" : ""}`}
                onClick={() => setIsOnBehalf(true)}
              >
                <FaUsers className="card-icon" />
                <span className="card-title">On Behalf</span>
                <span className="card-desc">Submit for another employee</span>
              </div>
            </div>

            {/* Employee Section */}
            {!isOnBehalf ? (
              <div className="form-group">
                <label>Applicant</label>
                <div className="user-badge">
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
              </div>
            ) : (
              <div className="on-behalf-wrapper">
                <div
                  className="form-row-2"
                  style={{ gap: "2rem", alignItems: "end" }}
                >
                  <div className="form-group">
                    <label>Operator (You)</label>
                    <div className="user-badge compact">
                      <div
                        className="user-badge-icon small"
                        style={{ background: "#475569" }}
                      >
                        <FaUserClock />
                      </div>
                      <div className="user-badge-info">
                        <h4 className="text-sm">{currentHrUser.first_name}</h4>
                        <p className="text-xs">HR Admin</p>
                      </div>
                    </div>
                  </div>

                  <div
                    className="form-group search-container"
                    style={{ flex: 1 }}
                  >
                    <label>Select Employee</label>
                    <div className="input-group-icon">
                      <input
                        type="text"
                        className="input-field with-icon"
                        placeholder="Type name or ID to search..."
                        value={searchTerm}
                        onChange={handleSearch}
                        onFocus={() => setShowDropdown(true)}
                      />
                      {showDropdown && filteredUsers.length > 0 && (
                        <div className="search-dropdown">
                          {filteredUsers.map((user) => (
                            <div
                              key={user.id}
                              className="dropdown-item"
                              onClick={() => selectUser(user)}
                            >
                              <span className="item-name">
                                {user.first_name} {user.last_name}
                              </span>
                              <span className="item-id">
                                ID: {user.empId || user.emp_code || user.id}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Logistics Row: Type + Dates */}
            <div className="form-row-3">
              <div className="form-group">
                <label>Leave Type</label>
                <select
                  name="leave_type"
                  value={formData.leave_type}
                  onChange={handleInputChange}
                  className="input-field custom-select"
                  required
                >
                  <option value="">Select Type...</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Personal Leave">Personal Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Reason</label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                placeholder="Please describe the reason for this leave request..."
                required
                className="input-field textarea"
                style={{ minHeight: "120px" }}
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate("/hr/show-leave")}
                className="btn-text"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
                <FaCalendarCheck
                  className="icon-yellow"
                  style={{ marginLeft: "0.5rem", color: "#fff" }}
                />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </HRLayout>
  );
};

export default Leave_info;
