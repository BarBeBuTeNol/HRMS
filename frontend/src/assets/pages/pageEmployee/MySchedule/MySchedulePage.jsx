// src/pages/pageEmployee/MySchedulePage.jsx
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Briefcase,
  Clock,
  Coffee,
  X,
  MapPin,
} from "lucide-react";
import api from "../../../../services/api";
import EmployeeSidebar from "../../../Component/Employee/EmployeeSidebar";
import "./MySchedulePage.css"; // Import the new CSS

const MySchedulePage = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [schedule, setSchedule] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null); // For Modal

  // --- Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch User Shift Schedule
        const userStr = localStorage.getItem("currentUser");
        if (userStr) {
          const user = JSON.parse(userStr);
          const userId = user.id;
          const scheduleRes = await api.get(`/work-schedules/user/${userId}`);
          setSchedule(scheduleRes.data);
        }
      } catch (error) {
        console.error("Failed to fetch schedule data", error);
      }
    };
    fetchData();
  }, [currentDate]);

  const daysInMonth = currentDate.daysInMonth();
  const firstDayOfMonth = currentDate.startOf("month").day();

  const generateCalendarDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ type: "empty", key: `empty-${i}` });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = currentDate.date(i).format("YYYY-MM-DD");

      // Find User Shift
      const dayShift = schedule.find(
        (s) => dayjs(s.date).format("YYYY-MM-DD") === dateStr
      );

      const dayOfWeek = currentDate.date(i).day();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sun=0, Sat=6
      const isToday = dayjs().format("YYYY-MM-DD") === dateStr;

      days.push({
        type: "day",
        day: i,
        date: dateStr,
        shift: dayShift,
        isWeekend,
        isToday,
        key: `day-${i}`,
      });
    }
    return days;
  };

  const handlePrevMonth = () =>
    setCurrentDate(currentDate.subtract(1, "month"));
  const handleNextMonth = () => setCurrentDate(currentDate.add(1, "month"));
  const handleToday = () => setCurrentDate(dayjs());

  const handleEventClick = (eventData, type) => {
    setSelectedEvent({ ...eventData, dataType: type });
  };

  const handleDayClick = (item) => {
    // If there's a shift or event, we might want to show details even if not specifically clicking the event pill
    // But usually clicking the cell is for creating new events (admin) or just viewing summary.
    // For now keeping existing logic: Weekend click trigger.
    if (item.isWeekend) {
      setSelectedEvent({
        title: "Weekend",
        date: item.date,
        dataType: "event",
        description: "Relax! It's the weekend.",
      });
    }
  };

  return (
    <div className="ec-layout">
      <EmployeeSidebar />
      <div className="ec-content-area">
        <div className="ec-container">
          {/* Header */}
          <div className="ec-header">
            <div className="ec-title-group">
              <div className="ec-icon-wrapper">
                <CalendarIcon size={28} color="#818cf8" strokeWidth={1.5} />
              </div>
              <div className="ec-title-text">
                <span className="ec-subtitle">My Work Schedule</span>
                <span className="ec-main-title">
                  {currentDate.format("MMMM YYYY")}
                </span>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="ec-nav">
              <button onClick={handlePrevMonth} className="ec-nav-btn">
                <ChevronLeft size={20} />
              </button>
              <button onClick={handleToday} className="ec-nav-today-btn">
                Today
              </button>
              <button onClick={handleNextMonth} className="ec-nav-btn">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="ec-week-header">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="ec-day-name">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <motion.div
            className="ec-grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            key={currentDate.format("YYYY-MM")}
          >
            {generateCalendarDays().map((item) =>
              item.type === "empty" ? (
                <div key={item.key} style={{ background: "transparent" }}></div>
              ) : (
                <div
                  key={item.key}
                  onClick={() => handleDayClick(item)}
                  className={`ec-day-cell ${item.isToday ? "today" : "default"} 
                    ${item.isWeekend ? "holiday-mode" : ""}`}
                >
                  {/* Date Number */}
                  <div
                    className={`ec-date-number ${
                      item.isToday ? "today" : "default"
                    }`}
                  >
                    {item.day}
                  </div>

                  {/* Events List (Desktop) */}
                  <div className="ec-events-list">
                    {/* Personal Shift */}
                    {item.shift && (
                      <motion.div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(item.shift, "shift");
                        }}
                        whileHover={{ scale: 1.02 }}
                        className={`ec-event-item ${
                          item.shift.shift === "Day Off"
                            ? "ec-shift-off"
                            : "ec-shift-work"
                        }`}
                      >
                        {item.shift.shift === "Day Off" ? (
                          <Coffee size={14} />
                        ) : (
                          <Clock size={14} />
                        )}
                        <span className="ec-event-text">
                          {item.shift.shift}
                        </span>
                      </motion.div>
                    )}
                  </div>

                  {/* Mobile Dots (Hidden on Desktop) */}
                  <div className="ec-mobile-dots">
                    {item.shift && (
                      <div
                        className="ec-dot"
                        style={{
                          background:
                            item.shift.shift === "Day Off"
                              ? "#fca5a5"
                              : "#6ee7b7",
                        }}
                      />
                    )}
                  </div>
                </div>
              )
            )}
          </motion.div>

          {/* Details Modal */}
          <AnimatePresence>
            {selectedEvent && (
              <motion.div
                className="ec-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedEvent(null)}
              >
                <motion.div
                  className={`ec-modal ${
                    selectedEvent.type === "holiday" ? "holiday" : ""
                  }`}
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="ec-modal-header">
                    <div
                      className="ec-modal-icon-box"
                      style={{
                        background:
                          selectedEvent.dataType === "shift"
                            ? selectedEvent.shift === "Day Off"
                              ? "rgba(239, 68, 68, 0.2)"
                              : "rgba(16, 185, 129, 0.2)"
                            : "rgba(59, 130, 246, 0.2)",
                        color:
                          selectedEvent.dataType === "shift"
                            ? selectedEvent.shift === "Day Off"
                              ? "#fca5a5"
                              : "#6ee7b7"
                            : "#93c5fd",
                      }}
                    >
                      {selectedEvent.dataType === "shift" ? (
                        <Clock size={24} />
                      ) : (
                        <CalendarIcon size={24} />
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="ec-modal-close-btn"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <h2
                    className={`ec-modal-title ${
                      selectedEvent.type === "holiday" ? "red" : ""
                    }`}
                  >
                    {selectedEvent.dataType === "shift"
                      ? selectedEvent.shift
                      : selectedEvent.title || selectedEvent.event_name}
                  </h2>

                  <p className="ec-modal-date">
                    {dayjs(selectedEvent.date).format("dddd, D MMMM YYYY")}
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {selectedEvent.dataType === "shift" && (
                      <div
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          padding: "16px",
                          borderRadius: "12px",
                          display: "flex",
                          gap: "12px",
                          alignItems: "center",
                        }}
                      >
                        <MapPin size={20} color="rgba(255,255,255,0.5)" />
                        <div>
                          <h4 className="ec-info-label">Location</h4>
                          <p className="ec-info-value">Head Office, Floor 3</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MySchedulePage;
