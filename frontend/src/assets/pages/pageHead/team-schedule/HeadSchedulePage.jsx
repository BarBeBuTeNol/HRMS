import React, { useState, useEffect } from "react";
import "./HeadSchedulePage.css";
import HeadSidebar from "../../../Component/Head/HeadSidebar";
import axios from "axios";
import {
  FaChevronLeft,
  FaChevronRight,
  FaExchangeAlt,
  FaFilter,
  FaCalendarAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { motion } from "framer-motion";

dayjs.extend(isBetween);

const HeadSchedulePage = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [viewMode, setViewMode] = useState("month"); // 'week' | 'month'

  const [employees, setEmployees] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedPosition, setSelectedPosition] = useState("All");
  const [positions, setPositions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Quick Add Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null); // { empId, dateStr, empName }

  // Get Current User (Head)
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const headId = currentUser.id;

  // --- Fetch Data ---
  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Employees
      const empRes = await axios.get(
        `http://localhost:5000/api/head/employees/${headId}`
      );
      setEmployees(empRes.data);
      const myTeam = empRes.data;
      const teamMmbersIds = myTeam.map((m) => m.id);

      // Extract unique positions
      const uniquePositions = [
        ...new Set(myTeam.map((e) => e.position_name).filter(Boolean)),
      ];
      setPositions(uniquePositions);

      // 2. Schedules
      const schedRes = await axios.get(
        "http://localhost:5000/api/work-schedules"
      );
      // Filter for team and ensure unique per day/user if needed (DB handles duplicates usually)
      const teamSchedules = schedRes.data.filter((s) =>
        teamMmbersIds.includes(s.user_id)
      );
      setSchedules(teamSchedules);

      // 3. Leaves
      const leaveRes = await axios.get(
        "http://localhost:5000/api/leave-requests/all"
      );
      const approvedLeaves = leaveRes.data.filter(
        (l) => teamMmbersIds.includes(l.user_id) && l.status === "Approved"
      );
      setLeaves(approvedLeaves);

      // 4. Holidays
      const holidayRes = await axios.get("http://localhost:5000/api/calendar");
      setHolidays(holidayRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Actions ---
  const handleCellClick = (emp, dateObj, currentCellData) => {
    // If cell is empty or has a shift, allow editing/adding.
    // If leave, maybe show details? For now, if empty -> Add.
    if (currentCellData.type === "empty" || currentCellData.type === "shift") {
      setSelectedCell({
        empId: emp.id,
        empName: `${emp.first_name} ${emp.last_name}`,
        dateStr: dateObj.format("YYYY-MM-DD"),
        currentShift:
          currentCellData.type === "shift" ? currentCellData.label : "",
      });
      setShowAddModal(true);
    }
  };

  const saveShift = async (shiftType) => {
    if (!selectedCell) return;
    try {
      const payload = [
        {
          user_id: selectedCell.empId,
          date: selectedCell.dateStr,
          shift: shiftType,
        },
      ];

      await axios.post(
        "http://localhost:5000/api/work-schedules/bulk-upsert",
        payload
      );

      // Refresh local state without full refetch for speed (optimistic) OR just refetch
      fetchData();
      setShowAddModal(false);
    } catch (err) {
      console.error("Failed to save shift", err);
      alert("Failed to save shift");
    }
  };

  // --- Matrix Logic ---
  const getDateRange = () => {
    const dates = [];
    const start =
      viewMode === "month"
        ? currentDate.startOf("month")
        : currentDate.startOf("week");
    const end =
      viewMode === "month"
        ? currentDate.endOf("month")
        : currentDate.endOf("week");

    let curr = start;
    while (curr.isBefore(end) || curr.isSame(end, "day")) {
      dates.push(curr);
      curr = curr.add(1, "day");
    }
    return dates;
  };

  const dates = getDateRange();

  // Filter Employees
  const filteredEmployees = employees.filter((e) => {
    const matchPos =
      selectedPosition === "All" || e.position_name === selectedPosition;
    const term = searchQuery.toLowerCase();
    const matchSearch =
      e.first_name.toLowerCase().includes(term) ||
      e.last_name.toLowerCase().includes(term);
    return matchPos && matchSearch;
  });

  // Cell Content Logic
  const getCellData = (empId, dateObj) => {
    const dateStr = dateObj.format("YYYY-MM-DD");

    const onLeave = leaves.find((l) => {
      const start = dayjs(l.start_date);
      const end = dayjs(l.end_date);
      return l.user_id === empId && dateObj.isBetween(start, end, "day", "[]");
    });
    if (onLeave)
      return {
        type: "leave",
        label: "On Leave",
        detail: `On Leave: ${onLeave.leave_type}`,
      };

    const shift = schedules.find(
      (s) =>
        s.user_id === empId && dayjs(s.date).format("YYYY-MM-DD") === dateStr
    );
    if (shift) {
      let time = "";
      if (shift.shift === "M") time = "08:00 - 16:00";
      if (shift.shift === "A") time = "16:00 - 00:00";
      if (shift.shift === "N") time = "00:00 - 08:00";
      return {
        type: "shift",
        label: shift.shift,
        detail: `Shift ${shift.shift}: ${time}`,
      };
    }

    const isHoliday = holidays.find(
      (h) => dayjs(h.date).format("YYYY-MM-DD") === dateStr
    );
    if (isHoliday)
      return {
        type: "holiday",
        label: "H",
        detail: `Holiday: ${isHoliday.title}`,
      };

    return { type: "empty", label: "OFF", detail: "Click to Assign Shift" };
  };

  // Navigation
  // ... (handlePrev, handleNext already defined in logic above, if not, re-declare)
  const handlePrev = () => {
    setCurrentDate((prev) =>
      viewMode === "month"
        ? prev.subtract(1, "month")
        : prev.subtract(1, "week")
    );
  };
  const handleNext = () => {
    setCurrentDate((prev) =>
      viewMode === "month" ? prev.add(1, "month") : prev.add(1, "week")
    );
  };

  return (
    <div className="head-schedule-layout">
      {/* Sidebar Wrapper */}
      <div className="head-sidebar-wrapper">
        <HeadSidebar />
      </div>

      <div className="head-schedule-content">
        {/* Header Controls */}
        <header className="hs-matrix-header">
          <div className="hs-header-left">
            <h1 className="hs-title">Team Schedule</h1>
            <p className="hs-subtitle">Manage and view team shifts</p>
          </div>

          <div className="hs-header-controls">
            {/* Search */}
            <div className="hs-filter-wrapper search">
              <input
                type="text"
                placeholder="Search employee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="hs-search-input"
              />
            </div>

            {/* Position Filter */}
            <div className="hs-filter-wrapper">
              <FaFilter className="hs-filter-icon" />
              <select
                className="hs-select"
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
              >
                <option value="All">All Positions</option>
                {positions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode */}
            <div className="hs-view-toggle">
              <button
                className={viewMode === "week" ? "active" : ""}
                onClick={() => setViewMode("week")}
              >
                Week
              </button>
              <button
                className={viewMode === "month" ? "active" : ""}
                onClick={() => setViewMode("month")}
              >
                Month
              </button>
            </div>

            {/* Date Nav */}
            <div className="hs-date-nav">
              <button onClick={handlePrev}>
                <FaChevronLeft />
              </button>
              <span>
                {viewMode === "month"
                  ? currentDate.format("MMMM YYYY")
                  : `${dates[0].format("D MMM")} - ${dates[
                      dates.length - 1
                    ].format("D MMM YYYY")}`}
              </span>
              <button onClick={handleNext}>
                <FaChevronRight />
              </button>
            </div>

            <div className="hs-legend">
              <div className="hs-legend-item">
                <span className="hs-dot m"></span> M
              </div>
              <div className="hs-legend-item">
                <span className="hs-dot a"></span> A
              </div>
              <div className="hs-legend-item">
                <span className="hs-dot n"></span> N
              </div>
              <div className="hs-legend-item">
                <span className="hs-dot l"></span> Leave
              </div>
              <div className="hs-legend-item">
                <span className="hs-dot h"></span> Holiday
              </div>
            </div>

            <button
              className="hs-btn-gold"
              onClick={() => navigate("/head/delegate-shift")}
            >
              <FaExchangeAlt /> Delegate
            </button>
          </div>
        </header>

        {/* Matrix Table */}
        <div className="hs-matrix-container">
          <div className="hs-table-wrapper">
            <table className="hs-matrix-table">
              <thead>
                <tr>
                  <th className="hs-sticky-col-header">Employee</th>
                  {dates.map((date) => {
                    const isHoliday = holidays.find((h) =>
                      dayjs(h.date).isSame(date, "day")
                    );
                    const isToday = date.isSame(dayjs(), "day");
                    return (
                      <th
                        key={date.toString()}
                        className={`hs-date-header ${
                          isHoliday ? "is-holiday" : ""
                        } ${
                          date.day() === 0 || date.day() === 6
                            ? "is-weekend"
                            : ""
                        } ${isToday ? "is-today" : ""}`}
                      >
                        <div className="hs-date-num">{date.format("D")}</div>
                        <div className="hs-date-day">{date.format("ddd")}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td className="hs-sticky-col-cell">
                      <div className="hs-emp-cell">
                        <img
                          src={
                            emp.avatar ||
                            `https://ui-avatars.com/api/?name=${emp.first_name}&background=random`
                          }
                          alt="av"
                        />
                        <div>
                          <div className="hs-emp-name">
                            {emp.first_name} {emp.last_name}
                          </div>
                          <div className="hs-emp-pos">{emp.position_name}</div>
                        </div>
                      </div>
                    </td>
                    {dates.map((date) => {
                      const cell = getCellData(emp.id, date);
                      const isToday = date.isSame(dayjs(), "day");
                      return (
                        <td
                          key={date.toString()}
                          className={`hs-cell ${isToday ? "is-today" : ""} ${
                            cell.type === "empty" || cell.type === "shift"
                              ? "is-clickable"
                              : ""
                          }`}
                          onClick={() => handleCellClick(emp, date, cell)}
                        >
                          {cell.type !== "gap" && (
                            <div
                              className={`hs-cell-content type-${cell.type} label-${cell.label}`}
                              title={cell.detail}
                            >
                              {cell.label === "H" ? (
                                <FaCalendarAlt size={12} />
                              ) : (
                                cell.label
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {filteredEmployees.length === 0 && (
                  <tr>
                    <td
                      colSpan={dates.length + 1}
                      style={{
                        textAlign: "center",
                        padding: "2rem",
                        color: "#64748b",
                      }}
                    >
                      No employees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Summary (Sticky Bottom) */}
          <div className="hs-matrix-footer">
            <div className="hs-summary-item">
              Total Staff: {employees.length}
            </div>
            {["M", "A", "N"].map((shift) => {
              // Calc total shifts for visible range? Or just today? Requirement: "Today has...".
              // Let's settle for "Visible Range Average" or just Today if possible.
              // Let's do simple Total count across current view for simplicity or just hide if too complex.
              // User asked for "Today has...". Let's calc Today's stats if Today is in view.
              const todayStr = dayjs().format("YYYY-MM-DD");
              const todayShifts = schedules.filter(
                (s) =>
                  s.shift === shift &&
                  dayjs(s.date).format("YYYY-MM-DD") === todayStr
              ).length;
              return (
                <div key={shift} className="hs-summary-item">
                  Today {shift}: {todayShifts}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Add Modal */}
        {showAddModal && selectedCell && (
          <div
            className="hs-modal-overlay"
            onClick={() => setShowAddModal(false)}
          >
            <div
              className="hs-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Assign Shift</h3>
              <p>
                Assign shift for <strong>{selectedCell.empName}</strong> on{" "}
                {selectedCell.dateStr}
              </p>
              <div className="hs-modal-actions">
                <button
                  className="hs-shift-btn m"
                  onClick={() => saveShift("M")}
                >
                  M (08-16)
                </button>
                <button
                  className="hs-shift-btn a"
                  onClick={() => saveShift("A")}
                >
                  A (16-00)
                </button>
                <button
                  className="hs-shift-btn n"
                  onClick={() => saveShift("N")}
                >
                  N (00-08)
                </button>
                <button
                  className="hs-shift-btn off"
                  onClick={() => saveShift("OFF")}
                >
                  OFF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeadSchedulePage;
