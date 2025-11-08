import React, { useEffect, useMemo, useState } from "react";
import SidebarCHRO from "../../../Component/CHRO/SidebarCHRO";
import "./DecideCHRO.css";

/**
 * DecideCHRO – CHRO Inbox / Approval Center
 * - รองรับ FHD: จัดความกว้าง content สูงสุด ~1760px และเว้นที่ Sidebar 280px
 * - แถบควบคุมด้านบน: ค้นหา, กรองประเภท, กรองสถานะ, เรียงเวลา, สลับ Grid/List
 * - Action ด่วน: มาร์คอ่านทั้งหมด, ลบที่อ่านแล้ว
 * - ทุกสี/เอฟเฟกต์อยู่ใน CSS เท่านั้น (ไม่มี inline style)
 */

const DecideCHRO = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Controls
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // leave | announcement | alert | general | all
  const [statusFilter, setStatusFilter] = useState("all"); // unread | read | approved | rejected | all
  const [sortOrder, setSortOrder] = useState("latest"); // latest | oldest
  const [viewMode, setViewMode] = useState("grid"); // grid | list

  // ---------- Utils ----------
  const saveAnnouncements = (items) => {
    localStorage.setItem("announcements", JSON.stringify(items));
  };

  const safeParse = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      return [];
    }
  };

  const mapType = (title = "") => {
    const t = (title || "").toLowerCase();
    if (t.includes("ลา") || t.includes("leave")) return { key: "leave", label: "การลา" };
    if (t.includes("ประกาศ") || t.includes("announcement")) return { key: "announcement", label: "ประกาศ" };
    if (t.includes("แจ้งเตือน") || t.includes("notification")) return { key: "alert", label: "แจ้งเตือน" };
    return { key: "general", label: "ทั่วไป" };
  };

  const statusKey = (n) => {
    if (n.status === "approved") return "approved";
    if (n.status === "rejected") return "rejected";
    return n?.views > 0 ? "read" : "unread";
  };

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      return timestamp;
    }
  };

  // ---------- Load ----------
  useEffect(() => {
    const load = () => {
      const all = safeParse("announcements");
      // ส่งถึง CHRO หรือ ALL
      const chroOnly = all.filter((n) => n.target === "chro" || n.target === "all");
      // sort latest first
      chroOnly.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setNotifications(chroOnly);
      setLoading(false);
    };

    load();
    const interval = setInterval(load, 5000); // refresh 5s
    return () => clearInterval(interval);
  }, []);

  // ---------- Actions ----------
  const handleMarkAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, views: (n.views || 0) + 1 } : n))
    );
    const all = safeParse("announcements");
    const updated = all.map((n) => (n.id === id ? { ...n, views: (n.views || 0) + 1 } : n));
    saveAnnouncements(updated);
  };

  const handleDelete = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    const all = safeParse("announcements");
    const updated = all.filter((n) => n.id !== id);
    saveAnnouncements(updated);
  };

  const handleApproveLeave = (notification) => {
    // update leaveRequests
    const leaveRequests = safeParse("leaveRequests");
    const updatedLeave = leaveRequests.map((r) =>
      r.requestId === notification.requestId
        ? { ...r, status: "approved", approvedAt: new Date().toISOString(), approvedBy: "CHRO" }
        : r
    );
    localStorage.setItem("leaveRequests", JSON.stringify(updatedLeave));

    // update this notification
    const all = safeParse("announcements");
    const updated = all.map((n) =>
      n.id === notification.id ? { ...n, status: "approved", views: (n.views || 0) + 1 } : n
    );
    saveAnnouncements(updated);

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notification.id ? { ...n, status: "approved", views: (n.views || 0) + 1 } : n
      )
    );

    // send back to HR
    const approvalNotification = {
      id: `NOTIF-${Date.now()}`,
      type: "leave_approval",
      title: `อนุมัติการลา - ${notification.leaveData?.employeeName}`,
      message: `คำขอการลาของ ${notification.leaveData?.employeeName} (${notification.leaveData?.employeeId}) ได้รับการอนุมัติแล้ว`,
      sender: "CHRO",
      target: "hr",
      timestamp: new Date().toISOString(),
      views: 0,
      priority: "medium",
    };
    const again = safeParse("announcements");
    again.unshift(approvalNotification);
    saveAnnouncements(again);
  };

  const handleRejectLeave = (notification) => {
    // update leaveRequests
    const leaveRequests = safeParse("leaveRequests");
    const updatedLeave = leaveRequests.map((r) =>
      r.requestId === notification.requestId
        ? { ...r, status: "rejected", rejectedAt: new Date().toISOString(), rejectedBy: "CHRO" }
        : r
    );
    localStorage.setItem("leaveRequests", JSON.stringify(updatedLeave));

    // update this notification
    const all = safeParse("announcements");
    const updated = all.map((n) =>
      n.id === notification.id ? { ...n, status: "rejected", views: (n.views || 0) + 1 } : n
    );
    saveAnnouncements(updated);

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notification.id ? { ...n, status: "rejected", views: (n.views || 0) + 1 } : n
      )
    );

    // send back to HR
    const rejectionNotification = {
      id: `NOTIF-${Date.now()}`,
      type: "leave_rejection",
      title: `ปฏิเสธการลา - ${notification.leaveData?.employeeName}`,
      message: `คำขอการลาของ ${notification.leaveData?.employeeName} (${notification.leaveData?.employeeId}) ถูกปฏิเสธ`,
      sender: "CHRO",
      target: "hr",
      timestamp: new Date().toISOString(),
      views: 0,
      priority: "medium",
    };
    const again = safeParse("announcements");
    again.unshift(rejectionNotification);
    saveAnnouncements(again);
  };

  const handleMarkAllRead = () => {
    const confirmDo = window.confirm("มาร์คว่าอ่านทั้งหมด?");
    if (!confirmDo) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, views: (n.views || 0) + (n.views > 0 ? 0 : 1) })));
    const all = safeParse("announcements");
    const updated = all.map((n) =>
      n.target === "chro" || n.target === "all"
        ? { ...n, views: (n.views || 0) + (n.views > 0 ? 0 : 1) }
        : n
    );
    saveAnnouncements(updated);
  };

  const handleDeleteRead = () => {
    const confirmDo = window.confirm("ลบรายการที่อ่านแล้วทั้งหมด?");
    if (!confirmDo) return;

    const idsToKeep = new Set(
      notifications.filter((n) => statusKey(n) === "unread").map((n) => n.id)
    );
    setNotifications((prev) => prev.filter((n) => idsToKeep.has(n.id)));

    const all = safeParse("announcements");
    const updated = all.filter((n) => (n.target === "chro" || n.target === "all" ? !idsToKeep.has(n.id) ? false : true : true));
    // คำอธิบาย: filter ด้านบนเก็บทุกอย่างที่ไม่ใช่ของ CHRO/ALL ไว้ตามเดิม และสำหรับของ CHRO/ALL จะเก็บเฉพาะที่ยังไม่อ่าน
    saveAnnouncements(updated);
  };

  // ---------- Derived ----------
  const counts = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((n) => statusKey(n) === "unread").length;
    const read = notifications.filter((n) => statusKey(n) === "read").length;
    const approved = notifications.filter((n) => statusKey(n) === "approved").length;
    const rejected = notifications.filter((n) => statusKey(n) === "rejected").length;
    return { total, unread, read, approved, rejected };
  }, [notifications]);

  const filtered = useMemo(() => {
    let arr = [...notifications];

    // text search
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      arr = arr.filter((n) => {
        const fields = [
          n.title || "",
          n.message || "",
          n.sender || "",
          n.leaveData?.employeeName || "",
          n.leaveData?.employeeId || "",
        ].join(" ").toLowerCase();
        return fields.includes(s);
      });
    }

    // type filter
    if (typeFilter !== "all") {
      arr = arr.filter((n) => mapType(n.title).key === typeFilter);
    }

    // status filter
    if (statusFilter !== "all") {
      arr = arr.filter((n) => statusKey(n) === statusFilter);
    }

    // sort
    arr.sort((a, b) =>
      sortOrder === "latest"
        ? new Date(b.timestamp) - new Date(a.timestamp)
        : new Date(a.timestamp) - new Date(b.timestamp)
    );

    return arr;
  }, [notifications, search, typeFilter, statusFilter, sortOrder]);

  if (loading) {
    return (
      <div className="decide-chro-root">
        <SidebarCHRO />
        <div className="decide-chro-content">
          <div className="decide-chro-loading">
            <div className="decide-chro-spinner"></div>
            <p>กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="decide-chro-root">
      <SidebarCHRO />
      <div className="decide-chro-content">
        {/* Header */}
        <div className="decide-chro-header">
          <div className="decide-chro-title-section">
            <span className="decide-chro-icon">📋</span>
            <h1 className="decide-chro-title">การแจ้งเตือนจาก HR</h1>
          </div>

          <div className="decide-chro-stats">
            <div className="decide-chro-stat">
              <span className="decide-chro-stat-number">{counts.total}</span>
              <span className="decide-chro-stat-label">ทั้งหมด</span>
            </div>
            <div className="decide-chro-stat">
              <span className="decide-chro-stat-number">{counts.unread}</span>
              <span className="decide-chro-stat-label">ยังไม่อ่าน</span>
            </div>
            <div className="decide-chro-stat">
              <span className="decide-chro-stat-number">{counts.read}</span>
              <span className="decide-chro-stat-label">อ่านแล้ว</span>
            </div>
            <div className="decide-chro-stat">
              <span className="decide-chro-stat-number">{counts.approved}</span>
              <span className="decide-chro-stat-label">อนุมัติแล้ว</span>
            </div>
            <div className="decide-chro-stat">
              <span className="decide-chro-stat-number">{counts.rejected}</span>
              <span className="decide-chro-stat-label">ปฏิเสธแล้ว</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="decide-chro-controls">
          <div className="decide-chro-controls-left">
            <input
              className="decide-chro-input"
              type="text"
              placeholder="🔍 ค้นหาหัวข้อ/ข้อความ/ชื่อพนักงาน/รหัสพนักงาน..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="decide-chro-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">ทุกประเภท</option>
              <option value="leave">การลา</option>
              <option value="announcement">ประกาศ</option>
              <option value="alert">แจ้งเตือน</option>
              <option value="general">ทั่วไป</option>
            </select>
            <select
              className="decide-chro-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">ทุกสถานะ</option>
              <option value="unread">ยังไม่อ่าน</option>
              <option value="read">อ่านแล้ว</option>
              <option value="approved">อนุมัติแล้ว</option>
              <option value="rejected">ปฏิเสธแล้ว</option>
            </select>
            <select
              className="decide-chro-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="latest">ล่าสุดก่อน</option>
              <option value="oldest">เก่าสุดก่อน</option>
            </select>
          </div>

          <div className="decide-chro-controls-right">
            <div className="decide-chro-view-toggle" role="tablist" aria-label="View mode">
              <button
                className={`decide-chro-view-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
                role="tab"
                aria-selected={viewMode === "grid"}
              >
                🧩 Grid
              </button>
              <button
                className={`decide-chro-view-btn ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
                role="tab"
                aria-selected={viewMode === "list"}
              >
                📋 List
              </button>
            </div>
            <button className="decide-chro-quick-btn decide-chro-quick-btn-readall" onClick={handleMarkAllRead}>
              👁️ มาร์คอ่านทั้งหมด
            </button>
            <button className="decide-chro-quick-btn decide-chro-quick-btn-clear" onClick={handleDeleteRead}>
              🗑️ ลบรายการที่อ่านแล้ว
            </button>
          </div>
        </div>

        {/* Content */}
        {filtered.length === 0 ? (
          <div className="decide-chro-empty">
            <span className="decide-chro-empty-icon">📭</span>
            <h3>ไม่พบรายการตามเงื่อนไขที่เลือก</h3>
            <p>ลองเปลี่ยนคำค้นหา/ตัวกรองดูนะ</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="decide-chro-requests">
            {filtered.map((n) => {
              const t = mapType(n.title);
              const isRead = statusKey(n) !== "unread";
              const sKey = statusKey(n); // approved | rejected | read | unread

              return (
                <div
                  key={n.id}
                  className={`decide-chro-card ${isRead ? "read" : "unread"}`}
                  data-type={t.label}
                >
                  <div className="decide-chro-card-header">
                    <div className="decide-chro-employee-info">
                      <div className="decide-chro-avatar">{(n.sender || "H").charAt(0)}</div>
                      <div className="decide-chro-employee-details">
                        <h3 className="decide-chro-employee-name">{n.title}</h3>
                        <p className="decide-chro-employee-id">ส่งโดย: {n.sender}</p>
                      </div>
                    </div>
                    <div className={`type-badge type-${t.key}`}>{t.label}</div>
                  </div>

                  <div className="decide-chro-card-body">
                    <div className="decide-chro-info-grid">
                      <div className="decide-chro-info-item">
                        <span className="decide-chro-info-label">เนื้อหา:</span>
                        <span className="decide-chro-info-value">{n.message}</span>
                      </div>

                      {n.leaveData && (
                        <>
                          <div className="decide-chro-info-item">
                            <span className="decide-chro-info-label">รหัสพนักงาน:</span>
                            <span className="decide-chro-info-value">{n.leaveData.employeeId}</span>
                          </div>
                          <div className="decide-chro-info-item">
                            <span className="decide-chro-info-label">ชื่อผู้ลา:</span>
                            <span className="decide-chro-info-value">{n.leaveData.employeeName}</span>
                          </div>
                          <div className="decide-chro-info-item">
                            <span className="decide-chro-info-label">วันที่ลา:</span>
                            <span className="decide-chro-info-value">
                              {new Date(n.leaveData.leaveDate).toLocaleDateString("th-TH")}
                            </span>
                          </div>
                          <div className="decide-chro-info-item">
                            <span className="decide-chro-info-label">ปีที่ลา:</span>
                            <span className="decide-chro-info-value">{n.leaveData.leaveYear}</span>
                          </div>
                          <div className="decide-chro-info-item">
                            <span className="decide-chro-info-label">เหตุผลการลา:</span>
                            <span className="decide-chro-info-value">{n.leaveData.reason}</span>
                          </div>
                          {n.leaveData.attachmentName && (
                            <div className="decide-chro-info-item">
                              <span className="decide-chro-info-label">ไฟล์แนบ:</span>
                              <span className="decide-chro-info-value">📎 {n.leaveData.attachmentName}</span>
                            </div>
                          )}
                        </>
                      )}

                      <div className="decide-chro-info-item">
                        <span className="decide-chro-info-label">วันที่ส่ง:</span>
                        <span className="decide-chro-info-value">{formatTimestamp(n.timestamp)}</span>
                      </div>

                      <div className="decide-chro-info-item">
                        <span className="decide-chro-info-label">สถานะ:</span>
                        <span className={`decide-chro-info-value status-dot status-${sKey}`}>
                          {sKey === "approved"
                            ? "อนุมัติแล้ว"
                            : sKey === "rejected"
                            ? "ปฏิเสธแล้ว"
                            : sKey === "read"
                            ? "อ่านแล้ว"
                            : "ยังไม่อ่าน"}
                        </span>
                      </div>

                      {n.views > 0 && (
                        <div className="decide-chro-info-item">
                          <span className="decide-chro-info-label">จำนวนครั้งที่อ่าน:</span>
                          <span className="decide-chro-info-value">{n.views}</span>
                        </div>
                      )}
                    </div>

                    <div className="decide-chro-status-section">
                      <div className={`decide-chro-status badge-${sKey}`}>
                        {sKey === "approved"
                          ? "อนุมัติแล้ว"
                          : sKey === "rejected"
                          ? "ปฏิเสธแล้ว"
                          : sKey === "read"
                          ? "อ่านแล้ว"
                          : "ยังไม่อ่าน"}
                      </div>
                    </div>

                    <div className="decide-chro-actions">
                      {n.type === "leave_request" && !n.status && (
                        <>
                          <button
                            className="decide-chro-btn decide-chro-btn-approve"
                            onClick={() => handleApproveLeave(n)}
                          >
                            <span className="decide-chro-btn-icon">✅</span>
                            อนุมัติ
                          </button>
                          <button
                            className="decide-chro-btn decide-chro-btn-reject"
                            onClick={() => handleRejectLeave(n)}
                          >
                            <span className="decide-chro-btn-icon">❌</span>
                            ปฏิเสธ
                          </button>
                        </>
                      )}

                      {statusKey(n) === "unread" && !n.status && (
                        <button
                          className="decide-chro-btn decide-chro-btn-read"
                          onClick={() => handleMarkAsRead(n.id)}
                        >
                          <span className="decide-chro-btn-icon">👁️</span>
                          มาร์คว่าอ่านแล้ว
                        </button>
                      )}

                      <button
                        className="decide-chro-btn decide-chro-btn-delete"
                        onClick={() => handleDelete(n.id)}
                      >
                        <span className="decide-chro-btn-icon">🗑️</span>
                        ลบ
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="decide-chro-list">
            {filtered.map((n) => {
              const t = mapType(n.title);
              const sKey = statusKey(n);
              return (
                <div key={n.id} className={`decide-chro-row ${sKey !== "unread" ? "read" : "unread"}`}>
                  <div className="row-left">
                    <div className={`type-badge type-${t.key}`}>{t.label}</div>
                    <div className="row-main">
                      <div className="row-title">{n.title}</div>
                      <div className="row-sub">
                        <span>ส่งโดย: {n.sender}</span>
                        <span> • {formatTimestamp(n.timestamp)}</span>
                        {n.leaveData?.employeeId && (
                          <>
                            <span> • ID: {n.leaveData.employeeId}</span>
                            <span> • {n.leaveData.employeeName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="row-right">
                    <span className={`row-status badge-${sKey}`}>
                      {sKey === "approved"
                        ? "อนุมัติแล้ว"
                        : sKey === "rejected"
                        ? "ปฏิเสธแล้ว"
                        : sKey === "read"
                        ? "อ่านแล้ว"
                        : "ยังไม่อ่าน"}
                    </span>
                    <div className="row-actions">
                      {n.type === "leave_request" && !n.status && (
                        <>
                          <button className="mini-btn approve" onClick={() => handleApproveLeave(n)}>✅</button>
                          <button className="mini-btn reject" onClick={() => handleRejectLeave(n)}>❌</button>
                        </>
                      )}
                      {sKey === "unread" && !n.status && (
                        <button className="mini-btn read" onClick={() => handleMarkAsRead(n.id)}>👁️</button>
                      )}
                      <button className="mini-btn delete" onClick={() => handleDelete(n.id)}>🗑️</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DecideCHRO;
