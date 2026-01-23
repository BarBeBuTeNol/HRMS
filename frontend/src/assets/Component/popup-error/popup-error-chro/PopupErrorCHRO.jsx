import React from "react";
import "./PopupErrorCHRO.css";
import { XCircle } from "lucide-react";

const PopupErrorCHRO = ({
  isOpen,
  onClose,
  message,
  title = "Error Occurred",
}) => {
  if (!isOpen) return null;

  return (
    <div className="popup-error-chro-overlay">
      <div className="popup-error-chro-container">
        <div className="popup-error-chro-icon-wrapper">
          <XCircle className="popup-error-chro-icon" />
        </div>
        <h2 className="popup-error-chro-title">{title}</h2>
        <p className="popup-error-chro-message">{message}</p>
        <button className="popup-error-chro-button" onClick={onClose}>
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default PopupErrorCHRO;
