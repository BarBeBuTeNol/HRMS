import React, { useState, useEffect } from "react";
import "./Calendar.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  X,
} from "lucide-react";
import dayjs from "dayjs";
import api from "../../../services/api";

// Layout Imports
import HRLayout from "../HR/HRLayout";
import CHROLayout from "../CHRO/CHROLayout";
import EmployeeSidebar from "../Employee/EmployeeSidebar";
import HeadSidebar from "../Head/HeadSidebar";

// --- Internal Calendar Component (Premium Glass Design) ---
const ExclusiveCalendarContent = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [events, setEvents] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [hoveredEvent, setHoveredEvent] = useState(null); // For custom tooltip/gimmick
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    type: "holiday",
    description: "",
  });

  // Role check for button visibility
  const [userRole, setUserRole] = useState(null);
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    setUserRole(user.role_name || user.role);
  }, []);

  const canCreateEvent = ["HR", "CHRO", "Admin"].includes(userRole);

  // Fetch Events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get("/calendar");
        setEvents(response.data);
      } catch (error) {
        console.error("Failed to fetch events", error);
      }
    };
    fetchEvents();
  }, []);

  const daysInMonth = currentDate.daysInMonth();
  const firstDayOfMonth = currentDate.startOf("month").day();

  /* View Modal State */
  const [viewedDay, setViewedDay] = useState(null);

  const generateCalendarDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ type: "empty", key: `empty-${i}` });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = currentDate.date(i).format("YYYY-MM-DD");
      const dayEvents = events.filter(
        (e) => dayjs(e.date).format("YYYY-MM-DD") === dateStr,
      );

      const dayOfWeek = currentDate.date(i).day();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 0=Sun, 6=Sat
      const hasHoliday = dayEvents.some((e) => e.type === "holiday");

      days.push({
        type: "day",
        day: i,
        date: dateStr,
        events: dayEvents,
        isWeekend,
        hasHoliday,
        key: `day-${i}`,
      });
    }
    return days;
  };

  const handleDayClick = (item) => {
    // Open view modal if it's a holiday or weekend or has events
    if (item.isWeekend || item.events.length > 0) {
      setViewedDay(item);
    }
  };

  const handlePrevMonth = () =>
    setCurrentDate(currentDate.subtract(1, "month"));
  const handleNextMonth = () => setCurrentDate(currentDate.add(1, "month"));
  const handleToday = () => setCurrentDate(dayjs());

  const handleAddEventSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/calendar", newEvent);
      setEvents([...events, { ...newEvent, id: response.data.id }]);
      setIsAddModalOpen(false);
      setNewEvent({ title: "", date: "", type: "holiday", description: "" });
    } catch (error) {
      console.error("Failed to add event", error);
      alert("Failed to add event");
    }
  };

  return (
    <div className="exclusive-calendar-container">
      {/* Background Decor (Gimmick) - Floating Orbs */}
      <div
        style={{
          position: "absolute",
          top: -50,
          left: -50,
          width: 200,
          height: 200,
          background: "rgba(99, 102, 241, 0.2)",
          filter: "blur(80px)",
          borderRadius: "50%",
          zIndex: 0,
        }}
      ></div>
      <div
        style={{
          position: "absolute",
          bottom: -50,
          right: -50,
          width: 300,
          height: 300,
          background: "rgba(192, 132, 252, 0.15)",
          filter: "blur(100px)",
          borderRadius: "50%",
          zIndex: 0,
        }}
      ></div>

      {/* Header */}
      <div
        className="exclusive-calendar-header"
        style={{ position: "relative", zIndex: 2 }}
      >
        <div className="exclusive-calendar-title">
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
              padding: "12px",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.1)",
            }}
          >
            <CalendarIcon size={36} className="text-indigo-400" />
          </div>
          <div>
            <span
              style={{
                display: "block",
                fontSize: "1rem",
                color: "#a5b4fc",
                textTransform: "uppercase",
                letterSpacing: "3px",
                marginBottom: "-5px",
                fontWeight: "700",
              }}
            >
              Company
            </span>
            <span
              style={{
                background: "linear-gradient(to right, #ffffff, #c7d2fe)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: "2.5rem",
              }}
            >
              {currentDate.format("MMMM YYYY")}
            </span>
          </div>
        </div>

        <div className="exclusive-calendar-nav">
          <div
            style={{
              display: "flex",
              background: "rgba(0, 0, 0, 0.2)",
              borderRadius: "16px",
              padding: "6px",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <button
              onClick={handlePrevMonth}
              className="exclusive-calendar-btn"
              style={{
                border: "none",
                background: "transparent",
                padding: "10px",
              }}
              title="Previous"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleToday}
              className="exclusive-calendar-btn"
              style={{
                border: "none",
                background: "rgba(255,255,255,0.1)",
                padding: "8px 20px",
                borderRadius: "12px",
              }}
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="exclusive-calendar-btn"
              style={{
                border: "none",
                background: "transparent",
                padding: "10px",
              }}
              title="Next"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {canCreateEvent && (
            <button
              className="exclusive-calendar-btn primary"
              onClick={() => setIsAddModalOpen(true)}
              style={{
                padding: "10px 24px",
                fontSize: "1rem",
                letterSpacing: "0.5px",
              }}
            >
              <Plus size={20} strokeWidth={3} />
              <span>New Event</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid Header */}
      <div
        className="exclusive-calendar-grid"
        style={{
          marginBottom: "10px",
          position: "relative",
          zIndex: 1,
          flexGrow: 0,
          height: "auto",
          minHeight: "auto",
          gap: "8px",
        }}
      >
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="exclusive-calendar-day-header"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              borderBottom: "2px solid rgba(255, 255, 255, 0.05)",
              borderRadius: "12px",
              padding: "0.8rem",
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <motion.div
        className="exclusive-calendar-grid"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        key={currentDate.format("YYYY-MM")}
        style={{
          position: "relative",
          zIndex: 1,
          gap: "8px",
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gridTemplateRows: "repeat(6, 1fr)",
          flexGrow: 1,
        }}
      >
        {generateCalendarDays().map((item) =>
          item.type === "empty" ? (
            <div key={item.key} className="exclusive-calendar-day empty"></div>
          ) : (
            <div
              key={item.key}
              onClick={() => handleDayClick(item)}
              className={`exclusive-calendar-day ${
                dayjs().format("YYYY-MM-DD") === item.date ? "today" : ""
              } ${item.isWeekend || item.hasHoliday ? "holiday-mode" : ""}`}
              style={{
                transitionDelay: `${item.day * 10}ms`,
                cursor:
                  item.isWeekend || item.events.length > 0
                    ? "pointer"
                    : "default",
              }} /* Stagger animation */
            >
              <div className="exclusive-calendar-day-number">{item.day}</div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  marginTop: "5px",
                }}
              >
                {item.events.map((event, idx) => (
                  <motion.div
                    key={idx}
                    className={`exclusive-calendar-event ${event.type}`}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 * idx }}
                    whileHover={{ scale: 1.05, x: 5 }}
                    title={event.title}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "white",
                          opacity: 0.8,
                        }}
                      ></div>
                      {event.title}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ),
        )}
      </motion.div>

      {/* View Details Modal */}
      <AnimatePresence>
        {viewedDay && (
          <motion.div
            className="exclusive-calendar-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewedDay(null)}
          >
            <motion.div
              className="exclusive-calendar-modal premium-modal"
              initial={{ scale: 0.9, opacity: 0, y: 30, rotateX: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30, rotateX: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with decorative background */}
              <div className="premium-modal-header">
                <div className="premium-modal-date-badge">
                  <span className="premium-modal-day">
                    {dayjs(viewedDay.date).format("D")}
                  </span>
                  <span className="premium-modal-month">
                    {dayjs(viewedDay.date).format("MMM")}
                  </span>
                </div>
                <div className="premium-modal-title-section">
                  <h3 className="premium-modal-full-date">
                    {dayjs(viewedDay.date).format("dddd")}
                  </h3>
                  <p className="premium-modal-year">
                    {dayjs(viewedDay.date).format("MMMM YYYY")}
                  </p>
                </div>
                <button
                  onClick={() => setViewedDay(null)}
                  className="premium-modal-close-btn"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content Section */}
              <div className="premium-modal-content">
                {viewedDay.isWeekend && (
                  <motion.div
                    className="premium-info-card weekend"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="icon-wrapper">
                      <CalendarIcon size={18} />
                    </div>
                    <div className="info-text">
                      <h4>Weekend</h4>
                      <p>Time to recharge and relax.</p>
                    </div>
                  </motion.div>
                )}

                {viewedDay.events.length > 0 ? (
                  <div className="premium-events-list">
                    {viewedDay.events.map((evt, idx) => (
                      <motion.div
                        key={idx}
                        className={`premium-event-card ${evt.type}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + idx * 0.05 }}
                      >
                        <div className="event-indicator"></div>
                        <div className="event-details">
                          <h4 className="event-title">{evt.title}</h4>
                          {evt.description && (
                            <p className="event-description">
                              {evt.description}
                            </p>
                          )}
                          <span className="event-tag">{evt.type}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : !viewedDay.isWeekend ? (
                  <div className="empty-state">
                    <div className="empty-icon-wrapper">
                      <CalendarIcon size={32} />
                    </div>
                    <p>No events scheduled for this day.</p>
                    {canCreateEvent && (
                      <button
                        className="quick-add-btn"
                        onClick={() => {
                          setNewEvent((prev) => ({
                            ...prev,
                            date: viewedDay.date,
                          }));
                          setViewedDay(null);
                          setIsAddModalOpen(true);
                        }}
                      >
                        <Plus size={14} /> Add Event
                      </button>
                    )}
                  </div>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Event Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            className="exclusive-calendar-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="exclusive-calendar-modal"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              style={{
                background: "rgba(30, 30, 46, 0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                  Add Event
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
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
              <form onSubmit={handleAddEventSubmit}>
                <div style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      display: "block",
                      color: "rgba(255,255,255,0.6)",
                      marginBottom: "5px",
                      fontSize: "0.9rem",
                    }}
                  >
                    Event Title
                  </label>
                  <input
                    className="exclusive-calendar-input"
                    type="text"
                    value={newEvent.title}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, title: e.target.value })
                    }
                    required
                    style={{ fontSize: "1rem" }}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "15px",
                    marginBottom: "15px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        color: "rgba(255,255,255,0.6)",
                        marginBottom: "5px",
                        fontSize: "0.9rem",
                      }}
                    >
                      Date
                    </label>
                    <input
                      className="exclusive-calendar-input"
                      type="date"
                      value={newEvent.date}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        color: "rgba(255,255,255,0.6)",
                        marginBottom: "5px",
                        fontSize: "0.9rem",
                      }}
                    >
                      Type
                    </label>
                    <select
                      className="exclusive-calendar-input"
                      value={newEvent.type}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, type: e.target.value })
                      }
                    >
                      <option value="holiday">Holiday</option>
                      <option value="event">Event</option>
                      <option value="meeting">Meeting</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      display: "block",
                      color: "rgba(255,255,255,0.6)",
                      marginBottom: "5px",
                      fontSize: "0.9rem",
                    }}
                  >
                    Description
                  </label>
                  <textarea
                    className="exclusive-calendar-input"
                    placeholder="Optional details..."
                    value={newEvent.description}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, description: e.target.value })
                    }
                    style={{ minHeight: "80px", resize: "none" }}
                  />
                </div>

                <div className="exclusive-calendar-actions">
                  <button
                    type="button"
                    className="exclusive-calendar-btn"
                    onClick={() => setIsAddModalOpen(false)}
                    style={{ padding: "10px 20px" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="exclusive-calendar-btn primary"
                    style={{ padding: "10px 30px" }}
                  >
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main Wrapper Page ---
const ExclusiveCalendar = () => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    setUserRole(user.role_name || user.role);
  }, []);

  if (!userRole)
    return <div className="p-10 text-white">Loading Calendar...</div>;

  if (userRole === "HR") {
    return (
      <HRLayout>
        <ExclusiveCalendarContent />
      </HRLayout>
    );
  }

  if (userRole === "CHRO" || userRole === "Admin") {
    return (
      <CHROLayout>
        <ExclusiveCalendarContent />
      </CHROLayout>
    );
  }

  if (userRole === "Head") {
    return (
      <div className="layout-container">
        <div className="sidebar">
          <HeadSidebar />
        </div>
        <div className="content-area" style={{ padding: 0 }}>
          <ExclusiveCalendarContent />
        </div>
      </div>
    );
  }

  // Default: Employee
  return (
    <div className="layout-container">
      <EmployeeSidebar />
      <div className="content-area" style={{ padding: 0 }}>
        <ExclusiveCalendarContent />
      </div>
    </div>
  );
};

export default ExclusiveCalendar;
