import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CHROLayout from "../../../Component/CHRO/CHROLayout";
import "./AnnouncementsCHRO.css";
import api from "../../../../services/api";
import {
  Bell,
  Megaphone,
  Clock,
  Trash2,
  Edit3,
  CheckCircle,
  AlertCircle,
  FileText,
  ChevronRight,
  Plus,
} from "lucide-react";

const timeAgo = (dateMsg) => {
  const date = new Date(dateMsg);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const AnnouncementsCHRO = () => {
  const [activeTab, setActiveTab] = useState("announcements"); // 'announcements' | 'notifications'
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null); // 'create' | 'edit' | 'delete'
  const [selectedItem, setSelectedItem] = useState(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [announcementType, setAnnouncementType] = useState("general"); // 'general' | 'department'
  const [targetDeptId, setTargetDeptId] = useState("");
  const [priority, setPriority] = useState("Normal"); // 'Normal' | 'Important' | 'Urgent'

  const userId = localStorage.getItem("userId") || 1;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [annRes, notiRes, deptRes] = await Promise.all([
        api.get(`/announcements?userId=${userId}`),
        api.get(`/notifications/${userId}`),
        api.get("/departments"),
      ]);
      setAnnouncements(annRes.data);
      setNotifications(notiRes.data);
      setDepartments(deptRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await api.post("/announcements", {
        title: formTitle,
        content: formContent,
        userId: userId,
        type: announcementType,
        targetDepartmentId: targetDeptId,
        priority: priority,
      });
      fetchData();
      closeModal();
    } catch (err) {
      alert("Failed to create announcement");
    }
  };

  const handleDeleteAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await api.delete(`/announcements/${selectedItem.id}`, {
        data: { userId },
      });
      fetchData();
      closeModal();
    } catch (err) {
      alert("Failed to delete announcement. Ensure you are the owner.");
    }
  };

  const handleEditAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/announcements/${selectedItem.id}`, {
        title: formTitle,
        content: formContent,
        userId: userId,
      });
      fetchData();
      closeModal();
    } catch (err) {
      alert("Failed to update announcement");
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)),
      );
    } catch (err) {
      console.error("Error marking read:", err);
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    if (type === "edit" && item) {
      setFormTitle(item.title);
      setFormContent(item.content);
      setPriority(item.priority || "Normal"); // Assuming we fetch priority, if not preserved in edit it's acceptable for now or defaults
    } else if (type === "create") {
      setFormTitle("");
      setFormContent("");
      setAnnouncementType("general");
      setTargetDeptId("");
      setPriority("Normal");
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const stats = {
    total: announcements.length,
    urgent: notifications.filter((n) => !n.is_read).length,
    thisWeek: announcements.filter((a) => {
      const date = new Date(a.created_at);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }).length,
  };

  return (
    <CHROLayout>
      <div className="chro-exclusive-wrapper">
        {/* Header Section */}
        <div className="chro-exclusive-header">
          <div className="header-content">
            <h1 className="executive-title">
              <span className="gold-accent">CHRO</span> Intelligence
            </h1>
            <p className="executive-subtitle">
              Strategic Announcements & High-Priority Alerts
            </p>
          </div>

          <div className="executive-stats-row">
            <div className="stat-card glass">
              <div className="stat-icon">
                <FileText size={24} />
              </div>
              <div className="stat-text-center">
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">Total Briefings</span>
              </div>
            </div>
            <div className="stat-card glass gold-glow">
              <div className="stat-icon">
                <AlertCircle size={24} />
              </div>
              <div className="stat-text-center">
                <span className="stat-value">{stats.urgent}</span>
                <span className="stat-label">Pending Inputs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="chro-tabs-container">
          <div style={{ display: "flex", gap: "2.5rem" }}>
            <button
              className={`chro-nav-tab ${
                activeTab === "announcements" ? "active" : ""
              }`}
              onClick={() => setActiveTab("announcements")}
            >
              <Megaphone size={18} />
              <span>Executive Briefings</span>
            </button>
            <button
              className={`chro-nav-tab ${
                activeTab === "notifications" ? "active" : ""
              }`}
              onClick={() => setActiveTab("notifications")}
            >
              <Bell size={18} />
              <span>Alerts System</span>
              {notifications.some((n) => !n.is_read) && (
                <span className="pulsing-dot" />
              )}
            </button>
          </div>

          {activeTab === "announcements" && (
            <button className="btn-primary" onClick={() => openModal("create")}>
              <Plus size={18} style={{ marginRight: "0.5rem" }} /> New Briefing
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="chro-content-area glass-panel">
          {activeTab === "announcements" ? (
            <div className="content-list-view">
              {announcements.length === 0 && !loading && (
                <div className="empty-state-exclusive">
                  <CheckCircle size={48} className="empty-icon" />
                  <h3>All briefings cleared</h3>
                  <p>No new strategic updates at this time.</p>
                </div>
              )}
              {announcements.map((item) => (
                <motion.div
                  className="exclusive-card"
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="card-decoration"></div>
                  <div className="card-main">
                    <div className="card-header">
                      <div className="card-meta">
                        {item.priority === "Urgent" && (
                          <span
                            style={{ color: "#ef4444", fontWeight: "bold" }}
                          >
                            URGENT
                          </span>
                        )}
                        <span className="meta-department">
                          {item.department_name || "General Announcement"}
                        </span>
                        <span className="meta-dot">•</span>
                        <span className="meta-date">
                          <Clock size={14} /> {timeAgo(item.created_at)}
                        </span>
                      </div>
                      {/* Only show actions if user is the poster */}
                      {Number(item.posted_by) === Number(userId) && (
                        <div className="card-actions">
                          <button
                            onClick={() => openModal("edit", item)}
                            className="icon-btn"
                            title="Edit"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => openModal("delete", item)}
                            className="icon-btn delete"
                            title="Dismiss"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                    <h3 className="card-title">{item.title}</h3>
                    <p className="card-body">{item.content}</p>
                    <div className="card-footer">
                      <span className="author-signature">
                        Author:{" "}
                        <span className="highlight">
                          {item.poster_name || "System Admin"}
                        </span>
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="content-list-view">
              {notifications.length === 0 && !loading && (
                <div className="empty-state-exclusive">
                  <CheckCircle size={48} className="empty-icon" />
                  <h3>System All Clear</h3>
                  <p>No pending alerts requiring your attention.</p>
                </div>
              )}
              {notifications.map((noti) => (
                <motion.div
                  key={noti.id}
                  className={`exclusive-noti-item ${
                    noti.is_read ? "read" : "unread"
                  }`}
                  onClick={() => markAsRead(noti.id)}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="noti-indicator">
                    {!noti.is_read && <div className="glow-point"></div>}
                  </div>
                  <div className="noti-content">
                    <div className="noti-header">
                      <span className="noti-source">System Notification</span>
                      <span className="noti-time">
                        {timeAgo(noti.created_at)}
                      </span>
                    </div>
                    <p className="noti-message">{noti.message}</p>
                  </div>
                  <ChevronRight className="noti-arrow" size={20} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="modal-backdrop" onClick={closeModal}>
              <motion.div
                className="modal-glass-container"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                {modalType === "delete" ? (
                  <div className="modal-content-delete">
                    <div className="warning-icon-wrapper">
                      <AlertCircle size={40} />
                    </div>
                    <h3>Dismiss Briefing?</h3>
                    <p>
                      This action will permanently remove this item from the
                      executive feed.
                    </p>
                    <div className="modal-actions">
                      <button className="btn-secondary" onClick={closeModal}>
                        Cancel
                      </button>
                      <button
                        className="btn-danger"
                        onClick={handleDeleteAnnouncement}
                      >
                        Confirm Dismissal
                      </button>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={
                      modalType === "create"
                        ? handleCreateAnnouncement
                        : handleEditAnnouncement
                    }
                    className="modal-edit-form"
                  >
                    <div className="modal-header">
                      <h3>
                        {modalType === "create"
                          ? "Issuing Briefing"
                          : "Edit Directive"}
                      </h3>
                      <p>
                        {modalType === "create"
                          ? "Broadcast a new strategic update to the organization."
                          : "Modify the content of this strategic update."}
                      </p>
                    </div>

                    <div className="form-grid-row">
                      <div className="form-group-exclusive priority-group">
                        <label>Priority Level</label>
                        <div className="custom-select-wrapper">
                          <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            required
                          >
                            <option value="Normal">Normal</option>
                            <option value="Important">Important</option>
                            <option value="Urgent">Urgent</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-group-exclusive subject-group">
                        <label>Subject Line</label>
                        <input
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          required
                          placeholder="Enter briefing title..."
                        />
                      </div>
                    </div>

                    {modalType === "create" && (
                      <>
                        <div className="form-group-exclusive">
                          <label>Target Audience</label>
                          <div className="radio-group-exclusive">
                            <label
                              className={`radio-card ${
                                announcementType === "general" ? "active" : ""
                              }`}
                            >
                              <input
                                type="radio"
                                name="annType"
                                value="general"
                                checked={announcementType === "general"}
                                onChange={() => setAnnouncementType("general")}
                              />
                              <div className="radio-content">
                                <span className="radio-title">
                                  Company-Wide
                                </span>
                                <span className="radio-desc">
                                  Visible to everyone
                                </span>
                              </div>
                            </label>
                            <label
                              className={`radio-card ${
                                announcementType === "department"
                                  ? "active"
                                  : ""
                              }`}
                            >
                              <input
                                type="radio"
                                name="annType"
                                value="department"
                                checked={announcementType === "department"}
                                onChange={() =>
                                  setAnnouncementType("department")
                                }
                              />
                              <div className="radio-content">
                                <span className="radio-title">
                                  Department Specific
                                </span>
                                <span className="radio-desc">
                                  Targeted group
                                </span>
                              </div>
                            </label>
                          </div>
                        </div>

                        <AnimatePresence>
                          {announcementType === "department" && (
                            <motion.div
                              className="form-group-exclusive"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              <label>Select Department</label>
                              <div className="custom-select-wrapper">
                                <select
                                  value={targetDeptId}
                                  onChange={(e) =>
                                    setTargetDeptId(e.target.value)
                                  }
                                  required
                                >
                                  <option value="">
                                    -- Choose Department --
                                  </option>
                                  {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                      {dept.department_name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}

                    <div className="form-group-exclusive">
                      <label>Content</label>
                      <textarea
                        value={formContent}
                        onChange={(e) => setFormContent(e.target.value)}
                        rows={5}
                        required
                        placeholder="Enter details..."
                      />
                    </div>
                    <div className="modal-actions">
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={closeModal}
                      >
                        Discard
                      </button>
                      <button type="submit" className="btn-primary">
                        {modalType === "create"
                          ? "Publish Briefing"
                          : "Update Briefing"}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </CHROLayout>
  );
};

export default AnnouncementsCHRO;
