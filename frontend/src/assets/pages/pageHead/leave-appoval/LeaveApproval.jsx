import React, { useEffect, useState } from "react";
import axios from "axios";
import HeadSidebar from "../../../Component/Head/HeadSidebar";
import {
  FaCheck,
  FaTimes,
  FaCalendarAlt,
  FaUserTie,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";
import "./LeaveApproval.css";

const LeaveApproval = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      if (!userId) return;
      const response = await axios.get(
        `http://localhost:5000/api/leave-requests/for-head/${userId}`
      );
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Confirm approval?")) return;
    try {
      await axios.put(`http://localhost:5000/api/leave-requests/${id}/status`, {
        status: "approved",
      });
      alert("Approved successfully");
      fetchRequests();
    } catch (error) {
      console.error("Error approving:", error);
      alert("Failed to approve");
    }
  };

  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }
    try {
      await axios.put(
        `http://localhost:5000/api/leave-requests/${selectedRequest.id}/status`,
        {
          status: "rejected",
          rejection_reason: rejectionReason,
        }
      );
      alert("Rejected request.");
      setShowRejectModal(false);
      fetchRequests();
    } catch (error) {
      console.error("Error rejecting:", error);
      alert("Failed to reject");
    }
  };

  return (
    <div className="leave-approval-container">
      <HeadSidebar />
      <main className="leave-approval-content">
        <header className="page-header">
          <h1>
            <FaUserTie /> Leave Approvals
          </h1>
          <p className="subtitle">Review and manage team leave requests</p>
        </header>

        {loading ? (
          <div className="loading-state">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <FaCheck className="icon-empty" />
            <h3>All Caught Up!</h3>
            <p>There are no pending leave requests at the moment.</p>
          </div>
        ) : (
          <div className="requests-grid">
            {requests.map((req) => (
              <div key={req.id} className="request-card">
                {/* Header: Employee Info */}
                <div className="card-header">
                  <div className="employee-info">
                    <div className="avatar">{req.employeeName.charAt(0)}</div>
                    <div>
                      <h3>
                        {req.employeeName} {req.last_name}
                      </h3>
                      <span className="position">
                        {req.emp_code} • {req.position_name}
                      </span>
                    </div>
                  </div>
                  <div className="leave-badge">{req.leaveType}</div>
                </div>

                {/* Body: Details */}
                <div className="card-body">
                  <div className="detail-row">
                    <FaCalendarAlt className="icon" />
                    <span>
                      {new Date(req.startDate).toLocaleDateString()} -{" "}
                      {new Date(req.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="reason-box">
                    <p className="reason-label">Reason:</p>
                    <p>"{req.reason}"</p>
                  </div>

                  {/* Conflict Warning */}
                  {req.conflictCount > 0 ? (
                    <div className="conflict-alert warning">
                      <FaExclamationTriangle />
                      <span>
                        Conflict Warning: <strong>{req.conflictCount}</strong>{" "}
                        other(s) on leave during this period.
                      </span>
                    </div>
                  ) : (
                    <div className="conflict-alert success">
                      <FaCheck />
                      <span>No conflicts with other approved leaves.</span>
                    </div>
                  )}
                </div>

                {/* Footer: Actions */}
                <div className="card-actions">
                  <button
                    className="btn-reject"
                    onClick={() => openRejectModal(req)}
                  >
                    Reject
                  </button>
                  <button
                    className="btn-approve"
                    onClick={() => handleApprove(req.id)}
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rejection Modal */}
        {showRejectModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Reject Request</h2>
              <p>
                Please provide a reason for rejecting{" "}
                <strong>{selectedRequest?.employeeName}</strong>'s request.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows={4}
              />
              <div className="modal-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setShowRejectModal(false)}
                >
                  Cancel
                </button>
                <button className="btn-confirm-reject" onClick={handleReject}>
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LeaveApproval;
