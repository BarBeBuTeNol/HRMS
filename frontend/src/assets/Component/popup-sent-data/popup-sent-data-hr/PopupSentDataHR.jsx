import React, { useEffect, useState } from "react";
import "./PopupSentDataHR.css";
import { FaPaperPlane } from "react-icons/fa";

const PopupSentDataHR = ({
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
    <div className={`popup-sent-overlay-hr ${isOpen ? "open" : "close"}`}>
      <div className="popup-sent-card-hr">
        <div className="plane-container-hr">
          <div className="plane-circle-hr"></div>
          <FaPaperPlane className="plane-icon-hr" />
          <div className="wind-lines-hr">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <h2 className="popup-sent-title-hr">{title}</h2>
        <p className="popup-sent-message-hr">{message}</p>
      </div>
    </div>
  );
};

export default PopupSentDataHR;
