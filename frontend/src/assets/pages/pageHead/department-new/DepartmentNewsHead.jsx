import React, { useState, useEffect } from "react";
import api from "../../../../services/api";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBullhorn,
  FaPlus,
  FaBuilding,
  FaUsers,
  FaEdit,
  FaTrash,
  FaTimes,
} from "react-icons/fa";

import HeadSidebar from "../../../Component/Head/HeadSidebar";
import "../../../theam/head_theam/HeadTheme.css";
import "./DepartmentNewsHead.css";

const DepartmentNewsHead = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' or 'edit'
  const [currentNews, setCurrentNews] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "Normal",
  });
  const [originalData, setOriginalData] = useState(null); // Track initial data
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false); // Custom dropdown toggle

  // Check if form has changes
  const hasChanges = React.useMemo(() => {
    if (!originalData) return false;
    return (
      formData.title !== originalData.title ||
      formData.content !== originalData.content ||
      formData.priority !== originalData.priority
    );
  }, [formData, originalData]);

  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
  // Ensure numeric ID
  const userId = currentUser.id ? Number(currentUser.id) : null;
  const userRole = currentUser.role || "";

  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/announcements?userId=${userId}`);
      setNews(response.data);
    } catch (error) {
      console.error("Error fetching news:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load announcements.",
        background: "#1e293b",
        color: "#fff",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNews();
    }
  }, [userId]);

  // Handlers
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePrioritySelect = (priority) => {
    setFormData({ ...formData, priority });
    setShowPriorityDropdown(false);
  };

  const handleCreateClick = () => {
    setModalMode("create");
    const initial = { title: "", content: "", priority: "Normal" };
    setFormData(initial);
    setOriginalData(initial);
    setShowModal(true);
    setShowPriorityDropdown(false);
  };

  const handleEditClick = (item) => {
    setModalMode("edit");
    setCurrentNews(item);
    const initial = {
      title: item.title,
      content: item.content,
      priority: item.priority,
    };
    setFormData(initial);
    setOriginalData(initial);
    setShowModal(true);
    setShowPriorityDropdown(false);
  };

  const handleDeleteClick = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#c5a059", // Gold
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it!",
      background: "#1e293b",
      color: "#fff",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/announcements/${id}`, {
            data: { userId },
          });
          Swal.fire({
            title: "Deleted!",
            text: "Announcement has been deleted.",
            icon: "success",
            background: "#1e293b",
            color: "#fff",
            confirmButtonColor: "#c5a059",
          });
          fetchNews();
        } catch (error) {
          console.error("Error deleting announcement:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to delete announcement.",
            background: "#1e293b",
            color: "#fff",
          });
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (modalMode === "edit" && !hasChanges) return;

    try {
      if (modalMode === "create") {
        // Prepare payload
        const payload = {
          ...formData,
          userId,
          type: "department",
          priority: formData.priority,
        };

        // Explicitly check for department ID.
        const deptId =
          currentUser.department_id ||
          currentUser.departmentId ||
          currentUser.DepartmentId;

        if (deptId) {
          payload.targetDepartmentId = deptId;
        } else {
          console.warn(
            "Department ID not found in current user object. Announcement might default to Company News or fail.",
          );
        }

        await api.post(`/announcements`, payload);
      } else {
        await api.put(`/announcements/${currentNews.id}`, {
          ...formData,
          userId,
        });
      }
      setShowModal(false);
      fetchNews();
      Swal.fire({
        icon: "success",
        title: modalMode === "create" ? "Created!" : "Updated!",
        showConfirmButton: false,
        timer: 1500,
        background: "#1e293b",
        color: "#fff",
      });
    } catch (error) {
      console.error("Error saving announcement:", error);
      // Don't close modal on error so user can retry
      // setShowModal(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          "Failed to save announcement. Please check your connection.",
        background: "#1e293b",
        color: "#fff",
      });
    }
  };

  // Derived State
  const safeNews = Array.isArray(news) ? news : [];
  const companyNews = safeNews.filter((n) => !n.target_department_id);
  const departmentNews = safeNews.filter((n) => n.target_department_id);

  // Animation variants for container (stagger effect)
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="head-layout">
      <HeadSidebar unreadCount={0} onToggle={setIsSidebarOpen} />
      <div
        className="head-content"
        style={{
          marginLeft: isSidebarOpen ? "260px" : "80px",
          transition: "margin-left 0.4s ease",
        }}
      >
        <div className="head-news-container">
          <div className="head-news-header">
            <h1 className="head-news-title">
              <FaBullhorn /> Department News
            </h1>
            <button
              type="button"
              className="head-create-btn"
              onClick={handleCreateClick}
            >
              <FaPlus /> New Announcement
            </button>
          </div>

          <div className="head-news-layout">
            {/* Left Column: Department News (Primary focus) */}
            <section className="news-section">
              <div className="section-label">
                <FaUsers />{" "}
                {currentUser.department
                  ? `${currentUser.department}`
                  : "My Department News"}
              </div>

              {loading ? (
                <p>Loading...</p>
              ) : departmentNews.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <div className="empty-text">No announcements for your department yet.</div>
                </div>
              ) : (
                <motion.div 
                  className="news-grid"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  <AnimatePresence>
                    {departmentNews.map((item) => (
                      <NewsCard
                        key={item.id}
                        item={item}
                        currentUserId={userId}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </section>

            {/* Right Column: Company News */}
            <section className="news-section">
              <div className="section-label">
                <FaBuilding /> Company News
              </div>

              {loading ? (
                <p>Loading...</p>
              ) : companyNews.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🏢</div>
                  <div className="empty-text">No company announcements.</div>
                </div>
              ) : (
                <motion.div 
                  className="news-grid"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  <AnimatePresence>
                    {companyNews.map((item) => (
                      <NewsCard
                        key={item.id}
                        item={item}
                        currentUserId={userId}
                        canEdit={false} // Usually Head can't edit company news unless admin
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </section>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="head-modal-overlay"
            onClick={() => setShowModal(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="head-modal-content"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="head-modal-header">
                <h2 className="head-modal-title">
                  {modalMode === "create"
                    ? "Create Announcement"
                    : "Edit Announcement"}
                </h2>
                <button
                  type="button"
                  className="close-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowModal(false);
                  }}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="head-modal-body-container">
                <div className="form-group">
                  <label className="form-label">TOPIC / TITLE</label>
                  <input
                    type="text"
                    name="title"
                    className="form-input"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter announcement topic..."
                    autoFocus
                  />
                </div>

                <div className="form-group custom-select-group">
                  <label className="form-label">PRIORITY</label>
                  <div className="custom-select-container">
                    <button
                      type="button"
                      className={`custom-select-trigger priority-${formData.priority}`}
                      onClick={() =>
                        setShowPriorityDropdown(!showPriorityDropdown)
                      }
                    >
                      <span>{formData.priority}</span>
                      <motion.span
                        animate={{ rotate: showPriorityDropdown ? 180 : 0 }}
                      >
                        ▼
                      </motion.span>
                    </button>

                    <AnimatePresence>
                      {showPriorityDropdown && (
                        <motion.div
                          className="custom-options-list"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          {["Normal", "Important", "Urgent"].map((p) => (
                            <div
                              key={p}
                              className={`custom-option priority-${p} ${
                                formData.priority === p ? "selected" : ""
                              }`}
                              onClick={() => handlePrioritySelect(p)}
                            >
                              {p}
                              {formData.priority === p && <span>✓</span>}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">MESSAGE CONTENT</label>
                  <textarea
                    name="content"
                    className="form-textarea"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Type your message here..."
                  />
                </div>

                <div className="head-modal-footer">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-submit"
                    onClick={handleSubmit}
                    disabled={modalMode === "edit" && !hasChanges}
                    style={{
                      opacity:
                        modalMode === "edit" && !hasChanges ? 0.5 : 1,
                      cursor:
                        modalMode === "edit" && !hasChanges
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    {modalMode === "create"
                      ? "Post Announcement"
                      : "Save Changes"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Sub-component for individual card with variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

const NewsCard = ({
  item,
  currentUserId,
  onEdit,
  onDelete,
  canEdit = true,
}) => {
  // Check ownership
  const isOwner = canEdit && item.posted_by === currentUserId;

  return (
    <motion.div
      className={`news-card priority-${item.priority}`}
      variants={cardVariants}
      layout
    >
      {/* Absolute Actions for Owner */}
      {isOwner && (
        <div className="card-actions-absolute">
          <button
            className="action-btn edit"
            onClick={() => onEdit(item)}
            title="Edit"
          >
            <FaEdit />
          </button>
          <button
            className="action-btn delete"
            onClick={() => onDelete(item.id)}
            title="Delete"
          >
            <FaTrash />
          </button>
        </div>
      )}

      {/* Top: Priority Badge Centered */}
      <div className="card-top-badge">
        <span className={`badge-priority ${item.priority}`}>
          {item.priority}
        </span>
      </div>

      {/* Middle: Title & Content */}
      <div className="card-body-centered">
        <h3 className="card-title-centered">{item.title}</h3>
        <div className="card-content-centered">{item.content}</div>
      </div>

      {/* Bottom: Meta Info */}
      <div className="card-footer-centered">
        <span>{dayjs(item.created_at).format("MMM D, YYYY")}</span>
        <span className="separator">•</span>
        <span>{item.poster_name || "Unknown"}</span>
      </div>
    </motion.div>
  );
};

export default DepartmentNewsHead;
