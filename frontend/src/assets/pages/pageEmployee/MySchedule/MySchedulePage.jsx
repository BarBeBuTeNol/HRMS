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
  AlignLeft,
  User,
} from "lucide-react";
import api from "../../../../services/api";
import EmployeeSidebar from "../../../Component/Employee/EmployeeSidebar";
import "../../../Component/calendar/Calendar.css"; // Reuse Exclusive CSS

const MySchedulePage = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [schedule, setSchedule] = useState([]);
  const [companyEvents, setCompanyEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null); // For Modal

  // --- Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Company Events for Everyone
        const calendarRes = await api.get("/calendar");
        setCompanyEvents(calendarRes.data);

        // 2. Fetch User Shift Schedule
        const userStr = localStorage.getItem("currentUser");
        if (userStr) {
          const user = JSON.parse(userStr);
          // Backend route: /api/work-schedules/user/:userId
          // Note: check if 'id' or 'employee_id' is correct based on your auth logic. Usually 'id'.
          const userId = user.id;
          const scheduleRes = await api.get(`/work-schedules/user/${userId}`);
          setSchedule(scheduleRes.data);
        }
      } catch (error) {
        console.error("Failed to fetch calendar/schedule data", error);
      }
    };
    fetchData();
  }, [currentDate]); // Re-fetching on date change isn't strictly necessary if APIs return ALL data, but good if paginated.
  // Provided APIs return ALL data, so empty dependency [] is better, but keeping simple for now.

  const daysInMonth = currentDate.daysInMonth();
  const firstDayOfMonth = currentDate.startOf("month").day();

  const generateCalendarDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ type: "empty", key: `empty-${i}` });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = currentDate.date(i).format("YYYY-MM-DD");

      // Find User Shift (Real Data: work_schedules)
      // Schema: { id, user_id, date: "2024-01-01T00:00.000Z", shift: "Morning..." }
      const dayShift = schedule.find(
        (s) => dayjs(s.date).format("YYYY-MM-DD") === dateStr,
      );

      const dayCompanyEvents = companyEvents.filter((e) => {
        return dayjs(e.date).format("YYYY-MM-DD") === dateStr;
      });

      const dayOfWeek = currentDate.date(i).day();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sun=0, Sat=6
      const hasHoliday = dayCompanyEvents.some((e) => e.type === "holiday");

      days.push({
        type: "day",
        day: i,
        date: dateStr,
        shift: dayShift,
        companyEvents: dayCompanyEvents,
        isWeekend,
        hasHoliday,
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

  // Weekend Click Handler (Simple data obj)
  const handleDayClick = (item) => {
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
    <div
      className="layout-container"
      style={{ height: "100vh", overflow: "hidden" }}
    >
      <EmployeeSidebar />
      <div
        className="content-area"
        style={{
          padding: "10px",
          height: "100vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          className="exclusive-calendar-container"
          style={{ padding: "1rem", minHeight: 0, height: "100%" }}
        >
          {/* Header */}
          <div
            className="exclusive-calendar-header"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem",
              padding: "1rem 2rem",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}
            >
              <div
                style={{
                  padding: "12px",
                  background: "rgba(99, 102, 241, 0.15)",
                  borderRadius: "16px",
                  border: "1px solid rgba(99, 102, 241, 0.25)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 8px 32px rgba(99, 102, 241, 0.15)",
                }}
              >
                <CalendarIcon size={28} color="#818cf8" strokeWidth={1.5} />
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "2px" }}
              >
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: "700",
                    color: "#a5b4fc",
                    textTransform: "uppercase",
                    letterSpacing: "0.25em",
                  }}
                >
                  My Schedule
                </span>
                <span
                  style={{
                    fontSize: "2rem",
                    fontWeight: "800",
                    background:
                      "linear-gradient(135deg, #ffffff 0%, #c7d2fe 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {currentDate.format("MMMM YYYY")}
                </span>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div
              className="exclusive-calendar-nav"
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
                background: "rgba(255, 255, 255, 0.05)",
                padding: "6px",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <button
                onClick={handlePrevMonth}
                className="hover-bg"
                style={{
                  padding: "8px",
                  background: "transparent",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleToday}
                style={{
                  padding: "6px 16px",
                  borderRadius: "10px",
                  background: "rgba(99, 102, 241, 0.2)",
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                  color: "#e0e7ff",
                  cursor: "pointer",
                }}
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="hover-bg"
                style={{
                  padding: "8px",
                  background: "transparent",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div
            className="exclusive-calendar-grid"
            style={{
              marginBottom: "0.5rem",
              gap: "8px",
              flexGrow: 0, // Prevent headers from growing
              height: "auto", // Take only necessary height
              minHeight: "auto",
            }}
          >
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div
                key={d}
                className="exclusive-calendar-day-header"
                style={{
                  padding: "0.8rem",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "12px",
                  fontSize: "0.85rem",
                  marginBottom: 0,
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <motion.div
            className="exclusive-calendar-grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            key={currentDate.format("YYYY-MM")}
            style={{
              gap: "8px",
              flexGrow: 1,
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gridTemplateRows: "repeat(6, 1fr)", // Fixed 6 rows for consistency
            }}
          >
            {generateCalendarDays().map((item) =>
              item.type === "empty" ? (
                <div key={item.key} style={{ background: "transparent" }}></div>
              ) : (
                <div
                  key={item.key}
                  onClick={() => handleDayClick(item)}
                  className={`exclusive-calendar-day ${
                    dayjs().format("YYYY-MM-DD") === item.date ? "today" : ""
                  } ${item.isWeekend || item.hasHoliday ? "holiday-mode" : ""}`}
                  style={{
                    minHeight: "0" /* Allow Flex Shrink */,
                    height: "100%" /* Fill Grid Cell */,
                    background:
                      dayjs().format("YYYY-MM-DD") === item.date
                        ? "rgba(99, 102, 241, 0.15)"
                        : "rgba(30, 30, 46, 0.6)",
                    border:
                      dayjs().format("YYYY-MM-DD") === item.date
                        ? "1px solid #818cf8"
                        : "1px solid rgba(255, 255, 255, 0.05)",
                    padding: "6px", // Reduced padding
                    gap: "4px",
                    borderRadius: "12px", // Slightly tighter radius
                    boxShadow:
                      dayjs().format("YYYY-MM-DD") === item.date
                        ? "0 0 30px rgba(99, 102, 241, 0.1)"
                        : "none",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Date Number */}
                  <div
                    style={{
                      width: "24px", // Smaller circle
                      height: "24px",
                      minHeight: "24px", // Prevent shrinking
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      fontSize: "0.8rem", // Smaller font
                      fontWeight: "bold",
                      alignSelf: "flex-end", // Align to top-right corner
                      background:
                        dayjs().format("YYYY-MM-DD") === item.date
                          ? "#818cf8"
                          : "rgba(255,255,255,0.05)",
                      color:
                        dayjs().format("YYYY-MM-DD") === item.date
                          ? "white"
                          : "rgba(255,255,255,0.4)",
                      marginBottom: "4px",
                    }}
                  >
                    {item.day}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                      overflowY: "auto",
                      scrollbarWidth: "none",
                      flexGrow: 1, // Fill remaining space
                    }}
                  >
                    {/* Personal Shift */}
                    {item.shift && (
                      <motion.div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(item.shift, "shift");
                        }}
                        whileHover={{ scale: 1.02 }}
                        style={{
                          padding: "6px 10px", // Increased padding
                          borderRadius: "6px",
                          background:
                            item.shift.shift === "Day Off"
                              ? "rgba(239, 68, 68, 0.15)"
                              : "rgba(16, 185, 129, 0.15)",
                          border:
                            item.shift.shift === "Day Off"
                              ? "1px solid rgba(239, 68, 68, 0.3)"
                              : "1px solid rgba(16, 185, 129, 0.3)",
                          color:
                            item.shift.shift === "Day Off"
                              ? "#fca5a5"
                              : "#6ee7b7",
                          fontSize: "0.9rem", // Increased font size
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          cursor: "pointer",
                          marginBottom: "4px",
                        }}
                      >
                        {item.shift.shift === "Day Off" ? (
                          <Coffee size={14} /> // Increased icon size
                        ) : (
                          <Clock size={14} /> // Increased icon size
                        )}
                        <span
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {item.shift.shift}
                        </span>
                      </motion.div>
                    )}

                    {/* Company Events */}
                    {item.companyEvents &&
                      item.companyEvents.map((event, idx) => (
                        <motion.div
                          key={`event-${idx}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventClick(event, "event");
                          }}
                          whileHover={{ scale: 1.02 }}
                          style={{
                            padding: "6px 10px", // Increased padding
                            borderRadius: "6px",
                            background:
                              event.type === "holiday"
                                ? "rgba(244, 114, 182, 0.15)"
                                : "rgba(59, 130, 246, 0.15)",
                            border:
                              event.type === "holiday"
                                ? "1px solid rgba(244, 114, 182, 0.3)"
                                : "1px solid rgba(59, 130, 246, 0.3)",
                            color:
                              event.type === "holiday" ? "#fbcfe8" : "#bfdbfe",
                            fontSize: "0.9rem", // Increased font size
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            cursor: "pointer",
                            marginBottom: "4px",
                          }}
                        >
                          <Briefcase size={14} /> {/* Increased icon size */}
                          <span
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {event.title || event.event_name}
                          </span>
                        </motion.div>
                      ))}
                  </div>
                </div>
              ),
            )}
          </motion.div>
          {/* Details Modal */}
          <AnimatePresence>
            {selectedEvent && (
              <motion.div
                className="exclusive-calendar-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedEvent(null)}
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0,0,0,0.6)",
                  backdropFilter: "blur(8px)",
                  zIndex: 1000,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Modal Content */}
                <motion.div
                  className="exclusive-calendar-modal"
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    background:
                      selectedEvent.type === "holiday"
                        ? "linear-gradient(135deg, #450a0a 0%, #1e1e2e 100%)" // Red tint for holiday
                        : "#1e1e2e",
                    padding: "30px",
                    borderRadius: "24px",
                    width: "450px",
                    maxWidth: "90%",
                    border:
                      selectedEvent.type === "holiday"
                        ? "1px solid rgba(239, 68, 68, 0.5)" // Red border
                        : "1px solid rgba(255,255,255,0.1)",
                    boxShadow:
                      selectedEvent.type === "holiday"
                        ? "0 25px 50px -12px rgba(220, 38, 38, 0.25)" // Red glow
                        : "0 25px 50px -12px rgba(0,0,0,0.5)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "20px",
                    }}
                  >
                    <div
                      style={{
                        padding: "12px",
                        borderRadius: "12px",
                        // Icon Background Logic
                        background:
                          selectedEvent.dataType === "shift"
                            ? selectedEvent.shift === "Day Off"
                              ? "rgba(239, 68, 68, 0.2)"
                              : "rgba(16, 185, 129, 0.2)"
                            : selectedEvent.type === "holiday"
                              ? "rgba(239, 68, 68, 0.2)" // Red for Holiday
                              : "rgba(59, 130, 246, 0.2)",
                        color:
                          selectedEvent.dataType === "shift"
                            ? selectedEvent.shift === "Day Off"
                              ? "#fca5a5"
                              : "#6ee7b7"
                            : selectedEvent.type === "holiday"
                              ? "#fca5a5" // Red for Holiday
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
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "rgba(255,255,255,0.5)",
                        cursor: "pointer",
                      }}
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <h2
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      color:
                        selectedEvent.type === "holiday" ? "#fecaca" : "white", // Light red text
                      marginBottom: "8px",
                    }}
                  >
                    {selectedEvent.dataType === "shift"
                      ? selectedEvent.shift
                      : selectedEvent.title || selectedEvent.event_name}
                  </h2>

                  <p
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      fontSize: "0.95rem",
                      marginBottom: "24px",
                    }}
                  >
                    {dayjs(selectedEvent.date).format("dddd, D MMMM YYYY")}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    {selectedEvent.dataType === "event" &&
                      selectedEvent.description && (
                        <div
                          style={{
                            background:
                              selectedEvent.type === "holiday"
                                ? "rgba(239, 68, 68, 0.1)"
                                : "rgba(255,255,255,0.03)",
                            padding: "16px",
                            borderRadius: "12px",
                            border:
                              selectedEvent.type === "holiday"
                                ? "1px solid rgba(239, 68, 68, 0.2)"
                                : "none",
                          }}
                        >
                          <h4
                            style={{
                              color:
                                selectedEvent.type === "holiday"
                                  ? "rgba(254, 202, 202, 0.7)"
                                  : "rgba(255,255,255,0.5)",
                              fontSize: "0.75rem",
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                              marginBottom: "8px",
                            }}
                          >
                            Description
                          </h4>
                          <p
                            style={{
                              color: "rgba(255,255,255,0.9)",
                              lineHeight: "1.5",
                            }}
                          >
                            {selectedEvent.description}
                          </p>
                        </div>
                      )}

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
                          <h4
                            style={{
                              color: "rgba(255,255,255,0.5)",
                              fontSize: "0.75rem",
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                            }}
                          >
                            Location
                          </h4>
                          <p style={{ color: "rgba(255,255,255,0.9)" }}>
                            Head Office, Floor 3
                          </p>
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
