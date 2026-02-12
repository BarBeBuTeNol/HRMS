import React, { useEffect, useState } from "react";
import api from "../../../../services/api";
import HeadSidebar from "../../../Component/Head/HeadSidebar";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FaChartPie,
  FaChartLine,
  FaUserClock,
  FaTasks,
  FaUsers,
  FaCalendarCheck,
  FaExclamationTriangle,
} from "react-icons/fa";
import "./LeaveAnalytics.css";

const COLORS = [
  "#c5a059",
  "#3b82f6",
  "#10b981",
  "#ef4444",
  "#f59e0b",
  "#94a3b8",
];

const LeaveAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId =
          localStorage.getItem("userId") || localStorage.getItem("id"); // Fallback check
        if (!userId) {
          console.error("User ID not found");
          return;
        }

        // Fetch Analytics Data
        const response = await api.get(
          `/leave-requests/stats/analytics/${userId}`,
        );
        setData(response.data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="leave-analytics-container">
        <HeadSidebar />
        <div className="leave-analytics-content">
          <div className="loading-container">Loading Analytics...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="leave-analytics-container">
        <HeadSidebar />
        <div className="leave-analytics-content">
          <div className="loading-container">No Data Available</div>
        </div>
      </div>
    );
  }

  const { attendanceRate, pieData, lineData, topAbsentees, employeeStats } =
    data;

  return (
    <div className="leave-analytics-container">
      <HeadSidebar />

      <main className="leave-analytics-content">
        <header className="analytics-header">
          <div>
            <h1 className="analytics-title">Leave Analytics</h1>
            <p className="analytics-subtitle">
              Workforce Planning & Performance Insights
            </p>
          </div>
          <div
            style={{ color: "var(--head-accent-color)", fontSize: "1.2rem" }}
          >
            <FaCalendarCheck />{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </div>
        </header>

        {/* 1. Top Stats Cards */}
        <section className="analytics-grid-top">
          {/* Card 1: Attendance Rate */}
          <div className="stat-card">
            <div
              className="stat-icon-container"
              style={{ background: "rgba(16, 185, 129, 0.15)" }}
            >
              <FaUserClock style={{ color: "#10b981" }} />
            </div>
            <div className="stat-info">
              <div className="stat-label">Attendance Rate</div>
              <div className="stat-value">{attendanceRate}%</div>
              <div
                className="stat-subtext"
                style={{
                  color:
                    attendanceRate > 90
                      ? "var(--head-success)"
                      : "var(--head-danger)",
                  fontWeight: 600,
                }}
              >
                {attendanceRate > 90 ? "Excellent" : "Needs Attention"}
              </div>
            </div>
          </div>

          {/* Card 2: Total Staff */}
          <div className="stat-card">
            <div
              className="stat-icon-container"
              style={{ background: "rgba(59, 130, 246, 0.15)" }}
            >
              <FaUsers style={{ color: "#3b82f6" }} />
            </div>
            <div className="stat-info">
              <div className="stat-label">Total Staff</div>
              <div className="stat-value">{employeeStats.length}</div>
              <div
                className="stat-subtext"
                style={{ color: "var(--head-text-secondary)" }}
              >
                Active Employees
              </div>
            </div>
          </div>

          {/* Card 3: Leave Types */}
          <div className="stat-card">
            <div
              className="stat-icon-container"
              style={{ background: "rgba(197, 160, 89, 0.15)" }}
            >
              <FaChartPie style={{ color: "#c5a059" }} />
            </div>
            <div className="stat-info">
              <div className="stat-label">Leave Categories</div>
              <div className="stat-value">{pieData.length}</div>
              <div
                className="stat-subtext"
                style={{ color: "var(--head-text-secondary)" }}
              >
                Types Used
              </div>
            </div>
          </div>

          {/* Card 4: Top Absentee */}
          <div className="stat-card">
            <div
              className="stat-icon-container"
              style={{ background: "rgba(239, 68, 68, 0.15)" }}
            >
              <FaExclamationTriangle style={{ color: "#ef4444" }} />
            </div>
            <div className="stat-info">
              <div className="stat-label">Top Absentee</div>
              <div className="stat-value">
                {topAbsentees.length > 0
                  ? topAbsentees[0].name.split(" ")[0]
                  : "-"}
              </div>
              <div
                className="stat-subtext"
                style={{ color: "var(--head-danger)", fontWeight: 600 }}
              >
                {topAbsentees.length > 0
                  ? `${topAbsentees[0].usedDays} Days`
                  : "0 Days"}
              </div>
            </div>
          </div>
        </section>

        {/* 2. Charts Section */}
        <section className="charts-section">
          {/* Pie Chart */}
          <div className="chart-container">
            <h3 className="chart-title">
              <FaChartPie /> Leave Type Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
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
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "#fff" }}
                  labelStyle={{ color: "#fff" }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart */}
          <div className="chart-container">
            <h3 className="chart-title">
              <FaChartLine /> Monthly Leave Trends
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={lineData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "#fff" }}
                  labelStyle={{ color: "#fff" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="days"
                  stroke="#c5a059"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 3. Bottom Lists */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}
        >
          {/* Top Absentees */}
          <section className="absentees-section">
            <h3 className="chart-title">
              <FaExclamationTriangle style={{ color: "var(--head-danger)" }} />{" "}
              Top Absentees (Most Leave Days)
            </h3>
            <div className="absentees-list">
              {topAbsentees.map((emp) => (
                <div key={emp.id} className="absentee-card">
                  <img
                    src={`https://ui-avatars.com/api/?name=${emp.name}&background=random`}
                    alt={emp.name}
                    className="absentee-avatar"
                  />
                  <div className="absentee-info">
                    <h4>{emp.name}</h4>
                    <div className="absentee-days">
                      {emp.usedDays} Days Taken
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Leave Status Summary Table */}
          <section className="summary-table-container">
            <h3 className="chart-title">
              <FaTasks /> Leave Status Summary (Quota vs Used)
            </h3>
            <div style={{ overflowX: "auto" }}>
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Attendance Score</th>
                    <th>Used Days</th>
                    <th>Remaining Quota</th>
                    <th>Usage Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeStats.map((emp) => {
                    const percentage = Math.min(
                      100,
                      (emp.usedDays / emp.quota) * 100,
                    );
                    return (
                      <tr key={emp.id}>
                        <td style={{ fontWeight: 500, color: "white" }}>
                          {emp.name}
                        </td>
                        <td>
                          <span
                            style={{
                              color:
                                parseFloat(emp.attendance) > 95
                                  ? "#10b981"
                                  : parseFloat(emp.attendance) > 85
                                    ? "#f59e0b"
                                    : "#ef4444",
                              fontWeight: "bold",
                            }}
                          >
                            {emp.attendance}%
                          </span>
                        </td>
                        <td>{emp.usedDays} Days</td>
                        <td>{Math.max(0, emp.quota - emp.usedDays)} Days</td>
                        <td>
                          <div className="progress-container">
                            <div className="progress-bar-bg">
                              <div
                                className="progress-bar-fill"
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor:
                                    percentage > 80 ? "#ef4444" : "#c5a059",
                                }}
                              ></div>
                            </div>
                            <span style={{ fontSize: "0.8rem" }}>
                              {Math.round(percentage)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default LeaveAnalytics;
