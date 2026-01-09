// src/pages/pageHead/HeadProfilePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../../../services/api";
import HeadSidebar from "../../../Component/Head/HeadSidebar";
import "./HeadProfilePage.css";
// import picHead from '../../../pic/pon.jpg';

/** หา userId ให้ทนทาน */
const useUserId = () => {
  const { search } = useLocation();
  const qs = new URLSearchParams(search);
  const qId = Number(qs.get("userId"));
  if (!Number.isNaN(qId) && qId > 0) return qId;

  const rawId = localStorage.getItem("userId");
  if (rawId && rawId !== "undefined" && rawId !== "null") {
    const n = Number(rawId);
    if (!Number.isNaN(n) && n > 0) return n;
  }

  try {
    const rawUser = localStorage.getItem("user");
    if (rawUser) {
      const obj = JSON.parse(rawUser);
      const n = Number(obj?.id ?? obj?.user?.id);
      if (!Number.isNaN(n) && n > 0) return n;
    }
  } catch (err) {
    console.warn("⚠️ localStorage.user parse error", err);
  }

  return 0;
};

// helpers
const has = (v) =>
  v !== null && v !== undefined && String(v).trim() !== "" && v !== "-";
const val = (v, dash = "-") => (has(v) ? v : dash);
const fmtDateTH = (d) => {
  if (!has(d)) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "-";
  return new Intl.DateTimeFormat("th-TH", { dateStyle: "long" }).format(dt);
};

const Row = ({ label, value, isDate }) =>
  has(value) ? (
    <div className="profile-row">
      <strong>{label}:</strong> {isDate ? fmtDateTH(value) : value}
    </div>
  ) : null;

export default function HeadProfilePage() {
  const navigate = useNavigate();
  const userId = useUserId();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // โหลดโปรไฟล์จาก backend
  useEffect(() => {
    const url = `/api/users/${userId}/profile`;
    api
      .get(url)
      .then((res) => setProfile(res.data))
      .catch((err) => {
        setError(
          err.response?.data?.error ||
            err.message ||
            "โหลดข้อมูลโปรไฟล์ไม่สำเร็จ"
        );
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const headerName = useMemo(() => profile?.full_name || "-", [profile]);

  if (loading)
    return <div className="loading">⏳ กำลังโหลดข้อมูลโปรไฟล์...</div>;
  if (error) return <div className="loading error">❌ {error}</div>;
  if (!profile)
    return <div className="loading error">❌ ไม่พบข้อมูลผู้ใช้</div>;

  return (
    <div className="profile-container">
      <HeadSidebar />
      <main className="profile-main">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← กลับ
        </button>

        {/* HEADER */}
        <div className="profile-header">
          <div className="profile-user">
            <img
              src={profile.profile_pic /* || picHead */}
              alt="Profile"
              className="profile-image"
            />
            <div className="profile-name-block">
              <h2>{headerName}</h2>
              <div className="muted">
                {val(profile.role_name)} • {val(profile.department_name)}
              </div>
              <div className="muted">{val(profile.email)}</div>
            </div>
          </div>
        </div>

        {/* PERSONAL INFO */}
        <section className="profile-section">
          <h3>ข้อมูลส่วนตัว</h3>
          <Row label="เพศ" value={profile.gender} />
          <Row label="วันเกิด" value={profile.birthday} isDate />
          <Row label="ที่อยู่" value={profile.address} />
          <Row label="สถานภาพสมรส" value={profile.maritalStatus} />
          <Row label="สัญชาติ" value={profile.nationality} />
          <Row label="ศาสนา" value={profile.religion} />
          <Row label="กรุ๊ปเลือด" value={profile.bloodType} />
        </section>

        {/* EMERGENCY CONTACT */}
        <section className="profile-section">
          <h3>ผู้ติดต่อกรณีฉุกเฉิน</h3>
          <Row label="ชื่อ" value={profile.emergencyContact?.name} />
          <Row label="เบอร์โทร" value={profile.emergencyContact?.phone} />
          <Row
            label="ความสัมพันธ์"
            value={profile.emergencyContact?.relation}
          />
        </section>

        {/* SYSTEM INFO */}
        <section className="profile-section">
          <h3>System Info</h3>
          <Row label="สร้างเมื่อ" value={profile.createdAt} isDate />
          <Row label="แก้ไขล่าสุด" value={profile.updatedAt} isDate />
        </section>
      </main>
    </div>
  );
}
