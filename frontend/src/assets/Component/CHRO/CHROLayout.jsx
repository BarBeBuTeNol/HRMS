import React, { useState, useEffect } from "react";
import SidebarCHRO from "./SidebarCHRO";
import "./CHROLayout.css";
import LoadingCHRO from "../loading/loading-chro/LoadingCHRO";
import { AnimatePresence, motion } from "framer-motion";

const CHROLayout = ({ children, disableInitialLoading = false }) => {
  const [loading, setLoading] = useState(!disableInitialLoading);

  // --- Sidebar State Management ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (window.innerWidth < 1024) return false;
    const saved = localStorage.getItem("chroSidebarOpen");
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    if (disableInitialLoading) return;
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [disableInitialLoading]);

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
        <div className="chro-layout-content">
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: "absolute",
                  zIndex: 50,
                  inset: "-32px -40px",
                  borderRadius: "inherit",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <LoadingCHRO />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {children}
        </div>
      </div>
    </>
  );
};

export default CHROLayout;
