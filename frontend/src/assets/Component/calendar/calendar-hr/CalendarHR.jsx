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
    if (item.isWeekend || item.events.length > 0) {
      setViewedDay(item);
    } else if (canCreateEvent) {
      setNewEvent((prev) => ({ ...prev, date: item.date }));
      setIsAddModalOpen(true);
    }
  };

  const handlePrevMonth = () => setCurrentDate(currentDate.subtract(1, "month"));
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
    <HRLayout>
      <div className="calendar-layout-hr">
        <div className="hr-calendar-container">
          {/* Background Decor */}
          <div className="hr-cal-bg-circle-1"></div>
          
          {/* Header */}
          <div className="hr-calendar-header">
            <div className="hr-calendar-title">
              <div className="hr-icon-wrapper">
                <CalendarIcon size={32} />
              </div>
              <div>
                <span>HR Department</span>
                <span>{currentDate.format("MMMM YYYY")}</span>
              </div>
            </div>

            <div className="hr-calendar-nav">
              <div className="hr-nav-group">
                <button onClick={handlePrevMonth} className="hr-cal-btn" title="Previous">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={handleToday} className="hr-cal-btn today-btn">
                  Today
                </button>
                <button onClick={handleNextMonth} className="hr-cal-btn" title="Next">
                  <ChevronRight size={20} />
                </button>
              </div>

              {canCreateEvent && (
                <button
                  className="hr-cal-btn primary"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <Plus size={20} strokeWidth={2.5} />
                  <span>New Event</span>
                </button>
              )}
            </div>
          </div>

          {/* Grid Header */}
          <div className="hr-calendar-grid-header">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="hr-day-header">{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <motion.div
            className="hr-calendar-grid"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            key={currentDate.format("YYYY-MM")}
          >
            {generateCalendarDays().map((item) =>
              item.type === "empty" ? (
                <div key={item.key} className="hr-calendar-day empty"></div>
              ) : (
                <div
                  key={item.key}
                  onClick={() => handleDayClick(item)}
                  className={`hr-calendar-day ${
                    dayjs().format("YYYY-MM-DD") === item.date ? "today" : ""
                  } ${item.isWeekend || item.hasHoliday ? "holiday-mode" : ""}`}
                  style={{
                    cursor: item.isWeekend || item.events.length > 0 || canCreateEvent ? "pointer" : "default",
                  }}
                >
                  <div className="hr-day-header-row">
                    <div className="hr-day-number">{item.day}</div>
                  </div>

                  <div className="hr-events-container">
                    {item.events.map((event, idx) => (
                      <div key={idx} className={`hr-calendar-event ${event.type}`} title={event.title}>
                        {event.title}
                      </div>
                    ))}
                  </div>
                </div>
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
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="hr-modal-header">
                    <div className="hr-modal-title">
                      <h3>{dayjs(viewedDay.date).format("dddd, D MMMM YYYY")}</h3>
                      <p>Company Schedule</p>
                    </div>
                    <button onClick={() => setViewedDay(null)} className="hr-modal-close">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="hr-modal-content">
                    {viewedDay.events.length > 0 ? (
                      viewedDay.events.map((evt, idx) => (
                        <div key={idx} className={`hr-modal-event-card ${evt.type}`}>
                          <div className="hr-event-bar"></div>
                          <div className="hr-event-info">
                            <h4>{evt.title}</h4>
                            <p>{evt.description || "No description"}</p>
                            
                            {canCreateEvent && (
                                <button
                                  className="text-red-400 text-xs mt-2 hover:text-red-300"
                                  onClick={(e) => handleDeleteEvent(evt.id, e)}
                                >
                                  Delete
                                </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-center py-4">No events scheduled.</p>
                    )}
                    
                    {canCreateEvent && (
                      <button
                        className="hr-btn-save w-full mt-4"
                        onClick={() => {
                           setNewEvent((prev) => ({ ...prev, date: viewedDay.date }));
                           setViewedDay(null);
                           setIsAddModalOpen(true);
                        }}
                      >
                         Add Event Here
                      </button>
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
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="hr-modal-header">
                    <div className="hr-modal-title">
                      <h3>New Event</h3>
                    </div>
                    <button onClick={() => setIsAddModalOpen(false)} className="hr-modal-close">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="hr-modal-content">
                    <form onSubmit={handleAddEventSubmit}>
                      <div className="hr-form-group">
                        <label>Title</label>
                        <input
                          type="text"
                          value={newEvent.title}
                          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="flex gap-4">
                        <div className="hr-form-group flex-1">
                          <label>Date</label>
                          <input
                            type="date"
                            value={newEvent.date}
                            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                            required
                          />
                        </div>
                        <div className="hr-form-group flex-1">
                          <label>Type</label>
                          <select
                            value={newEvent.type}
                            onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
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
                          onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                          rows={3}
                        />
                      </div>
                      <div className="hr-modal-actions">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="hr-btn-cancel">
                          Cancel
                        </button>
                        <button type="submit" className="hr-btn-save">
                          Create
                        </button>
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
                    style={{ maxWidth: '400px', height: 'auto' }}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    >
                        <div className="hr-modal-header">
                            <h3 className="text-white font-bold">Confirm Delete</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-slate-300 mb-6">Are you sure you want to delete this event?</p>
                            <div className="flex justify-end gap-3">
                                <button
                                className="hr-btn-cancel"
                                onClick={() => setShowDeleteModal(false)}
                                >
                                Cancel
                                </button>
                                <button
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
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
