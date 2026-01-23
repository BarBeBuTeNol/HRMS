import React, { useState, useEffect } from "react";
import api from "../../../../services/api";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import {
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  Award,
  BookOpen,
} from "lucide-react";
import HeadSidebar from "../../../Component/Head/HeadSidebar"; // Adjust path if needed usually ../../../Component/Head/HeadSidebar
import "./TeamPerformanceHead.css";

const TeamPerformanceHead = () => {
  const [overview, setOverview] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // COLORS for Charts
  const COLORS = ["#10b981", "#3b82f6", "#f59e0b"]; // Completed, In Progress, Pending

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userStr =
        localStorage.getItem("user") || localStorage.getItem("currentUser");
      const user = userStr ? JSON.parse(userStr) : null;
      const headId = user?.id || user?.userId; // Handle potential different ID keys

      if (!headId) {
        console.error("User not found in localStorage");
        setLoading(false);
        return;
      }

      // Fetch Overview
      const overviewRes = await api.get(
        `/head/team-performance-overview/${headId}`,
      );
      setOverview(overviewRes.data.stats);

      // Fetch Members
      const membersRes = await api.get(
        `/head/team-performance-members/${headId}`,
      );
      setMembers(membersRes.data);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching performance data:", error);
      setLoading(false);
    }
  };

  // Prepare data for Pie Chart
  const pieData = overview
    ? [
        { name: "Completed", value: parseInt(overview.completed || 0) },
        { name: "In Progress", value: parseInt(overview.in_progress || 0) },
        { name: "Pending", value: parseInt(overview.pending || 0) },
      ]
    : [];

  const calculateOnTimeRate = (completed, onTime) => {
    if (!completed || completed === 0) return 0;
    return Math.round((onTime / completed) * 100);
  };

  if (loading) {
    return (
      <div className="flex bg-[#0f172a] min-h-screen text-white items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex">
      <HeadSidebar onToggle={setIsSidebarOpen} />
      <div
        className={`flex-1 team-performance-container ${
          isSidebarOpen ? "" : "sidebar-collapsed"
        }`}
      >
        <div className="page-header">
          <h1 className="page-title">Team Performance</h1>
          <p className="page-subtitle">
            Overview of team efficiency, task progress, and individual metrics.
          </p>
        </div>

        <div className="dashboard-grid">
          {/* Overall Progress Chart */}
          <div className="glass-card overall-progress-card">
            <h3 className="card-title">
              <CheckCircle className="text-emerald-400" size={20} /> Overall
              Task Progress
            </h3>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="stats-summary w-full mt-4">
              <div className="stat-item">
                <div className="stat-value text-emerald-400">
                  {overview?.completed}
                </div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-item">
                <div className="stat-value text-blue-400">
                  {overview?.in_progress}
                </div>
                <div className="stat-label">In Progress</div>
              </div>
              <div className="stat-item">
                <div className="stat-value text-amber-400">
                  {overview?.pending}
                </div>
                <div className="stat-label">Pending</div>
              </div>
            </div>
          </div>

          {/* Attendance Impact & Quick Stats */}
          <div className="glass-card flex flex-col justify-between">
            <div>
              <h3 className="card-title">
                <AlertCircle className="text-red-400" size={20} /> Attendance
                Impact
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Correlation between leaves and work impact. High leave rates may
                require workload redistribution.
              </p>
              <div className="attendance-impact">
                {members.slice(0, 4).map((m, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-800/50 p-3 rounded-lg flex justify-between items-center mb-2"
                  >
                    <div className="flex items-center gap-2">
                      {m.image ? (
                        <img
                          src={`http://localhost:3000${m.image}`}
                          className="w-8 h-8 rounded-full object-cover border border-amber-500/30"
                          alt={m.first_name}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-amber-400 border border-amber-500/30">
                          {m.first_name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {m.first_name}
                        </div>
                        <div className="text-xs text-gray-500 flex gap-2">
                          <span>
                            Leaves:{" "}
                            <span className="text-white">
                              {m.approved_leaves}
                            </span>
                          </span>
                          <span>
                            Overdue:{" "}
                            <span
                              className={
                                m.total_overdue > 0
                                  ? "text-red-400"
                                  : "text-white"
                              }
                            >
                              {m.total_overdue}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {m.approved_leaves > 0 && m.total_overdue > 0 ? (
                        <span className="text-xs text-red-500 font-bold bg-red-500/10 px-2 py-1 rounded">
                          High Impact
                        </span>
                      ) : m.total_overdue > 0 ? (
                        <span className="text-xs text-orange-400 font-bold">
                          Needs Support
                        </span>
                      ) : (
                        <span className="text-xs text-green-400 font-bold">
                          Stable
                        </span>
                      )}
                    </div>
                  </div>
                ))}{" "}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700/50">
              <h3 className="card-title text-sm mb-2">
                <Award className="text-yellow-400" size={16} /> Top Performers
                (Training Completed)
              </h3>
              <div className="flex gap-2 flex-wrap">
                {members
                  .filter((m) => m.training_info)
                  .slice(0, 5)
                  .map((m, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded text-xs"
                    >
                      {m.first_name}
                    </span>
                  ))}
                {members.filter((m) => m.training_info).length === 0 && (
                  <span className="text-xs text-gray-500">
                    No training data recorded yet.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Individual Metrics Table */}
        <div className="glass-card members-section">
          <h3 className="card-title">
            <User className="text-blue-400" size={20} /> Individual Member
            Metrics
          </h3>
          <div className="members-table-container">
            <table className="members-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Job Position</th>
                  <th>Tasks (C/T)</th>
                  <th>Avg Progress</th>
                  <th>On-time Delivery</th>
                  <th>Review & Training</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => {
                  const onTimeRate = calculateOnTimeRate(
                    member.total_completed,
                    member.on_time_completed,
                  );
                  const avgProgress = member.avg_progress
                    ? Math.round(member.avg_progress)
                    : 0;

                  return (
                    <tr key={member.id}>
                      <td>
                        <div className="member-info">
                          {member.image ? (
                            <img
                              src={`http://localhost:3000${member.image}`}
                              alt={member.first_name}
                              className="member-avatar"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/40";
                              }}
                            />
                          ) : (
                            <div className="member-avatar flex items-center justify-center bg-slate-700 text-amber-400 font-bold border-2 border-amber-500">
                              {member.first_name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="member-name">
                              {member.first_name} {member.last_name}
                            </div>
                            <div className="member-role text-xs text-gray-400">
                              {member.emp_code}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-gray-300">
                        {member.position_name || "N/A"}
                      </td>
                      <td>
                        <div className="flex flex-col">
                          <span className="text-white font-medium">
                            {member.total_completed} / {member.total_assigned}
                          </span>
                          <span className="text-xs text-gray-500">
                            Completed / Total
                          </span>
                        </div>
                      </td>
                      <td style={{ width: "20%" }}>
                        <div className="flex items-center gap-2">
                          <div className="progress-bar-container">
                            <div
                              className="progress-bar-fill"
                              style={{ width: `${avgProgress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold text-amber-400">
                            {avgProgress}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <div
                          className={`text-sm font-bold ${
                            onTimeRate >= 80
                              ? "text-green-400"
                              : onTimeRate >= 50
                                ? "text-yellow-400"
                                : "text-red-400"
                          }`}
                        >
                          {onTimeRate}%
                        </div>
                        <div className="text-xs text-gray-500">
                          Based on deadlines
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col gap-1">
                          {member.performance_review ? (
                            <div className="text-xs text-gray-300 flex items-start gap-1">
                              <Award
                                size={12}
                                className="text-purple-400 mt-0.5"
                              />
                              <span
                                className="truncate max-w-[150px]"
                                title={member.performance_review}
                              >
                                {member.performance_review}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-600">
                              - No Review -
                            </span>
                          )}

                          {member.training_info ? (
                            <div className="text-xs text-gray-300 flex items-start gap-1">
                              <BookOpen
                                size={12}
                                className="text-blue-400 mt-0.5"
                              />
                              <span
                                className="truncate max-w-[150px]"
                                title={member.training_info}
                              >
                                {member.training_info}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-600">
                              - No Training -
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamPerformanceHead;
