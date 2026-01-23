import React from "react";
import "./PopupErrorHead.css";
import { AlertTriangle } from "lucide-react";

const PopupErrorHead = ({ isOpen, onClose, message, title = "Error" }) => {
  if (!isOpen) return null;

  return (
    <div className="popup-error-head-overlay">
      <div className="popup-error-head-container">
        <div className="popup-error-head-decoration"></div>
        <div className="popup-error-head-content">
          <div className="popup-error-head-header">
            <AlertTriangle className="popup-error-head-icon" />
            <h2 className="popup-error-head-title">{title}</h2>
          </div>
          <div className="popup-error-head-body">
            <p className="popup-error-head-message">{message}</p>
          </div>
          <div className="popup-error-head-footer">
            <button className="popup-error-head-button" onClick={onClose}>
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupErrorHead;
