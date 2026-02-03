import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./PopupHR.css";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

const PopupHR = ({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
  autoClose = false,
  duration = 3000,
  actionLabel = "Close",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setShouldRender(false), 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval;
    if (isOpen && autoClose && duration > 0) {
      const startTime = Date.now();
      const endTime = startTime + duration;

      const updateProgress = () => {
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
        const percentage = ((duration - remaining) / duration) * 100;
        setProgress(percentage);

        if (remaining <= 0) {
          onClose();
        } else {
          interval = requestAnimationFrame(updateProgress);
        }
      };
      interval = requestAnimationFrame(updateProgress);
    }
    return () => cancelAnimationFrame(interval);
  }, [isOpen, autoClose, duration, onClose]);

  if (!shouldRender) return null;

  let IconComponent = <FaInfoCircle />;
  if (type === "success") IconComponent = <FaCheckCircle />;
  if (type === "error") IconComponent = <FaExclamationCircle />;
  if (type === "warning") IconComponent = <FaExclamationTriangle />;

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return createPortal(
    <div
      className={`popup-overlay-hr ${isVisible ? "open" : ""}`}
      onClick={onClose}
    >
      <div
        className={`popup-card-hr ${type}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="popup-header-hr">
          <div className={`popup-icon-wrapper-hr ${type}`}>{IconComponent}</div>
          <h3 className="popup-title-hr">{title}</h3>
          <p className="popup-message-hr">{message}</p>
        </div>

        {autoClose && (
          <div className="popup-timer-container-hr">
            <div className="timer-wrapper">
              <svg
                className="timer-svg-hr"
                width="44"
                height="44"
                viewBox="0 0 44 44"
              >
                <circle
                  className="timer-circle-bg-hr"
                  cx="22"
                  cy="22"
                  r={radius}
                />
                <circle
                  className="timer-circle-progress-hr"
                  cx="22"
                  cy="22"
                  r={radius}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <span className="timer-label">Auto Closing</span>
            </div>
          </div>
        )}

        <div className="popup-footer-hr">
          {!autoClose && (
            <button className="popup-action-btn-hr" onClick={onClose}>
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default PopupHR;
