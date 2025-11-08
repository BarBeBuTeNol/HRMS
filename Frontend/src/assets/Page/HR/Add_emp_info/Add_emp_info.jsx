import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar_HR from "../../../Component/HR/Sidebar_HR.jsx";
import "./Add_emp_info.css";

const AddEmpInfo = () => {
  const navigate = useNavigate();
  const [personalId, setPersonalId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Get emp_personal_list for personalId and imageUrl
    const empPersonalList = JSON.parse(localStorage.getItem("emp_personal_list") || "[]");
    if (empPersonalList.length > 0) {
      const last = empPersonalList[empPersonalList.length - 1];
      setPersonalId(last.personalId || "");
      setImageUrl(last.imageUrl || "");
    }

    // Generate new Employee ID
    const empInfoList = JSON.parse(localStorage.getItem("emp_info_list") || "[]");
    let nextEmpId = "001";
    if (empInfoList.length > 0) {
      // Find max empId (as number)
      const maxId = empInfoList.reduce((max, emp) => {
        const idNum = parseInt(emp.empId, 10);
        return !isNaN(idNum) && idNum > max ? idNum : max;
      }, 0);
      nextEmpId = String(maxId + 1).padStart(3, "0");
    }

    // Set today's date for startDate
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    setForm((prev) => ({
      ...prev,
      empId: nextEmpId,
      startDate: todayStr,
    }));
    setSalaryDisplay("");
  }, []);

  const [form, setForm] = useState({
    empId: "",
    department: "",
    status: "",
    startTime: "",
    endTime: "",
    jobPosition: "",
    startDate: "",
    salary: "",
    benefit: "",
    performanceReview: null,
    trainingInfo: null,
  });
  // For displaying salary with commas
  const [salaryDisplay, setSalaryDisplay] = useState("");

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (name === "salary") {
      // Remove all non-digit characters
      const raw = value.replace(/[^\d]/g, "");
      // Format with commas
      const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      setSalaryDisplay(formatted);
      setForm((prev) => ({
        ...prev,
        salary: raw,
      }));
      return;
    }
    if (type === "file") {
      setForm((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleBack = () => {
    navigate("/add-emp-personal");
  };

  const handleSave = (e) => {
    e.preventDefault();
    const empInfoList = JSON.parse(localStorage.getItem("emp_info_list") || "[]");
    const newEmpInfo = {
      ...form,
      personalId,
      imageUrl,
    };
    empInfoList.push(newEmpInfo);
    localStorage.setItem("emp_info_list", JSON.stringify(empInfoList));
    setIsSaved(true);
    alert("ข้อมูลพนักงานถูกบันทึกเรียบร้อยแล้ว");
  };

  const handleDone = (e) => {
    e.preventDefault();
    // ส่งข้อมูลไปหน้า Add_emp_education
    navigate("/add_emp_education", {
      state: {
        empId: form.empId,
        personalId: personalId,
        empImage: imageUrl,
      },
    });
  };
  
  const isFormFilled = Object.entries(form)
    .filter(([key]) => key !== "performanceReview" && key !== "trainingInfo")
    .every(([_, value]) => value && value !== "");

  useEffect(() => {
    if (isFormFilled && personalId) {
      const empInfoList = JSON.parse(localStorage.getItem("emp_info_list") || "[]");
      const exists = empInfoList.some(emp => emp.empId === form.empId);
      if (!exists) {
        const newEmpInfo = {
          ...form,
          personalId,
          imageUrl,
        };
        empInfoList.push(newEmpInfo);
        localStorage.setItem("emp_info_list", JSON.stringify(empInfoList));
      }
    }
  }, [isFormFilled, form, personalId, imageUrl]);

  return (
    <div className="add-emp-info-layout">
      <Sidebar_HR />
      <div className="add-emp-info-content">
        <div className="add-emp-info-page">
          <div className="add-emp-info-main">
            <div className="add-emp-info-form-container">
              <form className="add-emp-info-form" onSubmit={isSaved ? handleDone : handleSave}>
                <h2>Employee Information</h2>
                <div className="form-group">
                  <label>Employee ID</label>
                  <input type="text" name="empId" value={form.empId} onChange={handleChange} required readOnly />
                </div>
                <div className="form-group">
                  <label>Personal ID</label>
                  <input type="text" name="personalId" value={personalId} readOnly />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input type="text" name="department" value={form.department} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={form.status} onChange={handleChange} required>
                    <option value="">-- เลือกสถานะ --</option>
                    <option value="ฝึกงาน">ฝึกงาน</option>
                    <option value="พนักงาน">พนักงาน</option>
                    <option value="part-time">part-time</option>
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Time</label>
                    <input type="time" name="startTime" value={form.startTime} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>End Time</label>
                    <input type="time" name="endTime" value={form.endTime} onChange={handleChange} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Job Position</label>
                  <input type="text" name="jobPosition" value={form.jobPosition} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Salary (Bath)</label>
                  <input
                    type="text"
                    name="salary"
                    value={salaryDisplay}
                    onChange={handleChange}
                    required
                    min="0"
                    inputMode="numeric"
                    pattern="[0-9,]*"
                    placeholder="0"
                  />
                </div>
                <div className="form-group">
                  <label>Benefit</label>
                  <input type="text" name="benefit" value={form.benefit} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Performance Review (อัปโหลดไฟล์)</label>
                  <input type="file" name="performanceReview" accept=".pdf,.doc,.docx,.jpg,.png" onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Training Information (อัปโหลดไฟล์)</label>
                  <input type="file" name="trainingInfo" accept=".pdf,.doc,.docx,.jpg,.png" onChange={handleChange} />
                </div>
                <div className="button-row">
                  <button type="button" className="back-btn" onClick={handleBack}>
                    Back
                  </button>
                  <button type="submit" className="submit-btn">
                    {isSaved ? "Done" : "Save"}
                  </button>
                </div>
              </form>
            </div>
            <div className="emp-image-section">
              <div className="emp-image-preview-container">
                <div className="image-label">Image Employee</div>
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Employee"
                    className="emp-image-preview"
                  />
                ) : (
                  <div className="emp-image-preview no-image">ไม่มีรูปภาพ</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEmpInfo;