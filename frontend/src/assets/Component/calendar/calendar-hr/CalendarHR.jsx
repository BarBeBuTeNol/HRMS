import React, { useState, useEffect } from "react";
import "./CalendarHR.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  X,
  Trash2,
  Clock,
  MapPin,
  AlignLeft,
} from "lucide-react";
import dayjs from "dayjs";
import api from "../../../../services/api";
import HRLayout from "../../HR/HRLayout"; // Importing HR Layout

const CalendarHR = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [events, setEvents] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    type: "holiday",
    description: "",
  });

  // HR has permission to create events
  const canCreateEvent = true;

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
        (e) => dayjs(e.date).format("YYYY-MM-DD") === dateStr
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
    if (item.isWeekend || item.events.length > 0) {
      setViewedDay(item);
    } else if (canCreateEvent) {
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
            (e) => dayjs(e.date).format("YYYY-MM-DD") === viewedDay.date
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <HRLayout>
      <div className="calendar-layout-hr">
        <div className="hr-calendar-container">
          {/* Background Decor */}
          <div className="hr-cal-bg-circle-1"></div>
          <div className="hr-cal-bg-circle-2"></div>

          {/* Header */}
          <div className="hr-calendar-header">
            <div className="hr-calendar-title">
              <div className="hr-icon-wrapper">
                <CalendarIcon size={28} strokeWidth={2.5} />
              </div>
              <div>
                <span>Company Calendar</span>
                <motion.span
                  key={currentDate.format("MMMM YYYY")}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentDate.format("MMMM YYYY")}
                </motion.span>
              </div>
            </div>

            <div className="hr-calendar-nav">
              <div className="hr-nav-group">
                <button
                  onClick={handlePrevMonth}
                  className="hr-cal-btn"
                  title="Previous"
                >
                  <ChevronLeft size={20} />
                </button>
                <button onClick={handleToday} className="hr-cal-btn today-btn">
                  Today
                </button>
                <button
                  onClick={handleNextMonth}
                  className="hr-cal-btn"
                  title="Next"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {canCreateEvent && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="hr-cal-btn primary"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <Plus size={20} strokeWidth={2.5} />
                  <span>New Event</span>
                </motion.button>
              )}
            </div>
          </div>

          {/* Grid Header */}
          <div className="hr-calendar-grid-header">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="hr-day-header">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <motion.div
            className="hr-calendar-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            key={currentDate.format("YYYY-MM")}
          >
            {generateCalendarDays().map((item) =>
              item.type === "empty" ? (
                <div key={item.key} className="hr-calendar-day empty"></div>
              ) : (
                <motion.div
                  key={item.key}
                  variants={itemVariants}
                  onClick={() => handleDayClick(item)}
                  className={`hr-calendar-day ${
                    dayjs().format("YYYY-MM-DD") === item.date ? "today" : ""
                  } ${
                    item.isWeekend ? "weekend" : ""
                  } ${item.hasHoliday ? "holiday-mode" : ""}`}
                  style={{
                    cursor:
                      item.isWeekend ||
                      item.events.length > 0 ||
                      canCreateEvent
                        ? "pointer"
                        : "default",
                  }}
                  whileHover={{
                    y: -5,
                    boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
                  }}
                >
                  <div className="hr-day-header-row">
                    <div className="hr-day-number">{item.day}</div>
                  </div>

                  <div className="hr-events-container">
                    {item.events.map((event, idx) => (
                      <div
                        key={idx}
                        className={`hr-calendar-event ${event.type}`}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )
            )}
          </motion.div>

          {/* View Modal */}
          <AnimatePresence>
            {viewedDay && (
              <motion.div
                className="hr-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setViewedDay(null)}
              >
                <motion.div
                  className="hr-modal"
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="hr-modal-header">
                    <div className="hr-modal-title">
                      <h3>
                        {dayjs(viewedDay.date).format("dddd, D MMMM YYYY")}
                      </h3>
                      <p>Company Schedule</p>
                    </div>
                    <button
                      onClick={() => setViewedDay(null)}
                      className="hr-modal-close"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  <div className="hr-modal-content">
                    {viewedDay.events.length > 0 ? (
                      viewedDay.events.map((evt, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className={`hr-modal-event-card ${evt.type}`}
                        >
                          <div className="hr-event-bar"></div>
                          <div className="hr-event-info hr-w-full">
                            <div className="hr-flex-between">
                              <h4>{evt.title}</h4>
                              {canCreateEvent && (
                                <button
                                  className="hr-delete-btn"
                                  onClick={(e) => handleDeleteEvent(evt.id, e)}
                                  title="Delete Event"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                            <p className="hr-flex hr-items-center hr-gap-2 hr-mt-2">
                              <AlignLeft size={14} />
                              {evt.description || "No description"}
                            </p>
                            <div className="hr-flex hr-gap-3 hr-mt-3 hr-text-xs hr-text-slate">
                                <span className="hr-flex hr-items-center hr-gap-2"><Clock size={12}/> All Day</span>
                                <span className="hr-flex hr-items-center hr-gap-2"><MapPin size={12}/> Office</span>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="hr-center-content">
                        <CalendarIcon size={48} className="hr-mb-4 hr-opacity-20" />
                        <p>No events scheduled for this day.</p>
                      </div>
                    )}

                    {canCreateEvent && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="hr-btn-save hr-w-full hr-mt-6"
                        onClick={() => {
                          setNewEvent((prev) => ({
                            ...prev,
                            date: viewedDay.date,
                          }));
                          setViewedDay(null);
                          setIsAddModalOpen(true);
                        }}
                      >
                        <Plus size={18} className="inline mr-2" /> Add Event Here
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Add Event Modal */}
          <AnimatePresence>
            {isAddModalOpen && (
              <motion.div
                className="hr-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAddModalOpen(false)}
              >
                <motion.div
                  className="hr-modal"
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="hr-modal-header">
                    <div className="hr-modal-title">
                      <h3>New Event</h3>
                      <p>Create a new schedule entry</p>
                    </div>
                    <button
                      onClick={() => setIsAddModalOpen(false)}
                      className="hr-modal-close"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  <div className="hr-modal-content">
                    <form onSubmit={handleAddEventSubmit}>
                      <div className="hr-form-group">
                        <label>Event Title</label>
                        <input
                          type="text"
                          value={newEvent.title}
                          onChange={(e) =>
                            setNewEvent({ ...newEvent, title: e.target.value })
                          }
                          required
                          placeholder="e.g. Annual Meeting"
                          autoFocus
                        />
                      </div>
                      <div className="hr-flex hr-gap-4">
                        <div className="hr-form-group hr-flex-1">
                          <label>Date</label>
                          <input
                            type="date"
                            value={newEvent.date}
                            onChange={(e) =>
                              setNewEvent({ ...newEvent, date: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className="hr-form-group hr-flex-1">
                          <label>Type</label>
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
                        </div>
                      </div>
                      <div className="hr-form-group">
                        <label>Description</label>
                        <textarea
                          value={newEvent.description}
                          onChange={(e) =>
                            setNewEvent({
                              ...newEvent,
                              description: e.target.value,
                            })
                          }
                          rows={3}
                          placeholder="Additional details..."
                        />
                      </div>
                      <div className="hr-modal-actions">
                        <button
                          type="button"
                          onClick={() => setIsAddModalOpen(false)}
                          className="hr-btn-cancel"
                        >
                          Cancel
                        </button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="submit"
                          className="hr-btn-save"
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
                className="hr-modal-overlay"
                onClick={() => setShowDeleteModal(false)}
              >
                <motion.div
                  className="hr-modal"
                  style={{ maxWidth: "400px", height: "auto" }}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="hr-modal-header" style={{ padding: "1.5rem" }}>
                    <h3 className="hr-text-white hr-font-bold hr-text-xl">
                      Confirm Delete
                    </h3>
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                    <p className="hr-text-slate-300 hr-mb-6">
                      Are you sure you want to delete this event? This action
                      cannot be undone.
                    </p>
                    <div className="hr-flex hr-justify-end hr-gap-3">
                      <button
                        className="hr-btn-cancel"
                        onClick={() => setShowDeleteModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="hr-btn-delete-confirm"
                        onClick={confirmDeleteEvent}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </HRLayout>
  );
};

export default CalendarHR;
