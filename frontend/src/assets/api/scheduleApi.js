import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // เปลี่ยนตาม backend ของคุณ

// ✅ ดึงตารางงานทั้งหมด
export const getWorkSchedules = async () => {
  const response = await axios.get(`${API_BASE_URL}/work-schedules`);
  return response.data;
};
export async function bulkUpsertWorkSchedules(data) {
  const res = await fetch(`${API_URL}/work-schedules/bulk-upsert`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}


// ✅ ลบตารางงานตามวันที่
export const deleteScheduleByDate = async (date) => {
  const response = await axios.delete(`${API_BASE_URL}/work-schedules/date/${date}`);
  return response.data;
};

// ✅ เคลียร์ตารางทั้งหมด
export const clearAllSchedules = async () => {
  const response = await axios.delete(`${API_BASE_URL}/work-schedules`);
  return response.data;
};
// ✅ ดึงรายชื่อพนักงาน (เพิ่มการส่ง departmentId)
export const getEmployees = async (departmentId) => {
  const response = await axios.get(`${API_BASE_URL}/employees`, {
    params: { departmentId },
  });
  return response.data;
};
const handleDelete = async (date, shift) => {
  if (!window.confirm(`ต้องการลบตารางของวันที่ ${date} กะ ${shift} ใช่ไหม?`)) return;
  try {
    await deleteScheduleByDate(date); // ✅ ใช้ชื่อที่ import มา
    await refreshEvents();
    alert("✅ ลบตารางงานเรียบร้อยแล้ว");
  } catch (err) {
    console.error("Delete error:", err);
    alert("❌ เกิดข้อผิดพลาดในการลบตารางงาน");
  }
};


