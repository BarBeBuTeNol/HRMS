import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./PopupNotification.css";

const PopupNotification = ({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
  autoClose = false,
  duration = 3000,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      requestAnimationFrame(() => setIsAnimating(true));
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 300); // Wait for animation to finish
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const [progress, setProgress] = useState(100);

  useEffect(() => {
    let interval;
    if (isOpen && autoClose && duration > 0) {
      setProgress(100);
      const step = 100 / (duration / 100);

      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev <= 0) {
            clearInterval(interval);
            onClose();
            return 0;
          }
          return prev - step;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isOpen, autoClose, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg
            className="popup-icon success"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
              fill="currentColor"
            />
          </svg>
        );
      case "error":
        return (
          <svg
            className="popup-icon error"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM17 13H7V11H17V13ZM15.59 7L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41L15.59 7Z"
              fill="currentColor"
            />
            {/* Using a clear X icon instead of minus for error generally but keeping similar style */}
            <path
              d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
              fill="currentColor"
            />
          </svg>
        );
      case "warning":
        return (
          <svg
            className="popup-icon warning"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 21H23L12 2L1 21ZM13 18H11V16H13V18ZM13 14H11V10H13V14Z"
              fill="currentColor"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="popup-icon info"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z"
              fill="currentColor"
            />
          </svg>
        );
    }
  };

  return createPortal(
    <div
      className={`notification-popup-overlay ${isAnimating ? "open" : ""}`}
      onClick={onClose}
    >
      <div
        className={`notification-popup-content ${type}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="notification-popup-header">
          {getIcon()}
          <h3>{title}</h3>
        </div>
        <div className="notification-popup-body">
          <p>{message}</p>
        </div>

        {autoClose && (
          <div className="popup-countdown-wrapper">
            <div className="popup-circular-timer">
              <svg viewBox="0 0 36 36">
                <path
                  className="circle-bg"
                  d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="circle"
                  strokeDasharray={`${progress}, 100`}
                  d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="timer-text">
                {Math.ceil((duration * (progress / 100)) / 1000)}s
              </div>
            </div>
            <div className="popup-redirect-message">
              Redirecting to Show Leave...
            </div>
          </div>
        )}

        <div className="notification-popup-footer">
          <button className="notification-popup-btn" onClick={onClose}>
            {autoClose ? "Redirect Now" : "Close"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PopupNotification;
