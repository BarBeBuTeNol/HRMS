import React, { useState, useEffect } from "react";
import "./PopupErrorHR.css";
import { FaExclamationTriangle } from "react-icons/fa";

const PopupErrorHR = ({ isOpen, onClose, message, title = "System Error" }) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div className={`popup-error-hr-overlay ${isOpen ? "open" : ""}`}>
      <div className="popup-error-hr-container">
        <div className="error-header-pattern"></div>
        <div className="popup-error-hr-content">
          <div className="popup-error-hr-icon-wrapper">
            <div className="error-icon-bg"></div>
            <FaExclamationTriangle className="popup-error-hr-icon" />
          </div>
          <h2 className="popup-error-hr-title">{title}</h2>
          <p className="popup-error-hr-message">{message}</p>
        </div>
        <div className="popup-error-hr-footer">
          <button className="popup-error-hr-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupErrorHR;
