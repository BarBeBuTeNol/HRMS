import { Request, Response } from 'express';
import pool from '../config/db';

// ดึงแจ้งเตือนของ user
export const getNotifications = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// mark ว่าอ่านแล้ว
export const markAsRead = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
    res.json({ message: 'อ่านแล้ว' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
