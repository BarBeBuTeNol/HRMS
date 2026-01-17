import { Request, Response } from 'express';
import leaveRepository from '../repository/leaveRepository';

// ✅ ส่งคำขอลา (Employee)
export const createLeaveRequest = async (req: Request, res: Response) => {
  const { user_id, leave_type, start_date, end_date, reason } = req.body;

  try {
    // 1) บันทึกคำขอลาลงตาราง leave_requests
    const requestId = await leaveRepository.createLeaveRequest(req.body);

    // 2) ดึงข้อมูลพนักงาน (รวม department)
    const emp: any = await leaveRepository.findEmployeeWithDepartment(user_id);

    if (!emp) {
      return res.status(404).json({ message: '❌ ไม่พบข้อมูลพนักงาน' });
    }

    // 3) หา Head ของแผนกนั้น
    const head: any = await leaveRepository.findHeadOfDepartment(emp.department_id);

    if (head) {
      // 4) สร้างแจ้งเตือนให้หัวหน้า
      const message = `คำขอลาใหม่: ${emp.first_name} ${emp.last_name} (${leave_type}) ${start_date} ถึง ${end_date}`;
      // ใช้ type='system' ตาม schema enum ที่มี (leave_status, announcement, task_assignment, system)
      // reference_id = requestId
      await leaveRepository.createNotification(head.id, 'system', message, requestId);
    }

    res.json({
      message: '✅ ส่งคำขอลาสำเร็จ',
      requestId: requestId,
    });

  } catch (err: any) {
    console.error('❌ Error createLeaveRequest:', err.message);
    res.status(500).json({ message: '❌ เกิดข้อผิดพลาด', error: err.message });
  }
};

// ✅ ดึงคำขอลาทั้งหมด
export const getLeaveRequests = async (req: Request, res: Response) => {
  try {
    const rows = await leaveRepository.findAll();
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ ดึงคำขอลาตาม user
export const getLeaveRequestsByUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const rows = await leaveRepository.findByUserId(userId);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
