import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar_HR from '../../../Component/HR/Sidebar_HR'
import './MainHR.css'

const MainHR = () => {
  const navigate = useNavigate();
  // ดึง currentUser จาก localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const [users, setUsers] = useState([]);
  const [employeeList, setEmployeeList] = useState([]); // เพิ่ม state สำหรับ employee จริง
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [deleteError, setDeleteError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [editError, setEditError] = useState("");
  const [activeTab, setActiveTab] = useState('dashboard');

  // โหลด users จาก localStorage (ถ้าไม่มี Admin/CHRO ให้สร้างไว้)
  useEffect(() => {
    let users = JSON.parse(localStorage.getItem("users") || "[]");
    let changed = false;
    // ตรวจสอบว่ามี Admin กับ CHRO หรือยัง ถ้าไม่มีก็เพิ่ม
    if (!users.some(u => u.username === "Admin")) {
      users.push({ username: "Admin", password: "123456", firstName: "Admin", lastName: "", email: "admin@example.com", role: "Admin", empId: "A001" });
      changed = true;
    }
    if (!users.some(u => u.username === "CHRO")) {
      users.push({ username: "CHRO", password: "0123", firstName: "CHRO", lastName: "", email: "chro@example.com", role: "CHRO", empId: "C001" });
      changed = true;
    }
    // ลบ user อื่นๆ ที่ไม่ใช่ Admin หรือ CHRO
    // users = users.filter(u => u.username === "Admin" || u.username === "CHRO"); // <--- ยกเลิกการลบ user อื่นๆ
    if (changed) {
      localStorage.setItem("users", JSON.stringify(users));
    }
    setUsers(users);

    // ดึง employeeList จาก localStorage (merge 3 list)
    const personalList = JSON.parse(localStorage.getItem("emp_personal_list") || "[]");
    const infoList = JSON.parse(localStorage.getItem("emp_info_list") || "[]");
    const eduList = JSON.parse(localStorage.getItem("emp_education_list") || "[]");
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
  }, [activeTab, selectedUser]);

  // ฟิลเตอร์ user ตาม search (เพิ่ม empId ด้วย)
  const filteredUsers = users.filter(
    u =>
      (u.username && u.username.toLowerCase().includes(search.toLowerCase())) ||
      (u.firstName && u.firstName.toLowerCase().includes(search.toLowerCase())) ||
      (u.lastName && u.lastName.toLowerCase().includes(search.toLowerCase())) ||
      (u.empId && u.empId.toLowerCase().includes(search.toLowerCase()))
  );

  // สร้างกลุ่ม users ตาม role
  const groupedUsers = filteredUsers.reduce((acc, user) => {
    const role = user.role || "Other";
    if (!acc[role]) acc[role] = [];
    acc[role].push(user);
    return acc;
  }, {});

  // ฟังก์ชันแก้ไข user
  const handleEditSave = () => {
    const updatedUsers = users.map(u =>
      u.username === editForm.username ? editForm : u
    );
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    setSelectedUser(editForm);
    setEditMode(false);
    setShowEditConfirm(false);
    setEditPassword("");
    setEditError("");
  };

  // ฟังก์ชันลบ user (แก้ไขใหม่)
  const handleDelete = (username) => {
    setShowDeleteConfirm(true);
    setDeleteError("");
  };

  // ฟังก์ชันยืนยันการลบ
  const confirmDelete = () => {
    // ตรวจสอบรหัสผ่านกับ currentUser (ต้องเป็น HR หรือ Admin)
    if (
      (currentUser.role === "Admin" || currentUser.role === "HR") &&
      deletePassword === currentUser.password // สมมติ password เก็บใน currentUser
    ) {
      const updatedUsers = users.filter(u => u.username !== selectedUser.username);
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      setSelectedUser(null);
      setEditMode(false);
      setShowDeleteConfirm(false);
      setDeletePassword("");
      setDeleteError("");
    } else {
      setDeleteError("รหัสผ่านไม่ถูกต้อง หรือคุณไม่มีสิทธิ์ลบข้อมูลนี้");
    }
  };

  // ฟังก์ชันยืนยันสิทธิ์แก้ไข
  const confirmEdit = () => {
    if (
      (currentUser.role === "Admin" || currentUser.role === "HR") &&
      editPassword === currentUser.password
    ) {
      setEditForm(selectedUser);
      setEditMode(true);
      setShowEditConfirm(false);
      setEditPassword("");
      setEditError("");
    } else {
      setEditError("รหัสผ่านไม่ถูกต้อง หรือคุณไม่มีสิทธิ์แก้ไขข้อมูลนี้");
    }
  };

  // ฟังก์ชันเพิ่ม user ใหม่
  const handleCreateUser = () => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const newUser = {
      username,
      password,
      firstName,
      lastName,
      email,
      role,
      empId, // <-- ต้องมีบรรทัดนี้!
    };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    // ...อื่นๆ
  };

  // เพิ่ม useEffect สำหรับปิด modal/แก้ไขเมื่อเปลี่ยน tab
  useEffect(() => {
    if (editMode || selectedUser) {
      setEditMode(false);
      setSelectedUser(null);
      setShowEditConfirm(false);
      setShowDeleteConfirm(false);
      setEditPassword("");
      setDeletePassword("");
      setEditError("");
      setDeleteError("");
    }
    // eslint-disable-next-line
  }, [activeTab]);

  // Header + Navigation Tabs
  return (
    <div className="mainhr-root">
      <Sidebar_HR />
      <div className="mainhr-wrapper">
        <header className="mainhr-header">
          <div className="mainhr-title">HR Dashboard</div>
          <span className="mainhr-subtitle">Human Resources Management</span>
          <div className="mainhr-user">
            <span>{currentUser.firstName} {currentUser.lastName}</span>
            <span>{currentUser.role}</span>
            <button className="mainhr-logout-btn" onClick={() => { localStorage.removeItem('currentUser'); navigate('/login'); }}>Logout</button>
          </div>
        </header>
        <nav className="mainhr-nav">
          <button className={`mainhr-nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><span className="mainhr-nav-icon">📊</span> Dashboard</button>
          <button className={`mainhr-nav-tab ${activeTab === 'employees' ? 'active' : ''}`} onClick={() => setActiveTab('employees')}><span className="mainhr-nav-icon">👥</span> User</button>
          <button className={`mainhr-nav-tab ${activeTab === 'leave' ? 'active' : ''}`} onClick={() => setActiveTab('leave')}><span className="mainhr-nav-icon">🗓️</span> Leave/Attendance</button>
          <button className={`mainhr-nav-tab ${activeTab === 'activities' ? 'active' : ''}`} onClick={() => setActiveTab('activities')}><span className="mainhr-nav-icon">🕒</span> Activities</button>
        </nav>
        <main className="mainhr-main">
          {activeTab === 'dashboard' && (
            <div className="mainhr-dashboard-content">
              <div className="mainhr-metrics-grid">
                <div className="mainhr-metric-card mainhr-metric-users">
                  <div className="mainhr-metric-icon">👥</div>
                  <div>
                    <h3>{employeeList.length}</h3>
                    <p>พนักงานทั้งหมด</p>
                  </div>
                </div>
                <div className="mainhr-metric-card mainhr-metric-users">
                  <div className="mainhr-metric-icon">🧑‍💻</div>
                  <div>
                    <h3>{users.length}</h3>
                    <p>User ที่ถูกสร้าง</p>
                  </div>
                </div>
              </div>
              <div className="mainhr-dashboard-flex">
                <div className="mainhr-leave-chart-box">
                  <h3>สถิติการลา</h3>
                  <div className="mainhr-leave-progress-circles">
                    <span>รอข้อมูลจากระบบ...</span>
                  </div>
                </div>
                <div className="mainhr-activity-timeline">
                  <h3>กิจกรรมล่าสุด</h3>
                  <ul className="mainhr-timeline-list">
                    <li><span>รอข้อมูลจากระบบ...</span></li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'employees' && (
            <div className="mainhr-employees-content">
              <div className="mainhr-employees-header">
                <h2>การจัดการพนักงาน</h2>
                <div className="mainhr-search-filters">
                  <input type="text" placeholder="🔍 ค้นหาพนักงาน..." value={search} onChange={e => setSearch(e.target.value)} className="mainhr-search-input" />
                </div>
              </div>
              <div className="mainhr-employees-grid">
                {filteredUsers.length === 0 && (
                  <div className="mainhr-employee-empty">ไม่พบพนักงานที่ค้นหา</div>
                )}
                {filteredUsers.map(u => (
                  <div key={u.username} className="mainhr-employee-card" onClick={() => { setSelectedUser(u); setEditMode(false); }}>
                    <div className="mainhr-employee-avatar">{u.firstName?.charAt(0)}{u.lastName?.charAt(0)}</div>
                    <div className="mainhr-employee-details">
                      <h4>{u.firstName} {u.lastName}</h4>
                      <p className="mainhr-employee-id">ID: {u.empId || 'N/A'}</p>
                      <p className="mainhr-employee-role">{u.role}</p>
                      <p className="mainhr-employee-dept">{u.department || 'General'}</p>
                    </div>
                    <div className="mainhr-employee-status"><span className="mainhr-status-badge mainhr-active">Active</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'leave' && (
            <div className="mainhr-leave-content">
              <h2>สถิติการลา/ขาดงาน</h2>
              <div className="mainhr-leave-table-section">
                <span>รอข้อมูลจากระบบ...</span>
              </div>
            </div>
          )}
          {activeTab === 'activities' && (
            <div className="mainhr-activities-content">
              <h2>กิจกรรม HR ทั้งหมด</h2>
              <ul className="mainhr-timeline-list mainhr-timeline-list-full">
                <li><span>รอข้อมูลจากระบบ...</span></li>
              </ul>
            </div>
          )}
          {/* Modal ดู/แก้ไข/ลบ User */}
          {selectedUser && (
            <div className="mainhr-modal-overlay" onClick={() => { setSelectedUser(null); setEditMode(false); setShowDeleteConfirm(false); setShowEditConfirm(false); }}>
              <div className="mainhr-modal-content mainhr-modal-employee" onClick={e => e.stopPropagation()}>
                <div className="mainhr-modal-avatar-box">
                  <div className="mainhr-modal-avatar">{selectedUser.firstName?.charAt(0)}{selectedUser.lastName?.charAt(0)}</div>
                  <div className="mainhr-modal-name">{selectedUser.firstName} {selectedUser.lastName}</div>
                  <div className="mainhr-modal-role">{selectedUser.role}</div>
                </div>
                <div className="mainhr-modal-divider"></div>
                {editMode ? (
                  <div className="mainhr-modal-form mainhr-modal-form-grid mainhr-editform-modal">
                    <h3 className="mainhr-editform-title">แก้ไขข้อมูล</h3>
                    <label className="mainhr-editform-label">
                      First Name
                      <input value={editForm.firstName} onChange={e => setEditForm({ ...editForm, firstName: e.target.value })} className="mainhr-input mainhr-editform-input" />
                    </label>
                    <label className="mainhr-editform-label">
                      Last Name
                      <input value={editForm.lastName} onChange={e => setEditForm({ ...editForm, lastName: e.target.value })} className="mainhr-input mainhr-editform-input" />
                    </label>
                    <label className="mainhr-editform-label">
                      Email
                      <input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="mainhr-input mainhr-editform-input" />
                    </label>
                    <label className="mainhr-editform-label">
                      Role
                      <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })} className="mainhr-input mainhr-editform-input">
                        <option value="Admin">Admin</option>
                        <option value="HR">HR</option>
                        <option value="Manager">Manager</option>
                        <option value="Employee">Employee</option>
                      </select>
                    </label>
                    <label className="mainhr-editform-label">
                      Employee ID
                      <input value={editForm.empId || ""} onChange={e => setEditForm({ ...editForm, empId: e.target.value })} className="mainhr-input mainhr-editform-input" />
                    </label>
                    <label className="mainhr-editform-label">
                      Tel
                      <input value={editForm.telephone || ""} onChange={e => setEditForm({ ...editForm, telephone: e.target.value })} className="mainhr-input mainhr-editform-input" />
                    </label>
                    <div className="mainhr-modal-btn-group mainhr-modal-btn-group-right mainhr-editform-btn-group">
                      <button className="mainhr-edit-btn mainhr-editform-btn" onClick={handleEditSave}>บันทึก</button>
                      <button className="mainhr-cancel-btn mainhr-editform-btn" onClick={() => setEditMode(false)}>ยกเลิก</button>
                    </div>
                  </div>
                ) : (
                  <div className="mainhr-modal-info">
                    <div className="mainhr-modal-row"><span className="mainhr-modal-label">Username:</span> {selectedUser.username}</div>
                    <div className="mainhr-modal-row"><span className="mainhr-modal-label">Email:</span> {selectedUser.email}</div>
                    <div className="mainhr-modal-row"><span className="mainhr-modal-label">Role:</span> {selectedUser.role}</div>
                    <div className="mainhr-modal-row"><span className="mainhr-modal-label">Employee ID:</span> {selectedUser.empId || "-"}</div>
                    <div className="mainhr-modal-row"><span className="mainhr-modal-label">Tel:</span> {selectedUser.telephone || "-"}</div>
                    <div className="mainhr-modal-btn-group">
                      <button className="mainhr-edit-btn" onClick={() => setShowEditConfirm(true)}>แก้ไข</button>
                      <button className="mainhr-delete-btn" onClick={handleDelete}>ลบ</button>
                      <button className="mainhr-cancel-btn" onClick={() => setSelectedUser(null)}>ปิด</button>
                    </div>
                    {editError && <div className="mainhr-modal-error">{editError}</div>}
                    {showEditConfirm && (
                      <div className="mainhr-modal-confirm mainhr-modal-confirm-edit" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '24px 18px 18px 18px', margin: '18px 0 0 0' }}>
                        <div style={{ fontWeight: 600, fontSize: '1.08rem', marginBottom: 10, textAlign: 'center' }}>กรุณาใส่รหัสผ่านของ HR หรือ Admin เพื่อยืนยันการแก้ไข</div>
                        <input
                          type="password"
                          value={editPassword}
                          onChange={e => setEditPassword(e.target.value)}
                          placeholder="Password"
                          style={{ width: 220, padding: '10px 14px', borderRadius: 8, border: '2px solid #90caf9', fontSize: '1.08rem', marginBottom: 12, background: '#23272f', color: '#e0e0e0', textAlign: 'center' }}
                          className="mainhr-input"
                        />
                        <div className="mainhr-modal-btn-group" style={{ display: 'flex', gap: 10, justifyContent: 'center', width: '100%' }}>
                          <button className="mainhr-edit-btn" style={{ minWidth: 90 }} onClick={confirmEdit}>ยืนยันแก้ไข</button>
                          <button className="mainhr-cancel-btn" style={{ minWidth: 90 }} onClick={() => { setShowEditConfirm(false); setEditPassword(''); setEditError(''); }}>ยกเลิก</button>
                        </div>
                      </div>
                    )}
                    {deleteError && <div className="mainhr-modal-error">{deleteError}</div>}
                    {showDeleteConfirm && (
                      <div className="mainhr-modal-confirm mainhr-modal-confirm-delete">
                        <div>กรุณาใส่รหัสผ่านของ HR หรือ Admin เพื่อยืนยันการลบ</div>
                        <input type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} placeholder="Password" />
                        <div className="mainhr-modal-btn-group">
                          <button className="mainhr-delete-btn" onClick={confirmDelete}>ยืนยันลบ</button>
                          <button className="mainhr-cancel-btn" onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }}>ยกเลิก</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default MainHR
