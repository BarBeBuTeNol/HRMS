import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFileUpload,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import "./ChangeRequestModal.css";

const ChangeRequestModal = ({
  isOpen,
  onClose,
  changes,
  employeeName,
  onSubmit,
}) => {
  const [reason, setReason] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [effectiveDate, setEffectiveDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Termination Logic
  const isTermination = changes.some(
    (c) =>
      c.field === "employmentStatus" &&
      (c.newValue === "Terminated" || c.newValue === "Resigned")
  );

  const [checklist, setChecklist] = useState({
    assetsReturned: false,
    accountsRevoked: false,
    financeNotified: false,
  });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError("Please provide a reason for this change.");
      return;
    }
    if (!file) {
      setError("Evidence file is mandatory.");
      return;
    }

    if (isTermination) {
      if (
        !checklist.assetsReturned ||
        !checklist.accountsRevoked ||
        !checklist.financeNotified
      ) {
        setError("Please complete the termination checklist.");
        return;
      }
    }

    // Bundle data into reason field as requested (schema constraint)
    let finalReason = `Reason: ${reason}\nEffective Date: ${effectiveDate}`;

    if (isTermination) {
      finalReason += `\n[Checklist] Assets Returned: ${
        checklist.assetsReturned ? "Yes" : "No"
      }`;
      finalReason += ` | Accounts Revoked: ${
        checklist.accountsRevoked ? "Yes" : "No"
      }`;
      finalReason += ` | Finance Notified: ${
        checklist.financeNotified ? "Yes" : "No"
      }`;
    }

    onSubmit(finalReason, file);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="crm-overlay">
        <motion.div
          className="crm-modal"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <div className="crm-header">
            <h2>
              <FaExclamationTriangle className="crm-warning-icon" /> Confirm
              Changes
            </h2>
            <button className="crm-close-btn" onClick={onClose}>
              <FaTimes />
            </button>
          </div>

          <div className="crm-body">
            <p className="crm-description">
              As a CHRO, modifications require approval. Please review your
              changes and provide justification.
            </p>

            {employeeName && (
              <div className="crm-target-employee">
                <span>Target:</span> {employeeName}
              </div>
            )}

            <div className="crm-changes-list">
              <h4>Modified Fields:</h4>
              <ul>
                {changes.map((change, index) => (
                  <li key={index}>
                    <strong>{change.field}:</strong>
                    <span className="crm-old">
                      {change.oldValue || "Empty"}
                    </span>
                    →<span className="crm-new">{change.newValue}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="crm-row-group">
              <div className="crm-form-group half">
                <label>Effective Date *</label>
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                />
              </div>
            </div>

            {isTermination && (
              <div className="crm-checklist-section">
                <h4>Termination Checklist</h4>
                <label className="crm-checkbox-label">
                  <input
                    type="checkbox"
                    checked={checklist.assetsReturned}
                    onChange={(e) =>
                      setChecklist({
                        ...checklist,
                        assetsReturned: e.target.checked,
                      })
                    }
                  />
                  Assets Returned (Laptop, ID Card, Key)
                </label>
                <label className="crm-checkbox-label">
                  <input
                    type="checkbox"
                    checked={checklist.accountsRevoked}
                    onChange={(e) =>
                      setChecklist({
                        ...checklist,
                        accountsRevoked: e.target.checked,
                      })
                    }
                  />
                  System Accounts Revoked
                </label>
                <label className="crm-checkbox-label">
                  <input
                    type="checkbox"
                    checked={checklist.financeNotified}
                    onChange={(e) =>
                      setChecklist({
                        ...checklist,
                        financeNotified: e.target.checked,
                      })
                    }
                  />
                  Finance / Payroll Notified
                </label>
              </div>
            )}

            <div className="crm-form-group">
              <label>Reason for Change *</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Promotion based on performance review..."
                rows={3}
              />
            </div>

            <div className="crm-form-group">
              <label>Evidence Document *</label>
              <div className="crm-file-upload">
                <input
                  type="file"
                  id="evidence-upload"
                  onChange={handleFileChange}
                  hidden
                />
                <label htmlFor="evidence-upload" className="crm-upload-btn">
                  <FaFileUpload />{" "}
                  {file ? file.name : "Upload Document (PDF/JPG)"}
                </label>
              </div>
            </div>

            {error && <div className="crm-error">{error}</div>}
          </div>

          <div className="crm-footer">
            <button className="crm-cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button className="crm-submit-btn" onClick={handleSubmit}>
              <FaCheckCircle /> Submit Request
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ChangeRequestModal;
