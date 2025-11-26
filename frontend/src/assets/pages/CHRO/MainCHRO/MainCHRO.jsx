import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarCHRO from '../../../Component/CHRO/SidebarCHRO';
import './MainCHRO.css';

const MainCHRO = () => {
  const navigate = useNavigate();

  /** ---------- State หลัก (เฉพาะหน้านี้) ---------- */
  const [currentUser, setCurrentUser] = useState({});
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    departments: 0,
    turnoverRate: 0,
    avgSalary: 0,
    genderDistribution: { male: 0, female: 0, other: 0 },
    ageDistribution: { '18-25': 0, '26-35': 0, '36-45': 0, '46-55': 0, '55+': 0 },
    departmentStats: []
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  /** ---------- ค้นหา / กรอง / จัดเรียง / แบ่งหน้า (เฉพาะหน้านี้) ---------- */
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [chroViewMode, setChroViewMode] = useState('grid'); // 'grid' | 'list'
  const [chroSortKey, setChroSortKey] = useState('name');   // 'name' | 'empId' | 'role' | 'department'
  const [chroSortDir, setChroSortDir] = useState('asc');    // 'asc' | 'desc'
  const [chroPage, setChroPage] = useState(1);
  const [chroPageSize, setChroPageSize] = useState(12);

  /** ---------- โมดัล ---------- */
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  /** ---------- Load ข้อมูล (ยึดตามหน้าเดิม) ---------- */
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setCurrentUser(user);

    const storedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
    setEmployees(storedEmployees);

    if (storedEmployees.length === 0) {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const employeeUsers = users.filter(u => u.role === 'Employee' || u.role === 'Manager');
      setEmployees(employeeUsers);
    }

    const mockDepartments = [
      { id: 1, name: 'Human Resources', count: 12, budget: 850000 },
      { id: 2, name: 'Engineering', count: 45, budget: 3200000 },
      { id: 3, name: 'Marketing', count: 18, budget: 1200000 },
      { id: 4, name: 'Sales', count: 25, budget: 1800000 },
      { id: 5, name: 'Finance', count: 15, budget: 950000 },
      { id: 6, name: 'Operations', count: 30, budget: 2100000 }
    ];
    setDepartments(mockDepartments);

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const employeeUsers = users.filter(u => u.role === 'Employee' || u.role === 'Manager');
    generateAnalytics(storedEmployees.length > 0 ? storedEmployees : employeeUsers, mockDepartments);

    generateRecentActivities();
  }, []);

  /** ---------- Analytics & Activities (คงแนวเดิม) ---------- */
  const generateAnalytics = (empData, deptData) => {
    const total = empData.length;
    const active = Math.floor(total * 0.95);
    const turnover = 2.3;
    const avgSalary = 65000;

    const genderDist = {
      male: Math.floor(total * 0.52),
      female: Math.floor(total * 0.45),
      other: total - Math.floor(total * 0.52) - Math.floor(total * 0.45)
    };

    const ageDist = {
      '18-25': Math.floor(total * 0.15),
      '26-35': Math.floor(total * 0.35),
      '36-45': Math.floor(total * 0.30),
      '46-55': Math.floor(total * 0.15),
      '55+': Math.floor(total * 0.05)
    };

    setAnalytics({
      totalEmployees: total,
      activeEmployees: active,
      departments: deptData.length,
      turnoverRate: turnover,
      avgSalary,
      genderDistribution: genderDist,
      ageDistribution: ageDist,
      departmentStats: deptData
    });
  };

  const generateRecentActivities = () => {
    const activities = [
      { id: 1, type: 'hire', message: 'New employee John Smith hired in Engineering', time: '2 hours ago', icon: '👤' },
      { id: 2, type: 'promotion', message: 'Sarah Johnson promoted to Senior Manager', time: '1 day ago', icon: '📈' },
      { id: 3, type: 'training', message: 'Leadership training completed for 15 managers', time: '2 days ago', icon: '🎓' },
      { id: 4, type: 'review', message: 'Annual performance reviews completed', time: '3 days ago', icon: '📋' },
      { id: 5, type: 'policy', message: 'Updated remote work policy implemented', time: '1 week ago', icon: '📄' }
    ];
    setRecentActivities(activities);
  };

  /** ---------- Filter / Sort / Pagination ---------- */
  const filteredEmployees = useMemo(() => {
    const t = searchTerm.trim().toLowerCase();
    return employees.filter(emp => {
      const matchesSearch =
        emp.firstName?.toLowerCase().includes(t) ||
        emp.lastName?.toLowerCase().includes(t) ||
        emp.empId?.toLowerCase().includes(t);

      const matchesDept = filterDepartment === 'all' || emp.department === filterDepartment;
      return matchesSearch && matchesDept;
    });
  }, [employees, searchTerm, filterDepartment]);

  const sortedEmployees = useMemo(() => {
    const clone = [...filteredEmployees];
    const getKey = (e) => {
      if (chroSortKey === 'name') return `${e.firstName || ''} ${e.lastName || ''}`.trim().toLowerCase();
      if (chroSortKey === 'empId') return (e.empId || '').toString().toLowerCase();
      if (chroSortKey === 'role') return (e.role || '').toLowerCase();
      if (chroSortKey === 'department') return (e.department || '').toLowerCase();
      return '';
    };
    clone.sort((a, b) => {
      const A = getKey(a), B = getKey(b);
      if (A < B) return chroSortDir === 'asc' ? -1 : 1;
      if (A > B) return chroSortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return clone;
  }, [filteredEmployees, chroSortKey, chroSortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedEmployees.length / chroPageSize));

  useEffect(() => {
    // รีเซ็ตหน้า เมื่อผลลัพธ์เปลี่ยน
    setChroPage(1);
  }, [searchTerm, filterDepartment, chroSortKey, chroSortDir, chroPageSize]);

  const pagedEmployees = useMemo(() => {
    const start = (chroPage - 1) * chroPageSize;
    return sortedEmployees.slice(start, start + chroPageSize);
  }, [sortedEmployees, chroPage, chroPageSize]);

  /** ---------- Actions ---------- */
  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  const handleDeleteEmployee = (employee) => {
    setEmployeeToDelete(employee);
    setShowDeleteModal(true);
    setDeletePassword('');
    setDeleteError('');
  };

  const confirmDeleteEmployee = () => {
    if (deletePassword === '0123') {
      const updated = employees.filter(emp => emp.username !== employeeToDelete.username);
      setEmployees(updated);
      localStorage.setItem('employees', JSON.stringify(updated));

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.filter(u => u.username !== employeeToDelete.username);
      localStorage.setItem('users', JSON.stringify(updatedUsers));

      generateAnalytics(updated, departments);

      setShowDeleteModal(false);
      setShowEmployeeModal(false);
      setEmployeeToDelete(null);
      setDeletePassword('');
      setDeleteError('');
      alert(`พนักงาน ${employeeToDelete.firstName} ${employeeToDelete.lastName} ถูกลบออกเรียบร้อยแล้ว`);
    } else {
      setDeleteError('รหัสผ่านไม่ถูกต้อง กรุณาใส่รหัสผ่าน CHRO/HR ที่ถูกต้อง');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setEmployeeToDelete(null);
    setDeletePassword('');
    setDeleteError('');
  };

  const exportCurrentViewCSV = () => {
    const rows = [
      ['EmpID', 'First Name', 'Last Name', 'Role', 'Department', 'Email', 'Telephone'],
      ...sortedEmployees.map(e => [
        e.empId || '',
        e.firstName || '',
        e.lastName || '',
        e.role || '',
        e.department || '',
        e.email || '',
        e.telephone || ''
      ])
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'employees.csv';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  /** ---------- Helpers ---------- */
  const genderPct = (x) => analytics.totalEmployees ? Math.round((x / analytics.totalEmployees) * 100) : 0;

  return (
    <div className="main-chro-container">
      {/* Sidebar */}
      <SidebarCHRO />

      {/* Header */}
      <header className="chro-header" role="banner">
        <div className="header-content">
          <div className="header-left">
            <h1 className="chro-title">CHRO Dashboard</h1>
            <p className="chro-subtitle">Human Resources Management</p>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="user-name">{currentUser.firstName} {currentUser.lastName}</span>
              <span className="user-role">{currentUser.role}</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}><span>🚪</span> Logout</button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="chro-nav" aria-label="Primary">
        <button className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <span className="nav-icon">📊</span> Dashboard
        </button>
        <button className={`nav-tab ${activeTab === 'employees' ? 'active' : ''}`} onClick={() => setActiveTab('employees')}>
          <span className="nav-icon">👥</span> Employees
        </button>
        <button className={`nav-tab ${activeTab === 'departments' ? 'active' : ''}`} onClick={() => setActiveTab('departments')}>
          <span className="nav-icon">🏢</span> Departments
        </button>
        <button className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
          <span className="nav-icon">📈</span> Analytics
        </button>
      </nav>

      {/* Main */}
      <main className="chro-main">
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            <section className="metrics-grid" aria-label="KPI">
              <div className="metric-card">
                <div className="metric-icon">👥</div>
                <div className="metric-content">
                  <h3>{analytics.totalEmployees}</h3>
                  <p>พนักงานทั้งหมด</p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">✅</div>
                <div className="metric-content">
                  <h3>{analytics.activeEmployees}</h3>
                  <p>พนักงานที่ทำงานอยู่</p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">🏢</div>
                <div className="metric-content">
                  <h3>{analytics.departments}</h3>
                  <p>แผนก</p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">📊</div>
                <div className="metric-content">
                  <h3>{analytics.turnoverRate}%</h3>
                  <p>อัตราการลาออก</p>
                </div>
              </div>
            </section>

            <section className="charts-section">
              <div className="chart-container">
                <h3>การกระจายตามเพศ</h3>
                <div className="gender-chart">
                  <div className="gender-bar">
                    <div className="gender-label">Male</div>
                    <div className="gender-progress">
                      <div className="gender-fill male" style={{ '--w': `${genderPct(analytics.genderDistribution.male)}%` }} />
                    </div>
                    <div className="gender-percentage">{analytics.genderDistribution.male}</div>
                  </div>
                  <div className="gender-bar">
                    <div className="gender-label">Female</div>
                    <div className="gender-progress">
                      <div className="gender-fill female" style={{ '--w': `${genderPct(analytics.genderDistribution.female)}%` }} />
                    </div>
                    <div className="gender-percentage">{analytics.genderDistribution.female}</div>
                  </div>
                  <div className="gender-bar">
                    <div className="gender-label">Other</div>
                    <div className="gender-progress">
                      <div className="gender-fill other" style={{ '--w': `${genderPct(analytics.genderDistribution.other)}%` }} />
                    </div>
                    <div className="gender-percentage">{analytics.genderDistribution.other}</div>
                  </div>
                </div>
              </div>

              <div className="chart-container">
                <h3>การกระจายตามอายุ</h3>
                <div className="age-chart">
                  {Object.entries(analytics.ageDistribution).map(([range, count]) => {
                    const pct = analytics.totalEmployees ? Math.round((count / analytics.totalEmployees) * 100) : 0;
                    return (
                      <div key={range} className="age-bar">
                        <div className="age-label">{range}</div>
                        <div className="age-progress">
                          <div className="age-fill" style={{ '--w': `${pct}%` }} />
                        </div>
                        <div className="age-count">{count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="activities-section">
              <h3>กิจกรรมล่าสุด</h3>
              <div className="activities-list">
                {recentActivities.map(a => (
                  <div key={a.id} className="activity-item">
                    <div className="activity-icon">{a.icon}</div>
                    <div className="activity-content">
                      <p className="activity-message">{a.message}</p>
                      <span className="activity-time">{a.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* EMPLOYEES */}
        {activeTab === 'employees' && (
          <section className="employees-content">
            <div className="employees-header">
              <h2>การจัดการพนักงาน</h2>
              <div className="employees-toolbar">
                <input
                  type="text"
                  className="search-input"
                  placeholder="🔍 ค้นหาพนักงาน..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  className="filter-select"
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                >
                  <option value="all">ทุกแผนก</option>
                  {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>

                <select
                  className="sort-select"
                  value={chroSortKey}
                  onChange={(e) => setChroSortKey(e.target.value)}
                >
                  <option value="name">เรียงตามชื่อ</option>
                  <option value="empId">เรียงตามรหัส</option>
                  <option value="role">เรียงตามตำแหน่ง</option>
                  <option value="department">เรียงตามแผนก</option>
                </select>

                <button
                  className="sort-dir-btn"
                  aria-label="toggle sort direction"
                  onClick={() => setChroSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                >
                  {chroSortDir === 'asc' ? '⬆️ ASC' : '⬇️ DESC'}
                </button>

                <div className="view-toggle" role="group" aria-label="view mode">
                  <button
                    className={`view-btn ${chroViewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setChroViewMode('grid')}
                    title="Grid view"
                  >🗃️ Grid</button>
                  <button
                    className={`view-btn ${chroViewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setChroViewMode('list')}
                    title="List view"
                  >📋 List</button>
                </div>

                <select
                  className="page-size"
                  value={chroPageSize}
                  onChange={(e) => setChroPageSize(Number(e.target.value))}
                >
                  {[6, 12, 24, 48].map(n => <option key={n} value={n}>{n}/หน้า</option>)}
                </select>

                <button className="export-btn" onClick={exportCurrentViewCSV}>⬇️ Export CSV</button>
              </div>
            </div>

            {/* Grid Mode */}
            {chroViewMode === 'grid' && (
              <div className="employees-grid">
                {pagedEmployees.map(employee => (
                  <div key={employee.username || `${employee.firstName}-${employee.lastName}`} className="employee-card" onClick={() => handleEmployeeSelect(employee)}>
                    <div className="employee-avatar">{employee.firstName?.[0]}{employee.lastName?.[0]}</div>
                    <div className="employee-details">
                      <h4>{employee.firstName} {employee.lastName}</h4>
                      <p className="employee-id">ID: {employee.empId || 'N/A'}</p>
                      <p className="employee-role">{employee.role}</p>
                      <p className="employee-dept">{employee.department || 'General'}</p>
                    </div>
                    <div className="employee-status">
                      <span className="status-badge active">Active</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List Mode */}
            {chroViewMode === 'list' && (
              <div className="employees-table-wrap">
                <table className="employees-table">
                  <thead>
                    <tr>
                      <th>EmpID</th>
                      <th>ชื่อ-นามสกุล</th>
                      <th>ตำแหน่ง</th>
                      <th>แผนก</th>
                      <th>อีเมล</th>
                      <th>เบอร์โทร</th>
                      <th>สถานะ</th>
                      <th>จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedEmployees.map(emp => (
                      <tr key={emp.username || `${emp.firstName}-${emp.lastName}`}>
                        <td>{emp.empId || '—'}</td>
                        <td className="emp-name" onClick={() => handleEmployeeSelect(emp)}>
                          <span className="mini-avatar">{emp.firstName?.[0]}{emp.lastName?.[0]}</span>
                          {emp.firstName} {emp.lastName}
                        </td>
                        <td>{emp.role}</td>
                        <td>{emp.department || 'General'}</td>
                        <td>{emp.email || '—'}</td>
                        <td>{emp.telephone || '—'}</td>
                        <td><span className="status-badge active">Active</span></td>
                        <td className="row-actions">
                          <button className="row-btn view" onClick={() => handleEmployeeSelect(emp)}>ดู</button>
                          <button className="row-btn danger" onClick={() => handleDeleteEmployee(emp)}>ลบ</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            <div className="pagination">
              <button disabled={chroPage === 1} onClick={() => setChroPage(1)}>« First</button>
              <button disabled={chroPage === 1} onClick={() => setChroPage(p => Math.max(1, p - 1))}>‹ Prev</button>
              <span className="page-info">หน้า {chroPage} / {totalPages}</span>
              <button disabled={chroPage === totalPages} onClick={() => setChroPage(p => Math.min(totalPages, p + 1))}>Next ›</button>
              <button disabled={chroPage === totalPages} onClick={() => setChroPage(totalPages)}>Last »</button>
            </div>
          </section>
        )}

        {/* DEPARTMENTS */}
        {activeTab === 'departments' && (
          <section className="departments-content">
            <h2>ภาพรวมแผนก</h2>
            <div className="departments-grid">
              {departments.map(dept => {
                const score = Math.floor(Math.random() * 30) + 70;
                return (
                  <div key={dept.id} className="department-card">
                    <div className="department-header">
                      <h3>{dept.name}</h3>
                      <div className="performance-score">{score}%</div>
                    </div>
                    <div className="department-stats">
                      <div className="stat-item"><span className="stat-label">Employees</span><span className="stat-value">{dept.count}</span></div>
                      <div className="stat-item"><span className="stat-label">Budget</span><span className="stat-value">${(dept.budget/1000).toFixed(0)}K</span></div>
                      <div className="stat-item"><span className="stat-label">Avg Salary</span><span className="stat-value">${(dept.budget/dept.count).toFixed(0)}</span></div>
                    </div>
                    <div className="department-progress">
                      <div className="progress-bar"><div className="progress-fill" style={{ '--w': `${score}%` }} /></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ANALYTICS */}
        {activeTab === 'analytics' && (
          <section className="analytics-content">
            <h2>การวิเคราะห์ทรัพยากรบุคคล</h2>
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>Salary Analysis</h3>
                <div className="salary-stats">
                  <div className="salary-item"><span>Average Salary</span><strong>${analytics.avgSalary.toLocaleString()}</strong></div>
                  <div className="salary-item"><span>Median Salary</span><strong>${(analytics.avgSalary * 0.9).toLocaleString()}</strong></div>
                  <div className="salary-item"><span>Salary Range</span><strong>$45K - $120K</strong></div>
                </div>
              </div>
              <div className="analytics-card">
                <h3>Employee Retention</h3>
                <div className="retention-stats">
                  <div className="retention-item"><span>Turnover Rate</span><strong>{analytics.turnoverRate}%</strong></div>
                  <div className="retention-item"><span>Avg Tenure</span><strong>4.2 years</strong></div>
                  <div className="retention-item"><span>Retention Rate</span><strong>97.7%</strong></div>
                </div>
              </div>
              <div className="analytics-card">
                <h3>Recruitment Metrics</h3>
                <div className="recruitment-stats">
                  <div className="recruitment-item"><span>Time to Hire</span><strong>23 days</strong></div>
                  <div className="recruitment-item"><span>Cost per Hire</span><strong>$4,200</strong></div>
                  <div className="recruitment-item"><span>Offer Acceptance</span><strong>87%</strong></div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Employee Modal */}
      {showEmployeeModal && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setShowEmployeeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>รายละเอียดพนักงาน</h3>
              <button className="modal-close" onClick={() => setShowEmployeeModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="employee-modal-info">
                <div className="info-row"><span className="info-label">ชื่อ:</span><span className="info-value">{selectedEmployee.firstName} {selectedEmployee.lastName}</span></div>
                <div className="info-row"><span className="info-label">รหัสพนักงาน:</span><span className="info-value">{selectedEmployee.empId || 'ไม่มีข้อมูล'}</span></div>
                <div className="info-row"><span className="info-label">ตำแหน่ง:</span><span className="info-value">{selectedEmployee.role}</span></div>
                <div className="info-row"><span className="info-label">แผนก:</span><span className="info-value">{selectedEmployee.department || 'ทั่วไป'}</span></div>
                <div className="info-row"><span className="info-label">อีเมล:</span><span className="info-value">{selectedEmployee.email || 'ไม่มีข้อมูล'}</span></div>
                <div className="info-row"><span className="info-label">เบอร์โทร:</span><span className="info-value">{selectedEmployee.telephone || 'ไม่มีข้อมูล'}</span></div>
              </div>
              <div className="modal-actions">
                <button className="delete-employee-btn" onClick={() => handleDeleteEmployee(selectedEmployee)}>🗑️ ลบพนักงาน</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteModal && employeeToDelete && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚠️ ลบพนักงาน</h3>
              <button className="modal-close" onClick={cancelDelete}>×</button>
            </div>
            <div className="modal-body">
              <div className="delete-warning">
                <p>คุณแน่ใจหรือไม่ที่จะลบพนักงานคนนี้?</p>
                <div className="employee-to-delete">
                  <strong>{employeeToDelete.firstName} {employeeToDelete.lastName}</strong>
                  <span>รหัส: {employeeToDelete.empId || 'ไม่มีข้อมูล'}</span>
                  <span>ตำแหน่ง: {employeeToDelete.role}</span>
                </div>
                <p className="warning-text">การดำเนินการนี้ไม่สามารถยกเลิกได้!</p>
              </div>
              <div className="password-confirmation">
                <label htmlFor="deletePassword">ใส่รหัสผ่าน CHRO/HR เพื่อยืนยัน:</label>
                <input
                  id="deletePassword"
                  type="password"
                  className="password-input"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="ใส่รหัสผ่าน (0123)"
                />
                {deleteError && <p className="error-message">{deleteError}</p>}
              </div>
              <div className="delete-actions">
                <button className="cancel-btn" onClick={cancelDelete}>❌ ยกเลิก</button>
                <button className="confirm-delete-btn" onClick={confirmDeleteEmployee}>🗑️ ลบพนักงาน</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MainCHRO;
