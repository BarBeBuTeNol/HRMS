import React from "react";
import "./PopupErrorEmp.css";
import { AlertHexagon } from "lucide-react";

const PopupErrorEmp = ({
  isOpen,
  onClose,
  message,
  title = "Something went wrong",
}) => {
  if (!isOpen) return null;

  return (
    <div className="popup-error-emp-overlay">
      <div className="popup-error-emp-container">
        <div className="popup-error-emp-header">
          <AlertHexagon className="popup-error-emp-icon" />
          <h2 className="popup-error-emp-title">{title}</h2>
        </div>
        <div className="popup-error-emp-body">
          <p className="popup-error-emp-message">{message}</p>
        </div>
        <div className="popup-error-emp-footer">
          <button className="popup-error-emp-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupErrorEmp;
