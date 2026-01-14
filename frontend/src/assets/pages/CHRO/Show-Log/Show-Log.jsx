import React, { useState, useEffect, useMemo } from "react";
import CHROLayout from "../../../Component/CHRO/CHROLayout";
import LogService from "../../../../services/LogService";
import PopupNotification from "../../../Component/popup_notifications/PopupNotification";
import "./Show-Log.css";

const ShowLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  // Helper to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const getThreeDaysAgo = () => {
    const date = new Date();
    date.setDate(date.getDate() - 3);
    return date.toISOString().split("T")[0];
  };

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState("all");
  // Default to Last 3 Days
  const [startDate, setStartDate] = useState(getThreeDaysAgo());
  const [endDate, setEndDate] = useState(getTodayDate());

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  // Fetch Data
  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Artificial delay for CHRO Loading Popup visibility (Premium feel)
      await new Promise((resolve) => setTimeout(resolve, 800));

      const data = await LogService.getLogs({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        action: selectedAction !== "all" ? selectedAction : undefined,
        startDate,
        endDate,
      });

      setLogs(data.logs);
      setTotalPages(data.totalPages);
      setTotalLogs(data.total);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      // If 401, LogService handles redirect, but we can set a message just in case
      if (error.response && error.response.status === 401) {
        setError("Session expired. Redirecting to login...");
      } else {
        setError("Failed to load logs. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchLogs();
    }, 500);
    return () => clearTimeout(timer);
  }, [currentPage, searchTerm, selectedAction, startDate, endDate]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleRefresh = () => {
    fetchLogs();
  };

  const handleToday = () => {
    const today = getTodayDate();
    setStartDate(today);
    setEndDate(today);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedAction("all");
    setStartDate("");
    setEndDate("");
  };

  const handleExport = () => {
    window.print();
  };

  const toggleRow = (id) => {
    if (expandedRow === id) {
      setExpandedRow(null);
    } else {
      setExpandedRow(id);
    }
  };

  // Helper for badges
  const getSeverityClass = (severity) => {
    switch (severity) {
      case "Critical":
        return "severity-critical";
      case "Warning":
        return "severity-warning";
      default:
        return "severity-info";
    }
  };

  return (
    <CHROLayout>
      <main className="show-log-content fade-in-up">
        <header className="sl-header">
          <div className="sl-header-left">
            <h1 className="sl-title">
              <span className="sl-icon">🛡️</span> System Audit Logs
            </h1>
            <p className="sl-subtitle">
              Monitor all system activities, security events, and user actions.
            </p>
          </div>
          <div className="sl-actions">
            <button className="sl-btn" onClick={handleToday}>
              📅 Today
            </button>
            <button className="sl-btn" onClick={handleClearFilters}>
              ❌ Clear Filters
            </button>
            <button className="sl-btn" onClick={handleRefresh}>
              🔄 Refresh
            </button>
            <button className="sl-btn" onClick={handleExport}>
              📥 Export Report
            </button>
          </div>
        </header>

        <PopupNotification
          isOpen={loading}
          title="Loading Data"
          message="Please wait while we fetch the latest system logs..."
          type="chro-loading"
          onClose={() => {}} // Block close while loading
        />

        {/* Filters Section */}
        <section className="sl-filters-card">
          <div className="sl-filter-group">
            <label>Search</label>
            <div className="sl-input-wrapper">
              <span className="sl-input-icon">🔍</span>
              <input
                type="text"
                placeholder="Search user, IP, details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="sl-filter-group">
            <label>Category</label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
            >
              <option value="all">All Activities</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
              <option value="CHANGE_REQUEST_SUBMIT">Change Requests</option>
              <option value="LEAVE_REQUEST">Leave Requests</option>
              {/* Add more as needed */}
            </select>
          </div>

          <div className="sl-filter-group">
            <label>Date Range</label>
            <div className="sl-date-row">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span
                style={{ margin: "0 0.5rem", color: "var(--sl-text-muted)" }}
              >
                to
              </span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Exclusive Table */}
        <section className="sl-table-container">
          {error ? (
            <div
              className="sl-error-state"
              style={{ padding: "2rem", textAlign: "center", color: "#dc3545" }}
            >
              <h3>⚠️ Error</h3>
              <p>{error}</p>
              <button
                className="sl-btn"
                onClick={handleRefresh}
                style={{ marginTop: "1rem" }}
              >
                Try Again
              </button>
            </div>
          ) : loading && logs.length === 0 ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading System Logs...</p>
            </div>
          ) : (
            <table className="sl-table">
              <thead>
                <tr>
                  <th width="15%">Created At</th>
                  <th width="10%">Action</th>
                  <th width="15%">User</th>
                  <th width="12%">IP Address</th>
                  <th width="13%">Target</th>
                  <th width="10%">Severity</th>
                  <th width="20%">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr
                      className={`sl-row ${
                        expandedRow === log.id ? "sl-row-expanded" : ""
                      }`}
                      onClick={() => toggleRow(log.id)}
                    >
                      <td className="sl-time">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td>
                        <span
                          className={`sl-action-badge action-${log.action}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="sl-user">
                        <div className="user-name">
                          {log.first_name} {log.last_name}
                        </div>
                        <div className="user-role">{log.username}</div>
                        {log.emp_code && (
                          <div
                            className="user-role"
                            style={{ fontSize: "0.7rem" }}
                          >
                            ID: {log.emp_code}
                          </div>
                        )}
                      </td>
                      <td>{log.ip_address || "N/A"}</td>
                      <td>{log.target || "-"}</td>
                      <td>
                        <span
                          className={`sl-severity-badge ${getSeverityClass(
                            log.severity
                          )}`}
                        >
                          {log.severity || "Info"}
                        </span>
                      </td>
                      <td
                        className="sl-details-preview"
                        title="Click to expand"
                      >
                        {log.details}
                      </td>
                    </tr>
                    {expandedRow === log.id && (
                      <tr className="sl-expanded-details">
                        <td colSpan={6}>
                          <div className="sl-details-content">
                            <strong>Full Details:</strong>
                            <br />
                            {log.details}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {!loading && logs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="sl-empty-state">
                      No logs found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </section>

        {/* Pagination */}
        <footer className="sl-pagination">
          <span className="sl-page-info">
            Showing {logs.length} of {totalLogs} events
          </span>
          <div className="sl-page-controls">
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </button>
            <span className="current-page">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </footer>
      </main>
    </CHROLayout>
  );
};

export default ShowLog;
