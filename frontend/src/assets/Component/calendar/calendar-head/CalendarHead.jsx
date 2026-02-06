import React, { useState, useEffect } from "react";
import "./CalendarHead.css";
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
import HeadSidebar from "../../Head/HeadSidebar"; // Import layout

const CalendarHead = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [events, setEvents] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    type: "holiday",
    description: "",
  });
  
  const canCreateEvent = true;

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
      const isWeekend = [0, 6].includes(currentDate.date(i).day());
      
      days.push({
        type: "day",
        day: i,
        date: dateStr,
        events: dayEvents,
        isWeekend,
        key: `day-${i}`,
      });
    }
    return days;
  };

  const handleDayClick = (item) => {
    if (item.events.length > 0 || item.isWeekend) {
        setViewedDay(item);
    } else {
        setNewEvent(prev => ({ ...prev, date: item.date }));
        setIsAddModalOpen(true);
    }
  };

  const handleAddEventSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/calendar", newEvent);
      setEvents([...events, { ...newEvent, id: response.data.id }]);
      setIsAddModalOpen(false);
      setNewEvent({ title: "", date: "", type: "holiday", description: "" });
    } catch (error) {
      console.error("Error adding event", error);
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
    <div className={`calendar-layout-head ${isSidebarOpen ? "" : "sidebar-collapsed"}`}>
      <HeadSidebar onToggle={setIsSidebarOpen} />
      
      <div className="calendar-content-area" style={{ flex: 1, padding: '1rem' }}>
        <div className="head-calendar-container">
          {/* Header */}
          <div className="head-calendar-header">
            <div className="head-calendar-title">
              <motion.div 
                className="head-icon-box"
                whileHover={{ rotate: 10, scale: 1.1 }}
              >
                <CalendarIcon size={28} />
              </motion.div>
              <div>
                <span>Team Schedule</span>
                <span>{currentDate.format("MMMM YYYY")}</span>
              </div>
            </div>

            <div className="head-calendar-nav">
              <div className="head-nav-group">
                <button onClick={() => setCurrentDate(currentDate.subtract(1, "month"))} className="head-cal-btn">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={() => setCurrentDate(dayjs())} className="head-cal-btn text-xs font-bold px-3">
                  Today
                </button>
                <button onClick={() => setCurrentDate(currentDate.add(1, "month"))} className="head-cal-btn">
                  <ChevronRight size={20} />
                </button>
              </div>
              
              <motion.button 
                className="head-create-btn"
                onClick={() => setIsAddModalOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={18} /> New Event
              </motion.button>
            </div>
          </div>

          {/* Grid */}
          <div className="head-grid-header">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <div key={d} className="head-day-label">{d}</div>
            ))}
          </div>

          <motion.div 
            className="head-calendar-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            key={currentDate.format("YYYY-MM")}
          >
            {generateCalendarDays().map(item => (
              item.type === 'empty' ? 
                <div key={item.key} className="head-cal-day empty" /> :
                <div 
                  key={item.key}
                  className={`head-cal-day ${dayjs().isSame(item.date, 'day') ? 'today' : ''}`}
                  onClick={() => handleDayClick(item)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="head-day-num">{item.day}</div>
                  <div className="head-events-list">
                    {item.events.map((ev, i) => (
                      <div key={i} className={`head-event-item ${ev.type}`}>
                        {ev.title}
                      </div>
                    ))}
                  </div>
                </div>
            ))}
          </motion.div>

          {/* View Modal */}
          <AnimatePresence>
            {viewedDay && (
              <motion.div 
                className="head-modal-overlay"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setViewedDay(null)}
              >
                <motion.div 
                  className="head-modal"
                  initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  onClick={e => e.stopPropagation()}
                >
                  <div className="head-modal-header">
                    <h3>{dayjs(viewedDay.date).format("dddd, D MMMM")}</h3>
                    <button onClick={() => setViewedDay(null)} className="head-btn-secondary"><X size={18} /></button>
                  </div>
                  <div className="head-modal-body">
                    {viewedDay.events.length === 0 ? (
                       <div className="text-center text-gray-400 py-8">
                          <p>No events scheduled.</p>
                          <button 
                            className="head-btn-primary mt-4"
                            onClick={() => {
                                setNewEvent(prev => ({ ...prev, date: viewedDay.date }));
                                setViewedDay(null);
                                setIsAddModalOpen(true);
                            }}
                          >
                            Add Event
                          </button>
                       </div>
                    ) : (
                        viewedDay.events.map((ev, i) => (
                          <div key={i} className={`p-3 mb-2 rounded border border-white/10 flex justify-between items-start bg-white/5`}>
                             <div>
                                <h4 className="text-white font-bold">{ev.title}</h4>
                                <p className="text-sm text-purple-200">{ev.description}</p>
                                <span className="text-xs uppercase mt-1 inline-block opacity-70">{ev.type}</span>
                             </div>
                             <button onClick={(e) => handleDeleteEvent(ev.id, e)} className="text-red-400 hover:text-white p-1">
                                <Trash2 size={16} />
                             </button>
                          </div>
                        ))
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Add Modal */}
          <AnimatePresence>
            {isAddModalOpen && (
              <motion.div 
                className="head-modal-overlay"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsAddModalOpen(false)}
              >
                <motion.div 
                  className="head-modal"
                  initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  onClick={e => e.stopPropagation()}
                >
                  <div className="head-modal-header">
                    <h3>Create Event</h3>
                    <button onClick={() => setIsAddModalOpen(false)} className="head-btn-secondary"><X size={18} /></button>
                  </div>
                  <form onSubmit={handleAddEventSubmit}>
                    <div className="head-modal-body">
                      <div>
                        <label className="head-form-label">Title</label>
                        <input className="head-form-input" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} required />
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="head-form-label">Date</label>
                          <input type="date" className="head-form-input" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} required />
                        </div>
                        <div className="flex-1">
                           <label className="head-form-label">Type</label>
                           <select className="head-form-input" value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value})}>
                             <option value="holiday">Holiday</option>
                             <option value="event">Event</option>
                             <option value="meeting">Meeting</option>
                           </select>
                        </div>
                      </div>
                      <div>
                        <label className="head-form-label">Description</label>
                        <textarea className="head-form-input" rows="3" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} />
                      </div>
                    </div>
                    <div className="head-modal-footer">
                      <button type="button" onClick={() => setIsAddModalOpen(false)} className="head-btn-secondary">Cancel</button>
                      <button type="submit" className="head-btn-primary">Create Event</button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
           {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                <div
                    className="head-modal-overlay"
                    onClick={() => setShowDeleteModal(false)}
                >
                    <motion.div
                    className="head-modal"
                    style={{ maxWidth: '400px', height: 'auto' }}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    >
                        <div className="head-modal-header">
                            <h3 className="text-white font-bold">Confirm Delete</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-slate-300 mb-6">Are you sure you want to delete this event?</p>
                            <div className="flex justify-end gap-3">
                                <button
                                className="head-btn-secondary"
                                onClick={() => setShowDeleteModal(false)}
                                >
                                Cancel
                                </button>
                                <button
                                className="head-btn-primary bg-red-500 hover:bg-red-600 border-none"
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
    </div>
  );
};

export default CalendarHead;
