import React from "react";
import "./LoadingHR.css";

const LoadingHR = () => {
  return (
    <div className="loading-hr-container">
      <div className="loading-hr-content">
        <div className="hr-hex-spinner">
          <div className="hex-outer"></div>
          <div className="hex-inner"></div>
        </div>
        <h3 className="loading-hr-text">Accessing HR Portal...</h3>
      </div>
    </div>
  );
};

export default LoadingHR;
