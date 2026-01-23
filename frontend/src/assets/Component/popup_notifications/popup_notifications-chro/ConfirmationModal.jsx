import React from "react";
import "./ConfirmationModal.css";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  type = "warning", // warning, info, danger
}) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay-chro" onClick={onClose}>
      <div
        className={`confirm-modal-card-chro ${type}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-modal-icon-wrapper-chro">
          <span className="confirm-icon-chro">
            {type === "danger" ? "🗑️" : type === "warning" ? "⚠️" : "ℹ️"}
          </span>
        </div>
        <h3 className="confirm-modal-title-chro">{title}</h3>
        <p className="confirm-modal-message-chro">{message}</p>

        <div className="confirm-modal-actions-chro">
          <button className="confirm-btn-cancel-chro" onClick={onClose}>
            {cancelLabel}
          </button>
          <button
            className={`confirm-btn-confirm-chro ${type}`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
