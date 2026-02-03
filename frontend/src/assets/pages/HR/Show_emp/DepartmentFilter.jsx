import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaFilter, FaChevronDown, FaCheck } from "react-icons/fa";
import "./Show_emp.css";

const DepartmentFilter = ({ departments, selectedDept, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (deptName) => {
    onSelect(deptName);
    setIsOpen(false);
  };

  return (
    <div className="custom-dept-filter" ref={dropdownRef}>
      <button
        className={`dept-trigger-btn ${isOpen ? "active" : ""}`}
        onClick={toggleDropdown}
      >
        <div className="trigger-content">
          <FaFilter className="filter-icon" />
          <span className="selected-label">
            {selectedDept || "All Departments"}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <FaChevronDown className="chevron-icon" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="dept-dropdown-menu"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <div className="dept-options-list">
              <div
                className={`dept-option ${selectedDept === "" ? "selected" : ""}`}
                onClick={() => handleSelect("")}
              >
                <span>All Departments</span>
                {selectedDept === "" && <FaCheck className="check-icon" />}
              </div>
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  className={`dept-option ${
                    selectedDept === dept.department_name ? "selected" : ""
                  }`}
                  onClick={() => handleSelect(dept.department_name)}
                >
                  <span>{dept.department_name}</span>
                  {selectedDept === dept.department_name && (
                    <FaCheck className="check-icon" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DepartmentFilter;
