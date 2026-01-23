import React, { useState, useEffect, useRef } from "react";
import "./CustomSelect.css";
import { ChevronDown, Check } from "lucide-react";

const CustomSelect = ({
  options,
  value,
  onChange,
  placeholder,
  icon: Icon,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const getLabel = (opt) => (typeof opt === "object" ? opt.label : opt);
  const getValue = (opt) => (typeof opt === "object" ? opt.value : opt);

  const selectedOption = options.find((opt) => getValue(opt) === value);
  const displayValue = selectedOption
    ? getLabel(selectedOption)
    : getLabel(options.find((o) => getValue(o) === value)) ||
      value ||
      placeholder;

  return (
    <div className={`custom-select-container ${className}`} ref={selectRef}>
      <div
        className={`custom-select-trigger ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="custom-select-value">
          {Icon && <Icon className="custom-select-icon" size={18} />}
          <span>{displayValue}</span>
        </div>
        <ChevronDown
          className={`custom-select-arrow ${isOpen ? "rotated" : ""}`}
          size={18}
        />
      </div>

      {isOpen && (
        <div className="custom-select-dropdown">
          {options.map((option, index) => {
            const optValue = getValue(option);
            const optLabel = getLabel(option);
            const isSelected = optValue === value;
            return (
              <div
                key={index}
                className={`custom-select-option ${isSelected ? "selected" : ""}`}
                onClick={() => handleSelect(optValue)}
              >
                <span>{optLabel}</span>
                {isSelected && <Check size={16} className="check-icon" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
