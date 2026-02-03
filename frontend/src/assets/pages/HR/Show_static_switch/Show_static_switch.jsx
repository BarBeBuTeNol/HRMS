import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  BarChart,
  Bar,
} from "recharts";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import api from "../../../../services/api";
import HRLayout from "../../../Component/HR/HRLayout";
import "./Show_static_switch.css";

// --- Icons ---
import {
  FaFileExport,
  FaCheckDouble,
  FaFilter,
  FaExchangeAlt,
  FaUserClock,
  FaBuilding,
  FaChartLine,
  FaHourglassHalf,
  FaCheckCircle,
  FaTrophy,
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

const Show_static_switch = () => {
  const [activeTab, setActiveTab] = useState("stats");
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    topSwappers: [],
    topHelpers: [],
    deptHeatmap: [],
    swapVolume: [],
  });
  const [swapsList, setSwapsList] = useState([]);
  const [filters, setFilters] = useState({
    range: "month",
  });

  // Calculate Summary Metrics
  const summaryMetrics = useMemo(() => {
    const totalSwaps = statsData.swapVolume.reduce(
      (acc, curr) => acc + curr.count,
      0,
    );
    const approvedCount = swapsList.filter(
      (s) => s.status === "Approved",
    ).length;
    const pendingCount = swapsList.filter((s) => s.status === "Pending").length;

    // Find top dept
    let topDeptName = "-";
    if (statsData.deptHeatmap.length > 0) {
      const topDept = [...statsData.deptHeatmap].sort(
        (a, b) => b.count - a.count,
      )[0];
      topDeptName = topDept.department_name;
    }

    return {
      total: totalSwaps,
      approved: approvedCount,
      pending: pendingCount,
      topDept: topDeptName,
    };
  }, [statsData, swapsList]);

  useEffect(() => {
    fetchStats();
    fetchSwaps();
  }, []);

  useEffect(() => {
    fetchSwaps();
  }, [filters]);

  const fetchStats = async () => {
    try {
      const res = await api.get("/reports/swaps/stats");
      setStatsData(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchSwaps = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await api.get(`/reports/swaps?${query}`);
      setSwapsList(res.data);
    } catch (err) {
      console.error("Error fetching swaps:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      await api.post(`/reports/swaps/${id}/verify`);
      setSwapsList((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, hr_acknowledged: 1, status: "Verified" }
            : item,
        ),
      );
      // Small customized toast could go here
    } catch (err) {
      console.error("Failed to verify", err);
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(swapsList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SwapReport");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(
      data,
      `Shift_Swap_Report_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
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

  return (
    <HRLayout>
      <div className="static-wrapper">
        <div className="page-header">
          <div>
            <h1 className="page-header-title">Shift Swap Analytics</h1>
            <p className="page-subtitle">
              Real-time insights on verify activities.
            </p>
          </div>
          <div className="header-actions">
            <div className="tab-switcher-modern">
              <button
                className={`tab-btn-modern ${activeTab === "stats" ? "active" : ""}`}
                onClick={() => setActiveTab("stats")}
              >
                <FaChartLine /> Dashboard
              </button>
              <button
                className={`tab-btn-modern ${activeTab === "list" ? "active" : ""}`}
                onClick={() => setActiveTab("list")}
              >
                <FaExchangeAlt /> Recent Swaps
              </button>
            </div>
          </div>
        </div>

        {/* Summary Widgets - Always Visible or only on Dashboard? Let's keep distinct */}
        <AnimatePresence mode="wait">
          {activeTab === "stats" ? (
            <motion.div
              key="stats"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              className="dashboard-container"
            >
              {/* Summary Row */}
              <div className="summary-row">
                <motion.div
                  variants={itemVariants}
                  className="summary-card card-blue"
                >
                  <div className="icon-wrapper">
                    <FaExchangeAlt />
                  </div>
                  <div className="summary-info">
                    <h3>Total Volume</h3>
                    <p className="summary-value">{summaryMetrics.total}</p>
                  </div>
                </motion.div>
                <motion.div
                  variants={itemVariants}
                  className="summary-card card-green"
                >
                  <div className="icon-wrapper">
                    <FaCheckCircle />
                  </div>
                  <div className="summary-info">
                    <h3>Approved</h3>
                    <p className="summary-value">{summaryMetrics.approved}</p>
                  </div>
                </motion.div>
                <motion.div
                  variants={itemVariants}
                  className="summary-card card-yellow"
                >
                  <div className="icon-wrapper">
                    <FaHourglassHalf />
                  </div>
                  <div className="summary-info">
                    <h3>Pending</h3>
                    <p className="summary-value">{summaryMetrics.pending}</p>
                  </div>
                </motion.div>
                <motion.div
                  variants={itemVariants}
                  className="summary-card card-purple"
                >
                  <div className="icon-wrapper">
                    <FaTrophy />
                  </div>
                  <div className="summary-info">
                    <h3>Top Dept</h3>
                    <p className="summary-value small-text">
                      {summaryMetrics.topDept}
                    </p>
                  </div>
                </motion.div>
              </div>

              <div className="stats-grid-modern">
                {/* Main Trend Chart */}
                <motion.div
                  variants={itemVariants}
                  className="stat-card wide-card"
                >
                  <div className="card-header">
                    <h3>
                      <FaChartLine /> Application Trend
                    </h3>
                    <div className="card-badge">Monthly</div>
                  </div>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={statsData.swapVolume}>
                        <defs>
                          <linearGradient
                            id="colorCount"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#60A5FA"
                              stopOpacity={0.4}
                            />
                            <stop
                              offset="95%"
                              stopColor="#60A5FA"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.05)"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="month"
                          stroke="#94A3B8"
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#94A3B8"
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          content={<CustomTooltip />}
                          cursor={{
                            stroke: "rgba(255,255,255,0.2)",
                            strokeWidth: 1,
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="#60A5FA"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorCount)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* Heatmap & Top Users */}
                <motion.div variants={itemVariants} className="stat-card">
                  <div className="card-header">
                    <h3>
                      <FaBuilding /> Department Share
                    </h3>
                  </div>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={statsData.deptHeatmap}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="count"
                          nameKey="department_name"
                          stroke="none"
                        >
                          {statsData.deptHeatmap.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="chart-legend-custom">
                      {statsData.deptHeatmap.slice(0, 3).map((entry, index) => (
                        <div key={index} className="legend-item">
                          <span
                            className="dot"
                            style={{
                              background: COLORS[index % COLORS.length],
                            }}
                          ></span>
                          <span>{entry.department_name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="stat-card">
                  <div className="card-header">
                    <h3>
                      <FaUserClock /> Top Requesters
                    </h3>
                  </div>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart
                        layout="vertical"
                        data={statsData.topSwappers}
                        barSize={15}
                      >
                        <XAxis type="number" hide />
                        <YAxis
                          dataKey="name"
                          type="category"
                          width={100}
                          tick={{ fill: "#CBD5E1", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          cursor={{ fill: "rgba(255,255,255,0.05)" }}
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            borderColor: "#334155",
                          }}
                        />
                        <Bar
                          dataKey="count"
                          fill="#F87171"
                          radius={[0, 10, 10, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="stat-card">
                  <div className="card-header">
                    <h3>
                      <FaCheckDouble /> Top Helpers
                    </h3>
                  </div>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart
                        layout="vertical"
                        data={statsData.topHelpers}
                        barSize={15}
                      >
                        <XAxis type="number" hide />
                        <YAxis
                          dataKey="name"
                          type="category"
                          width={100}
                          tick={{ fill: "#CBD5E1", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          cursor={{ fill: "rgba(255,255,255,0.05)" }}
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            borderColor: "#334155",
                          }}
                        />
                        <Bar
                          dataKey="count"
                          fill="#34D399"
                          radius={[0, 10, 10, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="list-view-container"
            >
              <div className="toolbar">
                <div className="filters">
                  <div className="filter-group">
                    <FaFilter />
                    <select
                      value={filters.range}
                      onChange={(e) =>
                        setFilters({ ...filters, range: e.target.value })
                      }
                    >
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="all">All Time</option>
                    </select>
                  </div>
                </div>
                <button className="export-btn" onClick={exportToExcel}>
                  <FaFileExport /> Export Report
                </button>
              </div>
              {/* Table remains largely same but inside polished container */}
              <div className="table-responsive">
                <table className="swap-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Requester</th>
                      <th>Substitute</th>
                      <th>Shift</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="text-center">
                          Loading...
                        </td>
                      </tr>
                    ) : swapsList.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center">
                          No swaps found.
                        </td>
                      </tr>
                    ) : (
                      swapsList.map((swap) => (
                        <tr key={swap.id}>
                          <td>
                            {new Date(swap.shift_date).toLocaleDateString()}
                          </td>
                          <td>
                            <div className="user-cell">
                              <div className="user-initial">
                                {swap.leave_emp_first[0]}
                              </div>
                              <div>
                                {swap.leave_emp_first} {swap.leave_emp_last}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="user-cell">
                              <div className="user-initial alt">
                                {swap.delegate_emp_first[0]}
                              </div>
                              <div>
                                {swap.delegate_emp_first}{" "}
                                {swap.delegate_emp_last}
                              </div>
                            </div>
                          </td>
                          <td>
                            <span
                              className={`badge-shift shift-${swap.shift_type}`}
                            >
                              {swap.shift_type}
                            </span>
                          </td>
                          <td
                            style={{
                              maxWidth: "200px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                            title={swap.reason}
                          >
                            {swap.reason || "-"}
                          </td>
                          <td>
                            <span
                              className={`status-pill ${swap.status.toLowerCase()}`}
                            >
                              {swap.status}
                            </span>
                          </td>
                          <td>
                            {swap.hr_acknowledged ? (
                              <span className="verified-text">
                                <FaCheckDouble /> Verified
                              </span>
                            ) : (
                              <button
                                className="action-btn-verify"
                                onClick={() => handleVerify(swap.id)}
                              >
                                Verify
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </HRLayout>
  );
};

export default Show_static_switch;
