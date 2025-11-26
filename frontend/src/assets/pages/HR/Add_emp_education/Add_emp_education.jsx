import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // เพิ่ม useNavigate
import Sidebar_HR from "../../../Component/HR/Sidebar_HR.jsx";
import "./Add_emp_education.css";

const AddEmpEducation = (props) => {
  const location = useLocation();
  const navigate = useNavigate(); // เพิ่มบรรทัดนี้
  const { empId = "EMP001", personalId = "1234567890123", empImage = "https://via.placeholder.com/120" } = location.state || {};

  const [educationLevel, setEducationLevel] = useState("");
  const [university, setUniversity] = useState("");
  const [program, setProgram] = useState("");
  const [experienceFile, setExperienceFile] = useState(null);
  const [skill, setSkill] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const handleFileChange = (e) => {
    setExperienceFile(e.target.files[0]);
  };

  const handleSave = () => {
    const data = {
      empId,
      personalId,
      educationLevel,
      university,
      program,
      experienceFile,
      skill,
      empImage,
    };
    // --- เพิ่มส่วนนี้เพื่อบันทึกลง localStorage ---
    const eduList = JSON.parse(localStorage.getItem("emp_education_list") || "[]");
    eduList.push(data);
    localStorage.setItem("emp_education_list", JSON.stringify(eduList));
    // --- จบส่วนที่เพิ่ม ---

    setIsSaved(true);
    setTimeout(() => {
      navigate("/MainHR", { state: { newEmployee: data } });
    }, 1000);
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar_HR />
      <div className="hacker-theme-add-emp-education add-emp-education-container">
        <h2 className="add-emp-education-title">
          Employee Education Information
        </h2>
        {/* Progress bar animation when saving */}
        {isSaved && (
          <div style={{ width: "100%", height: 6, background: "#e0e6ed", borderRadius: 4, marginBottom: 18 }}>
            <div style={{ width: "100%", height: "100%", background: "linear-gradient(90deg,#3ecf8e 40%,#b3c7f7 100%)", borderRadius: 4, animation: "progressBar 1s linear" }} />
          </div>
        )}
        <div className="add-emp-education-info-section">
          <div className="add-emp-education-image-box">
            {empImage && (
              <img src={empImage} alt="Employee" className="add-emp-education-emp-image" />
            )}
          </div>
          <div className="add-emp-education-fields">
            <label>
              Employee ID
              <input type="text" value={empId} readOnly />
            </label>
            <label>
              Personal ID
              <input type="text" value={personalId} readOnly />
            </label>
            <label>
              Education Level
              <input
                type="text"
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                placeholder="e.g. Bachelor's, Master's"
              />
            </label>
            <label>
              University
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="Enter university name"
              />
            </label>
            <label>
              Program (Major)
              <input
                type="text"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                placeholder="Enter major/program"
              />
            </label>
            <label>
              Previous Experience (Upload)
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
              {experienceFile && <span>{experienceFile.name}</span>}
            </label>
            <label>
              Skill
              <textarea
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                placeholder="List skills here"
              />
            </label>
          </div>
        </div>
        <div className="add-emp-education-button-group">
          <button
            onClick={() => navigate(-1)}
            className="add-emp-education-back-btn"
            tabIndex={0}
          >
            Back
          </button>
          <button
            onClick={handleSave}
            className="add-emp-education-save-btn"
            disabled={isSaved}
            tabIndex={0}
          >
            {isSaved ? "Done" : "Save"}
          </button>
        </div>
      </div>
      {/* Progress bar keyframes */}
      <style>{`
        @keyframes progressBar {
          0% { width: 0; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default AddEmpEducation;