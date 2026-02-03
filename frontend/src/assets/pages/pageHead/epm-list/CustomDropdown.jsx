import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaCheck, FaFilter } from "react-icons/fa";

const CustomDropdown = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="custom-dropdown-comp" ref={dropdownRef}>
      <button
        className={`dropdown-trigger ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>
          <FaFilter style={{ marginRight: "8px", color: "#c5a059" }} />
          {value || placeholder}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <FaChevronDown />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="dropdown-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className={`dropdown-item ${value === "" ? "selected" : ""}`}
              onClick={() => handleSelect("")}
            >
              <span>{placeholder}</span>
              {value === "" && <FaCheck className="check-icon" />}
            </div>
            {options.map((option, idx) => (
              <div
                key={idx}
                className={`dropdown-item ${value === option ? "selected" : ""}`}
                onClick={() => handleSelect(option)}
              >
                <span>{option}</span>
                {value === option && <FaCheck className="check-icon" />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomDropdown;
