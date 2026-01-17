import React, { useState, useEffect } from "react";
import api from "../../../services/api";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import HeadSidebar from "../../../Component/Head/HeadSidebar";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  FaCalendarAlt,
  FaFileDownload,
  FaFilter,
  FaUserInjured,
  FaPlaneDeparture,
  FaBusinessTime,
  FaExclamationTriangle,
  FaTimes,
  FaChartPie,
} from "react-icons/fa";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import "./HeadTeamLeaveHistory.css";

const localizer = momentLocalizer(moment);

const CustomToolbar = (toolbar) => {
  const goToBack = () => {
    toolbar.onNavigate("PREV");
  };

  const goToNext = () => {
    toolbar.onNavigate("NEXT");
  };

  const goToCurrent = () => {
    toolbar.onNavigate("TODAY");
  };

  const goToView = (view) => {
    toolbar.onView(view);
  };

  const label = () => {
    const date = moment(toolbar.date);
    return (
      <span className="calendar-header-label">{date.format("MMMM YYYY")}</span>
    );
  };

  return (
    <div className="rbc-toolbar-custom">
      <div className="rbc-btn-group-nav">
        <button onClick={goToCurrent} className="btn-nav btn-today">
          Today
        </button>
        <button onClick={goToBack} className="btn-nav">
          &lt; Back
        </button>
        <button onClick={goToNext} className="btn-nav">
          Next &gt;
        </button>
      </div>

      <div className="rbc-toolbar-label">{label()}</div>

      <div className="rbc-btn-group-view">
        <button
          onClick={() => goToView("month")}
          className={toolbar.view === "month" ? "active" : ""}
        >
          Month
        </button>
        <button
          onClick={() => goToView("week")}
          className={toolbar.view === "week" ? "active" : ""}
        >
          Week
        </button>
        <button
          onClick={() => goToView("day")}
          className={toolbar.view === "day" ? "active" : ""}
        >
          Day
        </button>
        <button
          onClick={() => goToView("agenda")}
          className={toolbar.view === "agenda" ? "active" : ""}
        >
          Agenda
        </button>
      </div>
    </div>
  );
};

