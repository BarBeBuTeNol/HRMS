// src/pages/pageHead/EmployeeDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../../services/api";
import "./EmployeeDetail.css";
// import testpic from '../../../pic/profile_emp.jpg';

const EmployeeDetail = () => {
  const { id } = useParams(); // ⬅️ ดึง employeeId จาก path
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    api
      .get(`/api/users/${id}/profile`)
      .then((res) => setEmployee(res.data))
      .catch((err) => {
        console.error("โหลดข้อมูลพนักงานล้มเหลว:", err);
        setError("ไม่สามารถโหลดข้อมูลพนักงานได้");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>⏳ กำลังโหลดข้อมูลพนักงาน...</div>;
  if (error) return <div>❌ {error}</div>;
  if (!employee) return <div>❌ ไม่พบข้อมูลพนักงาน</div>;

  return (
    <div className="detail-container">
      <button className="btn-back" onClick={() => navigate(-1)}>
        ← ย้อนกลับ
      </button>

      <h1 className="title">ข้อมูลโปรไฟล์พนักงาน</h1>

      <div className="profile-card">
        <div className="info-section">
          <h2 className="section-title">ข้อมูลส่วนตัว</h2>
          <div className="info-row">
            <strong>ชื่อ:</strong> {employee.full_name}
          </div>
          <div className="info-row">
            <strong>ตำแหน่ง:</strong> {employee.role_name}
          </div>
          <div className="info-row">
            <strong>แผนก:</strong> {employee.department_name}
          </div>
          <div className="info-row">
            <strong>วันเกิด:</strong> {employee.birthday}
          </div>
          <div className="info-row">
            <strong>เพศ:</strong> {employee.gender}
          </div>
          <div className="info-row">
            <strong>สัญชาติ:</strong> {employee.nationality}
          </div>
          <div className="info-row">
            <strong>ศาสนา:</strong> {employee.religion}
          </div>
          <div className="info-row">
            <strong>อีเมล:</strong> {employee.email}
          </div>
          <div className="info-row">
            <strong>เบอร์โทรศัพท์:</strong> {employee.phone}
          </div>
          <div className="info-row">
            <strong>ที่อยู่:</strong> {employee.address}
          </div>
          <div className="info-row">
            <strong>สถานภาพสมรส:</strong> {employee.maritalStatus}
          </div>

          {employee.education && (
            <>
              <h2 className="section-title">การศึกษา</h2>
              <div className="info-row">
                <strong>วุฒิ:</strong> {employee.education.degree}
              </div>
              <div className="info-row">
                <strong>สาขา:</strong> {employee.education.major}
              </div>
              <div className="info-row">
                <strong>ปีที่จบ:</strong> {employee.education.year}
              </div>
              <div className="info-row">
                <strong>GPA:</strong> {employee.education.gpa}
              </div>
            </>
          )}

          {employee.guardian && (
            <>
              <h2 className="section-title">ผู้ปกครอง</h2>
              <div className="info-row">
                <strong>ชื่อ:</strong> {employee.guardian.name}
              </div>
              <div className="info-row">
                <strong>ความสัมพันธ์:</strong> {employee.guardian.relation}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;
