// src/assets/pages/pageEmployee/EMPDashboard/EmployeeDashboard.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import EmployeeSidebar from "../../../Component/Employee/EmployeeSidebar";

import "./NotificationBell.css"; // (รวม bell‑css ไว้ไฟล์นี้ไปแล้วนะ)

export default function EmployeeDashboard() {
  const navigate = useNavigate();

  // ---- mock user & noti ----
  const user = {
    employeeId: "EMP‑001",
    name: "ยุทธนา ชัยไธสง",
    position: "พนักงานฝ่ายผลิต",
    profilePic: "/pic/profile_emp.jpg",
    leaveLeft: 5,
  };

  const [notis, setNotis] = useState([
    {
      id: 1,
      title: "อนุมัติคำขอลาของคุณเรียบร้อย",
      type: "leave-approve",
      date: "2025‑07‑15 09:12",
      read: false,
    },
    {
      id: 2,
      title: "ข่าวบริษัท: ซ้อมดับเพลิง 1 ส.ค.",
      type: "news",
      date: "2025‑07‑14 15:00",
      read: true,
    },
  ]);
  const unread = notis.filter((n) => !n.read).length;

  /* ------ bell pop‑over toggle ------ */
  const [openBell, setOpenBell] = useState(false);
  const toggleBell = () => setOpenBell((o) => !o);

  /* ------ helper icon ------ */
  const iconByType = (t) => {
    switch (t) {
      case "leave-approve":
        return "✅";
      case "news":
        return "📰";
      default:
        return "🔔";
    }
  };

  return (
    <div className="dashboard-container">
      {/* ---------- Sidebar ---------- */}
      <EmployeeSidebar />

      {/* ---------- Main panel ---------- */}
      <main className="main-panel">
        {/* ===== Header (ขวาบน) ===== */}
        <div className="profile-header">
          {/* ด้านซ้ายของ header จะใส่ข้อความอื่นก็ได้ */}
          <h2 style={{ margin: 0 }}>หน้าแดชบอร์ด</h2>

          {/* ขวาสุด */}
          <div className="header-actions">
            {/* กระดิ่งแจ้งเตือน */}
            <div className="bell-wrapper">
              <button className="bell-btn" onClick={toggleBell}>
                🔔
                {unread > 0 && <span className="badge">{unread}</span>}
              </button>

              {openBell && (
                <div className="bell-pop">
                  <h4>แจ้งเตือน</h4>

                  {notis.length === 0 ? (
                    <div className="empty">— ไม่มีแจ้งเตือน —</div>
                  ) : (
                    <ul className="bell-list">
                      {notis.map((n) => (
                        <li
                          key={n.id}
                          className={n.read ? "" : "unread"}
                          onClick={() => {
                            setNotis((arr) =>
                              arr.map((it) =>
                                it.id === n.id ? { ...it, read: true } : it
                              )
                            );
                          }}
                        >
                          <span className="icon">{iconByType(n.type)}</span>
                          <span className="txt">
                            <span className="title">{n.title}</span>
                            <br />
                            <span className="date">{n.date}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    className="all-btn"
                    onClick={() => {
                      setOpenBell(false);
                      navigate("/employee/notifications");
                    }}
                  >
                    ดูทั้งหมด
                  </button>
                </div>
              )}
            </div>

            {/* Pop‑over โปรไฟล์ Removed */}
          </div>
        </div>

        {/* ===== เนื้อหาหลักของ Dashboard ===== */}
        <section style={{ marginTop: "2rem" }}>
          <h3>ข่าวสารบริษัท</h3>
          <p>พื้นที่สำหรับแสดงข่าวสารและลิงก์สื่อต่างๆของบริษัทในอนาคต</p>
        </section>
      </main>
    </div>
  );
}
