import React, { useEffect, useState } from "react";
import api from "../../../../services/api"; // Fixed import path
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
      const response = await api.get(`/leave-requests/for-head/${userId}`);
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
      await api.put(`/leave-requests/${id}/status`, {
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
      await api.put(`/leave-requests/${selectedRequest.id}/status`, {
        status: "rejected",
        rejection_reason: rejectionReason,
      });
      alert("Rejected request.");
      setShowRejectModal(false);
      fetchRequests();
    } catch (error) {
      console.error("Error rejecting:", error);
      alert("Failed to reject");
    }
  };

  // Calculate Stats
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const urgentCount = requests.filter((r) => {
    const diffTime = new Date(r.startDate) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  }).length;

  // Gimmick: Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const [filterTerm, setFilterTerm] = useState("");
  const [filterType, setFilterType] = useState("All");

  const filteredRequests = requests.filter((req) => {
    const matchesName =
      req.employeeName.toLowerCase().includes(filterTerm.toLowerCase()) ||
      req.last_name.toLowerCase().includes(filterTerm.toLowerCase());
    const matchesType = filterType === "All" || req.leaveType === filterType;
    return matchesName && matchesType;
  });

  return (
    <div className="leave-approval-container">
      <HeadSidebar />
      <main className="leave-approval-content">
        <header className="page-header-premium">
            {/* Top Row: Title & Greeting */}
            <div className="header-top-row">
                <div className="header-title-group">
                     <h1>
                        <div className="header-icon-wrapper">
                            <FaUserTie className="header-icon" /> 
                        </div>
                        Leave Dashboard
                    </h1>
                    <p className="greeting-text">{getGreeting()}, ready to manage your team?</p>
                </div>
                
                {/* Right: Stats Cards */}
                <div className="header-stats-group">
                     <div className="stat-card-glass">
                        <span className="stat-label">Pending</span>
                        <span className="stat-value">{pendingCount}</span>
                     </div>
                      <div className="stat-card-glass urgent">
                        <span className="stat-label">Urgent</span>
                        <span className="stat-value">{urgentCount}</span>
                     </div>
                </div>
            </div>

            {/* Bottom Row: Filters */}
            <div className="filters-container">
                <input 
                    type="text" 
                    placeholder="Search by employee name..." 
                    className="search-input-glass"
                    value={filterTerm}
                    onChange={(e) => setFilterTerm(e.target.value)}
                />
                <select 
                    className="select-input-glass"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                >
                    <option value="All">All Leave Types</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Personal Leave">Personal Leave</option>
                    <option value="Vacation">Vacation</option>
                </select>
            </div>
        </header>

        {loading ? (
          <div className="loading-state">
             <div className="spinner"></div>
             <span>Syncing requests...</span>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="empty-glass-state">
            <FaCheck className="empty-icon" />
            <h3>All Caught Up!</h3>
            <p>No pending leaves matching your current filters.</p>
          </div>
        ) : (
          <div className="requests-grid-modern">
            {filteredRequests.map((req) => (
              <div key={req.id} className="request-card-modern">
                <div className="card-content-wrapper">
                    {/* Header */}
                    <div className="req-header">
                        <div className="user-profile">
                            <div className="profile-pic">{req.employeeName.charAt(0)}</div>
                            <div className="user-details">
                                <h3>{req.employeeName} {req.last_name}</h3>
                                <span className="user-role">{req.position_name}</span>
                            </div>
                        </div>
                        <span className="leave-tag">{req.leaveType}</span>
                    </div>

                    {/* Dates */}
                    <div className="date-badge-row">
                        <FaCalendarAlt />
                        <span className="date-text">
                            {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                        </span>
                    </div>

                    {/* Reason */}
                    <div className="reason-container">
                        <p className="reason-text">"{req.reason}"</p>
                    </div>

                    {/* Conflict Status */}
                    <div className={`status-indicator ${req.conflictCount > 0 ? 'conflict' : 'safe'}`}>
                        {req.conflictCount > 0 ? (
                            <>
                                <FaExclamationTriangle />
                                <span><strong>{req.conflictCount}</strong> conflict(s) detected</span>
                            </>
                        ) : (
                            <>
                                <FaCheck />
                                <span>Clear schedule (No conflicts)</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="action-footer">
                  <button
                    className="action-btn reject"
                    onClick={() => openRejectModal(req)}
                  >
                    <FaTimes /> Reject
                  </button>
                  <button
                    className="action-btn approve"
                    onClick={() => handleApprove(req.id)}
                  >
                    <FaCheck /> Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rejection Modal */}
        {showRejectModal && (
          <div className="modal-glass-overlay">
            <div className="modal-glass-content">
              <h2>Confirm Rejection</h2>
              <p style={{ color: 'var(--la-text-sub)', marginBottom: '1rem' }}>
                Please provide a reason for rejecting <strong>{selectedRequest?.employeeName}</strong>'s request.
              </p>
              <textarea
                className="modal-textarea"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Reason is required..."
                rows={4}
              />
              <div className="modal-glass-actions">
                <button
                  className="btn-glass-cancel"
                  onClick={() => setShowRejectModal(false)}
                >
                  Cancel
                </button>
                <button className="btn-glass-confirm" onClick={handleReject}>
                  Reject Request
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
