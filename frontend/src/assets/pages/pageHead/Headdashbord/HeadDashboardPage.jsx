import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import api from "../../../../services/api";
import HeadSidebar from "../../../Component/Head/HeadSidebar";
import {
  FaUsers,
  FaClipboardList,
  FaFileInvoice,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import "./HeadDashboardPage.css";
import LoadingHead from "../../../Component/loading/loading-head/LoadingHead";
import PopupDoneHead from "../../../Component/poup_done/poup_done-head/PopupDoneHead";
import PopupErrorHead from "../../../Component/popup-error/popup-error-head/PopupErrorHead";
import PopupHead from "../../../Component/popup_notifications/popup_notifications-head/PopupHead";
import LogService from "../../../../services/LogService";
import { XCircle } from "lucide-react";

const HeadDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar State

  // Popup & Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  // Notification Popup specific for Approve
  const [notificationPopup, setNotificationPopup] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const handleApproveClick = async (leave) => {
    try {
      const userId = localStorage.getItem("userId");
      const userName = "Head"; // Or fetch user name from context/store if available

      // 1. Log Action
      await LogService.createLog({
        user_id: userId,
        action: "Approve Leave",
        description: `Approved leave request for ${leave.first_name} ${leave.last_name}`,
        ip_address: "127.0.0.1", // Ideally fetched from service
        severity: "Info",
      });

      // 2. Call API
      await api.put(`/leave-requests/${leave.id}/status`, {
        status: "approved",
      });

      // 3. Update Local State
      setData((prev) => ({
        ...prev,
        actions: {
          ...prev.actions,
          pendingLeaves: prev.actions.pendingLeaves.filter(
            (l) => l.id !== leave.id,
          ),
        },
      }));

      // 4. Show Notification Popup (PopupHead)
      setNotificationPopup({
        isOpen: true,
        title: "Approved",
        message: `Leave request for ${leave.first_name} has been approved.`,
        type: "success",
      });
    } catch (error) {
      console.error("Approve error:", error);
      setNotificationPopup({
        isOpen: true,
        title: "Error",
        message: "Failed to approve leave request.",
        type: "error",
      });
    }
  };

  const handleRejectClick = (leave) => {
    setSelectedLeave(leave);
    setRejectReason("");
    setIsRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    setIsRejectModalOpen(false);
    setSelectedLeave(null);
    setRejectReason("");
  };

  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }

    try {
      const userId = localStorage.getItem("userId");

      // 1. Log Action
      await LogService.createLog({
        user_id: userId,
        action: "Reject Leave",
        description: `Rejected leave request for ${selectedLeave.first_name} ${selectedLeave.last_name}. Reason: ${rejectReason}`,
        ip_address: "127.0.0.1",
        severity: "Warning",
      });

      // 2. Call API
      await api.put(`/leave-requests/${selectedLeave.id}/status`, {
        status: "rejected",
        rejection_reason: rejectReason,
      });

      // Update local state to remove the item (optimistic update)
      setData((prev) => ({
        ...prev,
        actions: {
          ...prev.actions,
          pendingLeaves: prev.actions.pendingLeaves.filter(
            (l) => l.id !== selectedLeave.id,
          ),
        },
      }));

      closeRejectModal();
      setPopupMessage("Leave request rejected successfully.");
      setShowSuccessPopup(true);
    } catch (error) {
      console.error("Reject error:", error);
      setPopupMessage("Failed to reject leave request.");
      setShowErrorPopup(true);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        const response = await api.get(`/head/dashboard-stats/${userId}`);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingHead />;
  }

  if (!data)
    return (
      <div style={{ color: "#fff", textAlign: "center", marginTop: "20%" }}>
        No Data Available
      </div>
    );

  const { overview, attendance, actions, analytics } = data;

  return (
    <div className="head-dashboard-container">
      <HeadSidebar onToggle={setIsSidebarOpen} />
      <main
        className={`head-dashboard-content ${isSidebarOpen ? "expanded" : "collapsed"}`}
      >
        <header className="dashboard-header">
          <h1>Dashboard Overview</h1>
        </header>

        {/* 1. Overview Cards */}
        <section className="overview-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <FaUsers />
            </div>
            <div className="stat-info">
              <h3>Total Team</h3>
              <div className="stat-value">{overview.totalEmployees}</div>
            </div>
          </div>
          <div className="stat-card">
            <div
              className="stat-icon"
              style={{
                background: "linear-gradient(135deg, #ef4444, transparent)",
              }}
            >
              <FaExclamationCircle />
            </div>
            <div className="stat-info">
              <h3>Pending Leaves</h3>
              <div className="stat-value">{overview.pendingLeaves}</div>
            </div>
          </div>
          <div className="stat-card">
            <div
              className="stat-icon"
              style={{
                background: "linear-gradient(135deg, #3b82f6, transparent)",
              }}
            >
              <FaCheckCircle />
            </div>
            <div className="stat-info">
              <h3>Active Tasks</h3>
              <div className="stat-value">{overview.activeTasks}</div>
            </div>
          </div>
        </section>

        {/* 2. Main Grid: Attendance & Actions */}
        <div className="main-grid">
          {/* Working Today */}
          <div className="dashboard-section">
            <div className="section-title">
              <FaCheckCircle /> Working Today
            </div>
            <div className="user-list">
              {attendance.working.length > 0 ? (
                attendance.working.map((user) => (
                  <div key={user.id} className="user-item working-today-card">
                    <div className="user-info-left">
                      <img
                        src={
                          user.profile_pic ||
                          "https://ui-avatars.com/api/?name=" + user.first_name
                        }
                        alt=""
                        className="user-avatar"
                      />
                      <div className="user-details">
                        <div className="user-name">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="user-role">{user.role || "Employee"}</div>
                      </div>
                    </div>
                    
                    <div className="user-status-right">
                      <div className="shift-info">
                        <span className="shift-name">{user.shift}</span>
                        {user.start_time && user.end_time && (
                          <span className="shift-time">
                            {user.start_time.slice(0, 5)} - {user.end_time.slice(0, 5)}
                          </span>
                        )}
                      </div>
                      <div className="status-badge on-shift">
                        <div className="pulse-dot"></div>
                        On Shift
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: "var(--head-text-secondary)" }}>
                  No one scheduled today.
                </p>
              )}
            </div>
          </div>

          {/* On Leave Today */}
          <div className="dashboard-section">
            <div className="section-title" style={{ color: "#ef4444" }}>
              <FaExclamationCircle /> On Leave Today
            </div>
            <div className="user-list">
              {attendance.onLeave.length > 0 ? (
                attendance.onLeave.map((user, idx) => (
                  <div key={idx} className="user-item">
                    <img
                      src={
                        user.profile_pic ||
                        "https://ui-avatars.com/api/?name=" + user.first_name
                      }
                      alt=""
                      className="user-avatar"
                      style={{ borderColor: "#ef4444" }}
                    />
                    <div className="user-details">
                      <div className="user-name">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="user-meta" style={{ color: "#94a3b8" }}>
                        {user.leave_type}
                      </div>
                    </div>
                    <span className="badge leave">Leave</span>
                  </div>
                ))
              ) : (
                <p style={{ color: "var(--head-text-secondary)" }}>
                  No one is on leave today.
                </p>
              )}
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="dashboard-section" style={{ gridColumn: "span 2" }}>
            <div className="section-title">
              <FaFileInvoice /> Pending Leave Approvals
            </div>
            {actions.pendingLeaves.length > 0 ? (
              <div className="action-table-container">
                <table className="action-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Type</th>
                      <th>Dates</th>
                      <th>Reason</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actions.pendingLeaves.map((leave) => (
                      <tr key={leave.id}>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <img
                              src={
                                leave.profile_pic ||
                                "https://ui-avatars.com/api/?name=" +
                                  leave.first_name
                              }
                              alt=""
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: "50%",
                              }}
                            />
                            {leave.first_name} {leave.last_name}
                          </div>
                        </td>
                        <td>
                          <span className="badge leave">
                            {leave.leave_type}
                          </span>
                        </td>
                        <td>
                          {new Date(leave.start_date).toLocaleDateString()} -{" "}
                          {new Date(leave.end_date).toLocaleDateString()}
                        </td>
                        <td>{leave.reason}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-action btn-approve"
                              onClick={() => handleApproveClick(leave)}
                            >
                              Approve
                            </button>
                            <button
                              className="btn-action btn-reject"
                              onClick={() => handleRejectClick(leave)}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p
                style={{ color: "var(--head-text-secondary)", padding: "1rem" }}
              >
                All caught up! No pending requests.
              </p>
            )}
          </div>

          {/* Task Progress */}
          <div className="dashboard-section" style={{ gridColumn: "span 2" }}>
            <div className="section-title">
              <FaClipboardList /> Active Task Progress
            </div>
            {actions.taskProgress.length > 0 ? (
              <div className="user-list">
                {actions.taskProgress.map((task) => (
                  <div key={task.id} className="user-item">
                    <img
                      src={
                        task.profile_pic ||
                        "https://ui-avatars.com/api/?name=" + task.first_name
                      }
                      alt=""
                      className="user-avatar"
                    />
                    <div
                      className="user-details"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                        gap: "1rem",
                      }}
                    >
                      <div style={{ minWidth: "150px" }}>
                        <div className="user-name">{task.first_name}</div>
                        <div className="user-meta" style={{ color: "#94a3b8" }}>
                          {task.task_name}
                        </div>
                      </div>
                      <div className="progress-container">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                        <span style={{ color: "#fff", fontWeight: 600 }}>
                          {task.progress}%
                        </span>
                      </div>
                      <div
                        className="user-meta"
                        style={{
                          color: "#94a3b8",
                          minWidth: "100px",
                          textAlign: "right",
                        }}
                      >
                        Due: {new Date(task.deadline).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p
                style={{ color: "var(--head-text-secondary)", padding: "1rem" }}
              >
                No active tasks.
              </p>
            )}
          </div>
        </div>
      </main>
      {/* Reject Modal */}
      {/* Reject Modal */}
      {isRejectModalOpen &&
        createPortal(
          <div className="head-reject-modal-overlay" onClick={closeRejectModal}>
            <div
              className="head-reject-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="head-reject-modal-header">
                <h2>
                  <XCircle size={24} /> Reject Request
                </h2>
              </div>
              <div className="head-reject-modal-body">
                <label>Reason for Rejection:</label>
                <textarea
                  className="head-reject-modal-textarea"
                  placeholder="Please explain why this request is being rejected..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                ></textarea>
              </div>
              <div className="head-reject-modal-footer">
                <button
                  className="btn-action btn-cancel"
                  onClick={closeRejectModal}
                >
                  Cancel
                </button>
                <button
                  className="btn-action btn-confirm-reject"
                  onClick={handleConfirmReject}
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Popups */}
      <PopupDoneHead
        isOpen={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        title="Success"
        message={popupMessage}
      />
      <PopupErrorHead
        isOpen={showErrorPopup}
        onClose={() => setShowErrorPopup(false)}
        title="Error"
        message={popupMessage}
      />

      {/* Notification Popup for Approve */}
      <PopupHead
        isOpen={notificationPopup.isOpen}
        onClose={() =>
          setNotificationPopup((prev) => ({ ...prev, isOpen: false }))
        }
        title={notificationPopup.title}
        message={notificationPopup.message}
        type={notificationPopup.type}
        autoClose={true}
        duration={3000}
      />
    </div>
  );
};

export default HeadDashboard;
