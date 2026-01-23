import React from "react";
import "./LoadingEmp.css";

const LoadingEmp = () => {
  return (
    <div className="loading-emp-container">
      <div className="loading-emp-card">
        <div className="loading-emp-dots">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
        <h4 className="loading-emp-text">Loading Workspace...</h4>
      </div>
    </div>
  );
};

export default LoadingEmp;
