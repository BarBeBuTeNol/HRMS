import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import api from "../../../services/api"; // Assuming api is configured globally or I'll use direct path
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
} from "react-icons/fa";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

const Show_static_switch = () => {
  const [activeTab, setActiveTab] = useState("stats"); // 'stats' or 'list'
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    topSwappers: [],
    topHelpers: [],
    deptHeatmap: [],
    swapVolume: [],
  });
  const [swapsList, setSwapsList] = useState([]);
  const [filters, setFilters] = useState({
    range: "month", // today, week, month
    department_id: "",
  });

  // Fetch Data
  useEffect(() => {
    fetchStats();
    fetchSwaps();
  }, []); // Initial load

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
      // Update local state to show verified
      setSwapsList((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, hr_acknowledged: 1, status: "Verified" }
            : item,
        ),
      );
      alert("Swap acknowledged successfully.");
    } catch (err) {
      alert("Failed to verify swap.");
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

  return (
    <HRLayout>
      <div className="static-wrapper">
        <div className="page-header">
          <div>
            <h1 className="page-header-title">Shift Swap Analytics</h1>
            <p className="page-subtitle">
              Monitor and verify shift exchange activities.
            </p>
          </div>
          <div className="tab-switcher">
            <button
              className={`tab-btn ${activeTab === "stats" ? "active" : ""}`}
              onClick={() => setActiveTab("stats")}
            >
              Statistics
            </button>
            <button
              className={`tab-btn ${activeTab === "list" ? "active" : ""}`}
              onClick={() => setActiveTab("list")}
            >
              Recent Swaps
            </button>
          </div>
        </div>

        <div className="content-area">
          <AnimatePresence mode="wait">
            {activeTab === "stats" ? (
              <motion.div
                key="stats"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="stats-grid"
              >
                {/* Top Row: Volume & Heatmap */}
                <div className="stat-card large-card">
                  <h3>
                    <FaExchangeAlt /> Swap Volume Trend
                  </h3>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={statsData.swapVolume}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="month" stroke="#ccc" />
                        <YAxis stroke="#ccc" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#333",
                            border: "none",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#00C49F"
                          strokeWidth={3}
                          dot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="stat-card">
                  <h3>
                    <FaBuilding /> Department Heatmap
                  </h3>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={statsData.deptHeatmap}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="count"
                          nameKey="department_name"
                          label
                        >
                          {statsData.deptHeatmap.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Bottom Row: Top Swappers & Helpers */}
                <div className="stat-card">
                  <h3>
                    <FaUserClock /> Top 5 Requestors
                  </h3>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart layout="vertical" data={statsData.topSwappers}>
                        <XAxis type="number" hide />
                        <YAxis
                          dataKey="name"
                          type="category"
                          width={100}
                          stroke="#ccc"
                          fontSize={12}
                        />
                        <Tooltip
                          cursor={{ fill: "transparent" }}
                          contentStyle={{ backgroundColor: "#333" }}
                        />
                        <Bar
                          dataKey="count"
                          fill="#FF8042"
                          radius={[0, 10, 10, 0]}
                          barSize={20}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="stat-card">
                  <h3>
                    <FaUserClock /> Top 5 Helpers
                  </h3>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart layout="vertical" data={statsData.topHelpers}>
                        <XAxis type="number" hide />
                        <YAxis
                          dataKey="name"
                          type="category"
                          width={100}
                          stroke="#ccc"
                          fontSize={12}
                        />
                        <Tooltip
                          cursor={{ fill: "transparent" }}
                          contentStyle={{ backgroundColor: "#333" }}
                        />
                        <Bar
                          dataKey="count"
                          fill="#0088FE"
                          radius={[0, 10, 10, 0]}
                          barSize={20}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
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
                    {/* Add Department Filter if dept list is available, skipping for now to keep simple or can hardcode common ones */}
                  </div>
                  <button className="export-btn" onClick={exportToExcel}>
                    <FaFileExport /> Export Report
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="swap-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Requester</th>
                        <th>Substitute</th>
                        <th>Shift</th>
                        <th>Department</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="8" style={{ textAlign: "center" }}>
                            Loading...
                          </td>
                        </tr>
                      ) : swapsList.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ textAlign: "center" }}>
                            No records found.
                          </td>
                        </tr>
                      ) : (
                        swapsList.map((swap) => (
                          <tr key={swap.id}>
                            <td>
                              {new Date(swap.shift_date).toLocaleDateString()}
                            </td>
                            <td>
                              <div className="user-info">
                                <span className="name">
                                  {swap.leave_emp_first} {swap.leave_emp_last}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="user-info">
                                <span className="name highlight">
                                  {swap.delegate_emp_first}{" "}
                                  {swap.delegate_emp_last}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span
                                className={`badge shift-${swap.shift_type}`}
                              >
                                {swap.shift_type}
                              </span>
                            </td>
                            <td>{swap.department_name || "-"}</td>
                            <td className="reason-col" title={swap.reason}>
                              {swap.reason || "N/A"}
                            </td>
                            <td>
                              <span
                                className={`status-badge ${
                                  swap.status === "Approved"
                                    ? "success"
                                    : "pending"
                                }`}
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
                                  className="verify-btn"
                                  onClick={() => handleVerify(swap.id)}
                                >
                                  Acknowledge
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
      </div>
    </HRLayout>
  );
};

export default Show_static_switch;
