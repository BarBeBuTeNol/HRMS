import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
import "./Popup_done.css";

// =========================================
//           CHRO (Executive) Popup
// =========================================
export const PopupDoneCHRO = ({
  isVisible,
  onClose,
  text = "Authorized",
  subText = "Executive directive confirmed.",
}) => {
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="popup-overlay chro"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="popup-card-chro"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", damping: 15 }}
        >
          <div className="popup-icon-chro">
            <FaCheckCircle />
          </div>
          <h3 className="popup-title-chro">{text}</h3>
          <p className="popup-text-chro">{subText}</p>
          <button className="popup-btn-chro" onClick={onClose}>
            Close
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// =========================================
//            HEAD (Management) Popup
// =========================================
export const PopupDoneHead = ({
  isVisible,
  onClose,
  text = "Completed",
  subText = "Operation successful.",
}) => {
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="popup-overlay head"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="popup-card-head"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="popup-icon-head">
            <FaCheckCircle />
          </div>
          <h3 className="popup-title-head">{text}</h3>
          <p className="popup-text-head">{subText}</p>
          <button className="popup-btn-head" onClick={onClose}>
            Acknowledge
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// =========================================
//              HR (General) Popup
// =========================================
export const PopupDoneHR = ({
  isVisible,
  onClose,
  text = "Success",
  subText = "Data updated successfully.",
}) => {
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="popup-overlay hr"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="popup-card-hr"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
        >
          <div className="popup-icon-hr">
            <FaCheckCircle />
          </div>
          <h3 className="popup-title-hr">{text}</h3>
          <p className="popup-text-hr">{subText}</p>
          <button className="popup-btn-hr" onClick={onClose}>
            Done
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// =========================================
//            EMPLOYEE (Standard) Popup
// =========================================
export const PopupDoneEmp = ({
  isVisible,
  onClose,
  text = "Done",
  subText = "Action completed.",
}) => {
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="popup-overlay emp"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="popup-card-emp"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          <div className="popup-icon-emp">
            <FaCheckCircle />
          </div>
          <h3 className="popup-title-emp">{text}</h3>
          <p className="popup-text-emp">{subText}</p>
          <button className="popup-btn-emp" onClick={onClose}>
            Close
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
