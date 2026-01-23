import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./PopupHR.css";

// --- Icons (HR Teal/Emerald Style) ---
const Icons = {
  Success: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
        fill="currentColor"
      />
    </svg>
  ),
  Error: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM15.59 7L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41L15.59 7Z"
        fill="currentColor"
      />
    </svg>
  ),
  Warning: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1 21H23L12 2L1 21ZM13 18H11V16H13V18ZM13 14H11V10H13V14Z"
        fill="currentColor"
      />
    </svg>
  ),
  Info: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z"
        fill="currentColor"
      />
    </svg>
  ),
};

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

  let IconComponent = Icons.Info;
  if (type === "success") IconComponent = Icons.Success;
  if (type === "error") IconComponent = Icons.Error;
  if (type === "warning") IconComponent = Icons.Warning;

  const radius = 16;
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
          <div className="popup-icon-wrapper-hr">
            <div className="popup-icon-hr">{IconComponent}</div>
          </div>
          <h3 className="popup-title-hr">{title}</h3>
          <p className="popup-message-hr">{message}</p>
        </div>

        {autoClose && (
          <div className="popup-timer-container-hr">
            <svg
              className="timer-svg-hr"
              width="40"
              height="40"
              viewBox="0 0 40 40"
            >
              <circle
                className="timer-circle-bg-hr"
                cx="20"
                cy="20"
                r={radius}
              />
              <circle
                className="timer-circle-progress-hr"
                cx="20"
                cy="20"
                r={radius}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="redirect-text-hr">Processing...</div>
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
