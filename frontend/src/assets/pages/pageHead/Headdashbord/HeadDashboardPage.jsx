import React, { useEffect, useState } from "react";
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

const HeadDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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
      <HeadSidebar />
      <main className="head-dashboard-content">
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
                  <div key={user.id} className="user-item">
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
                      <div className="user-meta" style={{ color: "#94a3b8" }}>
                        {user.shift} ({user.start_time?.slice(0, 5)} -{" "}
                        {user.end_time?.slice(0, 5)})
                      </div>
                    </div>
                    <span className="badge shift">On Shift</span>
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
                      <td
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
                          style={{ width: 30, height: 30, borderRadius: "50%" }}
                        />
                        {leave.first_name} {leave.last_name}
                      </td>
                      <td>{leave.leave_type}</td>
                      <td>
                        {new Date(leave.start_date).toLocaleDateString()} -{" "}
                        {new Date(leave.end_date).toLocaleDateString()}
                      </td>
                      <td>{leave.reason}</td>
                      <td>
                        <button
                          className="btn-action btn-approve"
                          onClick={() => alert("Feature coming soon")}
                        >
                          Approve
                        </button>
                        <button
                          className="btn-action btn-reject"
                          onClick={() => alert("Feature coming soon")}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
    </div>
  );
};

export default HeadDashboard;
