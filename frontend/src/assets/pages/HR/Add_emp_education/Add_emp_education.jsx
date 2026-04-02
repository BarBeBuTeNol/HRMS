import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaIdCard,
  FaGraduationCap,
  FaUniversity,
  FaBook,
  FaCode,
  FaCloudUploadAlt,
  FaCheckCircle,
  FaFile,
  FaTrash,
  FaPlus,
} from "react-icons/fa";
import HRLayout from "../../../Component/HR/HRLayout";
import EditEmpNav from "../../../Component/HR/EditEmpNav";
import PopupNotification from "../../../Component/popup_notifications/popup_notifications-hr/PopupHR";
import PopupDoneHR from "../../../Component/poup_done/poup_done-hr/PopupDoneHR";
import PopupErrorHR from "../../../Component/popup-error/popup-error-hr/PopupErrorHR";
import "./Add_emp_education.css";
import api from "../../../../services/api";

const AddEmpEducation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId: paramUserId } = useParams();

  const {
    empId = "",
    personalId = "",
    empImage = "",
    imageUrl: stateImageUrl = "",
    userId: stateUserId = null,
    isEditMode: stateEditMode,
  } = location.state || {};

  // Prioritize Param ID -> State ID
  const userId = paramUserId || stateUserId;
  const isEditMode = !!paramUserId || stateEditMode;

  const [educationList, setEducationList] = useState([]);
  const [newEducation, setNewEducation] = useState({
    level: "",
    university: "",
    major: "",
  });
  const [showAddForm, setShowAddForm] = useState(true);
  const [skill, setSkill] = useState("");
  const [previousExperience, setPreviousExperience] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  // Popup States
  const [notification, setNotification] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });
  const [donePopup, setDonePopup] = useState({
    isOpen: false,
    title: "",
    message: "",
  });
  const [errorPopup, setErrorPopup] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  // New File State
  const [educationFiles, setEducationFiles] = useState([]);

  // Track original form data for dirty checking
  const [originalForm, setOriginalForm] = useState(null);

  // Local state for image and IDs if not passed
  const [currentImage, setCurrentImage] = useState(empImage || stateImageUrl);
  const [currentPersonalId, setCurrentPersonalId] = useState(
    personalId || empId,
  );

  useEffect(() => {
    const fetchEducationDetails = async () => {
      if (!userId) return;
      try {
        const res = await api.get(`/users/${userId}`);
        const data = res.data;
        if (data.education_level || data.institution || data.program) {
            // Handle legacy single-row data or new multi-row data
            const initialList = [];
            if (data.education_level || data.institution || data.program) {
              initialList.push({
                id: Date.now(),
                level: data.education_level || "",
                university: data.institution || "",
                major: data.program || "",
              });
            }
            // If API returns a list (e.g. data.educationList), use that instead:
            if (data.educationList && Array.isArray(data.educationList)) {
              setEducationList(data.educationList);
            } else {
              setEducationList(initialList);
            }
          }
          if (data.skills) setSkill(data.skills);
          if (data.previous_experience) setPreviousExperience(data.previous_experience);
          if ((data.image_url || data.profile_image_url) && !currentImage)
            setCurrentImage(data.image_url || data.profile_image_url);
          if (data.emp_code) setCurrentPersonalId(data.emp_code);

          // Prepare original form for dirty checking
          const loadedForm = {
            educationList:
              data.educationList ||
              (data.education_level
                ? [
                    {
                      level: data.education_level,
                      university: data.institution,
                      major: data.program,
                    },
                  ]
                : []),
            skill: data.skills ? String(data.skills) : "",
            previousExperience: data.previous_experience ? String(data.previous_experience) : "",
          };
          setOriginalForm(JSON.stringify(loadedForm));

      } catch (err) {
        console.error("Failed to fetch education details", err);
      }
    };
    if (userId) {
      fetchEducationDetails();
    }
  }, [userId, currentImage]);

  // --- Validation Helpers ---
  const validateFile = (file) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/jpg",
      "application/msword", // .doc
    ];

    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      setErrorPopup({
        isOpen: true,
        title: "Invalid File Type",
        message: `File "${file.name}" is not supported. Use PDF, DOC/DOCX, or JPG.`,
      });
      return false;
    }

    if (file.size > maxSize) {
      setErrorPopup({
        isOpen: true,
        title: "File Too Large",
        message: `File "${file.name}" exceeds 10MB limit.`,
      });
      return false;
    }
    return true;
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const validFiles = newFiles.filter(validateFile);

    if (educationFiles.length + validFiles.length > 5) {
      setErrorPopup({
        isOpen: true,
        title: "Limit Exceeded",
        message: "You can only upload a maximum of 5 files.",
      });
      return;
    }
    setEducationFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setEducationFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEduChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "level") {
      if (newValue.length > 50) return;
      // Allow letters, numbers, spaces. Block special chars.
      newValue = newValue.replace(/[^a-zA-Z0-9\u0E00-\u0E7F\s]/g, "");
    } else if (name === "university" || name === "major") {
      if (newValue.length > 120) return;
      // Allow letters, numbers, spaces. Block special chars.
      newValue = newValue.replace(/[^a-zA-Z0-9\u0E00-\u0E7F\s]/g, "");
    }
    setNewEducation((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSkillChange = (e) => {
    let newValue = e.target.value;
    if (newValue.length > 255) return;
    // Allow Thai/Eng, numbers, spaces, and commas
    newValue = newValue.replace(/[^a-zA-Z0-9\u0E00-\u0E7F\s,]/g, "");
    setSkill(newValue);
  };

  const handleAddEducation = () => {
    if (educationList.length >= 5) {
      setErrorPopup({
        isOpen: true,
        title: "Limit Exceeded",
        message: "You can only add up to 5 education entries.",
      });
      return;
    }
    if (
      !newEducation.level ||
      !newEducation.university ||
      !newEducation.major
    ) {
      setErrorPopup({
        isOpen: true,
        title: "Missing Information",
        message: "Please fill in all education fields.",
      });
      return;
    }
    setEducationList([...educationList, { ...newEducation, id: Date.now() }]);
    setNewEducation({ level: "", university: "", major: "" });
  };

  const handleRemoveEducation = (id) => {
    setEducationList(educationList.filter((item) => item.id !== id));
  };

  // Dirty check
  const isDirty = (() => {
    // If files added, it's dirty
    if (educationFiles.length > 0) return true;
    if (!originalForm) return false;

    // Simple comparison for now. Ideally sort lists before comparing.
    const currentForm = {
      educationList,
      skill,
      previousExperience,
    };

    return JSON.stringify(currentForm) !== originalForm;
  })();

  const handleSave = async () => {
    try {
      // Use FormData for file uploads
      const formData = new FormData();
      formData.append("userId", userId);
      // We send the list as a JSON string. Backend must parse this.
      formData.append("educationList", JSON.stringify(educationList));
      // Keeping legacy fields for compatibility if needed, or sending empty/first item
      if (educationList.length > 0) {
        formData.append("educationLevel", educationList[0].level);
        formData.append("institution", educationList[0].university);
        formData.append("program", educationList[0].major);
      } else {
        formData.append("educationLevel", "");
        formData.append("institution", "");
        formData.append("program", "");
      }
      formData.append("skills", skill);
      formData.append("previousExperience", previousExperience);

      educationFiles.forEach((file) => {
        formData.append("educationFiles", file);
      });

      const res = await api.post("/employee-data/education", formData);
      const result = res.data;

      setIsSaved(true);
      setEducationFiles([]); // Clear files after save

      // Update dirty state
      const sentForm = {
        educationList: educationList,
        skill: skill,
        previousExperience: previousExperience,
      };
      setOriginalForm(JSON.stringify(sentForm));

      setDonePopup({
        isOpen: true,
        title: "Success",
        message: isEditMode
          ? "Education details updated successfully."
          : "Employee registration has been completed successfully.",
      });

    } catch (err) {
      console.error("Error Saving:", err);
      const message = err.response?.data?.message || err.message;
      setErrorPopup({
        isOpen: true,
        title: "Error Saving",
        message: "Error saving data: " + message,
      });
    }
  };

  const handleDoneClose = () => {
    setDonePopup({ ...donePopup, isOpen: false });
    if (!isEditMode) {
      // Only navigate if NOT in edit mode
      setTimeout(() => {
        // Navigate relative to where we might want to go?
        // User didn't specify next step after education, but usually it's done.
        // Assuming /hr/show-emp is the destination as per logic.
        // Need to pass state if needed.
        // Re-creating the navigate state from original
        const sentForm = {
          educationList: educationList,
          skill: skill,
          previousExperience: previousExperience,
        };
        navigate("/hr/show-emp", { state: { newEmployee: sentForm } });
      }, 500);
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

              {/* Education List */}
              <div className="education-list">
                {educationList.map((edu, index) => (
                  <div key={edu.id} className="education-item-card">
                    <div className="edu-info">
                      <h4>{edu.university}</h4>
                      <p>
                        {edu.level} - {edu.major}
                      </p>
                    </div>
                    <button
                      className="btn-remove-edu"
                      onClick={() => handleRemoveEducation(edu.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Education Form */}
              {educationList.length < 5 && (
                <div className="add-education-form">
                  <h4 className="add-edu-header">
                    Add Education ({educationList.length}/5)
                  </h4>
                  <div className="education-fields-grid">
                    <div className="form-group span-1">
                      <label>Education Level</label>
                      <div className="input-group">
                        <input
                          type="text"
                          name="level"
                          value={newEducation.level}
                          onChange={handleEduChange}
                          placeholder="e.g. Bachelor's Degree"
                          maxLength={50}
                        />
                      </div>
                    </div>
                    <div className="form-group span-1">
                      <label>University / Institution</label>
                      <div className="input-group">
                        <input
                          type="text"
                          name="university"
                          value={newEducation.university}
                          onChange={handleEduChange}
                          placeholder="University Name"
                          maxLength={120}
                        />
                      </div>
                    </div>
                    <div className="form-group span-2">
                      <label>Program / Major</label>
                      <div className="input-group">
                        <input
                          type="text"
                          name="major"
                          value={newEducation.major}
                          onChange={handleEduChange}
                          placeholder="Field of Study"
                          maxLength={120}
                        />
                      </div>
                    </div>
                    <div
                      className="form-group span-2"
                      style={{ textAlign: "right" }}
                    >
                      <button
                        type="button"
                        className="btn-add-edu"
                        onClick={handleAddEducation}
                      >
                        <FaPlus /> Add Education
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
                    {/* Textarea icons are positioned at top in CSS */}
                    {/* <FaCode className="input-icon" />  Optional for textarea if desired, CSS supports it */}
                    <textarea
                      value={skill}
                      onChange={handleSkillChange}
                      placeholder="List key technologies and skills..."
                      maxLength={255}
                    />
                  </div>
                  <span className="char-counter">
                    {skill.length}/255
                  </span>
                </div>

                <div className="form-group span-2">
                  <label>Previous Experience</label>
                  <div className="input-group">
                    <textarea
                      value={previousExperience}
                      onChange={(e) => setPreviousExperience(e.target.value)}
                      placeholder="Description of past work experience..."
                      rows="4"
                    />
                  </div>
                </div>

                {/* File Upload Section */}
                <div className="form-group span-2">
                  <label>Education Documents (Max 5)</label>
                  <div className="file-upload-wrapper">
                    <div className="uploaded-files-list">
                      <AnimatePresence>
                        {educationFiles.map((file, index) => (
                          <motion.div
                            key={`ed-${index}`}
                            className="file-item"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <div className="file-info">
                              <FaFile className="file-icon" />
                              <div className="file-details">
                                <span className="file-name">{file.name}</span>
                                <span className="file-size">
                                  {(file.size / 1024).toFixed(1)} KB
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="btn-remove-file"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile(index);
                              }}
                            >
                              <FaTrash />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {educationFiles.length < 5 && (
                      <>
                        <input
                          type="file"
                          id="edu-upload"
                          multiple
                          onChange={handleFileChange}
                          style={{ display: "none" }}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg"
                        />
                        <button
                          type="button"
                          className="btn-add-file"
                          onClick={() =>
                            document.getElementById("edu-upload").click()
                          }
                        >
                          <FaCloudUploadAlt /> Add Document
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              <button onClick={handleCancel} className="btn-back">
                Back
              </button>
              <button
                onClick={handleSave}
                className="btn-save"
                disabled={isEditMode ? !isDirty : false}
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
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
      <PopupDoneHR
        isOpen={donePopup.isOpen}
        onClose={handleDoneClose}
        title={donePopup.title}
        message={donePopup.message}
      />
      <PopupErrorHR
        isOpen={errorPopup.isOpen}
        onClose={() => setErrorPopup({ ...errorPopup, isOpen: false })}
        title={errorPopup.title}
        message={errorPopup.message}
      />
    </HRLayout>
  );
};

export default AddEmpEducation;
