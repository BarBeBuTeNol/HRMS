import React from "react";
import Sidebar_HR from "./Sidebar_HR";
import { motion } from "framer-motion";

const HRLayout = ({ children }) => {
  return (
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
  );
};

export default HRLayout;
