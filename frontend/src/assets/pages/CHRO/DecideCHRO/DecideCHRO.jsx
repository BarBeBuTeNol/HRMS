import React, { useEffect, useMemo, useState } from "react";
import api from "../../../../services/api";
import CHROLayout from "../../../Component/CHRO/CHROLayout";
import PopupErrorCHRO from "../../../Component/popup-error/popup-error-chro/PopupErrorCHRO";
import PopupDoneCHRO from "../../../Component/poup_done/poup_done-chro/PopupDoneCHRO";
import LogService from "../../../../services/LogService";
import LoadingCHRO from "../../../Component/loading/loading-chro/LoadingCHRO";
import "./DecideCHRO.css";
import ConfirmationModal from "../../../Component/popup_notifications/popup_notifications-chro/ConfirmationModal";
import CustomSelect from "../../../Component/CustomSelect/CustomSelect";

const DecideCHRO = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: () => {},
  });

  // Rejection Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [pendingRejectItem, setPendingRejectItem] = useState(null);

  // Delete Modal State (Legacy? Maybe replace with ConfirmModal or keep for specific use)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Success Popup State
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupData, setPopupData] = useState({
    title: "",
    message: "",
    type: "success",
  });

  // User Context (for Logging)
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  // Controls
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("latest");
  const [viewMode, setViewMode] = useState("grid");

  // ---------- Utils ----------
  const mapType = (title = "") => {
    const t = (title || "").toLowerCase();
    if (t.includes("ลา") || t.includes("leave"))
      return { key: "leave", label: "การลา" };
    if (
      t.includes("ทำงานแทน") ||
      t.includes("delegation") ||
      t.includes("behalf") ||
      t.includes("ฝากงาน")
    )
      return { key: "delegation", label: "ฝากงาน" };
    if (t.includes("ประกาศ") || t.includes("announcement"))
      return { key: "announcement", label: "ประกาศ" };
    if (t.includes("แจ้งเตือน") || t.includes("notification"))
      return { key: "alert", label: "แจ้งเตือน" };
    if (t.includes("คำขอเปลี่ยนแปลง") || t.includes("change"))
      return { key: "change_request", label: "เปลี่ยนแปลงข้อมูล" };
    return { key: "general", label: "ทั่วไป" };
  };

  const statusKey = (n) => {
    if (n.status === "approved") return "approved";
    if (n.status === "rejected") return "rejected";
    if (n.type === "delegation_request")
      return n.isAcknowledged ? "read" : "unread";
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
  // Ensure loading is only true initially
  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token"); // Retrieve token
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        const [approvalsRes, changesRes] = await Promise.all([
          api.get("/chro/approvals"),
          api.get("/change-requests/pending"),
        ]);

        let combinedData = [];

        // 1. Approvals (Leave/Delegation)
        if (approvalsRes.data) {
          combinedData = [...approvalsRes.data];
        }

        // 2. Change Requests
        if (changesRes.data) {
          const changesMapped = changesRes.data.map((c) => ({
            id: `change_${c.id}`, // specific ID format
            requestId: c.id,
            type: "change_request",
            title: "คำขอเปลี่ยนแปลงข้อมูล/ยกเลิกจ้าง",
            message: `ขอเปลี่ยนแปลงข้อมูลของ ${c.target_user_name} (${c.field_name})`,
            sender: c.requester_name,
            timestamp: c.created_at,
            status: c.status.toLowerCase(),
            views: 0, // Default unread
            changeData: { ...c },
          }));
          combinedData = [...combinedData, ...changesMapped];
        }

        const apiNotifications = combinedData.map((item) => ({
          ...item,
          timestamp: item.timestamp || new Date().toISOString(),
        }));

        setNotifications(apiNotifications);
      } catch (error) {
        console.error("Error loading approvals:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
    const interval = setInterval(() => {
      // Silent refresh - do not set loading to true
      load();
    }, 15000); // refresh 15s
    return () => clearInterval(interval);
  }, []);

  // ---------- Actions ----------
  const handleMarkAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, views: (n.views || 0) + 1 } : n)),
    );

    try {
      await api.post("/chro/read", { requestId: id });
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleViewDetails = (notification) => {
    setSelectedNotification(notification);
    if (
      notification.type !== "delegation_request" &&
      statusKey(notification) === "unread"
    ) {
      handleMarkAsRead(notification.id);
    }
  };

  const handleCloseModal = () => {
    setSelectedNotification(null);
  };

  const handleDelete = (id) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      setNotifications((prev) => prev.filter((n) => n.id !== itemToDelete));
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  // Helper to open confirmation
  const requestConfirm = (title, message, type, onConfirm) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      type, // 'info', 'warning', 'danger'
      onConfirm,
    });
  };

  const executeApproveLeave = async (notification) => {
    try {
      const numericId = notification.requestId;
      const response = await api.post("/chro/leave/action", {
        requestId: numericId,
        status: "Approved",
        approverId: user.id || user.user_id, // Pass CHRO ID for logging
      });

      // Optimistic Update
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id
            ? { ...n, status: "approved", views: (n.views || 0) + 1 }
            : n,
        ),
      );

      // Also update selectedNotification if open
      if (selectedNotification?.id === notification.id) {
        setSelectedNotification((prev) => ({ ...prev, status: "approved" }));
      }

      // LOGGING
      try {
        await LogService.createLog({
          userId: user.id || user.user_id,
          action: "Approvals",
          details: `Approved leave request for ${
            notification.leaveData?.employeeName || "User"
          }`,
          target: notification.leaveData?.employeeName || "Unknown",
          severity: "Info",
        });
      } catch (logErr) {
        console.warn("Logging failed", logErr);
      }

      setPopupData({
        title: "อนุมัติสำเร็จ",
        message: "อนุมัติคำขอเรียบร้อยแล้ว",
        type: "success",
      });
      setPopupOpen(true);
    } catch (error) {
      console.error("Error approving:", error);
      setPopupData({
        title: "เกิดข้อผิดพลาด",
        message:
          "เกิดข้อผิดพลาดในการอนุมัติ: " + (error.message || "Unknown error"),
        type: "error",
      });
      setPopupOpen(true);
    }
  };

  const handleApproveLeave = (notification) => {
    requestConfirm(
      "ยืนยันการอนุมัติ",
      `คุณต้องการอนุมัติคำขอของ ${notification.leaveData?.employeeName || "พนักงาน"} ใช่หรือไม่?`,
      "info",
      () => executeApproveLeave(notification),
    );
  };

  // Open Rejection Modal
  const openRejectModal = (notification) => {
    setPendingRejectItem(notification);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    setRejectModalOpen(false);
    setPendingRejectItem(null);
  };

  const submitReject = async () => {
    if (!pendingRejectItem) return;
    if (!rejectReason.trim()) {
      if (!rejectReason.trim()) {
        setPopupData({
          title: "แจ้งเตือน",
          message: "กรุณาระบุเหตุผลการปฏิเสธ",
          type: "error",
        });
        setPopupOpen(true);
        return;
      }
    }

    try {
      if (pendingRejectItem.type === "change_request") {
        await executeChangeRequestAction(
          pendingRejectItem,
          "reject",
          rejectReason,
        );
      } else {
        // Assume Leave Request (default existing logic)
        const numericId = pendingRejectItem.requestId;
        const response = await api.post("/chro/leave/action", {
          requestId: numericId,
          status: "Rejected",
          reason: rejectReason,
          approverId: user.id || user.user_id, // Pass CHRO ID
        });

        setNotifications((prev) =>
          prev.map((n) =>
            n.id === pendingRejectItem.id
              ? {
                  ...n,
                  status: "rejected",
                  views: (n.views || 0) + 1,
                  leaveData: { ...n.leaveData, rejectionReason: rejectReason },
                }
              : n,
          ),
        );
      }

      closeRejectModal();

      // LOGGING
      try {
        await LogService.createLog({
          userId: user.id || user.user_id,
          action:
            pendingRejectItem.type === "change_request"
              ? "Change Request"
              : "Approvals",
          details: `Rejected ${
            pendingRejectItem.type === "change_request" ? "change" : "leave"
          } request for ${
            pendingRejectItem.leaveData?.employeeName ||
            pendingRejectItem.changeData?.target_user_name ||
            "User"
          }. Reason: ${rejectReason}`,
          target:
            pendingRejectItem.leaveData?.employeeName ||
            pendingRejectItem.changeData?.target_user_name ||
            "Unknown",
          severity: "Warning",
        });
      } catch (logErr) {
        console.warn("Logging failed", logErr);
      }

      // Trigger Success Popup (conditional msg)
      setPopupData({
        title: "ดำเนินการสำเร็จ",
        message: `ได้ทำการปฏิเสธคำขอและส่งแจ้งเตือนเรียบร้อยแล้ว`,
        type: "success",
      });
      setPopupOpen(true);
    } catch (error) {
      console.error("Error rejecting:", error);
      setPopupData({
        title: "เกิดข้อผิดพลาด",
        message: "เกิดข้อผิดพลาดในการปฏิเสธ",
        type: "error",
      });
      setPopupOpen(true);
    }
  };

  const handleAcknowledgeDelegation = async (notification) => {
    try {
      const numericId = notification.requestId;
      const response = await api.post("/chro/delegation/action", {
        requestId: numericId,
        action: "acknowledge",
      });

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id
            ? { ...n, isAcknowledged: true, views: (n.views || 0) + 1 }
            : n,
        ),
      );

      if (selectedNotification?.id === notification.id) {
        setSelectedNotification((prev) => ({
          ...prev,
          isAcknowledged: true,
          views: (prev.views || 0) + 1,
        }));
      }

      // LOGGING
      try {
        await LogService.createLog({
          userId: user.id || user.user_id,
          action: "Delegation",
          details: `Acknowledged delegation request from ${notification.delegationData?.requesterName}`,
          target: notification.delegationData?.requesterName,
          severity: "Info",
        });
      } catch (logErr) {
        console.warn("Logging failed", logErr);
      }

      setPopupData({
        title: "สำเร็จ",
        message: "รับทราบรายการฝากงานเรียบร้อยแล้ว",
        type: "success",
      });
      setPopupOpen(true);
    } catch (error) {
      console.error("Error acknowledging:", error);
      setPopupData({
        title: "เกิดข้อผิดพลาด",
        message: "เกิดข้อผิดพลาดในการทำรายการ",
        type: "error",
      });
      setPopupOpen(true);
    }
  };

  const executeChangeRequestAction = async (
    notification,
    action,
    comment = "",
  ) => {
    try {
      const id = notification.requestId;
      const url = `/change-requests/${id}/${action}`; // action = approve or reject

      const response = await api.put(url, { comment });

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id
            ? { ...n, status: action === "approve" ? "approved" : "rejected" }
            : n,
        ),
      );

      if (selectedNotification?.id === notification.id) {
        setSelectedNotification((prev) => ({
          ...prev,
          status: action === "approve" ? "approved" : "rejected",
        }));
      }

      if (action === "approve") {
        // LOGGING
        try {
          await LogService.createLog({
            userId: user.id || user.user_id,
            action: "Change Request",
            details: `Approved change request for ${notification.changeData?.target_user_name} (${notification.changeData?.field_name})`,
            target: notification.changeData?.target_user_name,
            severity: "Info",
          });
        } catch (logErr) {
          console.warn("Logging failed", logErr);
        }
      }

      // No alert here, usage handles popups (submitReject or caller of this)
      if (action === "approve") {
        setPopupData({
          title: "ดำเนินการสำเร็จ",
          message: `อนุมัติคำขอเปลี่ยนแปลงเรียบร้อยแล้ว`,
          type: "success",
        });
        setPopupOpen(true);
      }

      if (action === "reject") closeRejectModal();
    } catch (err) {
      console.error("Error updating change request:", err);
      console.error("Error updating change request:", err);
      setPopupData({
        title: "Error",
        message: "Error updating request",
        type: "error",
      });
      setPopupOpen(true);
    }
  };

  const handleChangeRequestAction = (notification, action) => {
    if (action === "approve") {
      requestConfirm(
        "ยืนยันการอนุมัติ",
        `คุณต้องการอนุมัติการเปลี่ยนแปลงข้อมูลของ ${notification.changeData?.target_user_name} ใช่หรือไม่?`,
        "info",
        () => executeChangeRequestAction(notification, "approve"),
      );
    } else {
      // Reject handled by openRejectModal
    }
  };

  const handleMarkAllRead = () => {
    requestConfirm(
      "ยืนยันการทำรายการ",
      "คุณต้องการมาร์คว่าอ่านทั้งหมดใช่หรือไม่?",
      "info",
      () => {
        setNotifications((prev) =>
          prev.map((n) => ({
            ...n,
            views: (n.views || 0) + (n.views > 0 ? 0 : 1),
          })),
        );
        setPopupData({
          title: "สำเร็จ",
          message: "มาร์คอ่านทั้งหมดแล้ว",
          type: "success",
        });
        setPopupOpen(true);
      },
    );
  };

  const handleDeleteRead = () => {
    requestConfirm(
      "ยืนยันการลบ",
      "คุณต้องการลบรายการที่อ่านแล้วทั้งหมดใช่หรือไม่?",
      "danger",
      () => {
        const idsToKeep = new Set(
          notifications
            .filter((n) => statusKey(n) === "unread")
            .map((n) => n.id),
        );
        setNotifications((prev) => prev.filter((n) => idsToKeep.has(n.id)));
        setPopupData({
          title: "สำเร็จ",
          message: "ลบรายการที่อ่านแล้วเรียบร้อย",
          type: "success",
        });
        setPopupOpen(true);
      },
    );
  };

  // ---------- Derived ----------
  const counts = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter(
      (n) => statusKey(n) === "unread",
    ).length;
    const read = total - unread;
    const approved = notifications.filter(
      (n) => statusKey(n) === "approved",
    ).length;
    const rejected = notifications.filter(
      (n) => statusKey(n) === "rejected",
    ).length;
    return { total, unread, read, approved, rejected };
  }, [notifications]);

  const filtered = useMemo(() => {
    let arr = [...notifications];
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      arr = arr.filter((n) => {
        const fields = [
          n.title || "",
          n.message || "",
          n.sender || "",
          n.leaveData?.employeeName || "",
          n.leaveData?.employeeId || "",
          n.delegationData?.requesterName || "",
          n.delegationData?.delegateName || "",
        ]
          .join(" ")
          .toLowerCase();
        return fields.includes(s);
      });
    }
    if (typeFilter !== "all") {
      arr = arr.filter((n) => mapType(n.title).key === typeFilter);
    }
    if (statusFilter !== "all") {
      arr = arr.filter((n) => statusKey(n) === statusFilter);
    }
    arr.sort((a, b) =>
      sortOrder === "latest"
        ? new Date(b.timestamp) - new Date(a.timestamp)
        : new Date(a.timestamp) - new Date(b.timestamp),
    );
    return arr;
  }, [notifications, search, typeFilter, statusFilter, sortOrder]);

  if (loading) {
    return (
      <CHROLayout>
        <div
          style={{
            position: "relative",
            height: "100vh",
            margin: "-32px -40px",
            width: "calc(100% + 80px)",
            zIndex: 200,
          }}
        >
          <LoadingCHRO />
        </div>
      </CHROLayout>
    );
  }

  return (
    <CHROLayout>
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
              placeholder="ค้นหาหัวข้อ/ข้อความ/ชื่อ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <CustomSelect
              className="decide-chro-filter"
              options={[
                { value: "all", label: "ทุกประเภท" },
                { value: "leave", label: "การลา" },
                { value: "delegation", label: "ฝากงาน" },
                { value: "announcement", label: "ประกาศ" },
                {
                  value: "change_request",
                  label: "เปลี่ยนแปลงข้อมูล/เลิกจ้าง",
                },
                { value: "alert", label: "แจ้งเตือน" },
              ]}
              value={typeFilter}
              onChange={setTypeFilter}
              placeholder="ทุกประเภท"
            />
            <CustomSelect
              className="decide-chro-filter"
              options={[
                { value: "all", label: "ทุกสถานะ" },
                { value: "unread", label: "ยังไม่อ่าน" },
                { value: "read", label: "อ่านแล้ว" },
                { value: "approved", label: "อนุมัติแล้ว" },
                { value: "rejected", label: "ปฏิเสธแล้ว" },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="ทุกสถานะ"
            />
            <CustomSelect
              className="decide-chro-filter"
              options={[
                { value: "latest", label: "ล่าสุดก่อน" },
                { value: "oldest", label: "เก่าสุดก่อน" },
              ]}
              value={sortOrder}
              onChange={setSortOrder}
              placeholder="ลำดับ"
            />
          </div>
          <div className="decide-chro-controls-right">
            <div className="decide-chro-view-toggle">
              <button
                className={`decide-chro-view-btn ${
                  viewMode === "grid" ? "active" : ""
                }`}
                onClick={() => setViewMode("grid")}
              >
                🧩 Grid
              </button>
              <button
                className={`decide-chro-view-btn ${
                  viewMode === "list" ? "active" : ""
                }`}
                onClick={() => setViewMode("list")}
              >
                📋 List
              </button>
            </div>
            <button
              className="decide-chro-quick-btn decide-chro-quick-btn-readall"
              onClick={handleMarkAllRead}
            >
              👁️ มาร์คอ่านทั้งหมด
            </button>
            <button
              className="decide-chro-quick-btn decide-chro-quick-btn-clear"
              onClick={handleDeleteRead}
            >
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
              const sKey = statusKey(n);
              return (
                <div
                  key={n.id}
                  className={`decide-chro-card ${isRead ? "read" : "unread"}`}
                  data-type={t.label}
                  onClick={() => handleViewDetails(n)}
                >
                  <div className="decide-chro-card-header">
                    <div className="decide-chro-employee-info">
                      <div className="decide-chro-avatar">
                        {(n.sender || "H").charAt(0)}
                      </div>
                      <div className="decide-chro-employee-details">
                        <h3
                          className="decide-chro-employee-name truncate-single-line"
                          title={n.title}
                        >
                          {n.title}
                        </h3>
                        <p className="decide-chro-employee-id">
                          ส่งโดย: {n.sender}
                        </p>
                      </div>
                    </div>
                    <div className="decide-chro-badges">
                      <div className={`type-badge type-${t.key}`}>
                        {t.label}
                      </div>
                      <div
                        className={`decide-chro-status-badge status-${sKey}`}
                      >
                        {sKey === "approved"
                          ? "อนุมัติแล้ว"
                          : sKey === "rejected"
                            ? "ปฏิเสธแล้ว"
                            : sKey === "read"
                              ? "อ่านแล้ว"
                              : "รออนุมัติ"}
                      </div>
                    </div>
                  </div>
                  <div className="decide-chro-card-body">
                    <div className="decide-chro-info-grid">
                      <div className="decide-chro-info-item">
                        <span className="decide-chro-info-label">เนื้อหา:</span>
                        <span className="decide-chro-info-value truncate-multi-line">
                          {n.message}
                        </span>
                      </div>
                      {n.leaveData && (
                        <>
                          <div className="decide-chro-info-item">
                            <span className="decide-chro-info-label">
                              ชื่อผู้ลา:
                            </span>
                            <span className="decide-chro-info-value">
                              {n.leaveData.employeeName}
                            </span>
                          </div>
                          <div className="decide-chro-info-item">
                            <span className="decide-chro-info-label">
                              วันที่ลา:
                            </span>
                            <span className="decide-chro-info-value">
                              {new Date(
                                n.leaveData.leaveDate,
                              ).toLocaleDateString("th-TH")}
                            </span>
                          </div>
                        </>
                      )}

                      {n.type === "change_request" && n.changeData && (
                        <>
                          <div className="decide-chro-info-item">
                            <span className="decide-chro-info-label">
                              ประเภท:
                            </span>
                            <span className="decide-chro-info-value">
                              {n.changeData.field_name}
                            </span>
                          </div>
                          <div className="decide-chro-info-item">
                            <span className="decide-chro-info-label">
                              Target:
                            </span>
                            <span className="decide-chro-info-value">
                              {n.changeData.target_user_name}
                            </span>
                          </div>
                        </>
                      )}
                      {n.delegationData && (
                        <>
                          <div className="decide-chro-info-item">
                            <span className="decide-chro-info-label">
                              มอบหมาย:
                            </span>
                            <span className="decide-chro-info-value">
                              {n.delegationData.delegateName}
                            </span>
                          </div>
                          <div className="decide-chro-info-item">
                            <span className="decide-chro-info-label">
                              วันที่:
                            </span>
                            <span className="decide-chro-info-value">
                              {new Date(
                                n.delegationData.startDate,
                              ).toLocaleDateString("th-TH")}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="decide-chro-actions">
                      {n.type === "leave_request" && (
                        <>
                          <button
                            className="decide-chro-btn decide-chro-btn-approve"
                            style={
                              n.status === "approved"
                                ? { opacity: 0.5, pointerEvents: "none" }
                                : {}
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApproveLeave(n);
                            }}
                          >
                            <span className="decide-chro-btn-icon">✅</span>{" "}
                            {n.status === "approved"
                              ? "อนุมัติแล้ว"
                              : "อนุมัติ"}
                          </button>
                          {n.status !== "approved" &&
                            n.status !== "rejected" && (
                              <button
                                className="decide-chro-btn decide-chro-btn-reject"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openRejectModal(n);
                                }}
                              >
                                <span className="decide-chro-btn-icon">❌</span>{" "}
                                ปฏิเสธ
                              </button>
                            )}
                        </>
                      )}
                      {n.type === "delegation_request" && (
                        <button
                          className="decide-chro-btn decide-chro-btn-read"
                          style={
                            n.isAcknowledged
                              ? { opacity: 0.5, pointerEvents: "none" }
                              : {}
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcknowledgeDelegation(n);
                          }}
                        >
                          <span className="decide-chro-btn-icon">
                            {n.isAcknowledged ? "☑️" : "👁️"}
                          </span>{" "}
                          {n.isAcknowledged ? "รับทราบแล้ว" : "กดเพื่อรับทราบ"}
                        </button>
                      )}
                      {n.type === "change_request" && (
                        <>
                          <button
                            className="decide-chro-btn decide-chro-btn-approve"
                            style={
                              n.status === "approved"
                                ? { opacity: 0.5, pointerEvents: "none" }
                                : {}
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              handleChangeRequestAction(n, "approve");
                            }}
                          >
                            <span className="decide-chro-btn-icon">✅</span>{" "}
                            {n.status === "approved"
                              ? "อนุมัติแล้ว"
                              : "อนุมัติ"}
                          </button>
                          {n.status !== "approved" &&
                            n.status !== "rejected" && (
                              <button
                                className="decide-chro-btn decide-chro-btn-reject"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Reuse reject modal but with different submit handler context or update submitReject to handle this type
                                  // For simplicity, we can just use prompt or a simple confirm for now, OR update submitReject to route based on type
                                  // Let's use prompt for quick implementation to match existing pattern or update submitReject.
                                  // BETTER: Update submitReject to handle this type.
                                  openRejectModal(n);
                                }}
                              >
                                <span className="decide-chro-btn-icon">❌</span>{" "}
                                ปฏิเสธ
                              </button>
                            )}
                        </>
                      )}
                      <button
                        className="decide-chro-btn decide-chro-btn-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(n.id);
                        }}
                      >
                        <span className="decide-chro-btn-icon">🗑️</span> ลบ
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="decide-chro-list">
            {/* List view implementation similar to grid but simpler */}
            {filtered.map((n) => {
              const t = mapType(n.title);
              const isRead = statusKey(n) !== "unread";
              const sKey = statusKey(n);
              return (
                <div
                  key={n.id}
                  className={`decide-chro-row ${isRead ? "read" : "unread"}`}
                  onClick={() => handleViewDetails(n)}
                >
                  <div className="row-left">
                    <div className={`type-badge type-${t.key} list-badge`}>
                      {t.label}
                    </div>
                  </div>
                  <div className="row-main">
                    <div className="row-title">{n.title}</div>
                    <div className="row-sub">
                      {n.message.substring(0, 50)}...
                    </div>
                  </div>
                  <div className="row-right">
                    <span className={`row-status badge-${sKey}`}>{sKey}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* DETAILS MODAL */}
        {selectedNotification && (
          <div className="decide-chro-modal-overlay" onClick={handleCloseModal}>
            <div
              className="decide-chro-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="decide-chro-modal-close"
                onClick={handleCloseModal}
              >
                ×
              </button>
              <h2 className="decide-chro-modal-title">
                {selectedNotification.title}
              </h2>
              <div className="decide-chro-modal-body">
                <div className="decide-chro-info-item">
                  <span className="decide-chro-info-label">ผู้ส่ง:</span>
                  <span className="decide-chro-info-value modal-value">
                    {selectedNotification.sender}
                  </span>
                </div>
                <div className="decide-chro-info-item">
                  <span className="decide-chro-info-label">วันที่ส่ง:</span>
                  <span className="decide-chro-info-value modal-value">
                    {formatTimestamp(selectedNotification.timestamp)}
                  </span>
                </div>
                <div className="decide-chro-info-item">
                  <span className="decide-chro-info-label">ข้อความ:</span>
                  <span className="decide-chro-info-value modal-value">
                    {selectedNotification.message}
                  </span>
                </div>

                {selectedNotification.leaveData && (
                  <>
                    <div className="decide-chro-info-item">
                      <span className="decide-chro-info-label">ชื่อ:</span>
                      <span className="decide-chro-info-value modal-value">
                        {selectedNotification.leaveData.employeeName} (
                        {selectedNotification.leaveData.employeeId})
                      </span>
                    </div>
                    <div className="decide-chro-info-item">
                      <span className="decide-chro-info-label">แผนก:</span>
                      <span className="decide-chro-info-value modal-value">
                        {selectedNotification.leaveData.department}
                      </span>
                    </div>
                    <div className="decide-chro-info-item">
                      <span className="decide-chro-info-label">วันที่ลา:</span>
                      <span className="decide-chro-info-value modal-value">
                        {new Date(
                          selectedNotification.leaveData.leaveDate,
                        ).toLocaleDateString()}{" "}
                        -{" "}
                        {new Date(
                          selectedNotification.leaveData.endDate,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="decide-chro-info-item">
                      <span className="decide-chro-info-label">เหตุผล:</span>
                      <div className="decide-chro-info-value modal-value reason-box">
                        {selectedNotification.leaveData.reason}
                      </div>
                    </div>
                    {selectedNotification.leaveData.rejectionReason && (
                      <div
                        className="decide-chro-info-item"
                        style={{ color: "#ff6b6b" }}
                      >
                        <span className="decide-chro-info-label">
                          เหตุผลที่ปฏิเสธ:
                        </span>
                        <span className="decide-chro-info-value modal-value">
                          {selectedNotification.leaveData.rejectionReason}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {selectedNotification.changeData && (
                  <>
                    <div className="decide-chro-info-item">
                      <span className="decide-chro-info-label">
                        Requested By:
                      </span>
                      <span className="decide-chro-info-value modal-value">
                        {selectedNotification.changeData.requester_name}
                      </span>
                    </div>
                    <div className="decide-chro-info-item">
                      <span className="decide-chro-info-label">
                        Target User:
                      </span>
                      <span className="decide-chro-info-value modal-value">
                        {selectedNotification.changeData.target_user_name}
                      </span>
                    </div>
                    <div className="decide-chro-info-item">
                      <span className="decide-chro-info-label">Field:</span>
                      <span className="decide-chro-info-value modal-value">
                        {selectedNotification.changeData.field_name}
                      </span>
                    </div>
                    <div className="decide-chro-info-grid-2">
                      <div>
                        <small>Old Value</small>
                        <div className="old-value-box">
                          {selectedNotification.changeData.old_value || "-"}
                        </div>
                      </div>
                      <div>
                        <small>New Value</small>
                        <div className="new-value-box">
                          {selectedNotification.changeData.new_value}
                        </div>
                      </div>
                    </div>
                    <div className="decide-chro-info-item">
                      <span className="decide-chro-info-label">Reason:</span>
                      <div className="decide-chro-info-value modal-value reason-box">
                        {selectedNotification.changeData.reason}
                      </div>
                    </div>
                  </>
                )}

                <div
                  className="decide-chro-actions"
                  style={{ marginTop: "20px", justifyContent: "flex-end" }}
                >
                  {selectedNotification.type === "leave_request" && (
                    <>
                      <button
                        className="decide-chro-btn decide-chro-btn-approve"
                        disabled={selectedNotification.status === "approved"}
                        style={
                          selectedNotification.status === "approved"
                            ? { opacity: 0.5 }
                            : {}
                        }
                        onClick={() => handleApproveLeave(selectedNotification)}
                      >
                        ✅{" "}
                        {selectedNotification.status === "approved"
                          ? "อนุมัติแล้ว"
                          : "อนุมัติ"}
                      </button>
                      {selectedNotification.status !== "approved" &&
                        selectedNotification.status !== "rejected" && (
                          <button
                            className="decide-chro-btn decide-chro-btn-reject"
                            onClick={() =>
                              openRejectModal(selectedNotification)
                            }
                          >
                            ❌ ปฏิเสธ
                          </button>
                        )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REJECTION REASON MODAL */}
        {rejectModalOpen && (
          <div
            className="decide-chro-modal-overlay"
            onClick={closeRejectModal}
            style={{ zIndex: 2000 }}
          >
            <div
              className="decide-chro-modal"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "500px" }}
            >
              <h2
                className="decide-chro-modal-title"
                style={{ color: "#ff6b6b" }}
              >
                ⛔ ปฏิเสธคำขอ
              </h2>
              <p style={{ color: "#ccc", marginBottom: "10px" }}>
                กรุณาระบุเหตุผลที่ปฏิเสธคำขอนี้ เพื่อแจ้งให้พนักงานทราบ
              </p>
              <textarea
                className="decide-chro-reason-input"
                placeholder="ระบุเหตุผลที่นี่..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{
                  width: "100%",
                  height: "120px",
                  background: "#1e293b", // Darker solid background
                  border: "1px solid #475569",
                  color: "#f8fafc", // White text
                  padding: "10px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  resize: "none",
                }}
              />
              <div
                className="decide-chro-actions"
                style={{ justifyContent: "flex-end" }}
              >
                <button
                  className="decide-chro-btn"
                  onClick={closeRejectModal}
                  style={{
                    background: "transparent",
                    border: "1px solid #475569",
                    color: "#e2e8f0", // Light text
                    marginRight: "10px",
                  }}
                >
                  ยกเลิก
                </button>
                <button
                  className="decide-chro-btn decide-chro-btn-reject"
                  onClick={submitReject}
                >
                  ยืนยันการปฏิเสธ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL (EXCLUSIVE) */}
        {deleteModalOpen && (
          <div className="decide-chro-modal-overlay">
            <div className="decide-chro-modal decide-chro-delete-modal">
              <span className="decide-chro-delete-icon">🗑️</span>
              <h2 className="decide-chro-delete-title">ยืนยันการลบข้อมูล</h2>
              <p className="decide-chro-delete-text">
                คุณแน่ใจหรือไม่ที่จะลบรายการนี้? <br />
                การกระทำนี้ไม่สามารถย้อนกลับได้
              </p>
              <div className="decide-chro-delete-actions">
                <button
                  className="decide-chro-btn decide-chro-btn-cancel-delete"
                  onClick={cancelDelete}
                >
                  ยกเลิก
                </button>
                <button
                  className="decide-chro-btn decide-chro-btn-confirm-delete"
                  onClick={confirmDelete}
                >
                  ยืนยันลบ
                </button>
              </div>
            </div>
          </div>
        )}
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          type={confirmModal.type}
          confirmLabel="ยืนยัน"
          cancelLabel="ยกเลิก"
        />

        {/* SUCCESS POPUP (CHRO EXCLUSIVE) */}
        <PopupErrorCHRO
          isOpen={popupOpen && popupData.type === "error"}
          onClose={() => setPopupOpen(false)}
          title={popupData.title}
          message={popupData.message}
        />
        <PopupDoneCHRO
          isOpen={popupOpen && popupData.type === "success"}
          onClose={() => setPopupOpen(false)}
          title={popupData.title}
          message={popupData.message}
        />
      </div>
    </CHROLayout>
  );
};

export default DecideCHRO;
