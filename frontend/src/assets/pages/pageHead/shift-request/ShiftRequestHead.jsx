import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import HeadSidebar from "../../../Component/Head/HeadSidebar"; // Adjust path if needed
import "./ShiftRequestHead.css";

const ShiftRequestHead = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null); // For workload check
  const [workloadData, setWorkloadData] = useState(null);
  const [showWorkloadModal, setShowWorkloadModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectTargetId, setRejectTargetId] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:3000/api/task-replacement/pending",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRequests(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching requests:", error);
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    const result = await Swal.fire({
      title: "Approve Request?",
      text: "This will automatically update the schedule/task assignment.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Approve it!",
      background: "#1e293b",
      color: "#fff",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          `http://localhost:3000/api/task-replacement/${id}/approve`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        Swal.fire({
          title: "Approved!",
          text: "The request has been approved.",
          icon: "success",
          background: "#1e293b",
          color: "#fff",
        });
        fetchRequests();
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "Something went wrong.",
          icon: "error",
          background: "#1e293b",
          color: "#fff",
        });
      }
    }
  };

  const initiateReject = (id) => {
    setRejectTargetId(id);
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      Swal.fire("Error", "Please provide a reason", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:3000/api/task-replacement/${rejectTargetId}/reject`,
        {
          reason: rejectReason,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setShowRejectModal(false);
      setRejectReason("");
      setRejectTargetId(null);
      fetchRequests();

      Swal.fire({
        title: "Rejected",
        text: "Request has been rejected.",
        icon: "info",
        background: "#1e293b",
        color: "#fff",
      });
    } catch (error) {
      console.error("Error rejecting:", error);
    }
  };

  const checkWorkload = async (request) => {
    setSelectedRequest(request);
    try {
      const token = localStorage.getItem("token");
      // Use work_date if shift, or deadline if task (as a proxy for "date")
      const dateToCheck = request.work_date
        ? request.work_date.split("T")[0]
        : request.deadline
        ? request.deadline.split("T")[0]
        : new Date().toISOString().split("T")[0];

      const response = await axios.get(
        `http://localhost:3000/api/task-replacement/workload`,
        {
          params: {
            replacementId: request.replacement_user_id,
            date: dateToCheck,
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setWorkloadData(response.data);
      setShowWorkloadModal(true);
    } catch (error) {
      console.error("Error checking workload:", error);
    }
  };

  return (
    <div className="flex">
      <HeadSidebar />
      <div className="flex-1 shift-request-container bg-slate-900">
        <div className="page-header">
          <h1 className="page-title">Shift & Task Requests</h1>
          <p className="page-subtitle">
            Manage replacement requests and ensure workforce consistency
          </p>
        </div>

        {loading ? (
          <div className="text-white text-center mt-10">Loading...</div>
        ) : (
          <div className="requests-grid">
            {requests.length === 0 ? (
              <div className="empty-state">No pending requests found.</div>
            ) : (
              requests.map((req) => (
                <div key={req.id} className="request-card">
                  <div className="card-header">
                    <span
                      className={`request-type-badge ${
                        req.task_id ? "task" : "shift"
                      }`}
                    >
                      {req.task_id ? "Task Swap" : "Shift Swap"}
                    </span>
                    <span className="date-timestamp">
                      Requested: {new Date(req.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="user-flow">
                    <div className="user-node">
                      <div className="user-avatar-placeholder">
                        {req.original_first_name?.charAt(0) || "?"}
                      </div>
                      <span className="user-name">
                        {req.original_first_name || "Unknown"}
                      </span>
                      <span className="user-role">Requester</span>
                    </div>
                    <div className="flow-arrow">➜</div>
                    <div className="user-node">
                      <div className="user-avatar-placeholder">
                        {req.replacement_first_name?.charAt(0) || "?"}
                      </div>
                      <span className="user-name">
                        {req.replacement_first_name || "Unknown"}
                      </span>
                      <span className="user-role">Replacement</span>
                    </div>
                  </div>

                  <div className="request-details">
                    {req.task_id ? (
                      <>
                        <div className="detail-row">
                          <span className="detail-label">Task Name</span>
                          <span className="detail-value">{req.task_name}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Deadline</span>
                          <span className="detail-value">
                            {new Date(req.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="detail-row">
                          <span className="detail-label">Shift Date</span>
                          <span className="detail-value">
                            {new Date(req.work_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Shift Type</span>
                          <span className="detail-value">{req.shift}</span>
                        </div>
                      </>
                    )}
                    <div className="reason-box">"{req.reason}"</div>
                  </div>

                  <div className="card-actions">
                    <button
                      className="action-btn btn-workload"
                      onClick={() => checkWorkload(req)}
                    >
                      <i className="fas fa-search"></i> Check Workload
                    </button>
                    <button
                      className="action-btn btn-reject"
                      onClick={() => initiateReject(req.id)}
                    >
                      <i className="fas fa-times"></i> Reject
                    </button>
                    <button
                      className="action-btn btn-approve"
                      onClick={() => handleApprove(req.id)}
                    >
                      <i className="fas fa-check"></i> Approve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Workload Modal */}
        {showWorkloadModal && workloadData && (
          <div
            className="modal-overlay"
            onClick={() => setShowWorkloadModal(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title">Workload Check</h2>
              <p className="text-gray-400 mb-4">
                Checking availability for{" "}
                <strong>{selectedRequest.replacement_first_name}</strong> on{" "}
                {selectedRequest.work_date
                  ? new Date(selectedRequest.work_date).toLocaleDateString()
                  : "Target Date"}
              </p>

              <div className="workload-list">
                <h3 className="text-white font-semibold mb-2">
                  Existing Shifts
                </h3>
                {workloadData.shifts.length === 0 ? (
                  <div className="workload-item text-green-400">
                    No shifts scheduled for this day
                  </div>
                ) : (
                  workloadData.shifts.map((s, idx) => (
                    <div
                      key={idx}
                      className="workload-item text-orange-400 border-l-2 border-orange-500"
                    >
                      {s.shift} Shift (
                      {new Date(s.work_date).toLocaleDateString()})
                    </div>
                  ))
                )}

                <h3 className="text-white font-semibold mb-2 mt-4">
                  Active Tasks
                </h3>
                {workloadData.tasks.length === 0 ? (
                  <div className="workload-item text-green-400">
                    No active tasks found
                  </div>
                ) : (
                  workloadData.tasks.map((t, idx) => (
                    <div
                      key={idx}
                      className="workload-item text-blue-400 border-l-2 border-blue-500"
                    >
                      {t.task_name} (Deadline:{" "}
                      {new Date(t.deadline).toLocaleDateString()})
                    </div>
                  ))
                )}
              </div>

              <div className="modal-actions">
                <button
                  className="action-btn btn-workload"
                  onClick={() => setShowWorkloadModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowRejectModal(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title text-red-500">Reject Request</h2>
              <p className="text-gray-400 mb-4">
                Please provide a reason for rejecting this request.
              </p>

              <textarea
                className="reject-reason-input"
                placeholder="Enter reason here..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />

              <div className="modal-actions">
                <button
                  className="action-btn btn-workload"
                  onClick={() => setShowRejectModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="action-btn btn-reject bg-red-500/10"
                  onClick={handleReject}
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftRequestHead;
