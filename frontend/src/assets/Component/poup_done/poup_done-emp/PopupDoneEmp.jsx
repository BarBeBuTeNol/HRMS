import React from "react";
import "./PopupDoneEmp.css";
import { Check } from "lucide-react";

const PopupDoneEmp = ({ isOpen, onClose, message, title = "Completed" }) => {
  if (!isOpen) return null;

  return (
    <div className="popup-done-emp-overlay">
      <div className="popup-done-emp-container">
        <div className="popup-done-emp-content">
          <div className="popup-done-emp-icon-bg">
            <Check className="popup-done-emp-icon" />
          </div>
          <div className="popup-done-emp-text">
            <h2 className="popup-done-emp-title">{title}</h2>
            <p className="popup-done-emp-message">{message}</p>
          </div>
        </div>
        <div className="popup-done-emp-actions">
          <button className="popup-done-emp-button" onClick={onClose}>
            Okay, Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupDoneEmp;
