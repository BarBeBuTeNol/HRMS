import React from "react";
import "./LoadingEmp.css";

const LoadingEmp = () => {
  return (
    <div className="loading-emp-container">
      {/* Ambient Background Particles */}
      <div className="particles-container">
        <div className="particle p1"></div>
        <div className="particle p2"></div>
        <div className="particle p3"></div>
      </div>
      
      {/* Main Content */}
      <div className="loading-core-wrapper">
        <div className="crystal-loader">
          <div className="crystal-face f1"></div>
          <div className="crystal-face f2"></div>
          <div className="crystal-face f3"></div>
          <div className="core-glow"></div>
        </div>
        
        <div className="loading-text-container">
            <h4 className="loading-title">Workspace</h4>
            <div className="loading-bar-wrapper">
                <div className="loading-bar"></div>
            </div>
            <p className="loading-subtitle">Initializing Environment...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingEmp;
