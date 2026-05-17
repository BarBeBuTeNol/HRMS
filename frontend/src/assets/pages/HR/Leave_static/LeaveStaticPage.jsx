import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import api from "../../../../services/api";
import HRLayout from "../../../Component/HR/HRLayout";
import "./LeaveStaticPage.css";
import { useNavigate } from "react-router-dom";

// --- Icons ---
import {
  FaChartLine,
  FaBuilding,
  FaCalendarCheck,
  FaHourglassHalf,
  FaArrowLeft
} from "react-icons/fa";

const COLORS = [
  "#60A5FA", // Blue-400
  "#34D399", // Emerald-400
  "#FBBF24", // Amber-400
  "#F87171", // Red-400
  "#818CF8", // Indigo-400
  "#A78BFA", // Violet-400
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="description">{`${label || ""}`}</p>
        <p className="value">{`${payload[0].name}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const LeaveStaticPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    kpi: {
      totalPending: 0,
      thisMonthUsedDays: 0,
      leaveTypeStats: []
    },
    charts: {
      leavesByDepartment: [],
      monthlyLeaveTrends: []
    },
    recentLeaves: []
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get("/leave-requests/stats/hr-analytics");
      setStatsData(res.data);
    } catch (err) {
      console.error("Error fetching leave stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  const hasMonthlyData = statsData.charts.monthlyLeaveTrends.some(d => d.days > 0);
  const hasDeptData = statsData.charts.leavesByDepartment.length > 0;

  return (
    <HRLayout>
      <div className="static-wrapper">
        <div className="page-header">
          <div>
            <h1 className="page-header-title">Leave Statistics</h1>
            <p className="page-subtitle">
              System-wide overview of employee leaves.
            </p>
          </div>
          <div className="header-actions">
            <button
              className="back-btn-modern"
              onClick={() => navigate("/hr/show-static-switch")}
            >
              <FaArrowLeft /> Back to Shift Swap Analytics
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading...</div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="dashboard-container"
          >
            {/* KPI Cards */}
            <div className="summary-row">
              <motion.div variants={itemVariants} className="summary-card card-yellow">
                <div className="icon-wrapper">
                  <FaHourglassHalf />
                </div>
                <div className="summary-info">
                  <h3>Pending Requests</h3>
                  <p className="summary-value">{statsData.kpi.totalPending}</p>
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants} className="summary-card card-blue">
                <div className="icon-wrapper">
                  <FaCalendarCheck />
                </div>
                <div className="summary-info">
                  <h3>Approved Leaves (This Month)</h3>
                  <p className="summary-value">{statsData.kpi.thisMonthUsedDays} Days</p>
                </div>
              </motion.div>

              {statsData.kpi.leaveTypeStats.map((type, index) => (
                <motion.div key={index} variants={itemVariants} className={`summary-card card-${index % 2 === 0 ? 'green' : 'purple'}`}>
                  <div className="icon-wrapper">
                    <FaChartLine />
                  </div>
                  <div className="summary-info">
                    <h3>{type.name}</h3>
                    <p className="summary-value">{type.days} Days</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Charts */}
            <div className="stats-grid-modern">
              <motion.div variants={itemVariants} className="stat-card wide-card">
                <div className="card-header">
                  <h3>
                    <FaChartLine /> Monthly Leave Trends
                  </h3>
                  <div className="card-badge">This Year</div>
                </div>
                <div className="chart-container">
                  {hasMonthlyData ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={statsData.charts.monthlyLeaveTrends}>
                        <defs>
                          <linearGradient id="colorDays" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="#94A3B8" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94A3B8" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.2)", strokeWidth: 1 }} />
                        <Area type="monotone" dataKey="days" stroke="#60A5FA" strokeWidth={3} fillOpacity={1} fill="url(#colorDays)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: '#64748b', flexDirection: 'column', gap: '10px' }}>
                      <FaChartLine size={48} opacity={0.2} />
                      <span style={{ fontStyle: 'italic' }}>No leave trends available for this year</span>
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="stat-card">
                <div className="card-header">
                  <h3>
                    <FaBuilding /> Leaves By Department
                  </h3>
                </div>
                <div className="chart-container">
                  {hasDeptData ? (
                    <>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={statsData.charts.leavesByDepartment}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            nameKey="name"
                            stroke="none"
                          >
                            {statsData.charts.leavesByDepartment.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="chart-legend-custom">
                        {statsData.charts.leavesByDepartment.map((entry, index) => (
                          <div key={index} className="legend-item">
                            <span className="dot" style={{ background: COLORS[index % COLORS.length] }}></span>
                            <span title={entry.name}>{entry.name}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '250px', color: '#64748b', flexDirection: 'column', gap: '10px' }}>
                      <FaBuilding size={48} opacity={0.2} />
                      <span style={{ fontStyle: 'italic' }}>No department data available</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Table */}
            <motion.div variants={itemVariants} className="list-view-container mt-4">
              <div className="card-header mb-3">
                <h3>Recent Approved Leaves</h3>
              </div>
              <div className="table-responsive">
                <table className="swap-table">
                  <thead>
                    <tr>
                      <th>Employee Name</th>
                      <th>Department</th>
                      <th>Leave Type</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statsData.recentLeaves.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center">No recent leaves.</td>
                      </tr>
                    ) : (
                      statsData.recentLeaves.map((leave) => (
                        <tr key={leave.id}>
                          <td>{leave.first_name} {leave.last_name}</td>
                          <td>{leave.department_name || "-"}</td>
                          <td>
                            <span className="badge-shift" style={{ backgroundColor: "#3b82f6", color: "white" }}>
                              {leave.leave_type}
                            </span>
                          </td>
                          <td>{new Date(leave.start_date).toLocaleDateString()}</td>
                          <td>{new Date(leave.end_date).toLocaleDateString()}</td>
                          <td style={{ maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={leave.reason}>
                            {leave.reason || "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </HRLayout>
  );
};

export default LeaveStaticPage;
