import pool from "../config/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface ChangeRequest {
  id: number;
  requester_id: number;
  target_user_id: number;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  reason: string | null;
  evidence_path: string | null;
  status: "Pending" | "Approved" | "Rejected";
  approver_id: number | null;
  comment_by_approver: string | null;
  created_at: Date;
  updated_at: Date;
}

class ChangeRequestRepository {
  async create(request: Partial<ChangeRequest>) {
    const {
      requester_id,
      target_user_id,
      field_name,
      old_value,
      new_value,
      reason,
      evidence_path,
      status,
      approver_id,
      comment_by_approver,
    } = request;

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO change_requests 
            (requester_id, target_user_id, field_name, old_value, new_value, reason, evidence_path, status, approver_id, comment_by_approver, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        requester_id,
        target_user_id,
        field_name,
        old_value,
        new_value,
        reason,
        evidence_path || null,
        status || "Pending",
        approver_id || null,
        comment_by_approver || null,
      ],
    );
    return result.insertId;
  }

  async findById(id: number) {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT cr.*, 
                    CONCAT(r.first_name, ' ', r.last_name) as requester_name,
                    CONCAT(t.first_name, ' ', t.last_name) as target_user_name
             FROM change_requests cr
             LEFT JOIN users r ON cr.requester_id = r.id
             LEFT JOIN users t ON cr.target_user_id = t.id
             WHERE cr.id = ?`,
      [id],
    );
    return rows[0];
  }

  async findPending() {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT cr.*, 
                    CONCAT(r.first_name, ' ', r.last_name) as requester_name,
                    CONCAT(t.first_name, ' ', t.last_name) as target_user_name
             FROM change_requests cr
             LEFT JOIN users r ON cr.requester_id = r.id
             LEFT JOIN users t ON cr.target_user_id = t.id
             WHERE cr.status = 'Pending'
             ORDER BY cr.created_at DESC`,
    );
    return rows;
  }

  async findHistory(approverId: number) {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT cr.*, 
                    CONCAT(r.first_name, ' ', r.last_name) as requester_name,
                    CONCAT(t.first_name, ' ', t.last_name) as target_user_name
             FROM change_requests cr
             LEFT JOIN users r ON cr.requester_id = r.id
             LEFT JOIN users t ON cr.target_user_id = t.id
             WHERE cr.status != 'Pending' 
            --  AND (cr.approver_id = ? OR cr.requester_id IN (SELECT id FROM users WHERE department_id = (SELECT department_id FROM users WHERE id = ?)))
            -- Simplified visibility for Head: See all history for now
             ORDER BY cr.updated_at DESC`,
      [approverId, approverId],
    );
    return rows;
  }

  async updateStatus(
    id: number,
    status: "Approved" | "Rejected",
    approverId: number,
    comment: string,
  ) {
    await pool.query(
      `UPDATE change_requests 
             SET status = ?, approver_id = ?, comment_by_approver = ?, updated_at = NOW()
             WHERE id = ?`,
      [status, approverId, comment, id],
    );
  }
}

export default new ChangeRequestRepository();
