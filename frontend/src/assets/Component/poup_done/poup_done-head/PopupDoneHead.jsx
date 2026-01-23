import React from "react";
import "./PopupDoneHead.css";
import { Award } from "lucide-react";

const PopupDoneHead = ({
  isOpen,
  onClose,
  message,
  title = "Operation Successful",
}) => {
  if (!isOpen) return null;

  return (
    <div className="popup-done-head-overlay">
      <div className="popup-done-head-container">
        <div className="popup-done-head-gold-line"></div>
        <div className="popup-done-head-content">
          <div className="popup-done-head-icon-box">
            <Award className="popup-done-head-icon" />
          </div>
          <h2 className="popup-done-head-title">{title}</h2>
          <div className="popup-done-head-divider"></div>
          <p className="popup-done-head-message">{message}</p>
          <button className="popup-done-head-button" onClick={onClose}>
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupDoneHead;
