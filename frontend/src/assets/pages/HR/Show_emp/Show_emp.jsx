import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaUserTie,
  FaTrashAlt,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBuilding,
  FaIdCard,
  FaGraduationCap,
  FaBriefcase,
  FaUserFriends,
  FaVenusMars,
  FaBirthdayCake,
  FaGlobe,
  FaPray,
  FaHeart,
  FaClock,
  FaCheckCircle,
  FaMoneyBillWave,
  FaFilter,
  FaChevronDown,
} from "react-icons/fa";
import HRLayout from "../../../Component/HR/HRLayout";
import PopupNotification from "../../../Component/popup_notifications/popup_notifications-hr/PopupHR";
import LogService from "../../../../services/LogService";
import "./Show_emp.css";

const Show_emp = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

  const [employeeList, setEmployeeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedEmp, setSelectedEmp] = useState(null);

  // Filter & Search State
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Delete Confirmation State
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    empId: null,
    empName: "",
  });

  // Popup Notification State
  const [popup, setPopup] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const [error, setError] = useState(null);

  // Tab State for Detail Modal
  const [empTab, setEmpTab] = useState("personal");

  // Toggle View Handler
  const toggleView = (mode) => setViewMode(mode);

  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/departments");
      if (res.ok) {
        const data = await res.json();
        setDepartments(data);
      }
    } catch (err) {
      console.error("Failed to fetch departments", err);
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        pageSize: 100,
        search: debouncedSearch,
        department: selectedDept,
      }).toString();

      const res = await fetch(`/api/users?${query}`);
      if (res.ok) {
        // Fix: backend might return array directly or { data: [...] }
        const result = await res.json();
        console.log("Show_emp API Result:", result);
        let data = [];
        if (Array.isArray(result)) {
          console.log("Result is Array");
          data = result;
        } else if (result.data && Array.isArray(result.data)) {
          console.log("Result has data array");
          data = result.data;
        } else {
          console.warn("Unexpected API structure", result);
        }
        console.log("Setting employee list with:", data);
        setEmployeeList(data);
      } else {
        throw new Error("Failed to fetch employees");
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch when filters change
  useEffect(() => {
    fetchEmployees();
  }, [debouncedSearch, selectedDept]);

  const fetchEmployeeDetail = async (id) => {
    try {
      const res = await fetch(`/api/users/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedEmp(data);
      } else {
        console.error("Failed to fetch detail");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCardClick = (emp) => {
    // If we already have the data in list, use it initially, then fetch fresh
    setSelectedEmp(emp);
    fetchEmployeeDetail(emp.id);
  };

  const handleDeleteClick = (e, emp) => {
    e.stopPropagation();
    setDeleteConfirm({
      isOpen: true,
      empId: emp.id,
      empName: `${emp.first_name} ${emp.last_name}`,
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.empId) return;
    try {
      const res = await fetch(`/api/users/${deleteConfirm.empId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        // LOGGING
        try {
          const currentUser = JSON.parse(
            localStorage.getItem("currentUser") || "{}",
          );
          await LogService.createLog({
            userId: currentUser.id || currentUser.user_id,
            action: "Delete User",
            details: `Deleted employee ${deleteConfirm.empName} (ID: ${deleteConfirm.empId})`,
            target: deleteConfirm.empName,
            severity: "Critical", // Deletion is critical
          });
        } catch (logErr) {
          console.warn("Logging failed", logErr);
        }

        setEmployeeList((prev) =>
          prev.filter((e) => e.id !== deleteConfirm.empId),
        );
        setPopup({
          isOpen: true,
          title: "Deleted",
          message: "Employee deleted successfully.",
          type: "success",
        });
      } else {
        throw new Error("Failed to delete");
      }
    } catch (err) {
      setPopup({
        isOpen: true,
        title: "Error",
        message: "Failed to delete employee.",
        type: "error",
      });
    } finally {
      setDeleteConfirm({ isOpen: false, empId: null, empName: "" });
      setSelectedEmp(null);
    }
  };

  const InfoRow = ({ icon, label, value }) => (
    <div className="info-row-premium">
      <div className="info-icon">{icon}</div>
      <div className="info-content">
        <span className="info-label">{label}</span>
        <span className="info-value">{value || "-"}</span>
      </div>
    </div>
  );

  const renderTabContent = () => {
    if (!selectedEmp) return null;

    if (empTab === "personal") {
      return (
        <div className="tab-grid">
          <div className="section-divider">--- User Details ---</div>
          <InfoRow
            icon={<FaUserTie />}
            label="Full Name"
            value={`${selectedEmp.first_name} ${selectedEmp.last_name}`}
          />
          <InfoRow
            icon={<FaVenusMars />} // Note: Make sure this is imported or use FaVenusMars
            label="Gender"
            value={selectedEmp.gender}
          />
          <InfoRow
            icon={<FaBirthdayCake />}
            label="Date of Birth"
            value={
              selectedEmp.birth_date
                ? new Date(selectedEmp.birth_date).toLocaleDateString("th-TH")
                : "-"
            }
          />
          <InfoRow
            icon={<FaMapMarkerAlt />}
            label="Address"
            value={selectedEmp.address}
          />
          <InfoRow
            icon={<FaHeart />}
            label="Marital Status"
            value={selectedEmp.marital_status}
          />
          <InfoRow
            icon={<FaGlobe />}
            label="Nationality"
            value={selectedEmp.nationality}
          />
          <InfoRow
            icon={<FaPray />}
            label="Religion"
            value={selectedEmp.religion}
          />
          <InfoRow
            icon={<FaBriefcase />} // Reusing icon for generic data
            label="Blood Type"
            value={selectedEmp.blood_type}
          />
          <div className="section-divider">--- Emergency Contact ---</div>
          <InfoRow
            icon={<FaUserFriends />}
            label="Contact Name"
            value={selectedEmp.emergency_contact_name}
          />
          <InfoRow
            icon={<FaPhone />}
            label="Phone"
            value={selectedEmp.emergency_contact_phone}
          />
          <InfoRow
            icon={<FaUserTie />}
            label="Relationship"
            value={selectedEmp.relation_to_emergency_contact}
          />
        </div>
      );
    }

    if (empTab === "employee") {
      return (
        <div className="tab-grid">
          <InfoRow
            icon={<FaIdCard />}
            label="Employee Code"
            value={selectedEmp.emp_code}
          />
          <InfoRow
            icon={<FaBuilding />}
            label="Department"
            value={selectedEmp.department_name}
          />
          <InfoRow
            icon={<FaBriefcase />}
            label="Job Position"
            value={selectedEmp.job_position || selectedEmp.job_title}
          />
          <InfoRow
            icon={<FaCheckCircle />}
            label="Employment Status"
            value={selectedEmp.employment_status}
          />
          <InfoRow
            icon={<FaClock />}
            label="Work Hours"
            value={
              selectedEmp.work_start_time && selectedEmp.work_end_time
                ? `${selectedEmp.work_start_time} - ${selectedEmp.work_end_time}`
                : "-"
            }
          />
          <InfoRow
            icon={<FaClock />}
            label="Hire Date"
            value={
              selectedEmp.hire_date
                ? new Date(selectedEmp.hire_date).toLocaleDateString("th-TH")
                : "-"
            }
          />
          <InfoRow
            icon={<FaMoneyBillWave />}
            label="Salary"
            value={
              selectedEmp.salary
                ? `${parseFloat(selectedEmp.salary).toLocaleString()} THB`
                : "-"
            }
          />
          <InfoRow
            icon={<FaBriefcase />}
            label="Benefits"
            value={selectedEmp.benefits}
          />
          <InfoRow
            icon={<FaCheckCircle />}
            label="Performance Review"
            value={selectedEmp.performance_review}
          />
          <InfoRow
            icon={<FaBriefcase />}
            label="Training Info"
            value={selectedEmp.training_info}
          />
        </div>
      );
    }

    if (empTab === "education") {
      return (
        <div className="tab-grid">
          <InfoRow
            icon={<FaGraduationCap />}
            label="Education Level"
            value={selectedEmp.education_level}
          />
          <InfoRow
            icon={<FaBuilding />}
            label="Institution"
            value={selectedEmp.institution}
          />
          <InfoRow
            icon={<FaBriefcase />}
            label="Program"
            value={selectedEmp.program}
          />
          <InfoRow
            icon={<FaBriefcase />}
            label="Previous Experience"
            value={selectedEmp.previous_experience}
          />
          <InfoRow
            icon={<FaUserTie />}
            label="Skills"
            value={selectedEmp.skills}
          />
        </div>
      );
    }
  };

  // Client-side filtering removed in favor of Server-side
  const filteredEmployees = employeeList;

  return (
    <HRLayout>
      <PopupNotification
        isOpen={popup.isOpen}
        onClose={() => setPopup({ ...popup, isOpen: false })}
        title={popup.title}
        message={popup.message}
        type={popup.type}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <h3>Delete Employee?</h3>
            <div className="confirm-content">
              <p>Are you sure you want to delete</p>
              <div className="text-highlight-wrapper">
                <span className="text-highlight-danger">
                  {deleteConfirm.empName}
                </span>
              </div>
              <p>This action cannot be undone.</p>
            </div>
            <div className="confirm-actions">
              <button
                className="btn-cancel"
                onClick={() =>
                  setDeleteConfirm({ isOpen: false, empId: null, empName: "" })
                }
              >
                Cancel
              </button>
              <button className="btn-delete" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="emp-page-container">
        <div className="emp-page-header">
          <div>
            <h1 className="emp-page-title">Employee Directory</h1>
            <p className="emp-page-subtitle">
              Manage your team members and their information.
            </p>
          </div>
          <div className="emp-controls">
            <div className="filter-group">
              <div className="emp-filter-wrapper">
                <FaFilter className="emp-filter-icon" />
                <select
                  className="dept-filter-select"
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.department_name}>
                      {dept.department_name}
                    </option>
                  ))}
                </select>
                <FaChevronDown className="emp-filter-chevron" />
              </div>
            </div>
            <div className="view-toggles">
              <button
                className={`toggle-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => toggleView("grid")}
                title="Grid View"
              >
                <FaUserTie />
              </button>
              <button
                className={`toggle-btn ${viewMode === "list" ? "active" : ""}`}
                onClick={() => toggleView("list")}
                title="List View"
              >
                <FaBriefcase />
              </button>
            </div>
            <div className="emp-search-wrapper">
              <FaSearch className="emp-search-icon" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="emp-search-input"
              />
            </div>
          </div>
        </div>

        {error ? (
          <div className="error-state">
            <p>Error: {error}</p>
            <button onClick={fetchEmployees} className="btn-retry">
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="loading-state">Loading employees...</div>
        ) : filteredEmployees.length === 0 ? (
          <div className="no-emp-state">
            <div className="no-emp-icon">
              <FaUserTie />
            </div>
            <h3>No Employees Found</h3>
            <p>Try adjusting your search or add a new employee.</p>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="emp-grid-container">
                {filteredEmployees.map((emp) => (
                  <motion.div
                    key={emp.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="emp-card-premium"
                    onClick={() => handleCardClick(emp)}
                  >
                    <div className="emp-card-header">
                      <div className="emp-avatar-large">
                        {emp.first_name ? (
                          emp.first_name[0].toUpperCase()
                        ) : (
                          <FaUserTie />
                        )}
                      </div>
                      <div className="emp-card-actions">
                        <button
                          className="action-btn edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/hr/add-emp-personal", {
                              state: {
                                userId: emp.id,
                                empId: emp.emp_code,
                                firstName: emp.first_name,
                                lastName: emp.last_name,
                                email: emp.email,
                                isEditMode: true,
                              },
                            });
                          }}
                          title="Edit"
                        >
                          <FaUserTie />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={(e) => handleDeleteClick(e, emp)}
                          title="Delete"
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
                    </div>
                    <div className="emp-card-body">
                      <h3 className="emp-name">
                        {emp.first_name} {emp.last_name}
                      </h3>
                      <p className="emp-role">
                        {emp.job_position || emp.role_name}
                      </p>
                      <div className="emp-department-badge">
                        {emp.department_name || "Unassigned"}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="emp-list-container">
                <table className="emp-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Email</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((emp) => (
                      <tr key={emp.id} onClick={() => handleCardClick(emp)}>
                        <td>
                          <div className="list-user-info">
                            <div className="list-avatar">
                              {emp.first_name ? (
                                emp.first_name[0].toUpperCase()
                              ) : (
                                <FaUserTie />
                              )}
                            </div>
                            <span>
                              {emp.first_name} {emp.last_name}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="emp-badge-role">
                            {emp.job_position || emp.role_name}
                          </span>
                        </td>
                        <td>
                          <span className="emp-badge-department">
                            {emp.department_name || "Unassigned"}
                          </span>
                        </td>
                        <td>{emp.email}</td>
                        <td>
                          <div className="list-actions">
                            <button
                              className="action-btn-small edit"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate("/hr/add-emp-personal", {
                                  state: {
                                    userId: emp.id,
                                    empId: emp.emp_code,
                                    firstName: emp.first_name,
                                    lastName: emp.last_name,
                                    email: emp.email,
                                    isEditMode: true,
                                  },
                                });
                              }}
                            >
                              <FaUserTie />
                            </button>
                            <button
                              className="action-btn-small delete"
                              onClick={(e) => handleDeleteClick(e, emp)}
                            >
                              <FaTrashAlt />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedEmp && (
            <div
              className="detail-overlay"
              onClick={() => setSelectedEmp(null)}
            >
              <motion.div
                className="detail-modal"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <div className="detail-header">
                  <div className="detail-profile-summary">
                    <div className="detail-avatar">
                      {selectedEmp.image_url ? (
                        <img src={selectedEmp.image_url} alt="avatar" />
                      ) : (
                        selectedEmp.first_name?.[0]
                      )}
                    </div>
                    <div>
                      <h2>
                        {selectedEmp.first_name} {selectedEmp.last_name}
                      </h2>
                      <p>{selectedEmp.job_position || selectedEmp.role_name}</p>
                    </div>
                  </div>
                  <button
                    className="close-detail-btn"
                    onClick={() => setSelectedEmp(null)}
                  >
                    ×
                  </button>
                </div>

                <div className="detail-tabs">
                  <button
                    className={`detail-tab ${
                      empTab === "personal" ? "active" : ""
                    }`}
                    onClick={() => setEmpTab("personal")}
                  >
                    Personal Info
                  </button>
                  <button
                    className={`detail-tab ${
                      empTab === "employee" ? "active" : ""
                    }`}
                    onClick={() => setEmpTab("employee")}
                  >
                    Job Details
                  </button>
                  <button
                    className={`detail-tab ${
                      empTab === "education" ? "active" : ""
                    }`}
                    onClick={() => setEmpTab("education")}
                  >
                    Education
                  </button>
                </div>

                <div className="detail-content">{renderTabContent()}</div>

                <div className="detail-footer">
                  <button
                    className="btn-edit-full"
                    onClick={() => {
                      let path = "/hr/add-emp-personal";
                      if (empTab === "employee") path = "/hr/add-emp-info";
                      if (empTab === "education")
                        path = "/hr/add-emp-education";

                      navigate(path, {
                        state: {
                          userId: selectedEmp.id,
                          empId: selectedEmp.emp_code,
                          isEditMode: true,
                          // Pass other necessary data if needed for pre-filling,
                          // though the pages now fetch by userId themselves.
                          firstName: selectedEmp.first_name,
                          lastName: selectedEmp.last_name,
                          email: selectedEmp.email,
                        },
                      });
                    }}
                  >
                    <FaUserTie /> Edit{" "}
                    {empTab === "personal"
                      ? "Personal"
                      : empTab === "employee"
                        ? "Job"
                        : "Education"}{" "}
                    Info
                  </button>
                  <button
                    className="btn-danger-full"
                    onClick={(e) => handleDeleteClick(e, selectedEmp)}
                  >
                    <FaTrashAlt /> Delete Employee
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </HRLayout>
  );
};

export default Show_emp;
