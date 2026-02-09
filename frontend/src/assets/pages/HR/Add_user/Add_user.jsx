import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaBriefcase,
  FaBuilding,
  FaIdCard,
  FaUserCog,
  FaUserShield,
  FaUserTie,
  FaTimes,
  FaCheck,
} from "react-icons/fa";
import HRLayout from "../../../Component/HR/HRLayout";
import PopupNotification from "../../../Component/popup_notifications/popup_notifications-hr/PopupHR";
import PopupErrorHR from "../../../Component/popup-error/popup-error-hr/PopupErrorHR";
import "./Add_user.css";
import api from "../../../../services/api";

const AddUser = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    empId: "",
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    telephone: "",
    role: "",
    department: "",
    prefix: "",
  });
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [prefixes, setPrefixes] = useState([]);

  // Popup State
  const [popup, setPopup] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  // Error Popup State
  const [errorPopup, setErrorPopup] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  // Fetch next Employee ID
  const fetchNextEmpId = async () => {
    try {
      const res = await api.get("/users?pageSize=1");
      const responseData = res.data;
      const users = responseData.data || [];

      if (users.length === 0) {
        setForm((prev) => ({ ...prev, empId: "001" }));
        return;
      }

      // Backend sorts by ID DESC, so the first user has the max ID
      const maxId = users[0].id || 0;
      const nextId = (maxId + 1).toString().padStart(3, "0");
      setForm((prev) => ({ ...prev, empId: nextId }));
    } catch (err) {
      console.error("Error generating ID:", err);
      // Fallback
      setForm((prev) => ({ ...prev, empId: "001" }));
    }
  };

  // Fetch Departments
  const fetchDepartments = async () => {
    try {
      const res = await api.get("/departments");
      setDepartments(res.data);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  // Fetch Roles
  const fetchRoles = async () => {
    try {
      const res = await api.get("/roles");
      setRoles(res.data);
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  };

  // Fetch Prefixes
  const fetchPrefixes = async () => {
    try {
      const res = await api.get("/prefixes");
      setPrefixes(res.data);
    } catch (err) {
      console.error("Error fetching prefixes:", err);
    }
  };

  useEffect(() => {
    fetchNextEmpId();
    fetchRoles();
    fetchDepartments();
    fetchPrefixes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // 1. Username, First Name, Last Name: Max 255 chars, No special chars (Allow allow letters, numbers, Thai chars, spaces)
    if (["username", "firstName", "lastName"].includes(name)) {
      if (newValue.length > 255) return; // Block > 255
      // Regex: Allow A-Z, a-z, 0-9, Thai chars (\u0E00-\u0E7F), whitespace
      // Remove anything else
      newValue = newValue.replace(/[^a-zA-Z0-9\u0E00-\u0E7F\s]/g, "");
    }

    // 2. Phone Number: Max 12 chars, Numbers only
    if (name === "telephone") {
      if (newValue.length > 12) return; // Block > 12
      newValue = newValue.replace(/[^0-9]/g, ""); // Remove non-numeric
    }

    setForm({ ...form, [name]: newValue });
  };

  const handleRoleChange = (e) => {
    setForm({ ...form, role: e.target.value });
  };

  const handleCancel = () => {
    navigate("/hr/dashboard");
  };

  const handleDone = async (e) => {
    e.preventDefault();

    // Manual Validation
    const requiredFields = [
      "username",
      "firstName",
      "lastName",
      "email",
      "telephone",
      "password",
      "department",
      "role",
      "prefix",
    ];
    const missingFields = requiredFields.filter((field) => !form[field]);

    if (missingFields.length > 0) {
      // 4. If data is incomplete, show Popup Error
      setErrorPopup({
        isOpen: true,
        title: "Missing Information",
        message: "Please fill in all required fields completely.",
      });
      return;
    }

    const payload = {
      username: form.username,
      password: form.password,
      email: form.email,
      first_name: form.firstName,
      last_name: form.lastName,
      phone: form.telephone,
      role: form.role,
      department_id: form.department,
      empId: form.empId,
      prefix_id: form.prefix,
    };

    try {
      const res = await api.post("/users", payload);
      const data = res.data;

      setPopup({
        isOpen: true,
        title: "User Created",
        message:
          "User created successfully! Proceeding to Employee Personal Information...",
        type: "success",
      });
      // Delay navigation
      setTimeout(() => {
        navigate("/hr/add-emp-personal", {
          state: {
            userId: data.userId,
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            empId: form.empId,
          },
        });
      }, 2000);
    } catch (err) {
      console.error("Network error:", err);
      setErrorPopup({
        isOpen: true,
        title: "Submission Error",
        message: err.response?.data?.message || "Failed to create user.",
      });
    }
  };

  const getRoleIcon = (roleName) => {
    switch (roleName) {
      case "Admin":
        return <FaUserCog />;
      case "HR":
        return <FaUserTie />;
      case "CHRO":
        return <FaUserShield />;
      case "Head":
        return <FaUserTie />;
      default:
        return <FaUser />;
    }
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
      <PopupErrorHR
        isOpen={errorPopup.isOpen}
        onClose={() => setErrorPopup({ ...errorPopup, isOpen: false })}
        title={errorPopup.title}
        message={errorPopup.message}
      />

      <div className="add-user-page">
        <div className="add-user-container">
          <div className="add-user-header">
            <h2>Create New User</h2>
            <p>Enter the details to register a new employee into the system.</p>
          </div>

          <form onSubmit={handleDone} className="add-user-form-grid" noValidate>
            {/* --- Account Details Section --- */}
            <div className="form-section">
              <h3>Account Details</h3>
              <div className="section-grid">
                {/* Employee ID */}
                <div className="form-group">
                  <label>Employee ID</label>
                  <div className="input-group-styled readonly-group">
                    <div className="icon-box">
                      <FaIdCard />
                    </div>
                    <input
                      type="text"
                      name="empId"
                      value={form.empId}
                      readOnly
                      className="readonly"
                    />
                  </div>
                </div>

                {/* Username */}
                <div className="form-group">
                  <label>Username</label>
                  <div className="input-group-styled">
                    <div className="icon-box">
                      <FaUser />
                    </div>
                    <input
                      type="text"
                      name="username"
                      placeholder="jdoe"
                      value={form.username}
                      onChange={handleChange}
                      maxLength={255}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="form-group">
                  <label>Password</label>
                  <div className="input-group-styled">
                    <div className="icon-box">
                      <FaLock />
                    </div>
                    <input
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="form-group">
                  <label>Email Address</label>
                  <div className="input-group-styled">
                    <div className="icon-box">
                      <FaEnvelope />
                    </div>
                    <input
                      type="email"
                      name="email"
                      placeholder="john.doe@company.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* --- Personal Information Section --- */}
            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="section-grid">
                {/* Prefix */}
                <div className="form-group">
                  <label>Prefix</label>
                  <div className="input-group-styled">
                    <div className="icon-box">
                      <FaUser />
                    </div>
                    <select
                      name="prefix"
                      value={form.prefix}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select</option>
                      {prefixes.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.prefix_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* First Name */}
                <div className="form-group">
                  <label>First Name</label>
                  <div className="input-group-styled">
                    <div className="icon-box">
                      <FaUser />
                    </div>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="John"
                      value={form.firstName}
                      onChange={handleChange}
                      maxLength={255}
                      required
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div className="form-group">
                  <label>Last Name</label>
                  <div className="input-group-styled">
                    <div className="icon-box">
                      <FaUser />
                    </div>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Doe"
                      value={form.lastName}
                      onChange={handleChange}
                      maxLength={255}
                      required
                    />
                  </div>
                </div>

                {/* Telephone */}
                <div className="form-group">
                  <label>Phone Number</label>
                  <div className="input-group-styled">
                    <div className="icon-box">
                      <FaPhone />
                    </div>
                    <input
                      type="tel"
                      name="telephone"
                      placeholder="0812345678"
                      value={form.telephone}
                      onChange={handleChange}
                      maxLength={12}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* --- Organization Section --- */}
            <div className="form-section">
              <h3>Organization & Role</h3>
              <div className="section-grid">
                {/* Department */}
                <div className="form-group full-width">
                  <label>Department</label>
                  <div className="input-group-styled">
                    <div className="icon-box">
                      <FaBuilding />
                    </div>
                    <select
                      name="department"
                      value={form.department}
                      onChange={handleChange}
                      required
                      className={
                        form.department === "" ? "placeholder-style" : ""
                      }
                    >
                      <option value="" disabled hidden>
                        Select Department
                      </option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.department_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Role Selection */}
                <div className="form-group full-width">
                  <div className="role-group-label-wrapper">
                    <span className="role-label-icon">
                      <FaBriefcase />
                    </span>
                    <span className="role-label-text">Assign Role</span>
                  </div>
                  <div className="role-options">
                    {roles.length > 0 ? (
                      roles.map((r) => (
                        <label key={r.id} className="role-card">
                          <input
                            type="radio"
                            name="role"
                            value={r.role_name}
                            checked={form.role === r.role_name}
                            onChange={handleRoleChange}
                            required
                          />
                          <div className="role-card-content">
                            <div className="role-icon">
                              {getRoleIcon(r.role_name)}
                            </div>
                            <span className="role-name">{r.role_name}</span>
                          </div>
                        </label>
                      ))
                    ) : (
                      <p>Loading roles...</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="button-group">
              <button
                type="button"
                className="btn cancel-btn"
                onClick={handleCancel}
              >
                <FaTimes /> Cancel
              </button>
              <button type="submit" className="btn done-btn">
                <FaCheck /> Create User
              </button>
            </div>
          </form>
        </div>
      </div>
    </HRLayout>
  );
};

export default AddUser;
