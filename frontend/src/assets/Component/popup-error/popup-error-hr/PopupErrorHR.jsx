import React from "react";
import "./PopupErrorHR.css";
import { XOctagon } from "lucide-react";

const PopupErrorHR = ({ isOpen, onClose, message, title = "System Error" }) => {
  if (!isOpen) return null;

  return (
    <div className="popup-error-hr-overlay">
      <div className="popup-error-hr-container">
        <div className="popup-error-hr-header">
          <div className="popup-error-hr-icon-bg">
            <XOctagon className="popup-error-hr-icon" />
          </div>
        </div>
        <div className="popup-error-hr-body">
          <h2 className="popup-error-hr-title">{title}</h2>
          <p className="popup-error-hr-message">{message}</p>
        </div>
        <div className="popup-error-hr-footer">
          <button className="popup-error-hr-button" onClick={onClose}>
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupErrorHR;
