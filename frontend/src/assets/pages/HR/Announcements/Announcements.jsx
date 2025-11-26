import React, { useEffect, useState } from "react";
import Sidebar_HR from "../../../Component/HR/Sidebar_HR";
import "./Announcements.css";

const ADMIN_CODE = "123456";

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null); // 'edit' | 'delete'
  const [selectedPost, setSelectedPost] = useState(null);
  const [adminCode, setAdminCode] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("announcements") || "[]");
    setAnnouncements(data);
  }, []);

  // Helper: Save to localStorage
  const saveAnnouncements = (data) => {
    setAnnouncements(data);
    localStorage.setItem("announcements", JSON.stringify(data));
  };

  // Modal open/close
  const openModal = (type, post) => {
    setModalType(type);
    setSelectedPost(post);
    setAdminCode("");
    setError("");
    setSuccessMsg("");
    if (type === "edit") {
      setEditTitle(post.title);
      setEditMessage(post.message);
    }
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedPost(null);
    setAdminCode("");
    setError("");
    setSuccessMsg("");
  };

  // Handle Delete
  const handleDelete = (e) => {
    e.preventDefault();
    if (adminCode !== ADMIN_CODE) {
      setError("รหัสไม่ถูกต้อง");
      return;
    }
    const updated = announcements.filter((item) => item.id !== selectedPost.id);
    saveAnnouncements(updated);
    setSuccessMsg("ลบโพสต์สำเร็จ!");
    setTimeout(() => {
      closeModal();
    }, 1000);
  };

  // Handle Edit
  const handleEdit = (e) => {
    e.preventDefault();
    if (adminCode !== ADMIN_CODE) {
      setError("รหัสไม่ถูกต้อง");
      return;
    }
    if (!editTitle.trim() || !editMessage.trim()) {
      setError("กรอกข้อมูลให้ครบ");
      return;
    }
    const updated = announcements.map((item) =>
      item.id === selectedPost.id
        ? { ...item, title: editTitle, message: editMessage }
        : item
    );
    saveAnnouncements(updated);
    setSuccessMsg("แก้ไขโพสต์สำเร็จ!");
    setTimeout(() => {
      closeModal();
    }, 1000);
  };

  return (
    <div className="ann-root">
      <Sidebar_HR />
      <div className="ann-content">
        <h2 className="ann-title">ประกาศข่าวสารภายในองค์กร</h2>
        <div className="ann-list">
          {announcements.length === 0 ? (
            <div className="ann-empty">ยังไม่มีประกาศข่าวสาร</div>
          ) : (
            announcements.map((item) => (
              <div className="ann-card" key={item.id}>
                <div className="ann-header">
                  <span className="ann-icon">📢</span>
                  <span className="ann-card-title">{item.title}</span>
                </div>
                <div className="ann-message">{item.message}</div>
                <div className="ann-meta">
                  <span className="ann-sender">จาก: {item.sender}</span>
                  <span className="ann-time">{item.timestamp}</span>
                </div>
                <div className="ann-views">👁️ มีคนเห็นโพสต์นี้ {item.views} คน</div>
                {/* ปุ่มแก้ไข/ลบ เฉพาะ Admin (mock) */}
                <div className="ann-actions">
                  <button className="ann-btn edit" onClick={() => openModal("edit", item)}>
                    ✏️ แก้ไข
                  </button>
                  <button className="ann-btn delete" onClick={() => openModal("delete", item)}>
                    🗑️ ลบ
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        {/* Modal สำหรับแก้ไข/ลบ */}
        {showModal && (
          <div className="ann-modal-bg" onClick={closeModal}>
            <div className="ann-modal" onClick={e => e.stopPropagation()}>
              {modalType === "delete" ? (
                <form onSubmit={handleDelete} className="ann-modal-form">
                  <h3>ยืนยันการลบโพสต์</h3>
                  <div className="ann-modal-msg">ต้องการลบโพสต์นี้ใช่หรือไม่?</div>
                  <input
                    type="password"
                    className="ann-modal-input"
                    placeholder="กรอกรหัส Admin"
                    value={adminCode}
                    onChange={e => setAdminCode(e.target.value)}
                    autoFocus
                  />
                  {error && <div className="ann-modal-error">{error}</div>}
                  {successMsg && <div className="ann-modal-success">{successMsg}</div>}
                  <div className="ann-modal-actions">
                    <button type="button" className="ann-btn cancel" onClick={closeModal}>ยกเลิก</button>
                    <button type="submit" className="ann-btn delete">ยืนยันลบ</button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleEdit} className="ann-modal-form">
                  <h3>แก้ไขโพสต์</h3>
                  <input
                    type="text"
                    className="ann-modal-input"
                    placeholder="หัวข้อใหม่"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    autoFocus
                  />
                  <textarea
                    className="ann-modal-input"
                    placeholder="เนื้อหาใหม่"
                    value={editMessage}
                    onChange={e => setEditMessage(e.target.value)}
                    rows={3}
                  />
                  <input
                    type="password"
                    className="ann-modal-input"
                    placeholder="กรอกรหัส Admin"
                    value={adminCode}
                    onChange={e => setAdminCode(e.target.value)}
                  />
                  {error && <div className="ann-modal-error">{error}</div>}
                  {successMsg && <div className="ann-modal-success">{successMsg}</div>}
                  <div className="ann-modal-actions">
                    <button type="button" className="ann-btn cancel" onClick={closeModal}>ยกเลิก</button>
                    <button type="submit" className="ann-btn edit">บันทึก</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