const HeadTeamLeaveHistory = () => {
  const [events, setEvents] = useState([]);
  const [teamStats, setTeamStats] = useState({
    totalLeavesThisMonth: 0,
    topLeaveType: "N/A",
    topAbsentee: { name: "N/A", count: 0 },
    pendingRequests: 0,
  });
  const [upcomingLeaves, setUpcomingLeaves] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pieData, setPieData] = useState([]);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          console.error("No userId found in localStorage");
          return;
        }

        const response = await api.get(`/leave-history/department/${userId}`);
        const data = response.data;

        // 1. Transform to Calendar Events
        const formattedEvents = data.map((item) => ({
          id: item.id,
          title: `${item.employeeName} (${item.leaveType})`,
          start: new Date(item.startDate),
          end: new Date(item.endDate),
          type: item.leaveType,
          user: item.employeeName,
          status: item.status,
          profile:
            item.profile_pic ||
            `https://ui-avatars.com/api/?name=${item.employeeName}&background=random`,
          reason: item.reason,
          employeeId: item.employeeId,
        }));
        setEvents(formattedEvents);

        // 2. Calculate Statistics
        calculateStats(formattedEvents);
      } catch (error) {
        console.error("Error fetching team leave history:", error);
      }
    };

    fetchData();
  }, []);

  const calculateStats = (leaves) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let thisMonthCount = 0;
    let pendingCount = 0;
    const typeCounts = {};
    const absenteeCounts = {};
    const upcoming = [];

    leaves.forEach((leave) => {
      // Leaves this month
      if (
        leave.start.getMonth() === currentMonth &&
        leave.start.getFullYear() === currentYear
      ) {
        thisMonthCount++;
      }

      // Pending requests
      if (leave.status === "Pending") {
        pendingCount++;
      }

      // Top Leave Type
      typeCounts[leave.type] = (typeCounts[leave.type] || 0) + 1;

      // Top Absentee (Approved only usually, but taking all for now or check status)
      if (leave.status === "Approved") {
        absenteeCounts[leave.user] = (absenteeCounts[leave.user] || 0) + 1;
      }

      // Upcoming Leaves (Next 7 Days)
      const diffTime = leave.start - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 7) {
        upcoming.push(leave);
      }
    });

    // Determine Top stats
    const topType = Object.keys(typeCounts).reduce(
      (a, b) => (typeCounts[a] > typeCounts[b] ? a : b),
      "N/A",
    );
    const topTypeCount = typeCounts[topType] || 0;
    const totalLeavesForTypeCalc = leaves.length || 1;
    const topTypePct = ((topTypeCount / totalLeavesForTypeCalc) * 100).toFixed(
      0,
    );

    const topAbsenteeName = Object.keys(absenteeCounts).reduce(
      (a, b) => (absenteeCounts[a] > absenteeCounts[b] ? a : b),
      "N/A",
    );

    setTeamStats({
      totalLeavesThisMonth: thisMonthCount,
      topLeaveType: topType !== "N/A" ? `${topType} (${topTypePct}%)` : "N/A",
      topAbsentee: {
        name: topAbsenteeName,
        count: absenteeCounts[topAbsenteeName] || 0,
      },
      pendingRequests: pendingCount,
    });

    setUpcomingLeaves(upcoming);

    // Prepare Pie Chart Data
    const pData = Object.keys(typeCounts).map((key, index) => ({
      name: key,
      value: typeCounts[key],
      color: ["#ef4444", "#10b981", "#f59e0b", "#64748b", "#8b5cf6"][index % 5],
    }));
    setPieData(pData);
  };

  // --- Handlers ---
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(
      events.map((e) => ({
        Employee: e.user,
        Type: e.type,
        StartDate: moment(e.start).format("YYYY-MM-DD"),
        EndDate: moment(e.end).format("YYYY-MM-DD"),
        Status: e.status,
      })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Team Leaves");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(data, "Team_Leave_History.xlsx");
  };

  // --- Custom Style for Calendar Events ---
  const eventStyleGetter = (event) => {
    let backgroundColor = "#3b82f6"; // default blue
    if (event.type === "Sick Leave") backgroundColor = "#ef4444"; // red
    if (event.type === "Vacation") backgroundColor = "#10b981"; // green
    if (event.type === "Personal Leave") backgroundColor = "#f59e0b"; // orange

    return {
      style: {
        backgroundColor,
        borderRadius: "6px",
        opacity: 0.9,
        color: "#fff",
        border: "none",
        display: "block",
      },
    };
  };

  // --- Charts Data ---
  // Pie content is now dynamic from state

  return (
    <div className="head-leave-history-container">
      <HeadSidebar />

      <div className="head-leave-content">
        {/* Header */}
        <header className="history-header">
          <div className="history-title">
            <h1>Team Leave History</h1>
            <p>Monitor and plan your team's availability effectively.</p>
          </div>
          <div className="header-actions">
            <button className="btn-filter">
              <FaFilter /> Filter Position
            </button>
            <button className="btn-export" onClick={handleExport}>
              <FaFileDownload /> Export Report
            </button>
          </div>
        </header>

        {/* Statistics Grid */}
        <section className="stats-grid">
          <div className="stat-card-glass">
            <div
              className="stat-icon-wrapper"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
              }}
            >
              <FaCalendarAlt />
            </div>
            <div className="stat-content">
              <h3>Leaves This Month</h3>
              <div className="stat-number">
                {teamStats.totalLeavesThisMonth}
              </div>
              <div className="stat-trend">
                <span style={{ color: "#10b981" }}></span>
              </div>
            </div>
            <div className="stat-icon-large">
              <FaCalendarAlt />
            </div>
          </div>

          <div className="stat-card-glass">
            <div
              className="stat-icon-wrapper"
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
              }}
            >
              <FaPlaneDeparture />
            </div>
            <div className="stat-content">
              <h3>Top Leave Type</h3>
              <div className="stat-number" style={{ fontSize: "1.2rem" }}>
                {teamStats.topLeaveType}
              </div>
              <div className="stat-trend"></div>
            </div>
            <div className="stat-icon-large">
              <FaPlaneDeparture />
            </div>
          </div>

          <div className="stat-card-glass">
            <div
              className="stat-icon-wrapper"
              style={{
                background: "linear-gradient(135deg, #ef4444, #b91c1c)",
              }}
            >
              <FaUserInjured />
            </div>
            <div className="stat-content">
              <h3>Top Absentee</h3>
              <div
                className="stat-number"
                style={{
                  fontSize: "1.2rem",
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                }}
              >
                {teamStats.topAbsentee.name}
              </div>
              <div className="stat-trend">
                {teamStats.topAbsentee.count} days this year
              </div>
            </div>
            <div className="stat-icon-large">
              <FaUserInjured />
            </div>
          </div>

          <div className="stat-card-glass">
            <div
              className="stat-icon-wrapper"
              style={{
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
              }}
            >
              <FaExclamationTriangle />
            </div>
            <div className="stat-content">
              <h3>Pending Requests</h3>
              <div className="stat-number">{teamStats.pendingRequests}</div>
              <div className="stat-trend" style={{ color: "#f59e0b" }}>
                Needs Attention
              </div>
            </div>
            <div className="stat-icon-large">
              <FaExclamationTriangle />
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="content-grid">
          {/* Calendar Section */}
          <div className="calendar-section">
            <div style={{ height: "500px" }}>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "100%" }}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={handleSelectEvent}
                components={{
                  toolbar: CustomToolbar,
                }}
              />
            </div>
          </div>

          {/* Sidebar Section */}
          <aside className="side-panel">
            {/* Upcoming Leaves */}
            <div className="panel-card">
              <div className="panel-title">
                <FaCalendarAlt /> Upcoming Leaves (7 Days)
              </div>
              <div className="upcoming-list">
                {upcomingLeaves.length > 0 ? (
                  upcomingLeaves.map((leave) => (
                    <div key={leave.id} className="upcoming-item">
                      <div className="upcoming-date-box">
                        <div className="date-day">
                          {moment(leave.start).format("DD")}
                        </div>
                        <div className="date-month">
                          {moment(leave.start).format("MMM")}
                        </div>
                      </div>
                      <div className="upcoming-info">
                        <h4>{leave.user}</h4>
                        <p>{leave.type}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                    No upcoming leaves.
                  </p>
                )}
              </div>
            </div>

            {/* Leave Distribution Chart */}
            <div className="panel-card">
              <div className="panel-title">
                <FaChartPie /> Leave Distribution
              </div>
              <div style={{ height: "220px", width: "100%" }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#1e293b",
                        border: "none",
                        borderRadius: "8px",
                      }}
                      itemStyle={{ color: "#fff" }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Modal Detail */}
      {isModalOpen && selectedEvent && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={handleCloseModal}>
              <FaTimes />
            </button>

            <div className="modal-header-profile">
              <img
                src={selectedEvent.profile}
                alt={selectedEvent.user}
                className="modal-avatar-lg"
              />
              <h2>{selectedEvent.user}</h2>
              <p style={{ color: "#94a3b8" }}>Software Developer</p>
            </div>

            <div className="modal-stats-row">
              <div className="modal-stat-item">
                <span className="modal-stat-value">12</span>
                <span className="modal-stat-label">Total Leaves YTD</span>
              </div>
              <div className="modal-stat-item">
                <span className="modal-stat-value">5</span>
                <span className="modal-stat-label">Sick Leave</span>
              </div>
              <div className="modal-stat-item">
                <span className="modal-stat-value">8</span>
                <span className="modal-stat-label">Remaining Days</span>
              </div>
            </div>

            <h3 style={{ fontSize: "1rem", marginBottom: "1rem" }}>
              Current Request Details
            </h3>
            <div className="leave-history-list">
              <div className="history-row">
                <span className="history-type">Leave Type</span>
                <span className="history-date" style={{ color: "#fff" }}>
                  {selectedEvent.type}
                </span>
              </div>
              <div className="history-row">
                <span className="history-type">Duration</span>
                <span className="history-date" style={{ color: "#fff" }}>
                  {moment(selectedEvent.start).format("MMM DD")} -{" "}
                  {moment(selectedEvent.end).format("MMM DD, YYYY")}
                </span>
              </div>
              <div className="history-row">
                <span className="history-type">Status</span>
                <span
                  className="history-date"
                  style={{
                    color:
                      selectedEvent.status === "Approved"
                        ? "#10b981"
                        : "#f59e0b",
                    fontWeight: "bold",
                  }}
                >
                  {selectedEvent.status}
                </span>
              </div>
              <div className="history-row" style={{ borderBottom: "none" }}>
                <span className="history-type">Reason</span>
                <span className="history-date" style={{ color: "#fff" }}>
                  Medical appointment and follow-up.
                </span>
              </div>
            </div>

            <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
              <button
                className="btn-export"
                style={{ width: "100%" }}
                onClick={handleCloseModal}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeadTeamLeaveHistory;
