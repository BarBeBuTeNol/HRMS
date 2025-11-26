import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import HeadSidebar from '../../../Component/Head/HeadSidebar';
import api from '../../../../services/api';
import './AddWorkPage.css';

const AddWorkPage = () => {
  const { id } = useParams();  // รหัสพนักงาน
  const navigate = useNavigate();
  const location = useLocation();
  const empName = location.state?.empName || 'พนักงาน';

  const headUser = JSON.parse(localStorage.getItem('user')) || { name: "หัวหน้า" };

  // ✅ state
  const [title, setTitle] = useState('');
  const [job, setJob] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('Medium');

const handleSubmit = async (e) => {
  e.preventDefault();
  if (title && job && deadline) {
    try {
      const response = await api.post("/api/task_assignments", {
        user_id: id,
        task_name: title,
        description: job,
        deadline,
      });

      if (response.data.success) {
        alert("✅ บันทึกงานเรียบร้อยแล้ว");
        navigate(-1);
      }
    } catch (err) {
      console.error("❌ Error saving task:", err);
      alert("เกิดข้อผิดพลาดในการบันทึกงาน");
    }
  }
};

  return (
    <div className="add-work-container">
      <HeadSidebar />

      <div className="main-content">
        <div className="work-form-wrapper">
          <button className="btn-back" onClick={() => navigate(-1)}>← กลับ</button>
          <h2 className="form-title">เพิ่มงานใหม่ให้: {empName} (ID: {id})</h2>

          <form onSubmit={handleSubmit} className="work-form">
            
            {/* หัวข้องาน */}
            <label htmlFor="title">หัวข้องาน</label>
            <input
              type="text"
              id="title"
              placeholder="เช่น พัฒนาโมดูล Login"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            {/* รายละเอียดงาน */}
            <label htmlFor="job">รายละเอียดงาน</label>
            <textarea
              id="job"
              placeholder="ใส่รายละเอียดของงาน เช่น สิ่งที่ต้องทำ, scope, ความต้องการ"
              value={job}
              onChange={(e) => setJob(e.target.value)}
              rows="4"
              required
            />

            {/* กำหนดส่ง */}
            <label htmlFor="deadline">กำหนดส่งงาน</label>
            <input
              type="datetime-local"
              id="deadline"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />

            {/* ความสำคัญ */}
            <label htmlFor="priority">ความสำคัญ</label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="Low">ต่ำ</option>
              <option value="Medium">ปานกลาง</option>
              <option value="High">สูง</option>
            </select>

            <button type="submit" className="btn-submit">✅ บันทึกงาน</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddWorkPage;
