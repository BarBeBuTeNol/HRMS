import React, { useState, useEffect, useMemo } from 'react';
import SidebarCHRO from '../../../Component/CHRO/SidebarCHRO';
import './Show-Log.css';

const ShowLog = () => {
  // state ทั้งหมดถูกจำกัดการใช้งานในหน้านี้เท่านั้น
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  // mock data
  useEffect(() => {
    const mockLogs = [
      { id: 1, timestamp: '2024-01-15 09:30:15', action: 'LOGIN', user: 'สมชาย ใจดี', userId: 'EMP001', details: 'เข้าสู่ระบบด้วย role Employee', ip: '192.168.1.100', status: 'SUCCESS' },
      { id: 2, timestamp: '2024-01-15 10:15:22', action: 'LEAVE_REQUEST', user: 'สมหญิง รักงาน', userId: 'HR001', details: 'ส่งคำขอลาป่วย วันที่ 2024-01-20', ip: '192.168.1.105', status: 'PENDING' },
      { id: 3, timestamp: '2024-01-15 11:45:33', action: 'EMPLOYEE_UPDATE', user: 'วิชัย มุ่งมั่น', userId: 'CHRO001', details: 'อัปเดตข้อมูลพนักงาน EMP003 - เปลี่ยนตำแหน่งเป็น Senior Developer', ip: '192.168.1.102', status: 'SUCCESS' },
      { id: 4, timestamp: '2024-01-15 14:20:11', action: 'ANNOUNCEMENT', user: 'รัตนา สดใส', userId: 'HR002', details: 'สร้างประกาศเรื่อง "การอบรมพัฒนาทักษะ Q1 2024"', ip: '192.168.1.110', status: 'SUCCESS' },
      { id: 5, timestamp: '2024-01-15 16:05:44', action: 'LOGOUT', user: 'ธนวัฒน์ เก่งกล้า', userId: 'MGR001', details: 'ออกจากระบบ', ip: '192.168.1.115', status: 'SUCCESS' },
      { id: 6, timestamp: '2024-01-14 08:15:20', action: 'FAILED_LOGIN', user: 'Unknown', userId: 'N/A', details: 'ความพยายามเข้าสู่ระบบที่ล้มเหลว - รหัสผ่านไม่ถูกต้อง', ip: '192.168.1.200', status: 'FAILED' },
      { id: 7, timestamp: '2024-01-14 13:30:15', action: 'POSITION_CHANGE', user: 'สมชาย ใจดี', userId: 'CHRO001', details: 'เปลี่ยนตำแหน่ง EMP005 จาก Junior Developer เป็น Mid-level Developer', ip: '192.168.1.102', status: 'SUCCESS' },
      { id: 8, timestamp: '2024-01-14 15:45:30', action: 'LEAVE_APPROVAL', user: 'วิชัย มุ่งมั่น', userId: 'CHRO001', details: 'อนุมัติการลาของ EMP002 วันที่ 2024-01-18', ip: '192.168.1.102', status: 'SUCCESS' },
    ];

    const timer = setTimeout(() => {
      setLogs(mockLogs);
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  // กรองข้อมูล (memo เพื่อประสิทธิภาพ)
  const filteredLogs = useMemo(() => {
    let filtered = logs;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter((log) =>
        log.user.toLowerCase().includes(q) ||
        log.userId.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.ip.toLowerCase().includes(q)
      );
    }

    if (selectedFilter !== 'all') {
      filtered = filtered.filter((log) => log.action === selectedFilter);
    }

    return filtered;
  }, [logs, searchTerm, selectedFilter]);

  // pagination
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage) || 1;
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);

  const goPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    // เลื่อนขึ้นเล็กน้อยเวลาเปลี่ยนหน้า
    const content = document.querySelector('.show-log-page .show-log-content');
    if (content) content.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // สถิติ
  const successCount = useMemo(() => filteredLogs.filter((l) => l.status === 'SUCCESS').length, [filteredLogs]);
  const failedCount = useMemo(() => filteredLogs.filter((l) => l.status === 'FAILED').length, [filteredLogs]);
  const pendingCount = useMemo(() => filteredLogs.filter((l) => l.status === 'PENDING').length, [filteredLogs]);

  // mapping คลาสสำหรับ badge (ทั้งหมดไปจัดสีใน CSS)
  const getStatusClass = (status) => `status-badge ${String(status || '').toLowerCase()}`;
  const getActionClass = (action) => `action-badge action-${String(action || '').toLowerCase()}`;

  if (loading) {
    return (
      <div className="show-log-page">
        <SidebarCHRO />
        <div className="show-log-content">
          <div className="loading">
            <div className="loading__spinner" />
            <p className="loading__text">กำลังโหลดข้อมูล Log...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="show-log-page">
      <SidebarCHRO />

      <main className="show-log-content" role="main">
        {/* Header */}
        <header className="sl-header">
          <h1 className="sl-title">
            <span className="sl-title__icon" aria-hidden="true">📋</span>
            ประวัติการใช้งานระบบ
          </h1>
          <p className="sl-subtitle">ตรวจสอบและติดตามกิจกรรมของผู้ใช้งานทั้งหมดในระบบ</p>
        </header>

        {/* Controls */}
        <section className="sl-controls" aria-label="ตัวกรองและค้นหา">
          <div className="sl-search">
            <input
              type="text"
              className="sl-input"
              placeholder="ค้นหาตามชื่อผู้ใช้, ID, กิจกรรม, รายละเอียด หรือ IP..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="กล่องค้นหา"
            />
            {searchTerm && (
              <button
                className="sl-btn sl-btn--ghost"
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                aria-label="ล้างคำค้นหา"
              >
                ล้าง
              </button>
            )}
          </div>

          <div className="sl-filter">
            <select
              value={selectedFilter}
              onChange={(e) => {
                setSelectedFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="sl-select"
              aria-label="เลือกประเภทกิจกรรม"
            >
              <option value="all">ทุกกิจกรรม</option>
              <option value="LOGIN">เข้าสู่ระบบ</option>
              <option value="LOGOUT">ออกจากระบบ</option>
              <option value="LEAVE_REQUEST">คำขอลา</option>
              <option value="LEAVE_APPROVAL">อนุมัติการลา</option>
              <option value="EMPLOYEE_UPDATE">อัปเดตข้อมูลพนักงาน</option>
              <option value="POSITION_CHANGE">เปลี่ยนตำแหน่ง</option>
              <option value="ANNOUNCEMENT">ประกาศ</option>
              <option value="FAILED_LOGIN">เข้าสู่ระบบไม่สำเร็จ</option>
            </select>
          </div>
        </section>

        {/* Stats */}
        <section className="sl-stats" aria-label="สถิติ log">
          <article className="sl-stat">
            <div className="sl-stat__number">{filteredLogs.length}</div>
            <div className="sl-stat__label">รายการทั้งหมด</div>
          </article>
          <article className="sl-stat sl-stat--success">
            <div className="sl-stat__number">{successCount}</div>
            <div className="sl-stat__label">สำเร็จ</div>
          </article>
          <article className="sl-stat sl-stat--failed">
            <div className="sl-stat__number">{failedCount}</div>
            <div className="sl-stat__label">ล้มเหลว</div>
          </article>
          <article className="sl-stat sl-stat--pending">
            <div className="sl-stat__number">{pendingCount}</div>
            <div className="sl-stat__label">รอดำเนินการ</div>
          </article>
        </section>

        {/* Table */}
        {filteredLogs.length > 0 ? (
          <section className="sl-table__wrap" aria-label="ตารางประวัติการใช้งาน">
            <table className="sl-table">
              <thead>
                <tr>
                  <th>เวลา</th>
                  <th>กิจกรรม</th>
                  <th>ผู้ใช้</th>
                  <th>รหัสผู้ใช้</th>
                  <th>รายละเอียด</th>
                  <th>IP Address</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {currentLogs.map((log) => (
                  <tr key={log.id} className="sl-row">
                    <td data-label="เวลา" className="cell-time">{log.timestamp}</td>
                    <td data-label="กิจกรรม" className="cell-action">
                      <span className={getActionClass(log.action)}>{log.action}</span>
                    </td>
                    <td data-label="ผู้ใช้" className="cell-user">{log.user}</td>
                    <td data-label="รหัสผู้ใช้" className="cell-userid">{log.userId}</td>
                    <td data-label="รายละเอียด" className="cell-details">{log.details}</td>
                    <td data-label="IP Address" className="cell-ip">{log.ip}</td>
                    <td data-label="สถานะ" className="cell-status">
                      <span className={getStatusClass(log.status)}>
                        <span className="dot" aria-hidden="true" />
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : (
          <div className="sl-empty" aria-live="polite">
            <div className="sl-empty__icon" aria-hidden="true">📊</div>
            <h3>ไม่พบข้อมูล Log</h3>
            <p>ไม่มีข้อมูลที่ตรงกับเงื่อนไขการค้นหา</p>
          </div>
        )}

        {/* Pagination */}
        {filteredLogs.length > 0 && totalPages > 1 && (
          <nav className="sl-pagination" role="navigation" aria-label="เปลี่ยนหน้า">
            <button
              className="sl-pagebtn"
              onClick={() => goPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ก่อนหน้า
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  className={`sl-pagebtn ${page === currentPage ? 'is-active' : ''}`}
                  onClick={() => goPage(page)}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </button>
              );
            })}

            <button
              className="sl-pagebtn"
              onClick={() => goPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              ถัดไป
            </button>
          </nav>
        )}
      </main>
    </div>
  );
};

export default ShowLog;
