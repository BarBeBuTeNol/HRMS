import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import "./Add_emp_personal.css";
import PopupNotification from "../../../Component/popup_notifications/PopupNotification";

const AddEmpPersonal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, empId, firstName, lastName, email, isEditMode } =
    location.state || {}; // Access state correctly

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
        const res = await fetch("/api/employee-data/genders");
        if (res.ok) {
          const data = await res.json();
          setGenders(data);
        }
      } catch (err) {
        console.error("Failed to fetch genders", err);
      }
    };
    fetchGenders();

    if (!userId) {
      if (!isEditMode) {
        // Only warn if strict add mode missing ID
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

    // Pre-fill from navigation state if available
    setForm((prev) => ({
      ...prev,
      firstName: firstName || prev.firstName,
      lastName: lastName || prev.lastName,
      email: email || prev.email,
      empId: empId || "",
      userId: userId,
    }));

    // Fetch full details from backend
    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/users/${userId}`);
        if (res.ok) {
          const data = await res.json();
          // Map backend fields to form state
          const birthDate = data.birth_date
            ? new Date(data.birth_date).toISOString().split("T")[0]
            : "";

          // Map backend fields to form state - Keys MUST match useState order
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
            imageUrl: data.image_url || "",
          };

          setForm((prev) => ({
            ...prev,
            ...loadedForm,
          }));

          // Set original form for dirty checking (exclude image file)
          const { image, ...rest } = loadedForm;
          setOriginalForm(JSON.stringify(rest));
        }
      } catch (err) {
        console.error("Failed to fetch user details", err);
      }
    };

    if (userId) {
      fetchDetails();
    }
  }, [userId, firstName, lastName, email, empId, isEditMode, navigate]);

  // Check required fields (except image)
  const isFormFilled = Object.entries(form)
    .filter(([key]) => key !== "image" && key !== "imageUrl")
    .every(([_, value]) => value && value !== "");

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
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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

    try {
      const payload = {
        userId: form.userId,
        personalId: form.personalId,
        gender: form.gender,
        birthDate: form.birthDate,
        address: form.address,
        maritalStatus: form.maritalStatus,
        nationality: form.nationality,
        religion: form.religion,
        bloodType: form.bloodType,
        emergencyContactName: form.emergencyContactName,
        emergencyContactPhone: form.emergencyContactPhone,
        relationToEmergencyContact: form.relationToEmergencyContact,
      };

      const res = await fetch("/api/employee-data/personal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Update original form after successful save
        const { image, ...currentRest } = form;
        setOriginalForm(JSON.stringify(currentRest));

        const empList = JSON.parse(
          localStorage.getItem("emp_personal_list") || "[]"
        );
        empList.push(form);
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
      } else {
        const err = await res.json();
        setPopup({
          isOpen: true,
          title: "Error",
          message: "Error: " + err.message,
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error saving personal info:", error);
      setPopup({
        isOpen: true,
        title: "Network Error",
        message: "Failed to connect to server.",
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

  return (
    <HRLayout>
      <PopupNotification
        isOpen={popup.isOpen}
        onClose={() => setPopup({ ...popup, isOpen: false })}
        title={popup.title}
        message={popup.message}
        type={popup.type}
      />
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
              <div
                className="emp-id-display"
                style={{ marginTop: "1rem", color: "#ddd", fontWeight: "bold" }}
              >
                ID: {form.empId}
              </div>
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
                      <FaAddressCard className="input-icon" />
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
                      <FaAddressCard className="input-icon" />
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
                      <FaVenusMars className="input-icon" />
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
                      <FaUser className="input-icon" />
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
                      <FaUser className="input-icon" />
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
                      <FaBirthdayCake className="input-icon" />
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
                      <FaPray className="input-icon" />
                      <input
                        type="text"
                        name="religion"
                        value={form.religion}
                        onChange={handleChange}
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
                      <FaEnvelope className="input-icon" />
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
                      <FaMapMarkerAlt className="input-icon" />
                      <input
                        type="text"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
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
                    <label>Nationality</label>
                    <div className="input-group">
                      <FaGlobe className="input-icon" />
                      <input
                        type="text"
                        name="nationality"
                        value={form.nationality}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group span-1">
                    <label>Marital Status</label>
                    <div className="input-group">
                      <FaHeart className="input-icon" />
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
                    <label>Blood Type</label>
                    <div className="input-group">
                      <FaTint className="input-icon" />
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
                      <FaUser className="input-icon" />
                      <input
                        type="text"
                        name="emergencyContactName"
                        value={form.emergencyContactName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group span-1">
                    <label>Phone Number</label>
                    <div className="input-group">
                      <FaPhone className="input-icon" />
                      <input
                        type="text"
                        name="emergencyContactPhone"
                        value={form.emergencyContactPhone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group span-1">
                    <label>Relationship</label>
                    <div className="input-group">
                      <FaUser className="input-icon" />
                      <input
                        type="text"
                        name="relationToEmergencyContact"
                        value={form.relationToEmergencyContact}
                        onChange={handleChange}
                        placeholder="e.g. Father"
                        required
                      />
                    </div>
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
                  type="button"
                  className="btn-cancel"
                  onClick={handleCancel}
                  style={{ width: "300px" }} // Expanded
                >
                  {isEditMode ? "Back" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="btn-next"
                  disabled={isEditMode ? !isDirty : !isFormFilled}
                  style={{
                    width: isEditMode ? "300px" : "100%", // Expanded
                    flex: isEditMode ? "none" : 1,
                    opacity:
                      (isEditMode && !isDirty) || (!isEditMode && !isFormFilled)
                        ? 0.5
                        : 1,
                    cursor:
                      (isEditMode && !isDirty) || (!isEditMode && !isFormFilled)
                        ? "not-allowed"
                        : "pointer",
                  }}
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
