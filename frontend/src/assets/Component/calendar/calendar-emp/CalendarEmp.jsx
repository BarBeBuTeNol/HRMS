import React, { useState, useEffect } from "react";
import "./CalendarEmp.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  X,
} from "lucide-react";
import dayjs from "dayjs";
import api from "../../../../services/api";
import EmployeeSidebar from "../../Employee/EmployeeSidebar";

const CalendarEmp = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [events, setEvents] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);

  // Employee is Read-Only
  
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
        const dayEvents = events.filter(e => dayjs(e.date).format("YYYY-MM-DD") === dateStr);
        days.push({
            type: "day",
            day: i,
            date: dateStr,
            events: dayEvents,
            isWeekend: [0, 6].includes(currentDate.date(i).day()),
            key: `day-${i}`
        });
    }
    return days;
  };

  const handleDayClick = (item) => {
    if (item.events.length > 0 || item.isWeekend) {
        setViewedDay(item);
    }
  };

  return (
    <div className={`calendar-layout-emp ${isSidebarOpen ? "" : "sidebar-collapsed"}`}>
      <EmployeeSidebar onToggle={setIsSidebarOpen} />
      
      <div className="calendar-content-area">
        <div className="emp-calendar-container">
          {/* Header */}
          <div className="emp-calendar-header">
            <div className="emp-calendar-title">
              <div className="emp-icon-circle">
                 <CalendarIcon size={24} />
              </div>
                <div>
                  <span className="emp-subtitle">Company Calendar</span>
                  <span className="emp-main-title">{currentDate.format("MMMM YYYY")}</span>
                </div>
            </div>

            <div className="emp-calendar-nav">
                <button onClick={() => setCurrentDate(currentDate.subtract(1, "month"))} className="emp-cal-btn">
                  <ChevronLeft size={18} />
                </button>
                <button 
                  onClick={() => setCurrentDate(dayjs())} 
                  className="emp-present-btn"
                >
                    Present
                </button>
                <button onClick={() => setCurrentDate(currentDate.add(1, "month"))} className="emp-cal-btn">
                  <ChevronRight size={18} />
                </button>
            </div>
          </div>

          {/* Grid */}
          <div className="emp-grid-header">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                <div key={d} className="emp-day-name">{d}</div>
            ))}
          </div>

          <motion.div 
            className="emp-calendar-grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={currentDate.format("MM")}
          >
            {generateCalendarDays().map(item => (
                item.type === 'empty' ? 
                <div key={item.key} className="emp-cal-day empty" /> :
                <div 
                    key={item.key} 
                    className={`emp-cal-day ${dayjs().isSame(item.date, 'day') ? 'today' : ''} ${(item.isWeekend || item.events.some(e => e.type === 'holiday')) ? 'is-holiday' : ''}`}
                    onClick={() => handleDayClick(item)}
                    style={{ cursor: item.events.length ? 'pointer' : 'default' }}
                >
                    <div className="emp-day-num">{item.day}</div>
                    <div className="emp-events-wrapper">
                        {item.events.map((ev, i) => (
                            <div key={i} className={`emp-event-pill ${ev.type} text-xs`}>
                                {ev.title || ev.event_name}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
          </motion.div>

          {/* Modal */}
          <AnimatePresence>
            {viewedDay && (
                <div className="emp-modal-overlay" onClick={() => setViewedDay(null)}>
                    <motion.div 
                        className="emp-modal"
                        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="emp-modal-header">
                            <h3>{dayjs(viewedDay.date).format("D MMMM YYYY")}</h3>
                            <button onClick={() => setViewedDay(null)} className="emp-modal-close"><X size={20} /></button>
                        </div>
                        <div className="emp-modal-body">
                            {viewedDay.events.length === 0 ? (
                                <p className="text-gray-400 text-center">No events.</p>
                            ) : (
                                viewedDay.events.map((ev, i) => (
                                    <div key={i} className={`emp-event-detail ${ev.type}`}>
                                        <h4>{ev.title || ev.event_name}</h4>
                                        <p>{ev.description}</p>
                                    </div>
                                ))
                            )}
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

export default CalendarEmp;
