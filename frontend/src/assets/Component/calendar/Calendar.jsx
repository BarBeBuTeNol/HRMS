import React, { useState, useEffect } from "react";
import "./Calendar.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  X,
  Trash2,
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

  const canCreateEvent = ["HR", "CHRO", "Admin", "Head"].includes(userRole);

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
    // If user can create event and clicks on an empty day (or any day), pre-fill date and open Add Modal if intended
    // OR keep existing logic for weekends/events -> View Modal

    // Improved Logic:
    // 1. If existing events or weekend -> Open View Modal (User can add from there too)
    // 2. If empty day AND canCreateEvent -> Open Add Modal directly

    if (item.isWeekend || item.events.length > 0) {
      setViewedDay(item);
    } else if (canCreateEvent) {
      // Empty day, direct add
      setNewEvent((prev) => ({ ...prev, date: item.date }));
      setIsAddModalOpen(true);
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

  /* Delete Confirmation State */
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  const handleDeleteEvent = (eventId, e) => {
    e.stopPropagation();
    setEventToDelete(eventId);
    setShowDeleteModal(true);
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;

    try {
      await api.delete(`/calendar/${eventToDelete}`);

      const updatedEvents = events.filter((evt) => evt.id !== eventToDelete);
      setEvents(updatedEvents);

      if (viewedDay) {
        setViewedDay({
          ...viewedDay,
          events: updatedEvents.filter(
            (e) => dayjs(e.date).format("YYYY-MM-DD") === viewedDay.date,
          ),
        });
      }
      setShowDeleteModal(false);
      setEventToDelete(null);
    } catch (error) {
      console.error("Failed to delete event", error);
      alert("Failed to delete event");
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
          <div className="calendar-icon-wrapper">
            <CalendarIcon size={36} className="text-indigo-400" />
          </div>
          <div>
            <span>Company</span>
            <span>{currentDate.format("MMMM YYYY")}</span>
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
                  item.isWeekend || item.events.length > 0 || canCreateEvent
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

                        {canCreateEvent && (
                          <button
                            className="delete-event-btn"
                            onClick={(e) => handleDeleteEvent(evt.id, e)}
                            title="Delete Event"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : !viewedDay.isWeekend ? (
                  <div className="empty-state">
                    <div className="empty-icon-wrapper">
                      <CalendarIcon size={32} />
                    </div>
                    <p>No events scheduled for this day.</p>
                  </div>
                ) : null}

                {/* Always show Add Event button here if permission exists */}
                {canCreateEvent && (
                  <motion.button
                    className="quick-add-btn full-width"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setNewEvent((prev) => ({
                        ...prev,
                        date: viewedDay.date,
                      }));
                      setViewedDay(null);
                      setIsAddModalOpen(true);
                    }}
                  >
                    <Plus size={18} /> Add New Event
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Event Modal (Premium Redesign) */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            className="exclusive-calendar-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAddModalOpen(false)}
          >
            <motion.div
              className="exclusive-calendar-modal premium-modal add-event-modal"
              initial={{ scale: 0.9, opacity: 0, y: 50, rotateX: 5 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50, rotateX: 5 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative Header */}
              <div className="add-event-header">
                <div className="header-orb"></div>
                <h2>New Event</h2>
                <p>Create a scheduler entry for the company.</p>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="premium-close-absolute"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="add-event-body">
                <form onSubmit={handleAddEventSubmit} className="premium-form">
                  <div className="form-group">
                    <div className="flex justify-between items-baseline mb-1">
                      <label>Event Title</label>
                      <span className="text-xs text-gray-400 font-mono">
                        {newEvent.title.length}/255
                      </span>
                    </div>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        placeholder="e.g. Annual Company Party"
                        value={newEvent.title}
                        maxLength={255}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, title: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Date</label>
                      <div className="input-wrapper">
                        <input
                          type="date"
                          min={dayjs().format("YYYY-MM-DD")}
                          value={newEvent.date}
                          onChange={(e) =>
                            setNewEvent({ ...newEvent, date: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Type</label>
                      <div className="custom-select-wrapper">
                        <select
                          value={newEvent.type}
                          onChange={(e) =>
                            setNewEvent({ ...newEvent, type: e.target.value })
                          }
                        >
                          <option value="holiday">Holiday</option>
                          <option value="event">Event</option>
                          <option value="meeting">Meeting</option>
                        </select>
                        <div
                          className={`select-indicator ${newEvent.type}`}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="flex justify-between items-baseline mb-1">
                      <label>Description</label>
                      <span className="text-xs text-gray-400 font-mono">
                        {newEvent.description.length}/255
                      </span>
                    </div>
                    <div className="input-wrapper">
                      <textarea
                        placeholder="Add details about this event..."
                        value={newEvent.description}
                        maxLength={255}
                        onChange={(e) =>
                          setNewEvent({
                            ...newEvent,
                            description: e.target.value,
                          })
                        }
                        style={{ minHeight: "100px", resize: "none" }}
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setIsAddModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <motion.button
                      type="submit"
                      className="save-btn"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Create Event
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div
            className="exclusive-calendar-modal-overlay"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              className="confirm-modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="confirm-title">Delete Event?</h3>
              <p className="confirm-text">
                Are you sure you want to delete this event? This action cannot
                be undone.
              </p>
              <div className="confirm-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn-delete-confirm"
                  onClick={confirmDeleteEvent}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main Wrapper Page ---
const ExclusiveCalendar = () => {
  const [userRole, setUserRole] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    setUserRole(user.role_name || user.role);
  }, []);

  if (!userRole)
    return <div className="p-10 text-white">Loading Calendar...</div>;

  if (userRole === "Head") {
    return (
      <div
        className={`calendar-layout-head ${
          isSidebarOpen ? "" : "sidebar-collapsed"
        }`}
      >
        <HeadSidebar onToggle={setIsSidebarOpen} />
        <div className="calendar-content-area">
          <ExclusiveCalendarContent />
        </div>
      </div>
    );
  }

  if (userRole === "Employee") {
    return (
      <div
        className={`calendar-layout-emp ${
          isSidebarOpen ? "" : "sidebar-collapsed"
        }`}
      >
        <EmployeeSidebar onToggle={setIsSidebarOpen} />
        <div className="calendar-content-area">
          <ExclusiveCalendarContent />
        </div>
      </div>
    );
  }

  // Fallback for HR/CHRO if their layouts are used but we want consistent class names
  if (userRole === "HR") {
    return (
      <HRLayout>
        <div className="calendar-layout-hr">
          <ExclusiveCalendarContent />
        </div>
      </HRLayout>
    );
  }

  if (userRole === "CHRO" || userRole === "Admin") {
    return (
      <CHROLayout>
        <div className="calendar-layout-chro">
          <ExclusiveCalendarContent />
        </div>
      </CHROLayout>
    );
  }

  return (
    <div className="calendar-layout-default">
      <ExclusiveCalendarContent />
    </div>
  );
};

export default ExclusiveCalendar;
