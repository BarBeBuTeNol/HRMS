import React, { useState, useEffect } from "react";
import SidebarCHRO from "./SidebarCHRO";
import "./CHROLayout.css";

const CHROLayout = ({ children }) => {
  // --- Sidebar State Management ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (window.innerWidth < 1024) return false;
    const saved = localStorage.getItem("chroSidebarOpen");
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
      // Do not auto-open on resize back to desktop to respect user choice
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const newState = !prev;
      localStorage.setItem("chroSidebarOpen", JSON.stringify(newState));
      return newState;
    });
  };

  return (
    <>
      <SidebarCHRO isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div
        className={`chro-layout-container ${!isSidebarOpen ? "expanded" : ""}`}
      >
        <div className="chro-layout-content">{children}</div>
      </div>
    </>
  );
};

export default CHROLayout;
