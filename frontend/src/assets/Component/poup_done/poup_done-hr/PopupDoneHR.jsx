import React, { useState, useEffect } from "react";
import "./PopupDoneHR.css";
import { FaCheck } from "react-icons/fa";

const PopupDoneHR = ({ isOpen, onClose, message, title = "Task Complete" }) => {
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
    <div className={`popup-done-hr-overlay ${isOpen ? "open" : ""}`}>
      <div className="popup-done-hr-container">
        <div className="popup-done-hr-content">
          <div className="popup-done-hr-icon-wrapper">
            <div className="icon-circle-bg"></div>
            <FaCheck className="popup-done-hr-icon" />
          </div>
          <h2 className="popup-done-hr-title">{title}</h2>
          <p className="popup-done-hr-message">{message}</p>
        </div>
        <div className="popup-done-hr-footer">
          <button className="popup-done-hr-button" onClick={onClose}>
            Okay, Great!
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupDoneHR;
