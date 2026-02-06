import React, { useEffect, useState } from "react";
import "./PopupSentDataEmp.css";
import { FaPaperPlane } from "react-icons/fa";

const PopupSentDataEmp = ({
  isOpen,
  onClose,
  title = "Sending..",
  message = "Your data is being processed.",
}) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 400); // Wait for exit animation
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div className={`popup-sent-overlay-emp ${isOpen ? "open" : "close"}`}>
      <div className="popup-sent-card-emp">
        <div className="plane-container-emp">
          <div className="plane-circle-emp"></div>
          <FaPaperPlane className="plane-icon-emp" />
          <div className="wind-lines-emp">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <h2 className="popup-sent-title-emp">{title}</h2>
        <p className="popup-sent-message-emp">{message}</p>
      </div>
    </div>
  );
};

export default PopupSentDataEmp;
