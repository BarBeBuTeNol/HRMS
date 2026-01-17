import React, { useState, useEffect } from "react";
import axios from "axios";
import HeadSidebar from "../../../Component/Head/HeadSidebar";
import "./DataApproval.css"; // Ensure absolute or correct relative path if needed, but relative usually works
import {
  FaCheckCircle,
  FaTimesCircle,
  FaFileAlt,
  FaHistory,
  FaClock,
} from "react-icons/fa";

const DataApproval = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending"); // 'pending' | 'history'

  // Modal State
  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    requestId: null,
  });
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Assuming headers handle auth token automatically via interceptor or we need to add it
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const endpoint =
        activeTab === "pending"
          ? "http://localhost:5000/api/change-requests/pending"
          : "http://localhost:5000/api/change-requests/history";

      const response = await axios.get(endpoint, config);
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this request?"))
      return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/change-requests/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Remove from list or refresh
      setRequests((prev) => prev.filter((req) => req.id !== id));
      alert("Request approved successfully!");
    } catch (error) {
      console.error("Approval failed:", error);
      alert(error.response?.data?.message || "Approval failed");
    }
  };

  const openRejectModal = (id) => {
    setRejectModal({ isOpen: true, requestId: id });
    setRejectReason("");
  };

  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/change-requests/${rejectModal.requestId}/reject`,
        { comment: rejectReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRequests((prev) =>
        prev.filter((req) => req.id !== rejectModal.requestId)
      );
      setRejectModal({ isOpen: false, requestId: null });
    } catch (error) {
      console.error("Rejection failed:", error);
      alert(error.response?.data?.message || "Rejection failed");
    }
  };

  const viewEvidence = (path) => {
    if (!path) return;
    // Normalize path just in case
    const url = `http://localhost:5000/${path.replace(/\\/g, "/")}`;
    window.open(url, "_blank");
  };

  return (
    <div className="data-approval-container">
      <HeadSidebar />
      <main className="data-approval-content">
        <header className="data-approval-header">
          <h1 className="data-approval-title">
            <FaCheckCircle className="text-gold" /> Data Approvals
          </h1>
          <p className="data-approval-subtitle">
            Review and manage profile update requests from your team.
          </p>
        </header>

        {/* Tabs */}
        <div className="approval-tabs">
          <button
            className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
            onClick={() => setActiveTab("pending")}
          >
            <FaClock style={{ marginRight: "8px" }} />
            Pending Requests
          </button>
          <button
            className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            <FaHistory style={{ marginRight: "8px" }} />
            History Log
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <h3>No requests found.</h3>
            <p>Your team hasn't submitted any data changes recently.</p>
          </div>
        ) : (
          <div className="request-grid">
            {requests.map((req) => (
              <div key={req.id} className="request-card">
                <div className="card-header">
                  <div className="requester-info">
                    <h3>{req.requester_name}</h3>
                    <span className="requester-id">ID: {req.requester_id}</span>
                  </div>
                  <span className="field-badge">{req.field_name}</span>
                </div>

                <div className="comparison-box">
                  <div className="value-box">
                    <span className="value-label">Current Value</span>
                    <span className="value-text old">
                      {req.old_value || "(Empty)"}
                    </span>
                  </div>
                  <div className="value-box">
                    <span className="value-label">New Value</span>
                    <span className="value-text new">{req.new_value}</span>
                  </div>
                </div>

                <div className="reason-section">
                  <span className="reason-label">Reasoning:</span>
                  <div className="reason-text">"{req.reason}"</div>
                </div>

                {req.evidence_path && (
                  <button
                    className="evidence-btn"
                    onClick={() => viewEvidence(req.evidence_path)}
                  >
                    <FaFileAlt /> View Attached Evidence
                  </button>
                )}

                {activeTab === "pending" && (
                  <div className="action-buttons">
                    <button
                      className="btn-approve"
                      onClick={() => handleApprove(req.id)}
                    >
                      <FaCheckCircle /> Approve
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => openRejectModal(req.id)}
                    >
                      <FaTimesCircle /> Reject
                    </button>
                  </div>
                )}

                {activeTab === "history" && (
                  <div
                    style={{
                      marginTop: "1rem",
                      paddingTop: "1rem",
                      borderTop: "1px solid var(--head-glass-border)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.9rem",
                      }}
                    >
                      <span
                        style={{
                          color:
                            req.status === "Approved"
                              ? "var(--head-success)"
                              : "var(--head-danger)",
                          fontWeight: "bold",
                        }}
                      >
                        {req.status}
                      </span>
                      <span style={{ color: "var(--head-text-muted)" }}>
                        {new Date(req.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    {req.comment_by_approver && (
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--head-text-secondary)",
                          marginTop: "0.5rem",
                        }}
                      >
                        Note: {req.comment_by_approver}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Reject Modal */}
        {rejectModal.isOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 className="modal-title">Reject Request</h2>
              <p
                style={{
                  color: "var(--head-text-secondary)",
                  marginBottom: "1rem",
                }}
              >
                Please provide a reason for rejecting this change request. This
                will be visible to the employee.
              </p>
              <textarea
                className="modal-textarea"
                placeholder="Reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="modal-actions">
                <button
                  className="btn-secondary"
                  onClick={() =>
                    setRejectModal({ isOpen: false, requestId: null })
                  }
                >
                  Cancel
                </button>
                <button className="btn-danger" onClick={handleConfirmReject}>
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DataApproval;
