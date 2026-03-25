import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "./CalendarCHRO.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Trash2,
  Calendar as CalendarIcon,
  Search, // Gimmick
} from "lucide-react";
import dayjs from "dayjs";
import api from "../../../../services/api";
import CHROLayout from "../../CHRO/CHROLayout";

/* 
  Local Popups are defined at the bottom of this file 
  to ensure self-containment as requested.
*/
const LocalStatusModal = ({ isLoading, isSuccess, title, message, onClose }) => {
    if (!isLoading && !isSuccess) return null;
    
    return createPortal(
        <div className="chro-local-overlay">
            <div className="chro-local-card">
                <div className={`chro-local-icon ${isLoading ? 'loading' : 'success'}`}>
                    {isLoading ? null : <span style={{fontSize: '32px'}}>✓</span>}
                </div>
                <h3 className="chro-local-title">{title}</h3>
                <p className="chro-local-desc">{message}</p>
                
                {isSuccess && (
                    <div className="chro-local-actions">
                        <button className="chro-local-btn confirm" onClick={onClose}>Continue</button>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

const LocalConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="chro-local-overlay">
            <div className="chro-local-card">
                <div className="chro-local-icon warning">
                    <span>⚠️</span>
                </div>
                <h3 className="chro-local-title">{title}</h3>
                <p className="chro-local-desc">{message}</p>
                <div className="chro-local-actions">
                    <button className="chro-local-btn cancel" onClick={onClose}>Cancel</button>
                    <button className="chro-local-btn confirm" onClick={() => { onConfirm(); onClose(); }}>Confirm</button>
                </div>
            </div>
        </div>,
        document.body
    );
};

const LocalNotification = ({ isOpen, type = 'error', title, message, onClose }) => {
    if (!isOpen) return null;
    
    // Auto close after 4s
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, []);

    return createPortal(
        <div className={`chro-local-toast ${type}`} onClick={onClose}>
            <div style={{fontSize: '24px'}}>
                 {type === 'error' ? '✕' : 'ℹ️'}
            </div>
            <div className="chro-local-toast-content">
                <h4>{title}</h4>
                <p>{message}</p>
            </div>
        </div>,
        document.body
    );
};

// Helper Component for Tooltip
const ActionTooltip = ({ label, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div 
        style={{ position: 'relative' }} 
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
    >
        {children}
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: -0 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'absolute',
                        bottom: '120%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#e0c058',
                        color: '#000',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                        zIndex: 20
                    }}
                >
                    {label}
                    <div style={{ 
                        position: 'absolute', top: '100%', left: '50%', marginLeft: '-4px', 
                        borderWidth: '4px', borderStyle: 'solid', 
                        borderColor: '#e0c058 transparent transparent transparent' 
                    }} />
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

const CalendarCHRO = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [events, setEvents] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    type: "Company Event",
    description: "",
  });

  // Local Popup States
  const [statusState, setStatusState] = useState({ loading: false, success: false, title: "", message: "" });
  const [confirmState, setConfirmState] = useState({ isOpen: false, title: "", message: "", onConfirm: null });
  const [notifState, setNotifState] = useState({ isOpen: false, type: "error", title: "", message: "" });

  const canCreateEvent = true;
  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get("/calendar");
        setEvents(response.data);
      } catch (error) {
        console.error("Failed to fetch events", error);
        setNotifState({ isOpen: true, type: 'error', title: 'Connection Error', message: 'Could not fetch calendar events.' });
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
        const date = currentDate.date(i);
        const dateStr = date.format("YYYY-MM-DD");
        const dayEvents = events.filter(e => dayjs(e.date).format("YYYY-MM-DD") === dateStr);
        
        const dayOfWeek = date.day();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const showRedWarning = isWeekend && dayEvents.length === 0;

        days.push({
            type: "day",
            day: i,
            date: dateStr,
            events: dayEvents,
            isToday: dayjs().isSame(dateStr, 'day'),
            showRedWarning,
            key: `day-${i}`
        });
    }
    return days;
  };

  const handleDayClick = (item) => {
    setViewedDay(item);
  };
  
  // ... handlers ...
  const handleAddEventSubmit = async (e) => {
    e.preventDefault();
    
    // Basic Validation
    if (!newEvent.title || !newEvent.date) {
        setNotifState({ isOpen: true, type: 'error', title: 'Validation Error', message: 'Please fill in all required fields.' });
        return;
    }

    setStatusState({ loading: true, success: false, title: "Sending Data...", message: "Securely transmitting agenda details..." });
    
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
      const userId = currentUser.id || 1; 

      const payload = {
        title: newEvent.title,
        date: newEvent.date,
        description: newEvent.description,
        type: newEvent.type,
        endDate: newEvent.date,
        isAllDay: true,
        createdBy: userId
      };

      await api.post("/calendar", payload);
      
      const response = await api.get("/calendar");
      setEvents(response.data);
      // Navigate to the added date
      setCurrentDate(dayjs(newEvent.date));

      setIsAddModalOpen(false);
      setNewEvent({ title: "", date: "", type: "Company Event", description: "" });
      
      setStatusState({ loading: false, success: true, title: "Success", message: "New agenda has been successfully created." });

    } catch (error) {
      console.error("Failed to add event", error);
      setStatusState({ loading: false, success: false, title: "", message: "" }); // Reset status
      setNotifState({ isOpen: true, type: 'error', title: 'Submission Failed', message: 'Failed to create agenda. Please try again.' });
    }
  };

  const handleDeleteEvent = (id) => {
    setConfirmState({
        isOpen: true,
        title: "Delete Agenda",
        message: "Are you sure you want to delete this event? This action cannot be undone.",
        onConfirm: () => performDelete(id)
    });
  };

  const performDelete = async (id) => {
    setStatusState({ loading: true, success: false, title: "Deleting...", message: "Removing agenda from database..." });
    try {
      await api.delete(`/calendar/${id}`);
      const updatedEvents = events.filter(ev => ev.id !== id);
      setEvents(updatedEvents);
      
      // Close the view day modal to return to normal page
      setViewedDay(null);

      setStatusState({ loading: false, success: true, title: "Deleted", message: "Agenda has been permanently deleted." });
    } catch (error) {
      console.error("Failed to delete event", error);
      setStatusState({ loading: false, success: false, title: "", message: "" });
      setNotifState({ isOpen: true, type: 'error', title: 'Deletion Failed', message: 'Failed to delete agenda. System error.' });
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <CHROLayout>
         {/* Wrapper to negate CHROLayout padding */}
        <div className="chro-calendar-fullscreen-wrapper">
            <div className="chro-calendar-container">
                {/* Header */}
                <div className="chro-calendar-header">
                    <div className="chro-header-left">
                        <motion.h1 
                            key={currentDate.format("MMMM")}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        >
                            {currentDate.format("MMMM")}
                        </motion.h1>
                        <p>{currentDate.format("YYYY")} — Executive Overview</p>
                    </div>

                    <div className="chro-controls">
                         <div className="chro-nav-group">
                            <button onClick={() => setCurrentDate(currentDate.subtract(1, "month"))} className="chro-nav-btn">
                                <ChevronLeft size={18} />
                            </button>
                            <button onClick={() => setCurrentDate(dayjs())} className="chro-nav-btn" title="Today">
                                <CalendarIcon size={16} />
                            </button>
                            <button onClick={() => setCurrentDate(currentDate.add(1, "month"))} className="chro-nav-btn">
                                <ChevronRight size={18} />
                            </button>
                         </div>
                         <button className="chro-create-btn" onClick={() => {
                            setNewEvent(prev => ({ ...prev, date: dayjs().format("YYYY-MM-DD") }));
                            setIsAddModalOpen(true);
                         }}>
                            <Plus className="chro-btn-icon" />
                            <span className="chro-btn-text">New Agenda</span>
                        </button>
                    </div>
                </div>

                {/* Grid Header */}
                <div className="chro-grid-header">
                    {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(d => (
                        <div key={d} className="chro-dow">{d}</div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="chro-grid">
                    {generateCalendarDays().map((item, index) => (
                        item.type === 'empty' ? 
                            <div key={item.key} className="chro-day empty" /> 
                        :
                            <motion.div 
                                key={item.key}
                                className={`chro-day ${item.isToday ? 'today' : ''} ${item.showRedWarning ? 'weekend-red' : ''}`}
                                onClick={() => handleDayClick(item)}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.005 }} // Faster stagger
                            >
                                <div className="chro-date-num">{item.day < 10 ? `0${item.day}` : item.day}</div>
                                
                                <div className="chro-events-container">
                                    {item.events.map((ev, idx) => (
                                        <div key={idx} className={`chro-event-item ${ev.type}`}>
                                            <span>{ev.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                    ))}
                </div>

                {/* Create/Add Modal */}
                {createPortal(
                    isAddModalOpen && (
                        <div className="chro-modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
                            <div 
                                className="chro-modal-panel"
                                onClick={e => e.stopPropagation()}
                            >
                               {/* ... (Existing Modal Content Preserved to avoid large diffs, assumed unchanged logic inside) ... */}
                                <div className="chro-modal-header">
                                    <h2>New Agenda</h2>
                                    <span>Create a new schedule entry</span>
                                </div>
                                <div className="chro-modal-body">
                                    <form onSubmit={handleAddEventSubmit}>
                                        <div className="chro-input-group">
                                            <label>Title</label>
                                            <input className="chro-input" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} autoFocus required />
                                        </div>
                                        <div style={{ display: 'flex', gap: '20px' }}>
                                            <div className="chro-input-group" style={{ flex: 1 }}>
                                                <label>Date</label>
                                                <input type="date" className="chro-input" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} required />
                                            </div>
                                            <div className="chro-input-group" style={{ flex: 1 }}>
                                                <label>Category</label>
                                                <select className="chro-input" value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value})} style={{ background: '#0a0a0a' }}>
                                                    <option value="Company Event">Company Event</option>
                                                    <option value="Meeting">Meeting</option>
                                                    <option value="Holiday">Holiday</option>
                                                    <option value="Training">Training</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="chro-input-group">
                                            <label>Notes</label>
                                            <input className="chro-input" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} />
                                        </div>
                                        <div className="chro-modal-footer">
                                            <button type="button" className="chro-btn-cancel" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                                            <button type="submit" className="chro-btn-submit">Confirm Agenda</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    ),
                    document.body
                )}

                {/* View Day Modal */}
                {createPortal(
                    viewedDay && (
                        <div className="chro-modal-backdrop" onClick={() => setViewedDay(null)}>
                            <div 
                                className="chro-modal-panel"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="chro-modal-header">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h2>{dayjs(viewedDay.date).format("DD")}</h2>
                                        <button className="chro-btn-cancel" onClick={() => setViewedDay(null)}><X /></button>
                                    </div>
                                    <span>{dayjs(viewedDay.date).format("MMMM YYYY")}</span>
                                </div>
                                <div className="chro-modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                                    {viewedDay.events.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#666' }}>
                                            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📅</div>
                                            <p style={{ margin: '0 0 1.5rem', fontSize: '1.1rem' }}>No agenda scheduled.</p>
                                            <button className="chro-btn-submit" style={{ width: '100%', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => {
                                                setNewEvent(prev => ({...prev, date: viewedDay.date}));
                                                setViewedDay(null);
                                                setIsAddModalOpen(true);
                                            }}>
                                                <Plus size={18} /> Add New Agenda
                                            </button>
                                        </div>
                                    ) : (
                                        viewedDay.events.map((ev, i) => (
                                            <div key={i} style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #222' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <h3 style={{ margin: '0 0 5px', fontSize: '1.2rem', color: '#fff', fontFamily: 'var(--font-display)' }}>{ev.title}</h3>
                                                    <button onClick={() => handleDeleteEvent(ev.id)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <p style={{ margin: 0, color: '#999', fontSize: '0.9rem', lineHeight: '1.5' }}>{ev.description}</p>
                                                <div style={{ marginTop: '8px', display: 'inline-block', padding: '2px 8px', border: '1px solid #333', fontSize: '0.7rem', color: '#888', textTransform: 'uppercase' }}>
                                                    {ev.type}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    ),
                    document.body
                )}

                {/* --- Local Popups Render --- */}
                <LocalStatusModal 
                    isLoading={statusState.loading}
                    isSuccess={statusState.success}
                    title={statusState.title}
                    message={statusState.message}
                    onClose={() => setStatusState({ ...statusState, success: false })}
                />
                
                <LocalConfirmModal 
                    isOpen={confirmState.isOpen}
                    onClose={() => setConfirmState({...confirmState, isOpen: false})}
                    onConfirm={confirmState.onConfirm}
                    title={confirmState.title}
                    message={confirmState.message}
                />

                {notifState.isOpen && (
                    <LocalNotification 
                        isOpen={notifState.isOpen}
                        type={notifState.type}
                        title={notifState.title}
                        message={notifState.message}
                        onClose={() => setNotifState({...notifState, isOpen: false})}
                    />
                )}

            </div>
        </div>
      </CHROLayout>
    </div>
  );
};

export default CalendarCHRO;
