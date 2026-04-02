import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaUser,
  FaBirthdayCake,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
  FaGlobe,
  FaPray,
  FaTint,
  FaHeart,
  FaVenusMars,
  FaAddressCard,
} from "react-icons/fa";
import EditEmpNav from "../../../Component/HR/EditEmpNav";
import HRLayout from "../../../Component/HR/HRLayout";
import LogService from "../../../../services/LogService";
import "./Add_emp_personal.css";
// New Popup Imports
import PopupCHRO from "../../../Component/popup_notifications/popup_notifications-chro/PopupCHRO";
import PopupErrorCHRO from "../../../Component/popup-error/popup-error-chro/PopupErrorCHRO";
import PopupDoneCHRO from "../../../Component/poup_done/poup_done-chro/PopupDoneCHRO";
import api from "../../../../services/api";

const AddEmpPersonal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams(); // Get params

  // Logic: Params userId takes precedence (edit route), then state userId (add/navigation)
  const paramUserId = params.userId;
  const stateUserId = location.state?.userId;
  const userId = paramUserId || stateUserId;

  const { empId, firstName, lastName, email } = location.state || {};

  // Decide edit mode: if we have a userId, we are effectively in edit mode for that user
  const isEditMode = !!userId || location.state?.isEditMode;

  const [form, setForm] = useState({
    userId: "",
    empId: "",
    personalId: "",
    gender: "",
    firstName: "",
    lastName: "",
    birthDate: "",
    email: "",
    address: "",
    nationality: "",
    religion: "",
    bloodType: "",
    maritalStatus: "Single",
    emergencyContactName: "",
    emergencyContactPhone: "",
    relationToEmergencyContact: "",
    image: null,
    imageUrl: "",
  });
  const [genders, setGenders] = useState([]);

  // Popup State
  const [popup, setPopup] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  // Track original form data for dirty checking
  const [originalForm, setOriginalForm] = useState(null);

  useEffect(() => {
    // Fetch Genders logic
    const fetchGenders = async () => {
      try {
        const res = await api.get("/employee-data/genders");
        setGenders(res.data);
      } catch (err) {
        console.error("Failed to fetch genders", err);
      }
    };
    fetchGenders();

    if (!userId) {
      if (!isEditMode) {
        // Only warn if strict add mode missing ID and NOT in edit mode
        // But if isEditMode is false and no userId, we are in "Create" mode step 2?
        // Actually this page seems to require a User ID even for creation (step 1 was create user).
        setPopup({
          isOpen: true,
          title: "Missing User ID",
          message:
            "Please start from 'Create User' menu or select a user to edit.",
          type: "warning",
        });
        setTimeout(() => navigate("/hr/add-user"), 3000);
      }
      return;
    }

    // Pre-fill from navigation state if available (fallback)
    setForm((prev) => ({
      ...prev,
      firstName: firstName || prev.firstName,
      lastName: lastName || prev.lastName,
      email: email || prev.email,
      empId: empId || prev.empId,
      userId: userId,
    }));

    // Fetch full details from backend
    const fetchDetails = async () => {
      try {
        const res = await api.get(`/users/${userId}`);
        const data = res.data;
        // Map backend fields to form state
        const birthDate = data.birth_date
          ? new Date(data.birth_date).toISOString().split("T")[0]
          : "";

          // Debug data to ensure we are getting fields
          console.log("Fetched User Data:", data);

          // Map backend fields to form state - Keys MUST match useState order
          // Ensure we handle null/undefined correctly with fallback to empty string
          const loadedForm = {
            userId: userId,
            empId: data.emp_code ? String(data.emp_code) : empId || "",
            personalId: data.personal_id ? String(data.personal_id) : "",
            gender: data.gender ? String(data.gender) : "",
            firstName: data.first_name ? String(data.first_name) : "",
            lastName: data.last_name ? String(data.last_name) : "",
            birthDate: birthDate,
            email: data.email ? String(data.email) : "",
            address: data.address ? String(data.address) : "",
            nationality: data.nationality ? String(data.nationality) : "",
            religion: data.religion ? String(data.religion) : "",
            bloodType: data.blood_type ? String(data.blood_type) : "",
            maritalStatus: data.marital_status
              ? String(data.marital_status)
              : "Single",
            emergencyContactName: data.emergency_contact_name
              ? String(data.emergency_contact_name)
              : "",
            emergencyContactPhone: data.emergency_contact_phone
              ? String(data.emergency_contact_phone)
              : "",
            relationToEmergencyContact: data.relation_to_emergency_contact
              ? String(data.relation_to_emergency_contact)
              : "",
            image: null,
            imageUrl: data.image_url || data.profile_image_url || "", // Handle both potential keys
          };

          setForm((prev) => ({
            ...prev,
            ...loadedForm,
          }));

          // Set original form for dirty checking (exclude image file)
          const { image, ...rest } = loadedForm;
          setOriginalForm(JSON.stringify(rest));

      } catch (err) {
        console.error("Failed to fetch user details", err);
      }
    };

    if (userId) {
      fetchDetails();
    }
  }, [userId, firstName, lastName, email, empId, isEditMode, navigate]);

  // Check required fields (Essential info only)
  const isFormFilled = 
    form.personalId && 
    form.firstName && 
    form.lastName && 
    form.gender && 
    form.birthDate && 
    form.email && 
    form.address;

  // Check if form is dirty
  const isDirty = (() => {
    if (!originalForm) return false;
    const { image, ...currentRest } = form;
    // If a new image file is selected, it is dirty
    if (image) return true;
    return JSON.stringify(currentRest) !== originalForm;
  })();

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // Validation Rules
    switch (name) {
      case "personalId":
        if (newValue.length > 13) return;
        // Numbers only, No spaces
        newValue = newValue.replace(/[^0-9]/g, "");
        break;

      case "emergencyContactPhone":
        if (newValue.length > 20) return;
        // Numbers only, No spaces
        newValue = newValue.replace(/[^0-9]/g, "");
        break;

      case "religion":
        if (newValue.length > 50) return;
        // Allow Thai/Eng letters, numbers, spaces. No special chars.
        newValue = newValue.replace(/[^a-zA-Z0-9\u0E00-\u0E7F\s]/g, "");
        break;

      case "nationality":
      case "relationToEmergencyContact":
        if (newValue.length > 50) return;
        // Allow Thai/Eng letters, numbers, spaces. No special chars.
        newValue = newValue.replace(/[^a-zA-Z0-9\u0E00-\u0E7F\s]/g, "");
        break;

      case "emergencyContactName":
        if (newValue.length > 100) return;
        // Allow Thai/Eng letters, numbers, spaces. No special chars.
        newValue = newValue.replace(/[^a-zA-Z0-9\u0E00-\u0E7F\s]/g, "");
        break;

      case "address":
        // Allow common address characters: / . , -
        if (newValue.length > 255) return;
        if (!/^[a-zA-Z0-9\u0E00-\u0E7F\s\/\.,\-]*$/.test(newValue)) return;
        break;

      default:
        break;
    }

    setForm((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate File Type (JPG, JPEG, PNG Only)
      const validTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        setPopup({
          isOpen: true,
          title: "Invalid File Type",
          message: "Please upload only JPG, JPEG, or PNG files.",
          type: "error",
        });
        e.target.value = ""; // Reset input
        return;
      }

      setForm((prev) => ({
        ...prev,
        image: file,
        imageUrl: URL.createObjectURL(file), // Preview URL
      }));
    }
  };

  const handleCancel = () => {
    navigate("/hr/show-emp");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormFilled) {
      setPopup({
        isOpen: true,
        title: "Incomplete Form",
        message: "Please fill in all required fields properly.",
        type: "warning",
      });
      return;
    }

    // National ID MUST be exactly 13 digits
    if (form.personalId.length !== 13) {
      setPopup({
        isOpen: true,
        title: "Invalid National ID",
        message: "National ID must be exactly 13 digits long.",
        type: "error",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("userId", form.userId);
      formData.append("personalId", form.personalId);
      formData.append("gender", form.gender);
      formData.append("birthDate", form.birthDate);
      formData.append("address", form.address);
      formData.append("maritalStatus", form.maritalStatus);
      formData.append("nationality", form.nationality);
      formData.append("religion", form.religion);
      formData.append("bloodType", form.bloodType);
      formData.append("emergencyContactName", form.emergencyContactName);
      formData.append("emergencyContactPhone", form.emergencyContactPhone);
      formData.append(
        "relationToEmergencyContact",
        form.relationToEmergencyContact,
      );

      if (form.image) {
        formData.append("image", form.image);
      }

      const res = await api.post("/employee-data/personal", formData);
      const resultData = res.data;

      // LOGGING
      try {
        const currentUser = JSON.parse(
          localStorage.getItem("currentUser") || "{}",
        );
        await LogService.createLog({
          userId: currentUser.id || currentUser.user_id,
          action: "Update Personal Info",
          details: `Updated personal info for ${form.firstName} ${form.lastName}`,
          target: `${form.firstName} ${form.lastName}`,
          severity: "Info",
        });
      } catch (logErr) {
        console.warn("Logging failed", logErr);
      }

      // Update original form after successful save
      const { image, ...currentRest } = form;

      // If image was uploaded, update local URL if returned
      if (resultData.imageUrl) {
        setForm((prev) => ({ ...prev, imageUrl: resultData.imageUrl }));
      }

      setOriginalForm(JSON.stringify(currentRest));

      const empList = JSON.parse(
        localStorage.getItem("emp_personal_list") || "[]",
      );
      empList.push(form); // Note: This local storage list might need update if we want to store URL instead of file object, but for now keeping as is.
      localStorage.setItem("emp_personal_list", JSON.stringify(empList));

      if (isEditMode) {
        setPopup({
          isOpen: true,
          title: "Success",
          message: "Changes saved successfully!",
          type: "success",
        });
        // Stay on page
      } else {
        setPopup({
          isOpen: true,
          title: "Success",
          message:
            "Personal information saved successfully! Proceeding to Job Information...",
          type: "success",
        });

        // Delay navigation
        setTimeout(() => {
          navigate("/hr/add-emp-info", {
            state: { empPersonal: form, userId: userId },
          });
        }, 1500);
      }

    } catch (error) {
      console.error("Error saving personal info:", error);
      const err = error.response?.data || {};
      setPopup({
        isOpen: true,
        title: "Error",
        message: "Error: " + (err.message || "Failed to save"),
        type: "error",
      });
    }
  };

  // Animation variants
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

  const renderPopup = () => {
    if (!popup.isOpen) return null;

    if (popup.type === "error") {
      return (
        <PopupErrorCHRO
          isOpen={popup.isOpen}
          onClose={() => setPopup({ ...popup, isOpen: false })}
          title={popup.title}
          message={popup.message}
        />
      );
    }
    if (popup.type === "success") {
      return (
        <PopupDoneCHRO
          isOpen={popup.isOpen}
          onClose={() => setPopup({ ...popup, isOpen: false })}
          title={popup.title}
          message={popup.message}
        />
      );
    }
    // Default / Warning / Info
    return (
      <PopupCHRO
        isOpen={popup.isOpen}
        onClose={() => setPopup({ ...popup, isOpen: false })}
        title={popup.title}
        message={popup.message}
        type={popup.type} // pass warning or info
      />
    );
  };

  return (
    <HRLayout>
      {renderPopup()}
      <div className="add-emp-personal-page">
        {/* Header Section */}
        {isEditMode ? (
          <EditEmpNav userId={userId} activeTab="personal" />
        ) : (
          <motion.div
            className="personal-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="add-emp-personal-title">Personal Information</h2>
            <span className="step-indicator">
              Step 1 of 3: Identity & Contact
            </span>
          </motion.div>
        )}

        <motion.div
          className="add-emp-personal-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Column: Image Identity */}
          <motion.div className="personal-image-card" variants={itemVariants}>
            <div className="personal-image-wrapper">
              {form.imageUrl ? (
                <img
                  src={form.imageUrl}
                  alt="Employee"
                  className="personal-emp-image"
                />
              ) : (
                <div className="personal-image-placeholder">
                  <FaUser />
                </div>
              )}
            </div>
            {form.empId && (
              <div className="emp-id-display">ID: {form.empId}</div>
            )}

            <label htmlFor="image-upload" className="personal-upload-btn">
              Upload Photo
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              hidden
            />
          </motion.div>

          {/* Right Column: Form */}
          <motion.div className="personal-form-card" variants={itemVariants}>
            <form onSubmit={handleSubmit}>
              {/* Section 1: Basic Identity */}
              <div className="form-section">
                <div className="section-title">
                  <FaUser className="section-icon" />
                  <span>Basic Identity</span>
                </div>
                <div className="form-fields-grid">
                  <div className="form-group span-1">
                    <label>Employee ID</label>
                    <div className="input-group">
                      <input
                        type="text"
                        name="empId"
                        value={form.empId}
                        readOnly
                        className="readonly"
                      />
                    </div>
                  </div>
                  <div className="form-group span-1">
                    <label>National ID</label>
                    <div className="input-group">
                      <input
                        type="text"
                        name="personalId"
                        value={form.personalId}
                        onChange={handleChange}
                        maxLength={13}
                        required
                        placeholder="13-digit ID"
                      />
                    </div>
                  </div>
                  <div className="form-group span-1">
                    <label>Gender</label>
                    <div className="input-group">
                      <select
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Gender</option>
                        {genders.map((g) => (
                          <option key={g.id} value={g.name || g.gender_name}>
                            {g.name || g.gender_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-group span-1">
                    <label>First Name</label>
                    <div className="input-group">
                      <input
                        type="text"
                        name="firstName"
                        value={form.firstName}
                        readOnly
                        className="readonly"
                      />
                    </div>
                  </div>
                  <div className="form-group span-1">
                    <label>Last Name</label>
                    <div className="input-group">
                      <input
                        type="text"
                        name="lastName"
                        value={form.lastName}
                        readOnly
                        className="readonly"
                      />
                    </div>
                  </div>
                  <div className="form-group span-1">
                    <label>Date of Birth</label>
                    <div className="input-group">
                      <input
                        type="date"
                        name="birthDate"
                        value={form.birthDate}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group span-1">
                    <label>Religion</label>
                    <div className="input-group">
                      <input
                        type="text"
                        name="religion"
                        value={form.religion}
                        onChange={handleChange}
                        maxLength={50}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Contact & Address */}
              <div className="form-section">
                <div className="section-title">
                  <FaMapMarkerAlt className="section-icon" />
                  <span>Contact & Address</span>
                </div>
                <div className="form-fields-grid">
                  <div className="form-group span-2">
                    <label>Email Address</label>
                    <div className="input-group">
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        readOnly
                        className="readonly"
                      />
                    </div>
                  </div>
                  <div className="form-group span-2">
                    <label>Home Address</label>
                    <div className="input-group">
                      <input
                        type="text"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        maxLength={255}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Personal Details */}
              <div className="form-section">
                <div className="section-title">
                  <FaGlobe className="section-icon" />
                  <span>Personal Details</span>
                </div>
                <div className="form-fields-grid">
                  <div className="form-group span-1">
                    <label>Blood Type</label>
                    <div className="input-group">
                      <select
                        name="bloodType"
                        value={form.bloodType}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="AB">AB</option>
                        <option value="O">O</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group span-1">
                    <label>Marital Status</label>
                    <div className="input-group">
                      <select
                        name="maritalStatus"
                        value={form.maritalStatus}
                        onChange={handleChange}
                        required
                      >
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group span-2">
                    <label>Nationality</label>
                    <div className="input-group">
                      <input
                        type="text"
                        name="nationality"
                        value={form.nationality}
                        onChange={handleChange}
                        maxLength={50}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Emergency Contact */}
              <div className="form-section">
                <div className="section-title">
                  <FaPhone className="section-icon" />
                  <span>Emergency Contact</span>
                </div>
                <div className="form-fields-grid">
                  <div className="form-group span-2">
                    <label>Contact Name</label>
                    <div className="input-group">
                      <input
                        type="text"
                        name="emergencyContactName"
                        value={form.emergencyContactName}
                        onChange={handleChange}
                        maxLength={100}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group span-1">
                    <label>Phone Number</label>
                    <div className="input-group">
                      <input
                        type="text"
                        name="emergencyContactPhone"
                        value={form.emergencyContactPhone}
                        onChange={handleChange}
                        maxLength={20}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group span-1">
                    <label>Relationship</label>
                    <div className="input-group">
                      <input
                        type="text"
                        name="relationToEmergencyContact"
                        value={form.relationToEmergencyContact}
                        onChange={handleChange}
                        placeholder="e.g. Father"
                        maxLength={50}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCancel}
                >
                  {isEditMode ? "Back" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="btn-next"
                  disabled={isEditMode ? !isDirty : !isFormFilled}
                >
                  {isEditMode ? "Save Changes" : "Proceed to Step 2"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </HRLayout>
  );
};

export default AddEmpPersonal;
