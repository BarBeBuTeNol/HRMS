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
  FaTimes, // Added for Modal Close
} from "react-icons/fa";
import CHROLayout from "../../../Component/CHRO/CHROLayout";
import PopupNotification from "../../../Component/popup_notifications/PopupNotification";
import ChangeRequestModal from "../../../Component/popup_notifications/ChangeRequestModal";
import "./EmployeeDirectoryCHRO.css";
import api from "../../../../services/api"; // Import centralized api

const EmployeeDirectoryCHRO = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

  const [employeeList, setEmployeeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [empTab, setEmpTab] = useState("personal"); // 'personal' | 'employee' | 'education'

  // Filter & Search State
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Delete Confirmation State
  // Delete Request State
  const [deleteRequest, setDeleteRequest] = useState({
    isOpen: false,
    empId: null,
    empName: "",
    changes: [],
  });

  // Popup Notification State
  const [popup, setPopup] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const [error, setError] = useState(null);

  // Toggle View Handler
  const toggleView = (mode) => setViewMode(mode);

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/departments");
      setDepartments(res.data);
    } catch (err) {
      console.error("Failed to fetch departments", err);
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/users", {
        params: {
          pageSize: 100,
          search: debouncedSearch,
          department: selectedDept,
        },
      });

      const result = res.data;
      let data = [];
      if (Array.isArray(result)) {
        data = result;
      } else if (result.data && Array.isArray(result.data)) {
        data = result.data;
      }
      setEmployeeList(data);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError(err.message || "Failed to fetch employees");
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
      const res = await api.get(`/users/${id}`);
      setSelectedEmp(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCardClick = (emp) => {
    setSelectedEmp(emp);
    fetchEmployeeDetail(emp.id);
  };

  const handleDeleteClick = (e, emp) => {
    e.stopPropagation();
    setDeleteRequest({
      isOpen: true,
      empId: emp.id,
      empName: `${emp.first_name} ${emp.last_name}`,
      changes: [
        {
          field: "employmentStatus",
          oldValue: emp.employment_status || "Active",
          newValue: "Terminated",
        },
      ],
    });
  };

  const handleSubmitDeleteRequest = async (reason, file) => {
    // Helper function to call the delete/change request API
    setLoading(true);
    try {
      const formDataPayload = new FormData();
      formDataPayload.append("targetUserId", deleteRequest.empId);
      formDataPayload.append("changes", JSON.stringify(deleteRequest.changes));
      formDataPayload.append("reason", reason);
      formDataPayload.append("evidence", file);

      const res = await api.post("/change-requests", formDataPayload);

      if (res.status === 200 || res.status === 201) {
        setPopup({
          isOpen: true,
          title: "Delete Request Submitted",
          message: `Request to delete ${deleteRequest.empName} has been sent for approval.`,
          type: "success",
        });
        // Optionally refresh list if we want to show immediate feedback (though it's just a request)
        // fetchEmployees();
      }
    } catch (err) {
      // Handle error from api.post
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to submit request";
      setPopup({
        isOpen: true,
        title: "Request Failed",
        message: errorMessage,
        type: "error",
      });
    } finally {
      setDeleteRequest({
        isOpen: false,
        empId: null,
        empName: "",
        changes: [],
      });
      setLoading(false);
      setSelectedEmp(null);
    }
  };

  const InfoRow = ({ icon, label, value }) => (
    <div className="chro-info-row-premium">
      <div className="chro-info-icon">{icon}</div>
      <div className="chro-info-content">
        <span className="chro-info-label">{label}</span>
        <span className="chro-info-value">{value || "-"}</span>
      </div>
    </div>
  );

  const renderTabContent = () => {
    if (!selectedEmp) return null;

    if (empTab === "personal") {
      return (
        <div className="chro-tab-grid">
          <div className="chro-section-divider">--- User Details ---</div>
          <InfoRow
            icon={<FaUserTie />}
            label="Full Name"
            value={`${selectedEmp.first_name} ${selectedEmp.last_name}`}
          />
          <InfoRow
            icon={<FaVenusMars />}
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
            icon={<FaBriefcase />}
            label="Blood Type"
            value={selectedEmp.blood_type}
          />
          <div className="chro-section-divider">--- Emergency Contact ---</div>
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
        <div className="chro-tab-grid">
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
        <div className="chro-tab-grid">
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

  const filteredEmployees = employeeList;

  return (
    <CHROLayout>
      <PopupNotification
        isOpen={popup.isOpen}
        onClose={() => setPopup({ ...popup, isOpen: false })}
        title={popup.title}
        message={popup.message}
        type={popup.type}
      />

      {/* Delete Request Modal */}
      <ChangeRequestModal
        isOpen={deleteRequest.isOpen}
        onClose={() =>
          setDeleteRequest({
            isOpen: false,
            empId: null,
            empName: "",
            changes: [],
          })
        }
        changes={deleteRequest.changes}
        employeeName={deleteRequest.empName}
        onSubmit={handleSubmitDeleteRequest}
      />

      <div className="chro-emp-page-container">
        <div className="chro-emp-page-header">
          <div className="chro-emp-title-section">
            <h1 className="chro-emp-page-title">Executive Talent Directory</h1>
            <p className="chro-emp-page-subtitle">
              Overview of organizational talent & allocation
            </p>
          </div>

          <div className="chro-emp-controls">
            {/* Search Box */}
            <div className="chro-emp-search-wrapper">
              <FaSearch className="chro-emp-search-icon" />
              <input
                type="text"
                placeholder="Search executive, manager, employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="chro-emp-search-input"
              />
            </div>

            {/* Department Filter */}
            <div className="chro-emp-filter-wrapper">
              <FaFilter className="chro-emp-filter-icon" />
              <select
                className="chro-dept-filter-select"
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
              <FaChevronDown className="chro-emp-filter-chevron" />
            </div>

            {/* View Toggles - FIXED: Clearly separated buttons */}
            <div className="chro-view-toggles">
              <button
                className={`chro-toggle-btn ${
                  viewMode === "grid" ? "active" : ""
                }`}
                onClick={() => setViewMode("grid")}
                aria-label="Grid View"
              >
                <FaIdCard /> <span>Cards</span>
              </button>
              <button
                className={`chro-toggle-btn ${
                  viewMode === "list" ? "active" : ""
                }`}
                onClick={() => setViewMode("list")}
                aria-label="List View"
              >
                <FaBriefcase /> <span>List</span>
              </button>
            </div>
          </div>
        </div>

        {error ? (
          <div className="chro-error-state">
            <p>Error: {error}</p>
            <button onClick={fetchEmployees} className="btn-retry">
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="chro-loading-state">Loading employees...</div>
        ) : filteredEmployees.length === 0 ? (
          <div className="chro-no-emp-state">
            <div className="chro-no-emp-icon">
              <FaUserTie />
            </div>
            <h3>No Employees Found</h3>
            <p>Try adjusting your search.</p>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="chro-emp-grid-container">
                {filteredEmployees.map((emp) => (
                  <motion.div
                    key={emp.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="chro-emp-card-premium"
                    onClick={() => handleCardClick(emp)}
                  >
                    <div className="chro-emp-card-header">
                      <div className="chro-emp-avatar-large">
                        {emp.first_name ? (
                          emp.first_name[0].toUpperCase()
                        ) : (
                          <FaUserTie />
                        )}
                      </div>
                      <div className="chro-emp-card-actions">
                        <button
                          className="chro-action-btn edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/chro/edit-employee", {
                              state: { userId: emp.id },
                            });
                          }}
                          title="Edit"
                        >
                          <FaUserTie />
                        </button>
                        <button
                          className="chro-action-btn delete"
                          onClick={(e) => handleDeleteClick(e, emp)}
                          title="Delete"
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
                    </div>
                    <div className="chro-emp-card-body">
                      <h3 className="chro-emp-name">
                        {emp.first_name} {emp.last_name}
                      </h3>
                      <p
                        className="chro-emp-code"
                        style={{
                          opacity: 0.7,
                          fontSize: "0.85rem",
                          marginBottom: "4px",
                        }}
                      >
                        ID: {emp.emp_code || "-"}
                      </p>
                      <p className="chro-emp-role">
                        {emp.job_position || emp.role_name}
                      </p>
                      <div className="chro-emp-department-badge">
                        {emp.department_name || "Unassigned"}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="chro-emp-list-container">
                <table className="chro-emp-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>ID</th>
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
                          <div className="chro-list-user-info">
                            <div className="chro-list-avatar">
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
                          <span
                            className="chro-emp-id-text"
                            style={{ fontWeight: "500", color: "#555" }}
                          >
                            {emp.emp_code || "-"}
                          </span>
                        </td>
                        <td>
                          <span className="chro-emp-badge-role">
                            {emp.job_position || emp.role_name}
                          </span>
                        </td>
                        <td>
                          <span className="chro-emp-badge-department">
                            {emp.department_name || "Unassigned"}
                          </span>
                        </td>
                        <td>{emp.email}</td>
                        <td>
                          <div className="chro-list-actions">
                            <button
                              className="chro-action-btn-small edit"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate("/chro/edit-employee", {
                                  state: { userId: emp.id },
                                });
                              }}
                            >
                              <FaUserTie />
                            </button>
                            <button
                              className="chro-action-btn-small delete"
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
              className="chro-detail-overlay"
              onClick={() => setSelectedEmp(null)}
            >
              <motion.div
                className="chro-detail-modal"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                {/* Header */}
                <div className="chro-detail-header">
                  <button
                    className="chro-close-detail-btn"
                    onClick={() => setSelectedEmp(null)}
                    aria-label="Close"
                  >
                    <FaTimes />
                  </button>
                  <div className="chro-detail-profile-summary">
                    <div className="chro-detail-avatar">
                      {selectedEmp.profile_picture ? (
                        <img
                          src={`${api.defaults.baseURL.replace("/api", "")}${selectedEmp.profile_picture}`}
                          alt="Profile"
                        />
                      ) : (
                        selectedEmp.first_name?.charAt(0) || "U"
                      )}
                    </div>
                    <h2>
                      {selectedEmp.first_name} {selectedEmp.last_name}
                    </h2>
                    <p>{selectedEmp.job_position || selectedEmp.role_name}</p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="chro-detail-tabs">
                  <button
                    className={`chro-detail-tab ${
                      empTab === "personal" ? "active" : ""
                    }`}
                    onClick={() => setEmpTab("personal")}
                  >
                    Personal Info
                  </button>
                  <button
                    className={`chro-detail-tab ${
                      empTab === "employee" ? "active" : ""
                    }`}
                    onClick={() => setEmpTab("employee")}
                  >
                    Job Details
                  </button>
                  <button
                    className={`chro-detail-tab ${
                      empTab === "education" ? "active" : ""
                    }`}
                    onClick={() => setEmpTab("education")}
                  >
                    Education
                  </button>
                </div>

                {/* Content */}
                <div className="chro-detail-content">
                  <div className="chro-tab-grid">{renderTabContent()}</div>
                </div>

                {/* Footer Actions */}
                <div className="chro-detail-footer">
                  <button
                    className="chro-btn-edit-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/chro/edit-employee", {
                        state: { userId: selectedEmp.id },
                      });
                    }}
                  >
                    <FaUserTie /> Edit Personal Info
                  </button>
                  <button
                    className="chro-btn-danger-full"
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
    </CHROLayout>
  );
};

export default EmployeeDirectoryCHRO;
