import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaUser,
  FaIdCard,
  FaGraduationCap,
  FaUniversity,
  FaBook,
  FaCode,
  FaCloudUploadAlt,
  FaCheckCircle,
} from "react-icons/fa";
import HRLayout from "../../../Component/HR/HRLayout";
import EditEmpNav from "../../../Component/HR/EditEmpNav";
import PopupNotification from "../../../Component/popup_notifications/popup_notifications-hr/PopupHR";
import "./Add_emp_education.css";

const AddEmpEducation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    empId = "",
    personalId = "",
    empImage = "",
    userId = null,
    isEditMode,
  } = location.state || {}; // Access state correctly

  const [educationLevel, setEducationLevel] = useState("");
  const [university, setUniversity] = useState("");
  const [program, setProgram] = useState("");
  const [experienceFile, setExperienceFile] = useState(null);
  const [skill, setSkill] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // Track original form data for dirty checking
  const [originalForm, setOriginalForm] = useState(null);

  // Local state for image and IDs if not passed
  const [currentImage, setCurrentImage] = useState(empImage);
  const [currentPersonalId, setCurrentPersonalId] = useState(
    personalId || empId,
  );

  useEffect(() => {
    const fetchEducationDetails = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`/api/users/${userId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.education_level) setEducationLevel(data.education_level);
          if (data.institution) setUniversity(data.institution);
          if (data.program) setProgram(data.program);
          if (data.skills) setSkill(data.skills);
          if (data.image_url && !currentImage) setCurrentImage(data.image_url);
          if (data.emp_code) setCurrentPersonalId(data.emp_code);

          // Prepare original form for dirty checking - Keys MUST match useState order
          const loadedForm = {
            educationLevel: data.education_level
              ? String(data.education_level)
              : "",
            university: data.institution ? String(data.institution) : "",
            program: data.program ? String(data.program) : "",
            skill: data.skills ? String(data.skills) : "",
          };
          setOriginalForm(JSON.stringify(loadedForm));
        }
      } catch (err) {
        console.error("Failed to fetch education details", err);
      }
    };
    if (userId) {
      fetchEducationDetails();
    }
  }, [userId, currentImage]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setExperienceFile(e.target.files[0]);
    }
  };

  // Dirty check
  const isDirty = (() => {
    // If file uploaded, it's dirty
    if (experienceFile) return true;
    if (!originalForm) return false;
    const currentForm = {
      educationLevel,
      university,
      program,
      skill,
    };
    return JSON.stringify(currentForm) !== originalForm;
  })();

  const handleSave = async () => {
    try {
      const payload = {
        userId: userId,
        educationLevel: educationLevel,
        institution: university,
        program: program,
        previousExperience: "",
        skills: skill,
      };

      const res = await fetch("/api/employee-data/education", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        setIsSaved(true);
        setShowPopup(true);

        // Update dirty state
        const sentForm = {
          educationLevel: payload.educationLevel,
          university: payload.institution,
          program: payload.program,
          skill: payload.skills,
        };
        setOriginalForm(JSON.stringify(sentForm));

        if (!isEditMode) {
          // Only navigate if NOT in edit mode
          setTimeout(() => {
            navigate("/hr/show-emp", { state: { newEmployee: payload } });
          }, 3000);
        } else {
          // Stay on page
        }
      } else {
        alert("Error saving data: " + result.message);
      }
    } catch (err) {
      console.error("Network Error:", err);
      alert("Network Error: " + err.message);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  // ... unchanged animation variants ...
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <HRLayout>
      <div className="add-emp-education-container">
        {/* Header Section */}
        {isEditMode ? (
          <EditEmpNav userId={userId} activeTab="education" />
        ) : (
          <motion.div
            className="education-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="add-emp-education-title">Education & Skills</h2>
            <span className="step-indicator">
              Step 3 of 3: Final Verification
            </span>
          </motion.div>
        )}

        <motion.div
          className="add-emp-education-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Column: Employee Identity */}
          <motion.div className="education-image-card" variants={itemVariants}>
            <div className="education-image-wrapper">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt="Employee"
                  className="education-emp-image"
                />
              ) : (
                <div className="education-image-placeholder">
                  <FaUser />
                </div>
              )}
            </div>

            <div className="emp-id-badges">
              <div className="id-badge">
                <label>User ID</label>
                <span>{userId || "N/A"}</span>
              </div>
              <div className="id-badge">
                <label>Employee Code</label>
                <span>{currentPersonalId || "N/A"}</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Form */}
          <motion.div className="education-form-card" variants={itemVariants}>
            {/* Section 1: Academic Background */}
            <div className="form-section">
              <div className="section-title">
                <FaGraduationCap className="section-icon" />
                <span>Academic Background</span>
              </div>
              <div className="education-fields-grid">
                <div className="form-group span-1">
                  <label>Education Level</label>
                  <div className="input-group">
                    <FaBook className="input-icon" />
                    <input
                      type="text"
                      value={educationLevel}
                      onChange={(e) => setEducationLevel(e.target.value)}
                      placeholder="e.g. Bachelor's Degree"
                    />
                  </div>
                </div>
                <div className="form-group span-1">
                  <label>University / Institution</label>
                  <div className="input-group">
                    <FaUniversity className="input-icon" />
                    <input
                      type="text"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      placeholder="University Name"
                    />
                  </div>
                </div>
                <div className="form-group span-2">
                  <label>Program / Major</label>
                  <div className="input-group">
                    <FaGraduationCap className="input-icon" />
                    <input
                      type="text"
                      value={program}
                      onChange={(e) => setProgram(e.target.value)}
                      placeholder="Field of Study"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Skills & Experience */}
            <div className="form-section">
              <div className="section-title">
                <FaCode className="section-icon" />
                <span>Skills & Experience</span>
              </div>
              <div className="education-fields-grid">
                <div className="form-group span-2">
                  <label>Professional Skills</label>
                  <div className="input-group">
                    <textarea
                      value={skill}
                      onChange={(e) => setSkill(e.target.value)}
                      placeholder="List key technologies and skills..."
                    />
                  </div>
                </div>
                <div className="form-group span-2">
                  <label>Previous Experience File</label>
                  <label htmlFor="exp-upload" className="file-upload-zone">
                    <input
                      id="exp-upload"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      hidden
                    />
                    <div className="upload-content">
                      <FaCloudUploadAlt className="upload-icon" />
                      <span>Click to upload or drag and drop</span>
                      {experienceFile ? (
                        <span className="file-name">
                          <FaCheckCircle
                            style={{ marginRight: 5, verticalAlign: "middle" }}
                          />
                          {experienceFile.name}
                        </span>
                      ) : (
                        <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                          PDF, DOC, DOCX up to 10MB
                        </span>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              className="form-actions"
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center", // Centered
              }}
            >
              <button
                onClick={handleCancel}
                className="btn-back"
                style={{ width: "300px" }} // Expanded
              >
                Back
              </button>
              <button
                onClick={handleSave}
                className="btn-save"
                disabled={isEditMode ? !isDirty : false}
                style={{
                  width: isEditMode ? "300px" : "100%", // Expanded
                  flex: isEditMode ? "none" : 1,
                  opacity: isEditMode && !isDirty ? 0.5 : 1,
                  cursor: isEditMode && !isDirty ? "not-allowed" : "pointer",
                }}
              >
                {isSaved
                  ? "Saved"
                  : isEditMode
                    ? "Save Changes"
                    : "Complete Registration"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
      <PopupNotification
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        title="Success!"
        message={
          isEditMode
            ? "Education details updated successfully."
            : "Employee registration has been completed successfully."
        }
        type="success"
      />
    </HRLayout>
  );
};

export default AddEmpEducation;
