import React, { useState, useEffect } from "react";
import Sidebar_HR from "./Sidebar_HR";
import { motion, AnimatePresence } from "framer-motion";
import LoadingHR from "../loading/loading-hr/LoadingHR";

const HRLayout = ({ children }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay for page transition
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ position: "fixed", zIndex: 9999, inset: 0 }}
          >
            <LoadingHR />
          </motion.div>
        )}
      </AnimatePresence>
      <div
        className="hr-layout"
        style={{
          width: "100%",
          display: "flex",
          minHeight: "100vh",
          backgroundColor: "var(--bg-primary)",
          color: "var(--text-primary)",
        }}
      >
        <Sidebar_HR />
        <div
          className="hr-content-wrapper"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflowX: "hidden",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ width: "100%" }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default HRLayout;
