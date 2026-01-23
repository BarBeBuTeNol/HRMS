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
import "./Add_user.css";

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

  // Fetch next Employee ID
  const fetchNextEmpId = async () => {
    try {
      const res = await fetch("/api/users?pageSize=1");
      if (res.ok) {
        const responseData = await res.json();
        const users = responseData.data || [];

        if (users.length === 0) {
          setForm((prev) => ({ ...prev, empId: "001" }));
          return;
        }

        // Backend sorts by ID DESC, so the first user has the max ID
        const maxId = users[0].id || 0;
        const nextId = (maxId + 1).toString().padStart(3, "0");
        setForm((prev) => ({ ...prev, empId: nextId }));
      } else {
        setForm((prev) => ({ ...prev, empId: "001" }));
      }
    } catch (err) {
      console.error("Error generating ID:", err);
      // Fallback
      setForm((prev) => ({ ...prev, empId: "001" }));
    }
  };

  // Fetch Departments
  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/departments");
      if (res.ok) {
        const data = await res.json();
        setDepartments(data);
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  // Fetch Roles
  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/roles");
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
      }
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  };

  // Fetch Prefixes
  const fetchPrefixes = async () => {
    try {
      const res = await fetch("/api/prefixes");
      if (res.ok) {
        const data = await res.json();
        setPrefixes(data);
      }
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
    setForm({ ...form, [name]: value });
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
      setPopup({
        isOpen: true,
        title: "Missing Information",
        message: "Please fill in all required fields.",
        type: "warning",
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
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
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
      } else {
        setPopup({
          isOpen: true,
          title: "Error",
          message: "Error: " + data.message,
          type: "error",
        });
      }
    } catch (err) {
      console.error("Network error:", err);
      setPopup({
        isOpen: true,
        title: "Network Error",
        message: "Network error. Please try again.",
        type: "error",
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
      <div className="add-user-page">
        <div className="add-user-container">
          <div className="add-user-header">
            <h2>Create New User</h2>
            <p>Enter the details to register a new employee into the system.</p>
          </div>

          <form onSubmit={handleDone} className="add-user-form-grid" noValidate>
            {/* Employee ID */}
            <div className="form-group">
              <label>
                <FaIdCard className="label-icon" /> Employee ID
              </label>
              <div className="input-wrapper">
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
              <label>
                <FaUser className="label-icon" /> Username
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  name="username"
                  placeholder="jdoe"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Prefix */}
            <div className="form-group">
              <label>
                <FaUser className="label-icon" /> Prefix
              </label>
              <div className="input-wrapper">
                <select
                  name="prefix"
                  value={form.prefix}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Prefix</option>
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
              <label>
                <FaUser className="label-icon" /> First Name
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  name="firstName"
                  placeholder="John"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Last Name */}
            <div className="form-group">
              <label>
                <FaUser className="label-icon" /> Last Name
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  name="lastName"
                  placeholder="Doe"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label>
                <FaEnvelope className="label-icon" /> Email Address
              </label>
              <div className="input-wrapper">
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

            {/* Telephone */}
            <div className="form-group">
              <label>
                <FaPhone className="label-icon" /> Phone Number
              </label>
              <div className="input-wrapper">
                <input
                  type="tel"
                  name="telephone"
                  placeholder="0812345678"
                  value={form.telephone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label>
                <FaLock className="label-icon" /> Password
              </label>
              <div className="input-wrapper">
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

            {/* Department */}
            <div className="form-group center-span">
              <label>
                <FaBuilding className="label-icon" /> Department
              </label>
              <div className="input-wrapper">
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  required
                  className={form.department === "" ? "placeholder-style" : ""}
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
                <FaBriefcase />
                <span className="role-group-label">Assign Role</span>
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
