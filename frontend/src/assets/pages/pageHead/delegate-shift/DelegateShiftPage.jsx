import React, { useState, useEffect } from "react";
import "./DelegateShiftPage.css";
import HeadSidebar from "../../../Component/Head/HeadSidebar"; // Correct path based on file structure
import {
  FaExchangeAlt,
  FaUserClock,
  FaHistory,
  FaExclamationTriangle,
  FaSearch,
  FaCheckCircle,
  FaFilter,
} from "react-icons/fa";
import api from "../../../../services/api";

const DelegateShiftPage = () => {
  // State for Stepper
  const [activeStep, setActiveStep] = useState(1); // 1: Select Tasks, 2: Select Replacement, 3: Review & Confirm

  // State for Filters
  const [filterDate, setFilterDate] = useState("");
  const [filterName, setFilterName] = useState("");

  // State for Selection
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedReplacement, setSelectedReplacement] = useState(null);
  const [delegationReason, setDelegationReason] = useState("");
  const [priority, setPriority] = useState("Normal");

  // Data from API
  const [shifts, setShifts] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [history] = useState([]); // Pending implementation for history endpoint

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) return;

      const response = await api.get(`/head/delegation-data/${user.id}`);

      const { workItems, employees } = response.data;

      // Transform Work Items
      const formattedShifts = workItems.map((item) => ({
        id: item.id,
        employee: `${item.first_name} ${item.last_name}`,
        type: item.type,
        title: item.title,
        date: item.work_date.split("T")[0], // Simple date formatting
        status: "Active",
        original_user_id: item.user_id, // This should come from the API
      }));
      setShifts(formattedShifts);

      // Transform Employees
      const formattedStaff = employees.map((emp) => ({
        id: emp.id,
        name: `${emp.first_name} ${emp.last_name}`,
        role: emp.position_name || "Employee",
        status: "Available", // Simplified status for now
        workload: "Medium", // Placeholder
      }));
      setStaffList(formattedStaff);
    } catch (error) {
      console.error("Error fetching delegation data:", error);
    }
  };

  // Filter Logic
  const filteredShifts = shifts.filter((shift) => {
    return (
      (filterDate === "" || shift.date === filterDate) &&
      (filterName === "" ||
        shift.employee.toLowerCase().includes(filterName.toLowerCase()))
    );
  });

  // Handlers
  const handleTaskSelect = (task) => {
    setSelectedTask(task);
  };

  const handleReplacementSelect = (staff) => {
    if (staff.status === "Busy") return; // Prevent selecting busy staff
    setSelectedReplacement(staff);
  };

  const handleNextStep = () => {
    if (activeStep === 1 && selectedTask) setActiveStep(2);
    else if (activeStep === 2 && selectedReplacement) setActiveStep(3);
  };

  const handlePrevStep = () => {
    if (activeStep > 1) setActiveStep(activeStep - 1);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        task_id: selectedTask.type === "Task" ? selectedTask.id : null,
        shift_id: selectedTask.type === "Shift" ? selectedTask.id : null,
        original_user_id: selectedTask.original_user_id,
        replacement_user_id: selectedReplacement.id,
        reason: delegationReason,
        priority: priority,
      };

      await api.post("/head/delegate-work", payload);

      alert("Delegate Shift Submitted Successfully!");
      // Reset or Redirect
      setActiveStep(1);
      setSelectedTask(null);
      setSelectedReplacement(null);
      setDelegationReason("");
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error submitting delegation:", error);
      alert("Failed to delegate shift.");
    }
  };

  return (
    <div className="delegate-shift-container">
      <HeadSidebar />

      <div className="delegate-main-content">
        {/* Header */}
        <header className="delegate-header">
          <h1 className="page-title">Delegate Shift Manager</h1>
          <p className="page-subtitle">
            Manage scheduling conflicts and reassign tasks efficiently.
          </p>
        </header>

        {/* Stepper */}
        <div className="stepper-container">
          <div className="progress-line">
            <div
              className="progress-line-fill"
              style={{ width: `${(activeStep - 1) * 50}%` }}
            ></div>
          </div>
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`step-item ${activeStep >= step ? "active" : ""} ${
                activeStep > step ? "completed" : ""
              }`}
            >
              <div className="step-circle">
                {activeStep > step ? <FaCheckCircle /> : step}
              </div>
              <span className="step-label">
                {step === 1
                  ? "Select Task"
                  : step === 2
                    ? "Select Staff"
                    : "Confirm"}
              </span>
            </div>
          ))}
        </div>

        <div className="delegate-content-grid">
          {/* LEFT PANEL: MAIN INTERACTION */}
          <div className="left-panel">
            {/* STEP 1: SELECT TASK */}
            {activeStep === 1 && (
              <div className="glass-card fade-in">
                <h2 className="section-title">
                  <FaUserClock /> Select Original Shift/Task
                </h2>

                <div className="filter-bar">
                  <div
                    className="input-group"
                    style={{ flex: 1, position: "relative" }}
                  >
                    <FaSearch
                      style={{
                        position: "absolute",
                        left: "15px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--head-text-muted)",
                      }}
                    />
                    <input
                      type="text"
                      className="custom-input"
                      placeholder="Search employee name..."
                      style={{ paddingLeft: "40px" }}
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                    />
                  </div>
                  <input
                    type="date"
                    className="custom-input"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                  />
                </div>

                <div className="selection-list">
                  {filteredShifts.map((shift) => (
                    <div
                      key={shift.id}
                      className={`list-item ${
                        selectedTask?.id === shift.id ? "selected" : ""
                      }`}
                      onClick={() => handleTaskSelect(shift)}
                    >
                      <div className="item-info">
                        <h4>{shift.title}</h4>
                        <p>
                          {shift.employee} • {shift.date}
                        </p>
                      </div>
                      <span
                        className={`status-badge ${
                          shift.type === "Shift" ? "shift" : "task"
                        }`}
                      >
                        {shift.type}
                      </span>
                    </div>
                  ))}
                  {filteredShifts.length === 0 && (
                    <p
                      style={{
                        textAlign: "center",
                        color: "var(--head-text-muted)",
                        padding: "2rem",
                      }}
                    >
                      No shifts found.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: SELECT REPLACEMENT */}
            {activeStep === 2 && (
              <div className="glass-card fade-in">
                <h2 className="section-title">
                  <FaExchangeAlt /> Select Replacement Staff
                </h2>
                <div className="selection-list">
                  {staffList.map((staff) => (
                    <div
                      key={staff.id}
                      className={`list-item ${
                        selectedReplacement?.id === staff.id ? "selected" : ""
                      } ${staff.status === "Busy" ? "disabled" : ""}`}
                      onClick={() => handleReplacementSelect(staff)}
                      style={{
                        opacity: staff.status === "Busy" ? 0.6 : 1,
                        cursor:
                          staff.status === "Busy" ? "not-allowed" : "pointer",
                      }}
                    >
                      <div className="item-info">
                        <h4>{staff.name}</h4>
                        <p>
                          {staff.role} • Workload: {staff.workload}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span
                          className={`status-badge ${
                            staff.status === "Available" ? "available" : "busy"
                          }`}
                        >
                          {staff.status}
                        </span>
                        {staff.status === "Busy" && (
                          <div
                            className="conflict-warning"
                            style={{
                              marginTop: "5px",
                              fontSize: "0.7rem",
                              padding: "0.2rem 0.5rem",
                            }}
                          >
                            <FaExclamationTriangle /> {staff.conflict}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: CONFIRM */}
            {activeStep === 3 && (
              <div className="glass-card fade-in">
                <h2 className="section-title">
                  <FaCheckCircle /> Finalize Delegation
                </h2>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label
                    style={{
                      display: "block",
                      color: "var(--head-text-secondary)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Reason for Delegation
                  </label>
                  <textarea
                    className="custom-input"
                    rows="3"
                    placeholder="E.g. Sick leave, Emergency..."
                    value={delegationReason}
                    onChange={(e) => setDelegationReason(e.target.value)}
                    style={{ width: "100%", resize: "none" }}
                  ></textarea>
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label
                    style={{
                      display: "block",
                      color: "var(--head-text-secondary)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Priority Level
                  </label>
                  <select
                    className="custom-select"
                    style={{ width: "100%" }}
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option>Low</option>
                    <option>Normal</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: SUMMARY & ACTIONS */}
          <div className="right-panel">
            <div className="action-panel">
              <div className="summary-card">
                <h3
                  style={{
                    color: "var(--head-text-primary)",
                    marginBottom: "1rem",
                    borderBottom: "1px solid var(--head-glass-border)",
                    paddingBottom: "0.5rem",
                  }}
                >
                  Delegation Summary
                </h3>

                <div className="summary-row">
                  <span className="summary-label">Shift/Task</span>
                  <span className="summary-value">
                    {selectedTask ? selectedTask.title : "-"}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Original Owner</span>
                  <span className="summary-value">
                    {selectedTask ? selectedTask.employee : "-"}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">New Assignee</span>
                  <span className="summary-value">
                    {selectedReplacement ? selectedReplacement.name : "-"}
                  </span>
                </div>
                <div className="summary-row" style={{ border: "none" }}>
                  <span className="summary-label">Date</span>
                  <span className="summary-value">
                    {selectedTask ? selectedTask.date : "-"}
                  </span>
                </div>

                <div
                  style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}
                >
                  {activeStep > 1 && (
                    <button
                      className="primary-btn"
                      style={{
                        background: "transparent",
                        border: "1px solid var(--head-text-muted)",
                        color: "var(--head-text-muted)",
                      }}
                      onClick={handlePrevStep}
                    >
                      Back
                    </button>
                  )}
                  {activeStep < 3 ? (
                    <button
                      className="primary-btn"
                      disabled={
                        activeStep === 1 ? !selectedTask : !selectedReplacement
                      }
                      onClick={handleNextStep}
                    >
                      Next Step
                    </button>
                  ) : (
                    <button className="primary-btn" onClick={handleSubmit}>
                      Confirm Assignment
                    </button>
                  )}
                </div>
              </div>

              {/* HISTORY WIDGET */}
              <div className="glass-card" style={{ padding: "1rem" }}>
                <h4
                  style={{
                    color: "var(--head-text-primary)",
                    fontSize: "1rem",
                    marginBottom: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <FaHistory /> Recent History
                </h4>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.8rem",
                  }}
                >
                  {history.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        padding: "0.8rem",
                        borderRadius: "8px",
                        borderLeft:
                          item.status === "Approved"
                            ? "3px solid var(--head-success)"
                            : "3px solid var(--head-warning)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "0.8rem",
                          marginBottom: "0.3rem",
                        }}
                      >
                        <span style={{ color: "var(--head-text-primary)" }}>
                          {item.original} → {item.replacement.split(" ")[1]}
                        </span>
                        <span
                          style={{
                            color:
                              item.status === "Approved"
                                ? "var(--head-success)"
                                : "var(--head-warning)",
                          }}
                        >
                          {item.status}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--head-text-muted)",
                        }}
                      >
                        {item.task}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DelegateShiftPage;
