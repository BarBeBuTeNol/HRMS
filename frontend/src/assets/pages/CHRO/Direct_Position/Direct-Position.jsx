import React, { useEffect, useMemo, useState } from "react";
import CHROLayout from "../../../Component/CHRO/CHROLayout";
import LoadingCHRO from "../../../Component/loading/loading-chro/LoadingCHRO";
import LogService from "../../../../services/LogService";
import api from "../../../../services/api";
import "./Direct-Position.css";
import PopupErrorCHRO from "../../../Component/popup-error/popup-error-chro/PopupErrorCHRO";
import PopupDoneCHRO from "../../../Component/poup_done/poup_done-chro/PopupDoneCHRO";
import PopupCHRO from "../../../Component/popup_notifications/popup_notifications-chro/PopupCHRO";

export default function DirectPosition() {
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [jobPositions, setJobPositions] = useState([]); // State for job positions

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Modal State
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editForm, setEditForm] = useState({
    position: "",
    role_id: "",
    department_id: "",
    status: "",
    effectiveDate: "",
    note: "",
    reason: "", // Added reason to state
  });

  // Bulk Action State
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkActionType, setBulkActionType] = useState(""); // 'department' | 'role' | 'status'
  const [bulkValue, setBulkValue] = useState("");

  const [loading, setLoading] = useState(true);

  // Popups State
  const [donePopup, setDonePopup] = useState({
    isOpen: false,
    title: "Success",
    message: "",
  });
  const [errorPopup, setErrorPopup] = useState({
    isOpen: false,
    title: "Error",
    message: "",
  });
  const [warningPopup, setWarningPopup] = useState({
    isOpen: false,
    title: "Validation Warning",
    message: "",
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch Data
  const fetchData = async () => {
    try {
      // Use dynamic page and pageSize
      const [usersRes, rolesRes, deptsRes, jobsRes] = await Promise.all([
        api.get(`/users?page=${currentPage}&pageSize=${pageSize}`),
        api.get("/roles"),
        api.get("/departments"),
        api.get("/job-positions"), // Fetch job positions
      ]);

      // Process Users
      const fetchedUsers = usersRes.data.data.map((u) => ({
        ...u,
        displayStatus: u.status || "Active",
        lastActiveFormatted: u.last_active
          ? new Date(u.last_active).toLocaleString("th-TH")
          : "Never",
      }));

      setEmployees(fetchedUsers);

      // Update pagination info from response
      if (usersRes.data.pagination) {
        setTotalPages(usersRes.data.pagination.totalPages);
        setTotalCount(usersRes.data.pagination.total);
      }

      setRoles(rolesRes.data || []);
      setDepartments(deptsRes.data || []);
      setJobPositions(jobsRes.data || []); // Set job positions
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize]); // Re-fetch on page change

  // Filter Logic
  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const matchSearch =
        (e.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.first_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.last_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.email || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchRole = filterRole ? e.role_name === filterRole : true;
      const matchDept = filterDept ? e.department_name === filterDept : true;
      const matchStatus = filterStatus
        ? e.displayStatus === filterStatus
        : true;

      return matchSearch && matchRole && matchDept && matchStatus;
    });
  }, [employees, searchTerm, filterRole, filterDept, filterStatus]);

  // Handlers
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredEmployees.map((e) => e.id));
    } else {
      setSelectedIds([]);
    }
  };

  const openEditModal = async (emp) => {
    setSelectedEmployee(emp);

    // Pre-fill with existing data first while loading
    // Note: emp.job_position provides the NAME, but we need the ID to pre-select.
    // We will attempt to find the ID from the fetched jobPositions list if possible, or wait for fresh user details
    const foundPos = jobPositions.find(
      (jp) => jp.position_name === emp.job_position,
    );

    setEditForm({
      position: foundPos ? foundPos.id : "", // Use ID if found
      role_id: emp.role_id,
      department_id: emp.department_id,
      status: emp.displayStatus || "Active",
      effectiveDate: "",
      note: "",
      reason: "",
    });

    try {
      // Fetch fresh details to ensure we have latest Position etc.
      const res = await api.get(`/users/${emp.id}`);
      const user = res.data;
      if (user) {
        // Map user.job_position (which might be name or object) to ID.
        // Based on userController, getUserById returns `jp.position_name AS job_position`.
        // So we still have the name. We need to map it to ID from our list.
        const userPosId = jobPositions.find(
          (jp) => jp.position_name === user.job_position,
        )?.id;

        setEditForm((prev) => ({
          ...prev,
          position: user.position_id || userPosId || "", // Prefer explicit ID if available in refetch, else find by name
          role_id: user.role_id,
          department_id: user.department_id,
          status: user.status || prev.status,
        }));
      }
    } catch (err) {
      console.error("Failed to fetch fresh user details", err);
    }
  };

  // New Password State
  const [showPwdInput, setShowPwdInput] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordReason, setPasswordReason] = useState(""); // Reason for password reset

  const closeEditModal = () => {
    setSelectedEmployee(null);
    setShowPwdInput(false);
    setNewPassword("");
    setEditForm({
      position: "",
      role_id: "",
      department_id: "",
      status: "",
      effectiveDate: "",
      note: "",
      reason: "",
    });
    // Reset password related state
    setShowPwdInput(false);
    setNewPassword("");
    setPasswordReason("");
  };

  const handleSaveChanges = async () => {
    if (!selectedEmployee) return;
    setLoading(true);

    const changes = [];
    // Helper to add change if different
    // Note: Compare loosely as types might differ (int vs string)
    const addChange = (field, oldVal, newVal) => {
      // eslint-disable-next-line eqeqeq
      if (newVal != oldVal && newVal !== "" && newVal != null) {
        changes.push({
          field: field,
          oldValue: oldVal,
          newValue: newVal,
        });
      }
    };

    // Calculate changes
    addChange("role_id", selectedEmployee.role_id, editForm.role_id);
    addChange(
      "department_id",
      selectedEmployee.department_id,
      editForm.department_id,
    );
    addChange("status", selectedEmployee.displayStatus, editForm.status); // Use Status or DisplayStatus? Logic uses status.

    // Position Logic: editForm.position is ID. selectedEmployee.job_position is NAME.
    // Ideally we track ID. If we don't have old ID, we can't easily compare ID.
    // However, the editForm sets position from ID.
    // Let's rely on finding differences if the user selected something new.
    // If user changes nothing, editForm.position is pre-filled with ID.
    // We need to know if that ID represents a different position.
    // Simple way: if editForm.position is set, pass it. Backend or approver sees the new value.
    // BUT the Change Request logic expects "Old Value".
    // We can say Old Value = selectedEmployee.job_position (Name). New Value = editForm.position (ID).
    // The approver might see "Developer -> 5".
    // Better: Find the name of the new position ID.
    const newPos = jobPositions.find(
      (jp) => String(jp.id) === String(editForm.position),
    );
    // If we found a new position object and its name differs from old name
    if (newPos && newPos.position_name !== selectedEmployee.job_position) {
      changes.push({
        field: "jobPosition", // Matches controller mapping
        oldValue: selectedEmployee.job_position || "None",
        newValue: newPos.id, // Send ID for update logic
      });
    }

    if (changes.length === 0) {
      setLoading(false);
      // Use warning popup instead of ErrorPopup for "No Changes"
      setWarningPopup({
        isOpen: true,
        title: "No Changes Detected",
        message:
          "You must modify at least one field (Role, Department, or Status) before submitting.",
      });
      return;
    }

    // Check if Reason is filled (STRICT CHECK)
    if (!editForm.reason || !editForm.reason.trim()) {
      setLoading(false);
      setWarningPopup({
        isOpen: true,
        title: "Reason Required",
        message: "Please provide a valid reason for this change request.",
      });
      return;
    }

    try {
      // Create Change Request
      const formDataPayload = new FormData();
      formDataPayload.append("targetUserId", selectedEmployee.id);
      formDataPayload.append("changes", JSON.stringify(changes));
      formDataPayload.append("reason", editForm.reason);
      // evidence is optional

      await api.post("/change-requests", formDataPayload);

      setDonePopup({
        isOpen: true,
        title: "Request Submitted",
        message: "Your changes have been submitted for approval.",
      });

      // Do NOT refresh data immediately as it's pending
      closeEditModal();
    } catch (error) {
      setErrorPopup({
        isOpen: true,
        title: "Request Failed",
        message: error.message || "Failed to submit request",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedEmployee) return;

    // If input not shown, just toggle it
    if (!showPwdInput) {
      setShowPwdInput(true);
      return;
    }

    // If input shown but empty, ask to confirm default? or alert?
    // Let's assume if they click "Confirm Reset" (which this button becomes)
    const pwdToSend = newPassword.trim();
    if (!passwordReason.trim()) {
      setErrorPopup({
        isOpen: true,
        title: "Validation Error",
        message: "Please provide a reason for the password reset.",
      });
      return;
    }

    const confirmMsg = pwdToSend
      ? `Reset password for ${selectedEmployee.username} to custom value?`
      : `Reset password for ${selectedEmployee.username}? Default will be 'ChangeMe123!'`;

    if (!confirm(confirmMsg)) return;

    try {
      await api.post(`/users/${selectedEmployee.id}/reset-password`, {
        newPassword: pwdToSend,
        reason: passwordReason,
      });
      setDonePopup({
        isOpen: true,
        title: "Success",
        message: pwdToSend
          ? "Password updated successfully!"
          : "Password reset to 'ChangeMe123!'",
      });
      setShowPwdInput(false);
      setNewPassword("");
      setPasswordReason("");
    } catch (err) {
      setErrorPopup({
        isOpen: true,
        title: "Reset Failed",
        message: err.message,
      });
    }
  };

  const initBulkAction = (type) => {
    if (selectedIds.length === 0) {
      setErrorPopup({
        isOpen: true,
        title: "Selection Required",
        message: "Please select users first",
      });
      return;
    }
    setBulkActionType(type);
    setBulkValue("");
    setShowBulkModal(true);
  };

  const executeBulkAction = async () => {
    if (!bulkValue) return;
    setLoading(true);
    try {
      const payload = { ids: selectedIds };
      if (bulkActionType === "department") payload.department_id = bulkValue;
      else if (bulkActionType === "role") payload.role_id = bulkValue;
      else if (bulkActionType === "status") payload.status = bulkValue;

      await api.patch("/users/bulk", payload);

      // LOGGING
      try {
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        await LogService.createLog({
          userId: currentUser.id || currentUser.user_id,
          action: "Bulk Update",
          details: `Bulk updated ${selectedIds.length} users. Type: ${bulkActionType}, Value: ${bulkValue}`,
          target: "Multiple Users",
          severity: "Info",
        });
      } catch (logErr) {
        console.warn("Logging failed", logErr);
      }

      setDonePopup({
        isOpen: true,
        title: "Bulk Update Success",
        message: `Bulk Update (${selectedIds.length} users) Successful`,
      });
      fetchData();
      setSelectedIds([]);
      setShowBulkModal(false);
    } catch (err) {
      setErrorPopup({
        isOpen: true,
        title: "Bulk Action Failed",
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <CHROLayout>
      <main className="dp-main">
        {loading ? (
          <div
            style={{
              position: "relative",
              height: "100vh",
              margin: "-32px -40px",
              width: "calc(100% + 80px)",
            }}
          >
            <LoadingCHRO />
          </div>
        ) : (
          <>
            {/* Container for Centered Content */}
            <div className="direct-position-container">
              <header className="direct-position-header">
                <h1 className="direct-position-title">
                  User Management Center
                </h1>
                <p className="direct-position-subtitle">
                  Exclusive Control Panel for Human Resources & Operations
                </p>
              </header>

              {/* Controls & Metrics */}
              <section className="controls-section">
                <div className="metrics-cards">
                  <div className="metric-card">
                    <h3>Total Users</h3>
                    <div className="metric-value">{employees.length}</div>
                  </div>
                  <div className="metric-card active">
                    <h3>Active</h3>
                    <div className="metric-value">
                      {
                        employees.filter((e) => e.displayStatus === "Active")
                          .length
                      }
                    </div>
                  </div>
                  <div className="metric-card warning">
                    <h3>Inactive/Suspended</h3>
                    <div className="metric-value">
                      {
                        employees.filter((e) => e.displayStatus !== "Active")
                          .length
                      }
                    </div>
                  </div>
                </div>

                <div className="filters-bar">
                  <input
                    type="text"
                    className="search-input-premium"
                    placeholder="Search Users (Name, Email)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />

                  <select
                    className="filter-select"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                  >
                    <option value="">All Roles</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.role_name}>
                        {r.role_name}
                      </option>
                    ))}
                  </select>

                  <select
                    className="filter-select"
                    value={filterDept}
                    onChange={(e) => setFilterDept(e.target.value)}
                  >
                    <option value="">All Departments</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.department_name}>
                        {d.department_name}
                      </option>
                    ))}
                  </select>

                  <select
                    className="filter-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </section>

              {/* Table View */}
              <section className="table-container">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th style={{ width: "60px", paddingLeft: "30px" }}>
                        <input
                          type="checkbox"
                          className="custom-checkbox"
                          onChange={handleSelectAll}
                          checked={
                            selectedIds.length === filteredEmployees.length &&
                            filteredEmployees.length > 0
                          }
                        />
                      </th>
                      <th>User Profile</th>
                      <th>Access Role</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Last Active</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((emp) => (
                      <tr
                        key={emp.id}
                        className={
                          selectedIds.includes(emp.id) ? "row-selected" : ""
                        }
                      >
                        <td style={{ paddingLeft: "30px" }}>
                          <input
                            type="checkbox"
                            className="custom-checkbox"
                            checked={selectedIds.includes(emp.id)}
                            onChange={() => handleToggleSelect(emp.id)}
                          />
                        </td>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar">
                              {emp.first_name?.[0]}
                            </div>
                            <div className="user-info">
                              <div className="user-name">
                                {emp.first_name} {emp.last_name}
                              </div>
                              <div className="user-email">{emp.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="role-badge">{emp.role_name}</span>
                        </td>
                        <td>{emp.department_name || "-"}</td>
                        <td>
                          <span
                            className={`status-pill ${emp.displayStatus.toLowerCase()}`}
                          >
                            {emp.displayStatus}
                          </span>
                        </td>
                        <td className="last-active">
                          {emp.lastActiveFormatted}
                        </td>
                        <td>
                          <button
                            className="btn-edit-icon"
                            title="Edit User"
                            onClick={() => openEditModal(emp)}
                          >
                            ⚙️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              {/* Pagination Controls */}
              <div className="pagination-controls">
                <button
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>

                <span className="pagination-info">
                  Showing {(currentPage - 1) * pageSize + 1} -{" "}
                  {Math.min(currentPage * pageSize, totalCount)} of {totalCount}
                </span>

                <button
                  className="pagination-btn"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                >
                  Next
                </button>
              </div>
            </div>

            {/* Floating Bulk Action Toolbar */}
            {selectedIds.length > 0 && (
              <div className="bulk-toolbar">
                <div className="bulk-count-badge">
                  {selectedIds.length} Selected
                </div>
                <div className="bulk-actions-group">
                  <button onClick={() => initBulkAction("department")}>
                    Change Dept
                  </button>
                  <button onClick={() => initBulkAction("role")}>
                    Change Role
                  </button>
                  <button onClick={() => initBulkAction("status")}>
                    Set Status
                  </button>
                </div>
              </div>
            )}

            {/* Edit Modal (Redesigned) */}
            {selectedEmployee && (
              <div className="position-change-modal" role="dialog">
                <div className="modal-content premium-modal">
                  {/* Modal Header */}
                  <div className="modal-user-header">
                    <div className="modal-avatar-large">
                      {selectedEmployee.first_name?.[0]}
                    </div>
                    <div className="modal-user-details">
                      <h2>{selectedEmployee.username}</h2>
                      <p>
                        {selectedEmployee.first_name}{" "}
                        {selectedEmployee.last_name} | {selectedEmployee.email}
                      </p>
                    </div>
                  </div>

                  <div className="modal-body">
                    <div className="dp-form-grid">
                      <div className="dp-form-item">
                        <label>Assigned Role</label>
                        <select
                          className="position-select"
                          value={editForm.role_id}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              role_id: e.target.value,
                            })
                          }
                        >
                          {roles.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.role_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="dp-form-item">
                        <label>Job Position</label>
                        <select
                          className="position-select"
                          value={editForm.position}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              position: e.target.value,
                            })
                          }
                        >
                          <option value="">-- Select Position --</option>
                          {jobPositions.map((jp) => (
                            <option key={jp.id} value={jp.id}>
                              {jp.position_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="dp-form-item">
                        <label>Department</label>
                        <select
                          className="position-select"
                          value={editForm.department_id}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              department_id: e.target.value,
                            })
                          }
                        >
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.department_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="dp-form-item full-width">
                        <label>Account Status</label>
                        <select
                          className="position-select"
                          value={editForm.status}
                          onChange={(e) =>
                            setEditForm({ ...editForm, status: e.target.value })
                          }
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Suspended">Suspended</option>
                        </select>
                      </div>

                      <div className="dp-form-item full-width">
                        <label>Reason for Change (Required)</label>
                        <textarea
                          className="position-select"
                          style={{ height: "80px", resize: "vertical" }}
                          placeholder="Please specify why this change is being made..."
                          value={editForm.reason}
                          onChange={(e) =>
                            setEditForm({ ...editForm, reason: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="modal-actions-special">
                      {showPwdInput && (
                        <div
                          className="dp-form-item"
                          style={{
                            marginBottom: "15px",
                            animation: "slideDown 0.3s ease",
                          }}
                        >
                          <label style={{ color: "#f87171" }}>
                            New Password (Optional)
                          </label>
                          <input
                            type="text"
                            className="position-select" // reuse style
                            style={{ borderColor: "#f87171" }}
                            placeholder="Leave empty for default 'ChangeMe123!'"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                          <input
                            type="text"
                            className="position-select"
                            style={{
                              borderColor: "#f87171",
                              marginTop: "10px",
                            }}
                            placeholder="Reason for password reset (Required)"
                            value={passwordReason}
                            onChange={(e) => setPasswordReason(e.target.value)}
                          />
                        </div>
                      )}
                      <button
                        className="btn-reset-pwd"
                        onClick={handleResetPassword}
                      >
                        {showPwdInput
                          ? "⚠️ Confirm Password Reset"
                          : "🔒 Reset Password"}
                      </button>
                      {showPwdInput && (
                        <button
                          className="btn-link-cancel"
                          onClick={() => {
                            setShowPwdInput(false);
                            setNewPassword("");
                          }}
                          style={{
                            marginLeft: "10px",
                            background: "none",
                            border: "none",
                            color: "#94a3b8",
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                        >
                          Cancel Reset
                        </button>
                      )}
                    </div>

                    <div className="modal-actions">
                      <button className="btn-cancel" onClick={closeEditModal}>
                        Cancel
                      </button>
                      <button
                        className="btn-confirm"
                        onClick={handleSaveChanges}
                        disabled={loading} // Only disable on loading, allow click for validation check
                      >
                        {loading ? "Sending..." : "Send Request"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bulk Action Modal */}
            {showBulkModal && (
              <div className="position-change-modal">
                <div
                  className="modal-content premium-modal"
                  style={{ maxWidth: "450px" }}
                >
                  <div
                    className="modal-user-header"
                    style={{ padding: "20px" }}
                  >
                    <div
                      className="modal-user-details"
                      style={{ textAlign: "center", width: "100%" }}
                    >
                      <h2>Bulk Update</h2>
                      <p>{selectedIds.length} users selected</p>
                    </div>
                  </div>

                  <div className="modal-body">
                    <div className="dp-form-item" style={{ marginTop: "10px" }}>
                      <label>Select New {bulkActionType}</label>
                      <select
                        className="position-select"
                        value={bulkValue}
                        onChange={(e) => setBulkValue(e.target.value)}
                      >
                        <option value="">-- Select --</option>
                        {bulkActionType === "role" &&
                          roles.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.role_name}
                            </option>
                          ))}
                        {bulkActionType === "department" &&
                          departments.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.department_name}
                            </option>
                          ))}
                        {bulkActionType === "status" && (
                          <>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Suspended">Suspended</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div
                      className="modal-actions"
                      style={{ justifyContent: "space-between" }}
                    >
                      <button
                        className="btn-cancel"
                        onClick={() => setShowBulkModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn-confirm"
                        onClick={executeBulkAction}
                        disabled={loading || !bulkValue}
                      >
                        Confirm Update
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Popups */}
            <PopupDoneCHRO
              isOpen={donePopup.isOpen}
              title={donePopup.title}
              message={donePopup.message}
              onClose={() => setDonePopup({ ...donePopup, isOpen: false })}
            />
            <PopupErrorCHRO
              isOpen={errorPopup.isOpen}
              title={errorPopup.title}
              message={errorPopup.message}
              onClose={() => setErrorPopup({ ...errorPopup, isOpen: false })}
            />
            <PopupCHRO
              isOpen={warningPopup.isOpen}
              title={warningPopup.title}
              message={warningPopup.message}
              type="warning"
              onClose={() =>
                setWarningPopup({ ...warningPopup, isOpen: false })
              }
            />
          </>
        )}
      </main>
    </CHROLayout>
  );
}
