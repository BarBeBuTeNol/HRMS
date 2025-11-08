import React, { useEffect, useMemo, useState } from 'react';
import SidebarCHRO from '../../../Component/CHRO/SidebarCHRO';
import './Direct-Position.css';



const ROLE_OPTIONS = ['EMPLOYEE', 'HEAD', 'HR', 'CHRO'];
const DEPT_OPTIONS = ['ฝ่ายขาย', 'ฝ่ายบุคคล', 'ฝ่าย IT', 'ฝ่ายการเงิน', 'ฝ่ายผลิต'];

const POSITION_OPTIONS = [
  'ผู้จัดการฝ่ายขาย',
  'ผู้จัดการฝ่ายบุคคล',
  'ผู้จัดการฝ่าย IT',
  'ผู้จัดการฝ่ายการเงิน',
  'ผู้จัดการฝ่ายผลิต',
  'หัวหน้าทีมขาย',
  'หัวหน้าทีมพัฒนา',
  'หัวหน้าทีมบัญชี',
  'ผู้เชี่ยวชาญระบบ',
  'ที่ปรึกษาด้านธุรกิจ',
];

export default function DirectPosition() {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [note, setNote] = useState('');

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // --- Mock data (ตัวอย่าง) — ภายหลังดึงจาก API ได้ ---
  useEffect(() => {
    const mockEmployees = [
      { id: 1, name: 'สมชาย ใจดี', position: 'พนักงานขาย', department: 'ฝ่ายขาย', email: 'somchai@company.com', role: 'EMPLOYEE' },
      { id: 2, name: 'สมหญิง รักงาน', position: 'ผู้ช่วยผู้จัดการ', department: 'ฝ่ายบุคคล', email: 'somying@company.com', role: 'HR' },
      { id: 3, name: 'วิชัย มุ่งมั่น', position: 'โปรแกรมเมอร์', department: 'ฝ่าย IT', email: 'wichai@company.com', role: 'EMPLOYEE' },
      { id: 4, name: 'รัตนา สดใส', position: 'นักบัญชี', department: 'ฝ่ายการเงิน', email: 'rattana@company.com', role: 'EMPLOYEE' },
      { id: 5, name: 'ธนวัฒน์ เก่งกล้า', position: 'วิศวกร', department: 'ฝ่ายผลิต', email: 'thanawat@company.com', role: 'EMPLOYEE' },
    ];
    setEmployees(mockEmployees);
  }, []);

  const filteredEmployees = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return employees;
    return employees.filter((e) =>
      e.name.toLowerCase().includes(s) ||
      e.position.toLowerCase().includes(s) ||
      e.department.toLowerCase().includes(s) ||
      e.email.toLowerCase().includes(s)
    );
  }, [employees, searchTerm]);

  // เปิด modal และเติมค่าตั้งต้น
  const openModal = (emp) => {
    setSelectedEmployee(emp);
    setSelectedPosition(emp.position || '');
    setSelectedRole(emp.role || '');
    setSelectedDept(emp.department || '');
    setEffectiveDate('');
    setNote('');
  };

  const closeModal = () => {
    setSelectedEmployee(null);
    setSelectedPosition('');
    setSelectedRole('');
    setSelectedDept('');
    setEffectiveDate('');
    setNote('');
  };

  const handleConfirm = async () => {
    if (!selectedEmployee) return;
    if (!selectedPosition || !selectedRole || !selectedDept) return;

    setLoading(true);

    // TODO: เรียก API จริง เช่น
    // await api.put(`/employees/${selectedEmployee.id}/position`, {
    //   position: selectedPosition,
    //   role: selectedRole,
    //   department: selectedDept,
    //   effectiveDate,
    //   note,
    //   approvedBy: 'CHRO', // อาจอ่านจาก session ผู้ใช้ที่ล็อกอิน
    // });

    setTimeout(() => {
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === selectedEmployee.id
            ? { ...e, position: selectedPosition, role: selectedRole, department: selectedDept }
            : e
        )
      );

      setLoading(false);
      closeModal();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
    }, 900);
  };

  return (
    <div className="direct-position-layout">{/* Layout หลัก (Sidebar + Main) */}
      <SidebarCHRO />

      <main className="dp-main">
        {/* Header / Title */}
        <header className="direct-position-header">
          <h1 className="direct-position-title">จัดการตำแหน่งพนักงาน</h1>
          <p className="direct-position-subtitle">กำหนดและเปลี่ยนแปลงตำแหน่ง/บทบาท ตามสิทธิของ CHRO</p>
        </header>

        <div className="direct-position-content">
          {/* Search */}
          <section className="search-section">
            <div className="search-container">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาด้วยชื่อ / ตำแหน่ง / แผนก / อีเมล"
                className="search-input"
                aria-label="ค้นหาพนักงาน"
              />
              <div className="search-icon" aria-hidden>🔍</div>
            </div>
          </section>

          {/* Employees Grid */}
          <section className="employees-grid" aria-label="รายการพนักงาน">
            {filteredEmployees.map((emp) => (
              <article
                key={emp.id}
                className={`employee-card ${selectedEmployee?.id === emp.id ? 'selected' : ''}`}
                onClick={() => openModal(emp)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' ? openModal(emp) : null)}
                aria-label={`แก้ไขตำแหน่งของ ${emp.name}`}
              >
                <div className="employee-avatar">{emp.name.charAt(0)}</div>
                <div className="employee-info">
                  <h3 className="employee-name">{emp.name}</h3>
                  <p className="employee-position">{emp.position}</p>
                  <p className="employee-department">{emp.department}</p>
                  <p className="employee-email">{emp.email}</p>
                </div>
                <div className="employee-status"><span className="status-badge">Active</span></div>
              </article>
            ))}
          </section>
        </div>

        {/* Modal แก้ไขตำแหน่ง */}
        {selectedEmployee && (
          <div className="position-change-modal" role="dialog" aria-modal="true" aria-label="เปลี่ยนตำแหน่งพนักงาน">
            <div className="modal-content">
              <h2 className="modal-title">เปลี่ยนตำแหน่ง/บทบาท</h2>

              <div className="selected-employee-info">
                <div className="selected-avatar">{selectedEmployee.name.charAt(0)}</div>
                <div>
                  <h3>{selectedEmployee.name}</h3>
                  <p>ตำแหน่งปัจจุบัน: {selectedEmployee.position} • แผนก: {selectedEmployee.department}</p>
                  <p>บทบาทปัจจุบัน: {selectedEmployee.role}</p>
                </div>
              </div>

              <div className="position-selector">
                <label htmlFor="pos">ตำแหน่งใหม่</label>
                <select id="pos" className="position-select" value={selectedPosition} onChange={(e) => setSelectedPosition(e.target.value)}>
                  <option value="">-- เลือกตำแหน่ง --</option>
                  {POSITION_OPTIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="dp-form-grid">
                <div className="dp-form-item">
                  <label htmlFor="role">บทบาท (สิทธิการใช้งาน)</label>
                  <select id="role" className="position-select" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                    <option value="">-- เลือกบทบาท --</option>
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="dp-form-item">
                  <label htmlFor="dept">แผนก</label>
                  <select id="dept" className="position-select" value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
                    <option value="">-- เลือกแผนก --</option>
                    {DEPT_OPTIONS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="dp-form-item">
                  <label htmlFor="eff">วันที่มีผล</label>
                  <input id="eff" type="date" className="position-select dp-input" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
                </div>
              </div>

              <div className="dp-form-item">
                <label htmlFor="note">หมายเหตุ</label>
                <textarea id="note" rows={3} className="position-select dp-input" placeholder="เช่น ย้ายตามโครงสร้างใหม่ไตรมาส 4" value={note} onChange={(e) => setNote(e.target.value)} />
              </div>

              <div className="modal-actions">
                <button className="btn-cancel" onClick={closeModal}>ยกเลิก</button>
                <button className={`btn-confirm ${loading || !selectedPosition || !selectedRole || !selectedDept ? 'disabled' : ''}`} disabled={loading || !selectedPosition || !selectedRole || !selectedDept} onClick={handleConfirm}>
                  {loading ? 'กำลังดำเนินการ...' : 'ยืนยันการเปลี่ยนแปลง'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast สำเร็จ */}
        {showSuccess && (
          <div className="success-notification" role="status" aria-live="polite">
            <div className="success-content">
              <div className="success-icon">✅</div>
              <p>อัปเดตตำแหน่ง/บทบาทสำเร็จแล้ว</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
