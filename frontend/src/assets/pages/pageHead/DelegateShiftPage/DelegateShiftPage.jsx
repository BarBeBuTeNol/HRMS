// src/assets/pages/pageHead/DelegateShift/DelegateShiftPage.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import HeadSidebar from "../../../Component/Head/HeadSidebar";
import api from "../../../../services/api"; // ✅ axios instance
import "./DelegateShiftPage.css";

export default function DelegateShiftPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [employees, setEmployees] = useState([]); // ดึงจาก DB
  const [leaveEmp, setLeaveEmp] = useState("");
  const [shiftDate, setShiftDate] = useState(moment().format("YYYY-MM-DD"));
  const [shiftType, setShiftType] = useState("A");
  const [delegate, setDelegate] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);

  const headUser = JSON.parse(localStorage.getItem("user")) || {};

 // ✅ โหลดรายชื่อพนักงานจาก backend (เฉพาะในแผนกของหัวหน้า)
useEffect(() => {
  const fetchEmployees = async () => {
    try {
      if (!headUser?.id) {
        console.error("❌ ไม่พบข้อมูลหัวหน้าใน localStorage");
        setEmployees([]);
        return;
      }

      const res = await api.get(`/api/users/head/${headUser.id}/employees`);
      setEmployees(res.data || []);
    } catch (err) {
      console.error("❌ โหลดรายชื่อพนักงานไม่สำเร็จ:", err);
    } finally {
      setLoading(false);
    }
  };
  fetchEmployees();
}, [headUser]);


  // ✅ ถ้ามี id ใน URL → set leaveEmp
  useEffect(() => {
    if (id) setLeaveEmp(id);
  }, [id]);

  useEffect(() => setDelegate(""), [leaveEmp]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!leaveEmp || !delegate) {
      alert("กรุณาเลือกพนักงานทั้ง 2 คน");
      return;
    }

    try {
      await api.post("/api/shift_assignments", {
        leave_emp_id: leaveEmp,
        delegate_emp_id: delegate,
        shift_date: shiftDate,
        shift_type: shiftType,
        note,
        created_by: headUser.id || 1,
      });

      alert("✅ บันทึกการมอบหมายเวรเรียบร้อย");
      navigate("/head/leave-approvals");
    } catch (err) {
      console.error("❌ Error saving shift assignment:", err);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  if (loading) return <div>⏳ กำลังโหลดรายชื่อพนักงาน...</div>;

  return (
    <div className="layout-container">
      <HeadSidebar />

      <main className="delegate-main">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← ย้อนกลับ
        </button>

        <h1>มอบหมายเวรแทน</h1>
        <form className="delegate-form" onSubmit={handleSubmit}>
          {/* --- ผู้ลาที่ต้องหาแทน --- */}
          <label>พนักงานที่ลา</label>
          <select
            value={leaveEmp}
            onChange={(e) => setLeaveEmp(e.target.value)}
          >
            <option value="">— เลือกพนักงาน —</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.id} {emp.name} ({emp.position})
              </option>
            ))}
          </select>

          {/* --- วัน & กะ --- */}
          <div className="row">
            <div>
              <label>วันที่</label>
              <input
                type="date"
                value={shiftDate}
                onChange={(e) => setShiftDate(e.target.value)}
              />
            </div>
            <div>
              <label>กะ</label>
              <select
                value={shiftType}
                onChange={(e) => setShiftType(e.target.value)}
              >
                <option value="A">กะเช้า (08:00-16:00)</option>
                <option value="B">กะบ่าย (16:00-00:00)</option>
                <option value="C">กะดึก (00:00-08:00)</option>
              </select>
            </div>
          </div>

          {/* --- ผู้รับเวร --- */}
          <label>มอบหมายให้</label>
          <select
            value={delegate}
            onChange={(e) => setDelegate(e.target.value)}
          >
            <option value="">— เลือกพนักงานที่มาทำแทน —</option>
            {employees
              .filter((emp) => emp.id !== leaveEmp)
              .map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.id} {emp.name} ({emp.position})
                </option>
              ))}
          </select>

          {/* --- หมายเหตุ --- */}
          <label>หมายเหตุ (ถ้ามี)</label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <button className="save-btn" type="submit">
            บันทึก & แจ้งเตือน
          </button>
        </form>
      </main>
    </div>
  );
}
