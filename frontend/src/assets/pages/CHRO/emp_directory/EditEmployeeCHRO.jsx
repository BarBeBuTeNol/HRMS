import React, { useState, useEffect } from "react";
import api from "../../../../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUserTie,
  FaArrowLeft,
  FaSave,
  FaUser,
  FaBriefcase,
  FaGraduationCap,
  FaCamera,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaGlobe,
  FaHeart,
  FaVenusMars,
  FaPray,
  FaIdCard,
} from "react-icons/fa";
import CHROLayout from "../../../Component/CHRO/CHROLayout";
import CHROPopup from "../../../Component/popup_notifications/popup_notifications-chro/PopupCHRO";
import ChangeRequestModal from "../../../Component/popup_notifications/popup_notifications-chro/ChangeRequestModal";
import LoadingCHRO from "../../../Component/loading/loading-chro/LoadingCHRO";
import "./EditEmployeeCHRO.css";

const EditEmployeeCHRO = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = location.state || {};

  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Popup State
  const [popup, setPopup] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  // Reference Data
  const [genders, setGenders] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);

  // Form State - consolidated
  const [formData, setFormData] = useState({
    // Personal
    userId: userId,
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
    imageUrl: "",
    image: null,

    // Job
    departmentId: "",
    roleId: "",
    jobPosition: "",
    employmentStatus: "Full-Time",
    hireDate: "",
    salary: "",
    workStartTime: "",
    workEndTime: "",

    // Education
    educationLevel: "",
    institution: "",
    program: "",
  });

  useEffect(() => {
    if (!userId) {
      setPopup({
        isOpen: true,
        title: "Error",
        message: "No employee selected. Redirecting...",
        type: "error",
      });
      setTimeout(() => navigate("/chro/employee-directory"), 2000);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch dropdowns
        const [deptRes, roleRes, genderRes, userRes] = await Promise.all([
          api.get("/departments"),
          api.get("/roles"),
          api.get("/employee-data/genders"),
          api.get(`/users/${userId}`),
        ]);

        if (deptRes.data) setDepartments(deptRes.data);
        if (roleRes.data) setRoles(roleRes.data);
        if (genderRes.data) setGenders(genderRes.data);

        if (userRes.data) {
          const data = userRes.data;

          const mappedData = {
            empId: data.emp_code || "",
            personalId: data.personal_id || "",
            gender: data.gender || "",
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            birthDate: data.birth_date ? data.birth_date.split("T")[0] : "",
            email: data.email || "",
            address: data.address || "",
            nationality: data.nationality || "",
            religion: data.religion || "",
            bloodType: data.blood_type || "",
            maritalStatus: data.marital_status || "Single",
            emergencyContactName: data.emergency_contact_name || "",
            emergencyContactPhone: data.emergency_contact_phone || "",
            relationToEmergencyContact:
              data.relation_to_emergency_contact || "",
            imageUrl: data.image_url || "",

            departmentId: data.department_id || "",
            roleId: data.role_id || "",
            jobPosition: data.job_position || data.job_title || "",
            employmentStatus: data.employment_status || "Full-Time",
            hireDate: data.hire_date ? data.hire_date.split("T")[0] : "",
            salary: data.salary || "",
            workStartTime: data.work_start_time || "",
            workEndTime: data.work_end_time || "",

            educationLevel: data.education_level || "",
            institution: data.institution || "",
            program: data.program || "",
          };

          setFormData((prev) => ({ ...prev, ...mappedData }));
          setInitialData({ ...mappedData, userId: userId });
        }
      } catch (err) {
        console.error("Failed to load data", err);
        setPopup({
          isOpen: true,
          title: "System Error",
          message: "Failed to load employee data.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
        imageUrl: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      // 1. Personal Info
      const personalPayload = {
        userId: formData.userId,
        personalId: formData.personalId,
        gender: formData.gender,
        birthDate: formData.birthDate,
        address: formData.address,
        maritalStatus: formData.maritalStatus,
        nationality: formData.nationality,
        religion: formData.religion,
        bloodType: formData.bloodType,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        relationToEmergencyContact: formData.relationToEmergencyContact,
      };

      // 2. Job Info
      const jobPayload = {
        userId: formData.userId,
        empCode: formData.empId,
        departmentId: formData.departmentId,
        jobPosition: formData.jobPosition,
        employmentStatus: formData.employmentStatus,
        hireDate: formData.hireDate,
        salary: formData.salary,
        workStartTime: formData.workStartTime,
        workEndTime: formData.workEndTime,
      };

      // 3. Education Info
      const eduPayload = {
        userId: formData.userId,
        educationLevel: formData.educationLevel,
        institution: formData.institution,
        program: formData.program,
      };

      // 4. User Account Info (Name, Email)
      const userAccountPayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      };

      await Promise.all([
        api.post("/employee-data/personal", personalPayload),
        api.post("/employee-data/job", jobPayload),
        api.post("/employee-data/education", eduPayload),
        api.put(`/users/${formData.userId}`, userAccountPayload),
      ]);

      setPopup({
        isOpen: true,
        title: "Update Successful",
        message: "Employee records have been updated.",
        type: "success",
      });
      setTimeout(() => {
        setPopup({ ...popup, isOpen: false });
        navigate(-1);
      }, 1500);
    } catch (err) {
      console.error("Update failed", err);
      setPopup({
        isOpen: true,
        title: "Update Failed",
        message: "Could not save changes. Please try again.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [changes, setChanges] = useState([]);
  const [initialData, setInitialData] = useState({});

  // Helper to compare current formData with initialData
  const calculateChanges = () => {
    const changedFields = [];
    Object.keys(formData).forEach((key) => {
      // Skip internal fields or image object
      if (key === "image" || key === "imageUrl") return;

      const distinct = formData[key] !== initialData[key];
      // Simple equality check (works for strings/numbers)
      if (distinct) {
        changedFields.push({
          field: key,
          oldValue: initialData[key],
          newValue: formData[key],
        });
      }
    });
    return changedFields;
  };

  const handleSaveClick = () => {
    const diffs = calculateChanges();
    if (diffs.length === 0) {
      setPopup({
        isOpen: true,
        title: "No Changes",
        message: "You haven't made any modifications.",
        type: "info",
      });
      return;
    }
    setChanges(diffs);
    setIsModalOpen(true);
  };

  const handleConfirmRequest = async (reason, file) => {
    setIsModalOpen(false);
    setSaving(true);
    setLoading(true);

    try {
      const formDataPayload = new FormData();
      formDataPayload.append("targetUserId", formData.userId);
      formDataPayload.append("changes", JSON.stringify(changes));
      formDataPayload.append("reason", reason);
      if (file) {
        formDataPayload.append("evidence", file);
      }

      await api.post("/change-requests", formDataPayload);

      setPopup({
        isOpen: true,
        title: "Request Submitted",
        message: "Your change request has been sent for approval.",
        type: "success",
      });
      setTimeout(() => navigate(-1), 2000);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Failed to submit request";
      setPopup({
        isOpen: true,
        title: "Submission Error",
        message: msg,
        type: "error",
      });
      setSaving(false);
      setLoading(false);
    }
  };

  return (
    <CHROLayout>
      <CHROPopup
        isOpen={popup.isOpen}
        onClose={() => setPopup({ ...popup, isOpen: false })}
        title={popup.title}
        message={popup.message}
      />

      <ChangeRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        changes={changes}
        employeeName={`${formData.firstName} ${formData.lastName}`}
        onSubmit={handleConfirmRequest}
      />

      <div className="chro-edit-container">
        {/* Header */}
        <div className="chro-edit-header">
          <button className="chro-back-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft /> Back
          </button>
          <div className="chro-edit-title">
            <h1>Executive Employee Modification</h1>
            <p>Restricted Access - High Level Clearance</p>
          </div>
          <button
            className="chro-save-btn"
            onClick={handleSaveClick}
            disabled={saving || loading}
          >
            {saving ? (
              "Saving..."
            ) : (
              <>
                <FaSave /> Send Request
              </>
            )}
          </button>
        </div>

        {loading ? (
          <div style={{ position: "relative", height: "60vh" }}>
            <LoadingCHRO />
          </div>
        ) : (
          <div className="chro-edit-layout">
            {/* Sidebar / Tabs */}
            <div className="chro-edit-sidebar">
              <div className="chro-profile-preview">
                <div className="chro-profile-img-wrapper">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Profile" />
                  ) : (
                    <FaUserTie />
                  )}
                  <label htmlFor="file-upload" className="chro-img-edit-icon">
                    <FaCamera />
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    hidden
                  />
                </div>
                <h3>
                  {formData.firstName} {formData.lastName}
                </h3>
                <p>{formData.empId}</p>
              </div>

              <div className="edit-emp-nav-menu">
                <button
                  className={`edit-emp-nav-item ${
                    activeTab === "personal" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("personal")}
                >
                  <FaUser /> Personal Data
                </button>
                <button
                  className={`edit-emp-nav-item ${
                    activeTab === "job" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("job")}
                >
                  <FaBriefcase /> Job & Position
                </button>
                <button
                  className={`edit-emp-nav-item ${
                    activeTab === "education" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("education")}
                >
                  <FaGraduationCap /> Education & Skills
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="chro-edit-content">
              <AnimatePresence mode="wait">
                {/* PERSONAL TAB */}
                {activeTab === "personal" && (
                  <motion.div
                    key="personal"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="chro-form-section"
                  >
                    <h2 className="chro-section-header">
                      Personal Information Setup
                    </h2>

                    <div className="chro-input-grid">
                      <div className="chro-form-group">
                        <label>First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="chro-form-group">
                        <label>Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="chro-form-group">
                        <label>National ID</label>
                        <input
                          type="text"
                          name="personalId"
                          value={formData.personalId}
                          onChange={handleChange}
                          maxLength={13}
                        />
                      </div>
                      <div className="chro-form-group">
                        <label>Gender</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                        >
                          <option value="">Select</option>
                          {genders.map((g) => (
                            <option key={g.id} value={g.gender_name}>
                              {g.gender_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="chro-form-group">
                        <label>Date of Birth</label>
                        <input
                          type="date"
                          name="birthDate"
                          value={formData.birthDate}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="chro-form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="chro-form-group full-width">
                        <label>Address</label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          rows={2}
                        />
                      </div>
                      <div className="chro-form-group">
                        <label>Nationality</label>
                        <input
                          type="text"
                          name="nationality"
                          value={formData.nationality}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="chro-form-group">
                        <label>Religion</label>
                        <input
                          type="text"
                          name="religion"
                          value={formData.religion}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="chro-form-group">
                        <label>Marital Status</label>
                        <select
                          name="maritalStatus"
                          value={formData.maritalStatus}
                          onChange={handleChange}
                        >
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                          <option value="Divorced">Divorced</option>
                          <option value="Widowed">Widowed</option>
                        </select>
                      </div>
                    </div>

                    <h2 className="chro-section-header mt-4">
                      Emergency Contact
                    </h2>
                    <div className="chro-input-grid">
                      <div className="chro-form-group">
                        <label>Contact Name</label>
                        <input
                          type="text"
                          name="emergencyContactName"
                          value={formData.emergencyContactName}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="chro-form-group">
                        <label>Phone</label>
                        <input
                          type="text"
                          name="emergencyContactPhone"
                          value={formData.emergencyContactPhone}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="chro-form-group">
                        <label>Relationship</label>
                        <input
                          type="text"
                          name="relationToEmergencyContact"
                          value={formData.relationToEmergencyContact}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* JOB TAB */}
                {activeTab === "job" && (
                  <motion.div
                    key="job"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="chro-form-section"
                  >
                    <h2 className="chro-section-header">Employment Details</h2>
                    <div className="chro-input-grid">
                      <div className="chro-form-group">
                        <label>Department</label>
                        <select
                          name="departmentId"
                          value={formData.departmentId}
                          onChange={handleChange}
                        >
                          <option value="">Select Department</option>
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.department_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="chro-form-group">
                        <label>Role (Read Only)</label>
                        <select
                          name="roleId"
                          value={formData.roleId}
                          disabled
                          style={{ opacity: 0.6, cursor: "not-allowed" }}
                        >
                          <option value="">Select Role</option>
                          {roles.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.role_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="chro-form-group">
                        <label>Job Position</label>
                        <input
                          type="text"
                          name="jobPosition"
                          value={formData.jobPosition}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="chro-form-group">
                        <label>Employment Status</label>
                        <select
                          name="employmentStatus"
                          value={formData.employmentStatus}
                          onChange={handleChange}
                        >
                          <option value="Full-Time">Full-Time</option>
                          <option value="Part-Time">Part-Time</option>
                          <option value="Contract">Contract</option>
                          <option value="Intern">Intern</option>
                        </select>
                      </div>
                      <div className="chro-form-group">
                        <label>Hire Date</label>
                        <input
                          type="date"
                          name="hireDate"
                          value={formData.hireDate}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="chro-form-group">
                        <label>Salary (THB)</label>
                        <input
                          type="number"
                          name="salary"
                          value={formData.salary}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="chro-form-group">
                        <label>Start Time</label>
                        <input
                          type="time"
                          name="workStartTime"
                          value={formData.workStartTime}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="chro-form-group">
                        <label>End Time</label>
                        <input
                          type="time"
                          name="workEndTime"
                          value={formData.workEndTime}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* EDUCATION TAB */}
                {activeTab === "education" && (
                  <motion.div
                    key="education"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="chro-form-section"
                  >
                    <h2 className="chro-section-header">Academic Background</h2>
                    <div className="chro-input-grid">
                      <div className="chro-form-group">
                        <label>Education Level</label>
                        <select
                          name="educationLevel"
                          value={formData.educationLevel}
                          onChange={handleChange}
                        >
                          <option value="">Select Level</option>
                          <option value="High School">High School</option>
                          <option value="Bachelor's Degree">
                            Bachelor's Degree
                          </option>
                          <option value="Master's Degree">
                            Master's Degree
                          </option>
                          <option value="Doctorate">Doctorate</option>
                        </select>
                      </div>
                      <div className="chro-form-group">
                        <label>Institution</label>
                        <input
                          type="text"
                          name="institution"
                          value={formData.institution}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="chro-form-group">
                        <label>Program / Major</label>
                        <input
                          type="text"
                          name="program"
                          value={formData.program}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </CHROLayout>
  );
};

export default EditEmployeeCHRO;
