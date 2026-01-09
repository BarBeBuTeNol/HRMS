import React from "react";
import "./Popup_done.css";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";

const PopupDone = ({
  isVisible,
  onClose,
  text = "สำเร็จ!",
  subText = "บันทึกข้อมูลเรียบร้อยแล้ว",
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="popup-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="popup-content"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
          >
            <div className="popup-icon">
              <FaCheckCircle />
            </div>
            <h3>{text}</h3>
            <p>{subText}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PopupDone;
