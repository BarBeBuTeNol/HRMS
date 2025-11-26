import { useState, useEffect } from "react";
import moment from "moment";
import HeadSidebar from "../../../Component/Head/HeadSidebar";
import {
  getWorkSchedules,
  getEmployees,
  bulkUpsertWorkSchedules,
  deleteScheduleByDate,
} from "../../../api/scheduleApi";
import "./HeadSchedulePage.css";

export default function HeadSchedulePage() {
  const [employees, setEmployees] = useState([]);
  const [schedules, setSchedules] = useState({});
  const [selectedShift, setSelectedShift] = useState("");
  const [selectedCell, setSelectedCell] = useState(null);
  const [dirty, setDirty] = useState(false);

  // ✅ เพิ่ม state เดือน/ปี ที่เลือก
  const [selectedMonth, setSelectedMonth] = useState(moment().month() + 1);
  const [selectedYear, setSelectedYear] = useState(moment().year());

  const currentMonth = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;
  const daysInMonth = moment(currentMonth, "YYYY-MM").daysInMonth();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // ✅ โหลดพนักงาน
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const departmentId =
          JSON.parse(localStorage.getItem("user"))?.department_id || 2;
        const data = await getEmployees(departmentId);
        setEmployees(data);
      } catch (err) {
        console.error("โหลดพนักงานล้มเหลว:", err);
      }
    };
    fetchEmployees();
  }, []);

  // ✅ โหลดตารางงาน
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await getWorkSchedules();
        const map = {};
        res.forEach((item) => {
          const key = `${item.user_id}-${item.date}`;
          map[key] = item.shift;
        });
        setSchedules(map);
      } catch (err) {
        console.error("โหลดตารางงานล้มเหลว:", err);
      }
    };
    fetchSchedules();
  }, [selectedMonth, selectedYear]);

  // ✅ คลิกช่องตาราง
  const handleCellClick = (emp, day) => {
    const date = moment(`${currentMonth}-${String(day).padStart(2, "0")}`).format(
      "YYYY-MM-DD"
    );
    setSelectedCell({ emp, date });
    const key = `${emp.id}-${date}`;
    setSelectedShift(schedules[key] || "");
  };

  // ✅ บันทึกกะ (เฉพาะ state)
  const handleSaveShift = async () => {
    if (!selectedCell || !selectedShift) {
      setSelectedCell(null);
      return;
    }

    const key = `${selectedCell.emp.id}-${selectedCell.date}`;
    const newSchedules = {
      ...schedules,
      [key]: selectedShift,
    };
    setSchedules(newSchedules);
    setDirty(true);
    setSelectedCell(null);
  };

  // ✅ บันทึกจริงเข้า DB
  const handleBroadcast = async () => {
    try {
      const payload = Object.entries(schedules).map(([key, shift]) => {
        const [user_id, date] = key.split("-");
        return {
          user_id: Number(user_id),
          date,
          shift,
          department_id:
            JSON.parse(localStorage.getItem("user"))?.department_id || 2,
        };
      });
      await bulkUpsertWorkSchedules(payload);
      alert("✅ บันทึกข้อมูลเรียบร้อยแล้ว");
      setDirty(false);
    } catch (err) {
      console.error("Broadcast error:", err);
      alert("❌ เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  // ✅ ลบรายวัน
  const handleDeleteByDate = async (day) => {
    const date = moment(`${currentMonth}-${String(day).padStart(2, "0")}`).format(
      "YYYY-MM-DD"
    );
    if (!window.confirm(`ต้องการลบตารางวันที่ ${date} หรือไม่?`)) return;

    try {
      await deleteScheduleByDate(date);
      const newSchedules = Object.fromEntries(
        Object.entries(schedules).filter(([key]) => !key.includes(date))
      );
      setSchedules(newSchedules);
      alert("🗑️ ลบข้อมูลสำเร็จ");
    } catch (err) {
      console.error("Delete error:", err);
      alert("❌ ลบไม่สำเร็จ");
    }
  };

  // ✅ เปลี่ยนเดือน/ปี
  const handleChangeMonth = (e) => setSelectedMonth(Number(e.target.value));
  const handleChangeYear = (e) => setSelectedYear(Number(e.target.value));

  return (
    <div className="layout-container">
      <HeadSidebar />
      <main className="main-content">
        <h1 className="page-title">📅 ตารางการทำงานประจำเดือน</h1>

        {/* ✅ ส่วนเลือกเดือนและปี */}
        <div className="month-year-selector">
          <select value={selectedMonth} onChange={handleChangeMonth}>
            {moment.months().map((m, i) => (
              <option key={i} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <select value={selectedYear} onChange={handleChangeYear}>
            {Array.from({ length: 5 }, (_, i) => moment().year() - 2 + i).map(
              (y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              )
            )}
          </select>
        </div>

        {/* ปุ่มบันทึก */}
        <div className="button-group">
          <button
            className="btn-notify"
            disabled={!dirty}
            onClick={handleBroadcast}
            style={{ background: dirty ? "#4fc3f7" : "#777" }}
          >
            บันทึกการเปลี่ยนแปลง
          </button>
        </div>

        {/* ตาราง */}
        <div className="table-container">
          <table className="schedule-table">
            <thead>
              <tr>
                <th>ชื่อพนักงาน</th>
                {daysArray.map((day) => (
                  <th key={day}>
                    {moment(`${currentMonth}-${day}`, "YYYY-MM-DD").format("dd")}
                    <br />
                    {day}
                    <button
                      className="delete-day-btn"
                      onClick={() => handleDeleteByDate(day)}
                    >
                      ❌
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td className="emp-name">{emp.name}</td>
                  {daysArray.map((day) => {
                    const date = moment(
                      `${currentMonth}-${String(day).padStart(2, "0")}`
                    ).format("YYYY-MM-DD");
                    const key = `${emp.id}-${date}`;
                    return (
                      <td
                        key={key}
                        className={`cell ${
                          schedules[key]
                            ? `shift-${schedules[key]}`
                            : "shift-none"
                        }`}
                        onClick={() => handleCellClick(emp, day)}
                      >
                        {schedules[key] || ""}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Popup */}
        {selectedCell && (
          <div className="shift-dialog">
            <div className="shift-box">
              <h3>
                เลือกกะงานสำหรับ {selectedCell.emp.name} ({selectedCell.date})
              </h3>
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
              >
                <option value="">-- เลือกกะ --</option>
                <option value="morning">เช้า</option>
                <option value="evening">บ่าย</option>
                <option value="night">ดึก</option>
              </select>
              <div className="dialog-buttons">
                <button onClick={handleSaveShift}>บันทึก</button>
                <button onClick={() => setSelectedCell(null)}>ยกเลิก</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
