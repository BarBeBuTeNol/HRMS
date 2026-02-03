import React, { useState, useEffect } from "react";
import api from "../../../../services/api";
import Swal from "sweetalert2";
import HeadSidebar from "../../../Component/Head/HeadSidebar";
import "./ShiftRequestHead.css";
import { FaExchangeAlt, FaClipboardList, FaClock, FaExclamationCircle, FaSearch } from "react-icons/fa";

const ShiftRequestHead = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all', 'shift', 'task'
  const [searchTerm, setSearchTerm] = useState("");
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
      const response = await api.get("/task-replacement/pending");
      setRequests(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching requests:", error);
      setLoading(false);
    }
  };

  // Derived State for Stats
  const stats = {
    total: requests.length,
    shiftSwaps: requests.filter(r => !r.task_id).length,
    taskSwaps: requests.filter(r => r.task_id).length,
    urgent: requests.filter(r => {
        const date = r.work_date || r.deadline;
        const diff = new Date(date) - new Date();
        return diff < 86400000 * 2; // Less than 2 days
    }).length
  };

  // Filtering Logic
  const filteredRequests = requests.filter(req => {
      const matchesType = filter === "all" 
        ? true 
        : filter === "task" 
            ? req.task_id 
            : !req.task_id;
      
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        req.original_first_name?.toLowerCase().includes(searchLower) ||
        req.replacement_first_name?.toLowerCase().includes(searchLower) ||
        req.reason?.toLowerCase().includes(searchLower);

      return matchesType && matchesSearch;
  });

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
        await api.post(`/task-replacement/${id}/approve`, {});

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
      await api.post(`/task-replacement/${rejectTargetId}/reject`, {
        reason: rejectReason,
      });

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

      const response = await api.get(`/task-replacement/workload`, {
        params: {
          replacementId: request.replacement_user_id,
          date: dateToCheck,
        },
      });
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
        <header className="shift-req-header">
            <div className="shift-req-title-group">
                <div className="shift-req-title-text">
                    <h1 className="shift-req-title">Request Command Center</h1>
                    <p className="shift-req-subtitle">Manage workforce changes & approvals</p>
                </div>
            </div>
            
            {/* Stats Overview */}
            <div className="header-stats">
                <div className="stat-card total">
                    <div className="stat-icon"><FaClipboardList /></div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.total}</span>
                        <span className="stat-label">Pending</span>
                    </div>
                </div>
                <div className="stat-card warning">
                    <div className="stat-icon"><FaExclamationCircle /></div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.urgent}</span>
                        <span className="stat-label">Urgent</span>
                    </div>
                </div>
                 <div className="stat-card shift">
                    <div className="stat-icon"><FaClock /></div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.shiftSwaps}</span>
                        <span className="stat-label">Shift Swaps</span>
                    </div>
                </div>
            </div>
        </header>

        {/* Controls Bar */}
        <div className="controls-bar">
            <div className="filter-tabs">
                <button 
                    className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All Requests
                </button>
                 <button 
                    className={`filter-tab ${filter === 'shift' ? 'active' : ''}`}
                    onClick={() => setFilter('shift')}
                >
                    Shift Swaps
                </button>
                 <button 
                    className={`filter-tab ${filter === 'task' ? 'active' : ''}`}
                    onClick={() => setFilter('task')}
                >
                    Task Swaps
                </button>
            </div>
            <div className="search-wrapper">
                <FaSearch className="search-icon"/>
                <input 
                    type="text" 
                    placeholder="Search by name..." 
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {loading ? (
          <div className="text-white text-center mt-10">Loading...</div>
        ) : (
          <div className="requests-grid">
            {filteredRequests.length === 0 ? (
              <div className="empty-state">No requests match your filters.</div>
            ) : (
              filteredRequests.map((req) => (
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
