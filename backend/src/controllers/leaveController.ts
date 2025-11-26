import { Request, Response } from 'express';
import pool from '../config/db';

// ✅ ส่งคำขอลา (Employee)
export const createLeaveRequest = async (req: Request, res: Response) => {
  const { user_id, leave_type, start_date, end_date, reason } = req.body;

  try {
    // 1) บันทึกคำขอลาลงตาราง leave_requests
    const [leaveRes] = await pool.query(
      'INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, reason) VALUES (?, ?, ?, ?, ?)',
      [user_id, leave_type, start_date, end_date, reason]
    );

    // 2) ดึงข้อมูลพนักงาน (รวม department)
    const [[emp]]: any = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.department_id, d.department_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = ?`,
      [user_id]
    );

    if (!emp) {
      return res.status(404).json({ message: '❌ ไม่พบข้อมูลพนักงาน' });
    }

    // 3) หา Head ของแผนกนั้น
    const [[head]]: any = await pool.query(
      `SELECT u.id, u.first_name, u.last_name
       FROM users u
       WHERE u.department_id = ? AND u.role_id = 4
       LIMIT 1`,
      [emp.department_id]
    );

    if (head) {
      // 4) สร้างแจ้งเตือนให้หัวหน้า
      const title = `คำขอลา – ${emp.first_name} ${emp.last_name}`;
      const details = `${emp.first_name} ${emp.last_name} ขอ "${leave_type}" ${start_date} ถึง ${end_date}`;

      await pool.query(
        'INSERT INTO notifications (user_id, type, title, details) VALUES (?, ?, ?, ?)',
        [head.id, 'leave-request', title, details]
      );
    }

    res.json({
      message: '✅ ส่งคำขอลาสำเร็จ',
      requestId: (leaveRes as any).insertId,
    });

  } catch (err: any) {
    console.error('❌ Error createLeaveRequest:', err.message);
    res.status(500).json({ message: '❌ เกิดข้อผิดพลาด', error: err.message });
  }
};

// ✅ ดึงคำขอลาทั้งหมด
export const getLeaveRequests = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT * FROM leave_requests ORDER BY created_at DESC');
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ ดึงคำขอลาตาม user
export const getLeaveRequestsByUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM leave_requests WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
