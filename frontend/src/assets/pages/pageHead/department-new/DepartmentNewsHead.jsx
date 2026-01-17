import React, { useState, useEffect } from "react";
import axios from "axios";
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

  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
  // Ensure numeric ID
  const userId = currentUser.id ? Number(currentUser.id) : null;
  const userRole = currentUser.role || "";

  // API Base URL
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/announcements?userId=${userId}`
      );
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

  const handleCreateClick = () => {
    setModalMode("create");
    setFormData({ title: "", content: "", priority: "Normal" });
    setShowModal(true);
  };

  const handleEditClick = (item) => {
    setModalMode("edit");
    setCurrentNews(item);
    setFormData({
      title: item.title,
      content: item.content,
      priority: item.priority,
    });
    setShowModal(true);
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
          await axios.delete(`${API_URL}/announcements/${id}`, {
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
            "Department ID not found in current user object. Announcement might default to Company News or fail."
          );
        }

        await axios.post(`${API_URL}/announcements`, payload);
      } else {
        await axios.put(`${API_URL}/announcements/${currentNews.id}`, {
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

              <AnimatePresence>
                {loading ? (
                  <p>Loading...</p>
                ) : departmentNews.length === 0 ? (
                  <div className="empty-state">
                    No announcements for your department yet.
                  </div>
                ) : (
                  departmentNews.map((item) => (
                    <NewsCard
                      key={item.id}
                      item={item}
                      currentUserId={userId}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteClick}
                    />
                  ))
                )}
              </AnimatePresence>
            </section>

            {/* Right Column: Company News */}
            <section className="news-section">
              <div className="section-label">
                <FaBuilding /> Company News
              </div>

              <AnimatePresence>
                {loading ? (
                  <p>Loading...</p>
                ) : companyNews.length === 0 ? (
                  <div className="empty-state">No company announcements.</div>
                ) : (
                  companyNews.map((item) => (
                    <NewsCard
                      key={item.id}
                      item={item}
                      currentUserId={userId}
                      canEdit={false} // Usually Head can't edit company news unless admin
                    />
                  ))
                )}
              </AnimatePresence>
            </section>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="head-modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="head-modal-content"
            onClick={(e) => e.stopPropagation()}
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
                <label className="form-label">Topic / Title</label>
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

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  name="priority"
                  className="form-select"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option value="Normal">Normal</option>
                  <option value="Important">Important</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Message Content</label>
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
                >
                  {modalMode === "create"
                    ? "Post Announcement"
                    : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component for individual card
const NewsCard = ({
  item,
  currentUserId,
  onEdit,
  onDelete,
  canEdit = true,
}) => {
  // Check ownership
  // posted_by is likely a number, currentUserId is number
  const isOwner = canEdit && item.posted_by === currentUserId;

  return (
    <motion.div
      className={`news-card priority-${item.priority}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <div className="card-header">
        <div className="card-title-group">
          <h3 className="card-title">{item.title}</h3>
          <div className="card-meta">
            <span className={`badge-priority ${item.priority}`}>
              {item.priority}
            </span>
            <span>•</span>
            <span>{dayjs(item.created_at).format("MMM D, YYYY • h:mm A")}</span>
            <span>•</span>
            <span>by {item.poster_name || "Unknown"}</span>
          </div>
        </div>
        {isOwner && (
          <div className="card-actions">
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
      </div>
      <div className="card-content">{item.content}</div>
    </motion.div>
  );
};

export default DepartmentNewsHead;
