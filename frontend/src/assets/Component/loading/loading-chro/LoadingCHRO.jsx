import React from "react";
import "./LoadingCHRO.css";

const LoadingCHRO = () => {
  return (
    <div className="loading-chro-container">
      <div className="chro-command-center">
        {/* Outer orbital rings */}
        <div className="ring ring-outer"></div>
        <div className="ring ring-middle"></div>
        <div className="ring ring-inner"></div>

        {/* Central Core */}
        <div className="core-scanner">
          <div className="scanner-beam"></div>
        </div>

        {/* Logo/Text */}
        <div className="chro-logo-container">
          <span className="chro-logo-text">CHRO</span>
          <span className="chro-logo-sub">SYSTEM</span>
        </div>
      </div>

      <div className="loading-status">
        <span className="typing-text">Initializing Executive Protocols...</span>
      </div>
    </div>
  );
};

export default LoadingCHRO;
