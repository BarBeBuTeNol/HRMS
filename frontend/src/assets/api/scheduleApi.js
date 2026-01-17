import api from '../../services/api';

// ✅ ดึงตารางงานทั้งหมด
export const getWorkSchedules = async () => {
  const response = await api.get('/work-schedules');
  return response.data;
};

export async function bulkUpsertWorkSchedules(data) {
  const res = await api.post('/work-schedules/bulk-upsert', data);
  return res.data;
}


// ✅ ลบตารางงานตามวันที่
export const deleteScheduleByDate = async (date) => {
  const response = await api.delete(`/work-schedules/date/${date}`);
  return response.data;
};

// ✅ เคลียร์ตารางทั้งหมด
export const clearAllSchedules = async () => {
  const response = await api.delete('/work-schedules');
  return response.data;
};
// ✅ ดึงรายชื่อพนักงาน (เพิ่มการส่ง departmentId)
export const getEmployees = async (departmentId) => {
  const response = await api.get('/employees', {
    params: { departmentId },
  });
  return response.data;
};


