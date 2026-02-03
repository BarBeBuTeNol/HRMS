import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaBriefcase,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaIdBadge,
  FaFileAlt,
  FaCloudUploadAlt,
  FaTrash,
  FaFile,
} from "react-icons/fa";
import HRLayout from "../../../Component/HR/HRLayout";
import PopupNotification from "../../../Component/popup_notifications/popup_notifications-hr/PopupHR";
import PopupDoneHR from "../../../Component/poup_done/poup_done-hr/PopupDoneHR";
import PopupErrorHR from "../../../Component/popup-error/popup-error-hr/PopupErrorHR";
import EditEmpNav from "../../../Component/HR/EditEmpNav";
import "./Add_emp_info.css";

const AddEmpInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId: paramUserId } = useParams(); // Get ID from URL
  const {
    empPersonal,
    userId: stateUserId,
    isEditMode: stateEditMode,
    imageUrl: stateImageUrl,
  } = location.state || {};

  // Prioritize Param ID -> State ID
  const userId = paramUserId || stateUserId;
  const isEditMode = !!paramUserId || stateEditMode;

  const [showIds, setShowIds] = useState({
    userId: userId || "",
    empCode: empPersonal?.empId || "",
  });

  const [imageUrl, setImageUrl] = useState("");
  const [departmentId, setDepartmentId] = useState(null);
  const [jobPositions, setJobPositions] = useState([]);
  const [filteredPositions, setFilteredPositions] = useState([]);

  // Popups State
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

  const [form, setForm] = useState({
    empId: "",
    status: "",
    startTime: "",
    endTime: "",
    jobPosition: "",
    startDate: "",
    salary: "",
    benefit: "",
    performanceReview: "",
    trainingInfo: "",
  });

  const [salaryDisplay, setSalaryDisplay] = useState("");
  // Separate file states
  const [performanceFiles, setPerformanceFiles] = useState([]);
  const [trainingFiles, setTrainingFiles] = useState([]);
  const [originalForm, setOriginalForm] = useState(null);

  useEffect(() => {
    if (stateImageUrl) {
      setImageUrl(stateImageUrl);
    } else if (empPersonal?.imageUrl) {
      setImageUrl(empPersonal.imageUrl);
    }

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;

    setForm((prev) => ({
      ...prev,
      startDate: todayStr,
    }));

    const fetchFullDetails = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`/api/users/${userId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.department_id) setDepartmentId(data.department_id);
          setShowIds((prev) => ({
            ...prev,
            userId: userId,
            empCode: data.emp_code || prev.empCode,
          }));

          if (data.image_url || data.profile_image_url) {
            setImageUrl(data.image_url || data.profile_image_url);
          }

          const loadedForm = {
            empId: data.emp_code ? String(data.emp_code) : "",
            status: data.employment_status
              ? String(data.employment_status)
              : "",
            startTime: data.work_start_time ? String(data.work_start_time) : "",
            endTime: data.work_end_time ? String(data.work_end_time) : "",
            jobPosition:
              data.job_position_id || data.position_id
                ? String(data.job_position_id || data.position_id)
                : data.job_position
                  ? String(data.job_position)
                  : "",
            startDate: data.hire_date
              ? new Date(data.hire_date).toISOString().split("T")[0]
              : todayStr,
            salary: data.salary ? String(data.salary) : "",
            benefit: data.benefits ? String(data.benefits) : "",
            performanceReview: data.performance_review
              ? String(data.performance_review)
              : "",
            trainingInfo: data.training_info ? String(data.training_info) : "",
          };

          if (data.emp_code || isEditMode) {
            setForm((prev) => ({ ...prev, ...loadedForm }));
            if (data.salary) {
              const formatted = String(data.salary).replace(
                /\B(?=(\d{3})+(?!\d))/g,
                ",",
              );
              setSalaryDisplay(formatted);
            }
            setOriginalForm(JSON.stringify(loadedForm));
          }
        }
      } catch (err) {
        console.error("Failed to fetch user details", err);
      }
    };

    if (userId) {
      fetchFullDetails();
    }
  }, [userId, isEditMode]);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const res = await fetch("/api/job-positions");
        if (res.ok) {
          const data = await res.json();
          setJobPositions(data);
        }
      } catch (err) {
        console.error("Failed to fetch job positions", err);
      }
    };
    fetchPositions();
  }, []);

  // Fix: Resolve Job Position ID if API returned a Name instead of ID
  useEffect(() => {
    if (form.jobPosition && jobPositions.length > 0) {
      // Check if current value matches an ID directly
      const isId = jobPositions.some(
        (p) => String(p.id) === String(form.jobPosition),
      );

      if (!isId) {
        // If not an ID, try to find by Name
        const matched = jobPositions.find(
          (p) =>
            p.position_name.toLowerCase() === form.jobPosition.toLowerCase(),
        );
        if (matched) {
          console.log(
            `Mapped Job Position "${form.jobPosition}" to ID "${matched.id}"`,
          );
          setForm((prev) => ({ ...prev, jobPosition: String(matched.id) }));
          // Also ensure department is set if missing
          if (!departmentId) setDepartmentId(matched.department_id);
        }
      } else {
        // If it IS an ID, make sure department is set correctly
        const matched = jobPositions.find(
          (p) => String(p.id) === String(form.jobPosition),
        );
        if (matched && !departmentId) {
          setDepartmentId(matched.department_id);
        }
      }
    }
  }, [jobPositions, form.jobPosition, departmentId]);

  useEffect(() => {
    // Show ALL job positions, do not filter by department.
    // The user should be able to select any position, which will then update the departmentId.
    setFilteredPositions(jobPositions);
  }, [jobPositions]);

  // --- Validation Helpers ---
  const validateText = (text) => {
    // Allow Thai, English, Numbers, Whitespace
    const regex = /^[a-zA-Z0-9\u0E00-\u0E7F\s]*$/;
    return regex.test(text);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "salary") {
      const raw = value.replace(/[^\d]/g, "");
      if (raw.length > 10) return;
      const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      setSalaryDisplay(formatted);
      setForm((prev) => ({ ...prev, salary: raw }));
      return;
    }

    if (["benefit", "performanceReview", "trainingInfo"].includes(name)) {
      if (value.length > 255) return;
      if (!validateText(value)) return; // Strictly block special chars
      setForm((prev) => ({ ...prev, [name]: value }));
      return;
    }

    if (name === "jobPosition") {
      const selectedPos = jobPositions.find((p) => p.id == value);
      if (selectedPos) {
        setDepartmentId(selectedPos.department_id);
      }
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // --- File Upload Logic ---
  const validateFile = (file) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/jpg",
      "image/png", // Added back png as valid based on previous code usually accepting images, but user said jpg/pdf/docx. I'll stick to user request.
    ];
    // Wait, user strictly said "pdf, docx, jpg". So I should exclude png?
    // User request: "รับเเค่ pdf, docx, jpg"

    const userAllowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/jpg",
    ];

    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!userAllowedTypes.includes(file.type)) {
      setNotification({
        isOpen: true,
        title: "Invalid File Type",
        message: `File "${file.name}" is not supported. Use PDF, DOCX, or JPG.`,
        type: "error",
      });
      return false;
    }

    if (file.size > maxSize) {
      setNotification({
        isOpen: true,
        title: "File Too Large",
        message: `File "${file.name}" exceeds 10MB limit.`,
        type: "error",
      });
      return false;
    }
    return true;
  };

  const handleFileChange = (e, type) => {
    const newFiles = Array.from(e.target.files);
    const validFiles = newFiles.filter(validateFile);

    if (type === "performance") {
      if (performanceFiles.length + validFiles.length > 5) {
        setNotification({
          isOpen: true,
          title: "Limit Exceeded",
          message: "Max 5 files for Performance Review.",
          type: "warning",
        });
        return;
      }
      setPerformanceFiles((prev) => [...prev, ...validFiles]);
    } else if (type === "training") {
      if (trainingFiles.length + validFiles.length > 5) {
        setNotification({
          isOpen: true,
          title: "Limit Exceeded",
          message: "Max 5 files for Training Info.",
          type: "warning",
        });
        return;
      }
      setTrainingFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index, type) => {
    if (type === "performance") {
      setPerformanceFiles((prev) => prev.filter((_, i) => i !== index));
    } else {
      setTrainingFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleBack = () => {
    if (isEditMode) {
      navigate("/hr/show-emp");
    } else {
      navigate("/hr/add-emp-personal", {
        state: { userId: userId, ...empPersonal },
      });
    }
  };

  const isFormFilled =
    form.jobPosition &&
    form.status &&
    form.startDate &&
    form.startTime &&
    form.endTime &&
    form.salary;

  const isDirty = (() => {
    if (!originalForm) return false;
    const currentComp = { ...form };
    return (
      JSON.stringify(currentComp) !== originalForm ||
      performanceFiles.length > 0 ||
      trainingFiles.length > 0
    );
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormFilled) {
      setNotification({
        isOpen: true,
        title: "Incomplete Form",
        message: "Please fill in all required fields.",
        type: "warning",
      });
      return;
    }

    if (!departmentId) {
      setErrorPopup({
        isOpen: true,
        title: "Missing Department",
        message:
          "Could not retrieve department. Please select a valid position.",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("empCode", showIds.empCode);
      formData.append("departmentId", departmentId);
      formData.append("jobPosition", form.jobPosition);
      formData.append("employmentStatus", form.status);
      formData.append("workStartTime", form.startTime);
      formData.append("workEndTime", form.endTime);
      formData.append("hireDate", form.startDate);
      formData.append("salary", form.salary);
      formData.append("benefits", form.benefit);
      formData.append("performanceReview", form.performanceReview);
      formData.append("trainingInfo", form.trainingInfo);

      performanceFiles.forEach((file) => {
        formData.append("performanceFiles", file);
      });

      trainingFiles.forEach((file) => {
        formData.append("trainingFiles", file);
      });

      const res = await fetch("/api/employee-data/job", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setOriginalForm(JSON.stringify(form));
        setPerformanceFiles([]);
        setTrainingFiles([]);

        const empInfoList = JSON.parse(
          localStorage.getItem("emp_info_list") || "[]",
        );
        const newEmpInfo = {
          ...form,
          personalId: showIds.empCode,
          imageUrl,
          userId,
          departmentId,
        };
        empInfoList.push(newEmpInfo);
        localStorage.setItem("emp_info_list", JSON.stringify(empInfoList));

        setDonePopup({
          isOpen: true,
          title: "Success",
          message: isEditMode
            ? "Job information updated!"
            : "Job information saved! Proceeding...",
        });
      } else {
        const err = await res.json();
        setErrorPopup({
          isOpen: true,
          title: "Error",
          message: err.message || "Failed to save data.",
        });
      }
    } catch (error) {
      console.error("Error saving job info:", error);
      setErrorPopup({
        isOpen: true,
        title: "Network Error",
        message: "Failed to connect to server.",
      });
    }
  };

  const handleDoneClose = () => {
    setDonePopup({ ...donePopup, isOpen: false });
    if (!isEditMode) {
      setTimeout(() => {
        navigate("/hr/add-emp-education", {
          state: {
            empId: showIds.empCode,
            personalId: showIds.empCode,
            empImage: imageUrl,
            userId: userId,
          },
        });
      }, 500);
    }
  };

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

      <div className="add-emp-info-page">
        {isEditMode ? (
          <EditEmpNav userId={userId} activeTab="job" />
        ) : (
          <motion.div
            className="info-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="add-emp-info-title">Job Information</h2>
            <span className="step-indicator">
              Step 2 of 3: Employment Details
            </span>
          </motion.div>
        )}

        <motion.div
          className="add-emp-info-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Sidebar */}
          <motion.div className="info-image-card" variants={itemVariants}>
            <div className="info-image-wrapper">
              {imageUrl ? (
                <img src={imageUrl} alt="Employee" className="info-emp-image" />
              ) : (
                <div className="info-image-placeholder">
                  <FaUser />
                </div>
              )}
            </div>

            <div className="emp-id-badges">
              <div className="id-badge">
                <label>User ID</label>
                <span>{showIds.userId}</span>
              </div>
              <div className="id-badge">
                <label>Employee Code</label>
                <span>{showIds.empCode}</span>
              </div>
            </div>
          </motion.div>

          {/* Right Form Area */}
          <motion.div className="info-form-card" variants={itemVariants}>
            <form onSubmit={handleSubmit}>
              {/* Section 1: Role & Status */}
              <div className="form-section">
                <div className="section-title">
                  <FaBriefcase className="section-icon" />
                  <span>Role & Status</span>
                </div>
                <div className="form-fields-grid">
                  <div className="form-group span-1">
                    <label>Job Position</label>
                    <div className="input-group">
                      <select
                        name="jobPosition"
                        value={form.jobPosition}
                        onChange={handleChange}
                        required
                        className="form-control"
                      >
                        <option value="">-- Select Position --</option>
                        {filteredPositions.map((pos) => (
                          <option key={pos.id} value={pos.id}>
                            {pos.position_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-group span-1">
                    <label>Employment Status</label>
                    <div className="input-group">
                      <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        required
                        className="form-control"
                      >
                        <option value="">-- Select Status --</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Intern">Intern</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Compensation & Schedule */}
              <div className="form-section">
                <div className="section-title">
                  <FaMoneyBillWave className="section-icon" />
                  <span>Compensation & Schedule</span>
                </div>
                <div className="form-fields-grid">
                  <div className="form-group span-1">
                    <label>Start Date</label>
                    <div className="input-group">
                      <input
                        type="date"
                        name="startDate"
                        value={form.startDate}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group span-1">
                    <label>Working Hours</label>
                    <div className="input-group" style={{ gap: "0.5rem" }}>
                      <input
                        type="time"
                        name="startTime"
                        value={form.startTime}
                        onChange={handleChange}
                        onClick={(e) => e.target.showPicker()}
                        onKeyDown={(e) => e.preventDefault()}
                        required
                        style={{ cursor: "pointer" }}
                      />
                      <span style={{ color: "#94a3b8" }}>-</span>
                      <input
                        type="time"
                        name="endTime"
                        value={form.endTime}
                        onChange={handleChange}
                        onClick={(e) => e.target.showPicker()}
                        onKeyDown={(e) => e.preventDefault()}
                        required
                        style={{ cursor: "pointer" }}
                      />
                    </div>
                  </div>
                  <div className="form-group span-1">
                    <label>Salary (THB)</label>
                    <div className="input-group">
                      <input
                        type="text"
                        name="salary"
                        value={salaryDisplay}
                        onChange={handleChange}
                        required
                        placeholder="0.00"
                        maxLength={13} // 10 digits + commas
                      />
                    </div>
                    <span className="char-counter">
                      Integer only (Max 10 digits)
                    </span>
                  </div>
                  <div className="form-group span-1">
                    <label>Benefits</label>
                    <div className="input-group">
                      <textarea
                        name="benefit"
                        value={form.benefit}
                        onChange={handleChange}
                        placeholder="e.g. Health Insurance"
                        rows="3"
                      />
                    </div>
                    <span
                      className={`char-counter ${form.benefit.length >= 250 ? "limit-near" : ""}`}
                    >
                      {form.benefit.length}/255
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 3: Additional Info */}
              <div className="form-section">
                <div className="section-title">
                  <FaFileAlt className="section-icon" />
                  <span>Additional Details</span>
                </div>
                <div className="form-fields-grid">
                  {/* Performance Review */}
                  <div className="form-group span-2">
                    <label>Performance Review</label>
                    <div className="input-group">
                      <textarea
                        name="performanceReview"
                        value={form.performanceReview}
                        onChange={handleChange}
                        placeholder="Review notes..."
                        rows="3"
                      />
                    </div>
                    <span className="char-counter">
                      {form.performanceReview.length}/255
                    </span>

                    {/* Performance Files */}
                    <div className="file-upload-wrapper">
                      <label className="file-upload-label">
                        Attachments (Performance) - Max 5
                      </label>

                      <div className="uploaded-files-list">
                        <AnimatePresence>
                          {performanceFiles.map((file, index) => (
                            <motion.div
                              key={`p-${index}`}
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
                                  removeFile(index, "performance");
                                }}
                              >
                                <FaTrash />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>

                      {performanceFiles.length < 5 && (
                        <>
                          <input
                            type="file"
                            id="perf-upload"
                            multiple
                            onChange={(e) => handleFileChange(e, "performance")}
                            style={{ display: "none" }}
                            accept=".pdf,.docx,.jpg,.jpeg"
                          />
                          <button
                            type="button"
                            className="btn-add-file"
                            onClick={() =>
                              document.getElementById("perf-upload").click()
                            }
                          >
                            <FaCloudUploadAlt /> Add Performance File
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Training Info */}
                  <div className="form-group span-2">
                    <label>Training Info</label>
                    <div className="input-group">
                      <textarea
                        name="trainingInfo"
                        value={form.trainingInfo}
                        onChange={handleChange}
                        placeholder="Training notes..."
                        rows="3"
                      />
                    </div>
                    <span className="char-counter">
                      {form.trainingInfo.length}/255
                    </span>

                    {/* Training Files */}
                    <div className="file-upload-wrapper">
                      <label className="file-upload-label">
                        Attachments (Training) - Max 5
                      </label>

                      <div className="uploaded-files-list">
                        <AnimatePresence>
                          {trainingFiles.map((file, index) => (
                            <motion.div
                              key={`t-${index}`}
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
                                  removeFile(index, "training");
                                }}
                              >
                                <FaTrash />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>

                      {trainingFiles.length < 5 && (
                        <>
                          <input
                            type="file"
                            id="train-upload"
                            multiple
                            onChange={(e) => handleFileChange(e, "training")}
                            style={{ display: "none" }}
                            accept=".pdf,.docx,.jpg,.jpeg"
                          />
                          <button
                            type="button"
                            className="btn-add-file"
                            onClick={() =>
                              document.getElementById("train-upload").click()
                            }
                          >
                            <FaCloudUploadAlt /> Add Training File
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-back" onClick={handleBack}>
                  Back
                </button>
                <button
                  type="submit"
                  className="btn-save"
                  disabled={isEditMode ? !isDirty : !isFormFilled}
                >
                  {isEditMode ? "Save Changes" : "Proceed to Step 3"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </HRLayout>
  );
};

export default AddEmpInfo;
