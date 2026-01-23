import React from "react";
import "./PopupDoneCHRO.css";
import { CheckCircle } from "lucide-react";

const PopupDoneCHRO = ({ isOpen, onClose, message, title = "Success" }) => {
  if (!isOpen) return null;

  return (
    <div className="popup-done-chro-overlay">
      <div className="popup-done-chro-container">
        <div className="popup-done-chro-icon-wrapper">
          <CheckCircle className="popup-done-chro-icon" />
        </div>
        <h2 className="popup-done-chro-title">{title}</h2>
        <p className="popup-done-chro-message">{message}</p>
        <button className="popup-done-chro-button" onClick={onClose}>
          Continue
        </button>
      </div>
    </div>
  );
};

export default PopupDoneCHRO;
