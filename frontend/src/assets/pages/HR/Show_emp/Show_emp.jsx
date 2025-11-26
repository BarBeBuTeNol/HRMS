import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom'
import Sidebar_HR from '../../../Component/HR/Sidebar_HR'
import "./Show_emp.css";

const HR_PASSWORD = "123456";

const Show_emp = () => {
  const [employeeList, setEmployeeList] = useState([]);
  const [search, setSearch] = useState(""); // เพิ่ม state สำหรับ search
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [empTab, setEmpTab] = useState("personal");
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showDeleteInput, setShowDeleteInput] = useState(false);
  const [hrPassword, setHrPassword] = useState("");
  const [error, setError] = useState("");

  // โหลดข้อมูลพนักงานที่กรอกครบ 3 หน้า
  useEffect(() => {
    const personalList = JSON.parse(localStorage.getItem("emp_personal_list") || "[]");
    const infoList = JSON.parse(localStorage.getItem("emp_info_list") || "[]");
    const eduList = JSON.parse(localStorage.getItem("emp_education_list") || "[]");

    // Use a Set to track unique personalIds
    const uniquePersonalIds = new Set();

    const merged = personalList
      .map(personal => {
        const info = infoList.find(i => i.personalId === personal.personalId);
        const edu = eduList.find(e => e.personalId === personal.personalId);
        if (info && edu && !uniquePersonalIds.has(personal.personalId)) {
          uniquePersonalIds.add(personal.personalId);
          const empId = info.empId || personal.personalId;
          return {
            ...personal,
            ...info,
            ...edu,
            id: `EMP${empId.replace(/^EMP/, "")}`,
            empId: `EMP${empId.replace(/^EMP/, "")}`,
            empImage: personal.imageUrl || info.imageUrl || "",
          };
        }
        return null;
      })
      .filter(Boolean);

    setEmployeeList(merged);
  }, []);

  // filter employeeList ตาม search
  const filteredEmployees = employeeList.filter(emp =>
    (emp.empId && emp.empId.toLowerCase().includes(search.toLowerCase())) ||
    (emp.firstName && emp.firstName.toLowerCase().includes(search.toLowerCase())) ||
    (emp.lastName && emp.lastName.toLowerCase().includes(search.toLowerCase()))
  );

  // ฟังก์ชันแสดงข้อมูลแต่ละ tab
  const renderPersonal = (emp) => (
    <div>
      <p><b>ชื่อ:</b> {emp.firstName} {emp.lastName}</p>
      <p><b>อีเมล:</b> {emp.email}</p>
      <p><b>ที่อยู่:</b> {emp.address}</p>
      <p><b>สัญชาติ:</b> {emp.nationality}</p>
      <p><b>ครอบครัว:</b> {emp.family}</p>
      <p><b>เลขบัตรประชาชน:</b> {emp.personalId}</p>
      <p><b>ประวัติการรักษา:</b> {emp.healCheckup}</p>
    </div>
  );
  const renderEmployee = (emp) => (
    <div>
      <p><b>Employee ID:</b> {emp.empId}</p>
      <p><b>ตำแหน่ง:</b> {emp.jobPosition || emp.position}</p>
      <p><b>แผนก:</b> {emp.department}</p>
      <p><b>Personal ID:</b> {emp.personalId}</p>
      <p><b>วันเริ่มงาน:</b> {emp.startDate}</p>
      <p><b>เงินเดือน:</b> {emp.salary}</p>
      <p><b>สวัสดิการ:</b> {emp.benefit}</p>
    </div>
  );
  const renderEducation = (emp) => (
    <div>
      <p><b>ระดับการศึกษา:</b> {emp.educationLevel}</p>
      <p><b>มหาวิทยาลัย:</b> {emp.university}</p>
      <p><b>สาขา/โปรแกรม:</b> {emp.program}</p>
      <p><b>ทักษะ:</b> {emp.skill}</p>
      {emp.experienceFile && <p><b>ไฟล์ประสบการณ์:</b> {emp.experienceFile.name}</p>}
    </div>
  );

  // ฟังก์ชันแก้ไขข้อมูล
  const handleEdit = () => {
    setEditForm(selectedEmp);
    setEditMode(true);
    setError("");
  };
  const handleEditSave = () => {
    if (hrPassword !== HR_PASSWORD) {
      setError("รหัสผ่านไม่ถูกต้อง");
      return;
    }
    // อัปเดตข้อมูลใน localStorage
    const personalList = JSON.parse(localStorage.getItem("emp_personal_list") || "[]");
    const infoList = JSON.parse(localStorage.getItem("emp_info_list") || "[]");
    const eduList = JSON.parse(localStorage.getItem("emp_education_list") || "[]");

    // อัปเดตแต่ละ list
    const newPersonalList = personalList.map(p =>
      p.personalId === editForm.personalId ? { ...p, ...editForm } : p
    );
    const newInfoList = infoList.map(i =>
      i.empId === editForm.empId ? { ...i, ...editForm } : i
    );
    const newEduList = eduList.map(e =>
      e.empId === editForm.empId ? { ...e, ...editForm } : e
    );
    localStorage.setItem("emp_personal_list", JSON.stringify(newPersonalList));
    localStorage.setItem("emp_info_list", JSON.stringify(newInfoList));
    localStorage.setItem("emp_education_list", JSON.stringify(newEduList));
    setSelectedEmp(editForm);
    setEditMode(false);
    setHrPassword("");
    setError("");
    // รีโหลด employeeList
    setEmployeeList(employeeList.map(emp => emp.empId === editForm.empId ? editForm : emp));
  };

  // ฟังก์ชันลบข้อมูล
  const handleDelete = () => {
    if (hrPassword !== HR_PASSWORD) {
      setError("รหัสผ่านไม่ถูกต้อง");
      return;
    }
    // ใช้ personalId เป็น key หลักในการลบ
    const personalList = JSON.parse(localStorage.getItem("emp_personal_list") || "[]")
      .filter(p => p.personalId !== selectedEmp.personalId);
    const infoList = JSON.parse(localStorage.getItem("emp_info_list") || "[]")
      .filter(i => i.personalId !== selectedEmp.personalId);
    const eduList = JSON.parse(localStorage.getItem("emp_education_list") || "[]")
      .filter(e => e.personalId !== selectedEmp.personalId);

    localStorage.setItem("emp_personal_list", JSON.stringify(personalList));
    localStorage.setItem("emp_info_list", JSON.stringify(infoList));
    localStorage.setItem("emp_education_list", JSON.stringify(eduList));

    // Merge ข้อมูลใหม่หลังลบ
    const merged = infoList
      .map(info => {
        const personal = personalList.find(p => p.personalId === info.personalId);
        const edu = eduList.find(e => e.personalId === info.personalId);
        if (personal && edu) {
          const empId = info.empId || personal.personalId;
          return {
            ...personal,
            ...info,
            ...edu,
            id: `EMP${empId.replace(/^EMP/, "")}`,
            empId: `EMP${empId.replace(/^EMP/, "")}`,
            empImage: personal.imageUrl || info.imageUrl || "",
          };
        }
        return null;
      })
      .filter(Boolean);

    setEmployeeList(merged);
    setSelectedEmp(null);
    setShowDeleteInput(false);
    setHrPassword("");
    setError("");
  };

  return (
    <div className="show-emp-hacker-theme" style={{ display: "flex" }}>
      <Sidebar_HR /> {/* เพิ่ม Sidebar_HR */}
      <div style={{ flex: 1 }}>
        <h2 className="show-emp-title">Employee List</h2>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <input
            type="text"
            placeholder="🔍 ค้นหาชื่อหรือรหัสพนักงาน..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: '#23242b', color: '#7f5af0', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: '1.1rem', minWidth: 320, boxShadow: '0 2px 8px #7f5af020', outline: 'none', marginBottom: 0
            }}
          />
        </div>
        <div className="show-emp-list">
          {filteredEmployees.length === 0 && <div className="show-emp-empty">ไม่พบพนักงานที่ค้นหา</div>}
          {filteredEmployees.map(emp => (
            <div className="show-emp-card" key={emp.empId}>
              <div className="show-emp-img-box">
                <img src={emp.empImage || "/default-emp.png"} alt={emp.empId} className="show-emp-img" />
              </div>
              <div className="show-emp-info">
                <div className="show-emp-id">{emp.empId}</div>
                <div className="show-emp-name">{emp.firstName} {emp.lastName}</div>
                <button className="show-emp-view-btn" onClick={() => { setSelectedEmp(emp); setEmpTab("personal"); setEditMode(false); }}>
                  ดูข้อมูล
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal แสดงข้อมูลพนักงาน */}
        {selectedEmp && (
          <div className="show-emp-modal-overlay" onClick={() => { setSelectedEmp(null); setEditMode(false); setShowDeleteInput(false); setHrPassword(""); setError(""); }}>
            <div className="show-emp-modal-content" onClick={e => e.stopPropagation()}>
              <div className="show-emp-modal-tabs">
                <button className={empTab === "personal" ? "active" : ""} onClick={() => setEmpTab("personal")}>Personal</button>
                <button className={empTab === "employee" ? "active" : ""} onClick={() => setEmpTab("employee")}>Employee</button>
                <button className={empTab === "education" ? "active" : ""} onClick={() => setEmpTab("education")}>Education</button>
              </div>
              <div className="show-emp-modal-body">
                {editMode ? (
                  <div className="show-emp-edit-form">
                    {/* ตัวอย่างฟอร์มแก้ไข (เฉพาะ Personal) */}
                    <label>ชื่อ <input value={editForm.firstName} onChange={e => setEditForm({ ...editForm, firstName: e.target.value })} /></label>
                    <label>นามสกุล <input value={editForm.lastName} onChange={e => setEditForm({ ...editForm, lastName: e.target.value })} /></label>
                    <label>อีเมล <input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} /></label>
                    {/* เพิ่ม field อื่นๆ ตามต้องการ */}
                    <label>รหัส HR/Admin <input type="password" value={hrPassword} onChange={e => setHrPassword(e.target.value)} /></label>
                    {error && <div className="show-emp-error">{error}</div>}
                    <div className="show-emp-edit-btn-group">
                      <button onClick={handleEditSave}>บันทึก</button>
                      <button onClick={() => { setEditMode(false); setHrPassword(""); setError(""); }}>ยกเลิก</button>
                    </div>
                  </div>
                ) : (
                  <>
                    {empTab === "personal" && renderPersonal(selectedEmp)}
                    {empTab === "employee" && renderEmployee(selectedEmp)}
                    {empTab === "education" && renderEducation(selectedEmp)}
                  </>
                )}
              </div>
              <div className="show-emp-modal-actions">
                {!editMode && (
                  <>
                    <button className="show-emp-edit-btn" onClick={handleEdit}>แก้ไขข้อมูล</button>
                    <button className="show-emp-delete-btn" onClick={() => setShowDeleteInput(true)}>ลบข้อมูล</button>
                  </>
                )}
                {showDeleteInput && (
                  <div className="show-emp-delete-confirm">
                    <input
                      type="password"
                      placeholder="รหัส HR/Admin"
                      value={hrPassword}
                      onChange={e => setHrPassword(e.target.value)}
                    />
                    <button onClick={handleDelete}>ยืนยันลบ</button>
                    <button onClick={() => { setShowDeleteInput(false); setHrPassword(""); setError(""); }}>ยกเลิก</button>
                    {error && <div className="show-emp-error">{error}</div>}
                  </div>
                )}
                <button className="show-emp-close-btn" onClick={() => { setSelectedEmp(null); setEditMode(false); setShowDeleteInput(false); setHrPassword(""); setError(""); }}>ปิด</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Show_emp;