import { useState, useEffect } from 'react';
import './ShiftDialog.css';

export default function ShiftDialog({ data, employees, onSave, onClose }) {
  const [empId, setEmpId] = useState(data.empId || '');
  const [shift, setShift] = useState(data.shift || 'A');

  // sync state ทุกครั้งที่ dialogData เปลี่ยน
  useEffect(() => {
    setEmpId(data.empId || '');
    setShift(data.shift || 'A');
  }, [data]);

  const handleSubmit = () => {
    if (!empId) {
      alert("⚠️ กรุณาเลือกพนักงานก่อน");
      return;
    }

    const emp = employees.find(e => String(e.id) === String(empId));

    onSave({
      id: data.id || null,
      date: data.date,
      shift,
      empId,
      empName: emp ? emp.name : "",
    });
  };

  return (
    <div className="dialog-backdrop">
      <div className="dialog-card">
        <h3>กำหนดเวร {data.date}</h3>

        <label>กะ</label>
        <select value={shift} onChange={e => setShift(e.target.value)}>
          <option value="A">เช้า (08:00-16:00)</option>
          <option value="B">บ่าย (16:00-00:00)</option>
          <option value="C">ดึก (00:00-08:00)</option>
        </select>

        <label>พนักงาน</label>
        <select value={empId} onChange={e => setEmpId(e.target.value)}>
          <option value="">-- เลือก --</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.name}</option>
          ))}
        </select>

        <div className="dialog-actions">
          <button className="btn-save" onClick={handleSubmit}>บันทึก</button>
          <button className="btn-cancel" onClick={onClose}>ยกเลิก</button>
        </div>
      </div>
    </div>
  );
}
