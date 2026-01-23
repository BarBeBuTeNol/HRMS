import React from "react";
import "./LoadingHead.css";

const LoadingHead = () => {
  return (
    <div className="loading-head-container">
      <div className="loading-head-content">
        <div className="loading-head-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-core"></div>
        </div>
        <h3 className="loading-head-text">Initializing Head Dashboard...</h3>
        <div className="loading-head-progress">
          <div className="progress-bar"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingHead;
