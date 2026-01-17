import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./RequestLeaveHead.css";

// Components
import HeadSidebar from "../../../Component/Head/HeadSidebar";

const RequestLeaveHead = () => {
  const [userData, setUserData] = useState(null);

  // Data States
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [leaveSummary, setLeaveSummary] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [workShifts, setWorkShifts] = useState([]);

  // Form States
  const [formData, setFormData] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
    evidenceFile: null,
  });

  const [loading, setLoading] = useState(true);

  // Initialize Data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const userObj = JSON.parse(localStorage.getItem("user")); // Fallback or extra data

        if (!userId && !userObj) {
          window.location.href = "/login";
          return;
        }

        const currentUserId = userId || userObj.id;
        setUserData({ ...userObj, id: currentUserId });

        // Parallel Fetching
        const [historyRes, summaryRes, holidaysRes, shiftsRes] =
          await Promise.all([
            axios.get(
              `http://localhost:5000/api/leave-requests/${currentUserId}`
            ),
            axios.get(
              `http://localhost:5000/api/leave-requests/summary/${currentUserId}`
            ),
            axios.get("http://localhost:5000/api/calendar"),
            axios.get(
              `http://localhost:5000/api/work-schedules/user/${currentUserId}`
            ),
          ]);

        setLeaveHistory(historyRes.data);
        setLeaveSummary(summaryRes.data);
        setHolidays(holidaysRes.data); // Adjust if data structure differs
        setWorkShifts(shiftsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire("Error", "Failed to load leave data.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Form Handlers
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, evidenceFile: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.leaveType ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.reason
    ) {
      Swal.fire("Warning", "Please fill in all required fields.", "warning");
      return;
    }

    // Append file info to reason since DB doesn't have evidence column yet
    let finalReason = formData.reason;
    if (formData.evidenceFile) {
      finalReason += ` [Evidence Attached: ${formData.evidenceFile.name}]`;
    }

    try {
      const payload = {
        user_id: userData.id,
        leave_type: formData.leaveType,
        start_date: formData.startDate,
        end_date: formData.endDate,
        reason: finalReason,
      };

      const res = await axios.post(
        "http://localhost:5000/api/leave-requests",
        payload
      );

      if (res.data.success) {
        Swal.fire({
          title: "Success!",
          text: "Your leave request has been submitted to the Executive.",
          icon: "success",
          background: "#1e293b",
          color: "#fff",
          confirmButtonColor: "#c5a059",
        });

        // Refresh History
        const historyRes = await axios.get(
          `http://localhost:5000/api/leave-requests/${userData.id}`
        );
        setLeaveHistory(historyRes.data);

        // Reset Form
        setFormData({
          leaveType: "",
          startDate: "",
          endDate: "",
          reason: "",
          evidenceFile: null,
        });
      }
    } catch (error) {
      console.error("Submit error:", error);
      Swal.fire("Error", "Failed to submit request.", "error");
    }
  };

  // Calendar Logic
  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const dateStr = date.toISOString().split("T")[0];
    const dots = [];

    // Check Holiday
    const isHoliday = holidays.find(
      (h) => h.date && h.date.toString().startsWith(dateStr)
    );
    if (isHoliday)
      dots.push(
        <div
          key="holiday"
          className="calendar-dot dot-holiday"
          title={isHoliday.event_name}
        ></div>
      );

    // Check Shift
    const shift = workShifts.find((s) => s.date.startsWith(dateStr));
    if (shift)
      dots.push(
        <div
          key="shift"
          className="calendar-dot dot-shift"
          title={`Shift: ${shift.shift}`}
        ></div>
      );

    // Check Leave
    const leave = leaveHistory.find((l) => {
      const start = new Date(l.start_date).toISOString().split("T")[0];
      const end = new Date(l.end_date).toISOString().split("T")[0];
      return dateStr >= start && dateStr <= end;
    });
    if (leave)
      dots.push(
        <div
          key="leave"
          className="calendar-dot dot-leave"
          title={leave.leave_type}
        ></div>
      );

    return (
      <div className="flex gap-1 justify-center mt-1 flex-wrap">{dots}</div>
    );
  };

  if (loading)
    return <div className="head-req-leave-container">Loading...</div>;

  return (
    <div className="head-req-leave-container">
      <HeadSidebar />

      <div className="head-req-leave-header">
        <h1 className="head-req-leave-title">Leave Request</h1>
        <p className="head-req-leave-subtitle">
          Manage your time off and view your schedule overlaps
        </p>
      </div>

      <div className="head-req-leave-grid">
        {/* Left Column: Form */}
        <div className="head-req-leave-left">
          <div className="head-req-leave-card">
            <h2 className="head-card-title">
              <i className="fas fa-edit"></i> Submit Request
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="head-form-group">
                <label className="head-form-label">Leave Type</label>
                <select
                  name="leaveType"
                  className="head-form-select"
                  value={formData.leaveType}
                  onChange={handleChange}
                >
                  <option value="">Select Type...</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Personal Leave">Personal Leave</option>
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex gap-4">
                <div className="head-form-group flex-1">
                  <label className="head-form-label">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    className="head-form-input"
                    value={formData.startDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="head-form-group flex-1">
                  <label className="head-form-label">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    className="head-form-input"
                    value={formData.endDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="head-form-group">
                <label className="head-form-label">Reason</label>
                <textarea
                  name="reason"
                  className="head-form-textarea"
                  placeholder="Please describe your reason..."
                  value={formData.reason}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div className="head-form-group">
                <label className="head-form-label">Evidence (Optional)</label>
                <div className="head-file-upload-wrapper">
                  <label className="head-file-upload-label">
                    <i className="fas fa-cloud-upload-alt head-upload-icon"></i>
                    <span className="head-upload-text">
                      {formData.evidenceFile
                        ? formData.evidenceFile.name
                        : "Click to Upload File (Image/PDF)"}
                    </span>
                    <input type="file" hidden onChange={handleFileChange} />
                  </label>
                </div>
              </div>

              <button type="submit" className="head-submit-btn">
                <i className="fas fa-paper-plane"></i> Submit Request
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Dashboard */}
        <div className="head-req-leave-right">
          {/* Quota Summary */}
          <div className="head-quota-grid">
            {leaveSummary.map((item, idx) => (
              <div key={idx} className="head-quota-card">
                <div className="head-quota-icon">
                  {item.type === "Sick Leave" && "🩺"}
                  {item.type === "Personal Leave" && "💼"}
                  {item.type === "Annual Leave" && "🌴"}
                  {item.type === "Other" && "📝"}
                </div>
                <h3 className="head-quota-label">{item.type}</h3>
                <div className="head-quota-value">{item.used}</div>
                <div className="head-quota-total">/ {item.limit} Days</div>
                <div className="head-quota-progress">
                  <div
                    className="head-quota-bar"
                    style={{
                      width: `${Math.min(
                        (item.used / item.limit) * 100,
                        100
                      )}%`,
                      backgroundColor:
                        item.used >= item.limit ? "#ef4444" : "#c5a059",
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Calendar */}
          <div className="head-req-leave-card head-calendar-wrapper">
            <div className="flex justify-between items-center mb-4">
              <h2 className="head-card-title mb-0">
                <i className="fas fa-calendar-alt"></i> My Schedule & Leaves
              </h2>
              <div className="text-xs text-gray-400">
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>

            <div className="head-mini-calendar">
              <Calendar tileContent={tileContent} className="w-full" />
            </div>

            <div className="calendar-legend">
              <div className="legend-item">
                <div
                  className="legend-color"
                  style={{
                    background: "#ef4444",
                    boxShadow: "0 0 5px #ef4444",
                  }}
                ></div>
                <span>Holiday</span>
              </div>
              <div className="legend-item">
                <div
                  className="legend-color"
                  style={{
                    background: "#3b82f6",
                    boxShadow: "0 0 5px #3b82f6",
                  }}
                ></div>
                <span>Work Shift</span>
              </div>
              <div className="legend-item">
                <div
                  className="legend-color"
                  style={{
                    background: "#f59e0b",
                    boxShadow: "0 0 5px #f59e0b",
                  }}
                ></div>
                <span>Leave</span>
              </div>
            </div>
          </div>

          {/* History Table */}
          <div className="head-req-leave-card">
            <h2 className="head-card-title">
              <i className="fas fa-history"></i> Request History
            </h2>
            <div className="head-history-table-container">
              <table className="head-history-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Status</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveHistory.slice(0, 5).map((req) => (
                    <tr key={req.id}>
                      <td>{req.leave_type}</td>
                      <td>
                        {new Date(req.start_date).toLocaleDateString()} -{" "}
                        {new Date(req.end_date).toLocaleDateString()}
                      </td>
                      <td>
                        <span
                          className={`head-status-chip head-status-${req.status.toLowerCase()}`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="text-xs text-gray-400">
                        {req.status === "rejected" && req.rejection_reason && (
                          <span className="text-red-400">
                            Reason: {req.rejection_reason}
                          </span>
                        )}
                        {req.status === "pending" && "-"}
                        {req.status === "approved" && "-"}
                      </td>
                    </tr>
                  ))}
                  {leaveHistory.length === 0 && (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center py-4 text-gray-500"
                      >
                        No leave history found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestLeaveHead;
