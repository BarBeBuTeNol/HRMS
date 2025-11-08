import React, { useState } from "react";
import Sidebar_HR from "../../../Component/HR/Sidebar_HR";
import "./Send_notifi.css";
import { useNavigate } from "react-router-dom";

const Send_notifi = () => {
  const [target, setTarget] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // สร้าง object ข่าวสารใหม่
    const newAnnouncement = {
      id: Date.now(),
      title,
      message,
      sender: "HR", // หรือดึงจาก session/user ในอนาคต
      target: target, // เพิ่ม target เพื่อเก็บข้อมูลว่าส่งถึงใคร
      timestamp: new Date().toLocaleString("th-TH", { hour12: false }),
      views: 0,
    };
    // ดึงข่าวสารเดิมจาก localStorage
    const oldData = JSON.parse(localStorage.getItem("announcements") || "[]");
    // เพิ่มข่าวสารใหม่ไว้บนสุด
    const updated = [newAnnouncement, ...oldData];
    localStorage.setItem("announcements", JSON.stringify(updated));
    setSuccess(true);
    setTitle("");
    setMessage("");
    setTarget("");
    
    // แสดงข้อความสำเร็จและ redirect หลังจาก 2 วินาที
    setTimeout(() => {
      navigate("/announcements");
    }, 2000);
  };

  return (
    <div className="sendnoti-root">
      <Sidebar_HR />
      <div className="sendnoti-content">
        <div className="sendnoti-card wide">
          <div className="sendnoti-header">
            <span className="sendnoti-header-icon">🔔</span>
            <h2 className="sendnoti-title">ส่งการแจ้งเตือน</h2>
          </div>
          <div className="sendnoti-divider" />
          <form className="sendnoti-form" onSubmit={handleSubmit}>
            <div className="sendnoti-row">
              <div className="sendnoti-col">
                <label htmlFor="target">ส่งถึง</label>
                <select
                  id="target"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  required
                >
                  <option value="" disabled>เลือกกลุ่มเป้าหมาย</option>
                  <option value="all">พนักงานทั้งหมด</option>
                  <option value="manager">Manager</option>
                  <option value="employee">Employee</option>
                  <option value="chro">CHRO</option>
                </select>
              </div>
              <div className="sendnoti-col">
                <label htmlFor="title">หัวข้อ</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="กรอกหัวข้อการแจ้งเตือน"
                  required
                />
              </div>
            </div>
            <label htmlFor="message">เนื้อหา</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="กรอกรายละเอียดการแจ้งเตือน"
              rows={4}
              required
            />
            <button type="submit" className="sendnoti-btn">
              <span className="sendnoti-btn-icon">✈️</span> ส่งแจ้งเตือน
            </button>
            {success && <div className="sendnoti-success">🎉 ส่งแจ้งเตือนสำเร็จ! กำลังไปยังหน้าประกาศ...</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Send_notifi;
