import React from "react";
import "./LoadingHR.css";

const LoadingHR = ({ className = "" }) => {
  return (
    <div className={`loading-hr-container ${className}`}>
      <div className="loading-hr-content">
        <div className="hr-hex-spinner">
          <div className="hex-outer"></div>
          <div className="hex-middle"></div>
          <div className="hex-inner"></div>
        </div>
        <h3 className="loading-hr-text">Processing Request...</h3>
      </div>
    </div>
  );
};

export default LoadingHR;
