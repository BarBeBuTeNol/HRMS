import React from "react";
import "./PopupDoneHR.css";
import { Leaf } from "lucide-react";

const PopupDoneHR = ({ isOpen, onClose, message, title = "Task Complete" }) => {
  if (!isOpen) return null;

  return (
    <div className="popup-done-hr-overlay">
      <div className="popup-done-hr-container">
        <div className="popup-done-hr-content">
          <div className="popup-done-hr-icon-wrapper">
            <div className="popup-done-hr-ripple"></div>
            <Leaf className="popup-done-hr-icon" />
          </div>
          <h2 className="popup-done-hr-title">{title}</h2>
          <p className="popup-done-hr-message">{message}</p>
        </div>
        <div className="popup-done-hr-footer">
          <button className="popup-done-hr-button" onClick={onClose}>
            Okay
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupDoneHR;
