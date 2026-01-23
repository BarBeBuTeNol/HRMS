import React, { useState } from "react";
import "./ChangeRequestModalCHRO.css";

const ChangeRequestModal = ({
  isOpen,
  onClose,
  changes,
  employeeName,
  onSubmit,
}) => {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!reason.trim()) return;
    onSubmit(reason, null);
  };

  return (
    <div className="crm-overlay-chro" onClick={onClose}>
      <div className="crm-content-chro" onClick={(e) => e.stopPropagation()}>
        <h2 className="crm-title-chro">Request Changes for {employeeName}</h2>
        <div className="crm-changes-list-chro">
          {changes.map((change, index) => (
            <div key={index} className="crm-change-item-chro">
              <strong>{change.field}:</strong>{" "}
              <span className="crm-old-val">{change.oldValue}</span> &rarr;{" "}
              <span className="crm-new-val">{change.newValue}</span>
            </div>
          ))}
        </div>
        <textarea
          className="crm-textarea-chro"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for change..."
        />
        <div className="crm-actions-chro">
          <button className="crm-btn-cancel-chro" onClick={onClose}>
            Cancel
          </button>
          <button
            className="crm-btn-submit-chro"
            onClick={handleSubmit}
            disabled={!reason.trim()}
            style={{
              opacity: !reason.trim() ? 0.5 : 1,
              cursor: !reason.trim() ? "not-allowed" : "pointer",
            }}
          >
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeRequestModal;
