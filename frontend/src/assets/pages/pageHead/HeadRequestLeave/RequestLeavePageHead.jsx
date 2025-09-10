import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RequestLeavePageHead.css';
import HeadSidebar from '../../../Component/Head/HeadSidebar';

const leaveTypes = [
  { value: 'vacation', label: 'ลาพักผ่อน' },
  { value: 'sick', label: 'ลาป่วย' },
  { value: 'personal', label: 'ลากิจส่วนตัว' },
  { value: 'maternity', label: 'ลาคลอดบุตร' },
  { value: 'travel', label: 'ลาพักผ่อนลากิจเพื่อนเดินทางไปต่างประเทศ' },
  { value: 'ordination', label: 'ลาอุปสมบทหรือลาไปประกอบพิธีฮัจย์' },
  { value: 'training', label: 'การลาไปฝึกอบรม' },
  { value: 'military', label: 'ลาเข้ารับเลือกหรือเข้ารับการเตรียมพล' },
];

const RequestLeavePageHead = () => {
  const navigate = useNavigate();

  const userId = localStorage.getItem('userId') || '';

  const [form, setForm] = useState({
    user_id: userId,
    leave_type: '',
    start_date: '',
    end_date: '',
    reason: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/leave-requests', form);
      alert(res.data.message || 'ส่งคำขอลาสำเร็จ');
      navigate('/head/dashboard');
    } catch (err) {
      console.error(err);
      alert('ส่งคำขอลาไม่สำเร็จ');
    }
  };

  return (
    <main className="main-container">
      <HeadSidebar />
      <div className="leave-form-container">
        <form className="leave-form-box" onSubmit={handleSubmit}>
          <button
            type="button"
            className="back-button"
            onClick={() => navigate('/head/dashboard')}
          >
            ← ย้อนกลับ
          </button>

          <h2>แบบฟอร์มขอลา (หัวหน้า)</h2>

          <p>
            ประเภทการลา:{' '}
            <select name="leave_type" value={form.leave_type} onChange={handleChange} required>
              <option value="">-- เลือกประเภทการลา --</option>
              {leaveTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </p>

          <p>
            ตั้งแต่วันที่{' '}
            <input
              type="date"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
              required
            />{' '}
            ถึงวันที่{' '}
            <input
              type="date"
              name="end_date"
              value={form.end_date}
              onChange={handleChange}
              required
            />
          </p>

          <p>
            เหตุผลการลา:{' '}
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              placeholder="กรอกเหตุผล"
              required
            />
          </p>

          <button type="submit" className="submit-button">
            ส่งคำขอ
          </button>
        </form>
      </div>
    </main>
  );
};

export default RequestLeavePageHead;
