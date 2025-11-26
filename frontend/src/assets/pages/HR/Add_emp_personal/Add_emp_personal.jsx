import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar_HR from "../../../Component/HR/Sidebar_HR.jsx";
import "./Add_emp_personal.css";

const AddEmpPersonal = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    personalId: "",
    firstName: "",
    lastName: "",
    age: "",
    registerDate: "",
    email: "",
    address: "",
    nationality: "",
    family: "",
    tax: "",
    socialSecurity: "",
    healCheckup: "",
    image: null,
    imageUrl: "",
  });
  const [isComplete, setIsComplete] = useState(false);

  // ตรวจสอบว่ากรอกครบทุกช่อง (ยกเว้น image)
  const isFormFilled = Object.entries(form)
    .filter(([key]) => key !== "image" && key !== "imageUrl")
    .every(([_, value]) => value && value !== "");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({
        ...prev,
        image: file,
        imageUrl: URL.createObjectURL(file),
      }));
    }
  };

  const handleCancel = () => {
    navigate("/MainHR");
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (isFormFilled) {
      setIsComplete(true);
    }
  };

  const handleDone = () => {
    // เก็บข้อมูลลง localStorage (key: "emp_personal_list")
    const empList = JSON.parse(localStorage.getItem("emp_personal_list") || "[]");
    empList.push(form);
    localStorage.setItem("emp_personal_list", JSON.stringify(empList));
    // ส่งข้อมูลไปหน้า Add_emp_info (อาจใช้ state management จริงจังใน production)
    navigate("/Add_emp_info", { state: { empPersonal: form } });
  };

  // เพิ่ม useEffect เพื่อตรวจสอบและบันทึกข้อมูลเมื่อกรอกครบ
  useEffect(() => {
    if (isFormFilled) {
      // ตรวจสอบว่าข้อมูลนี้ยังไม่ได้ถูกบันทึก (เช่น เช็ค personalId ซ้ำ)
      const empList = JSON.parse(localStorage.getItem("emp_personal_list") || "[]");
      const exists = empList.some(emp => emp.personalId === form.personalId);
      if (!exists) {
        empList.push(form);
        localStorage.setItem("emp_personal_list", JSON.stringify(empList));
      }
    }
  }, [isFormFilled, form]);

  return (
    <div className="add-emp-personal-page">
      <Sidebar_HR />
      <div className="add-emp-content-row">
        {/* ซ้าย: ฟอร์มในกรอบ Employee Personal Information */}
        <div className="add-emp-form-container">
          <h2>Employee Personal Information</h2>
          <form className="add-emp-form" onSubmit={isComplete ? handleDone : handleSave}>
            <div className="form-fields-col">
              {/* --- ฟอร์มกรอกข้อมูลฝั่งซ้าย --- */}
              <div className="form-group">
                <label>Personal ID</label>
                <input type="text" name="personalId" value={form.personalId} onChange={handleChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" name="firstName" value={form.firstName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" name="lastName" value={form.lastName} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Age</label>
                  <input type="number" name="age" min="0" value={form.age} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" name="registerDate" value={form.registerDate} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input type="text" name="address" value={form.address} onChange={handleChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Nationality</label>
                  <input type="text" name="nationality" value={form.nationality} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Family</label>
                  <input type="text" name="family" value={form.family} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Tax</label>
                  <input type="text" name="tax" value={form.tax} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Social Security</label>
                  <input type="text" name="socialSecurity" value={form.socialSecurity} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Heal Checkup</label>
                <textarea name="healCheckup" rows="3" value={form.healCheckup} onChange={handleChange} placeholder="ประวัติการรักษา"></textarea>
              </div>
              <div className="button-group" style={{ display: "flex", gap: 16, marginTop: 24 }}>
                <button type="button" className="cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
                {!isComplete ? (
                  <button type="submit" className="save-btn" disabled={!isFormFilled}>
                    Save
                  </button>
                ) : (
                  <button type="button" className="done-btn" onClick={handleDone}>
                    Done
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
        {/* ขวา: รูปภาพ */}
        <div className="form-image-container">
          <label className="image-label">Upload Image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {form.imageUrl && (
            <img
              src={form.imageUrl}
              alt="Preview"
              className="emp-image-preview"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AddEmpPersonal;