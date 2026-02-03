import { Request, Response } from "express";
import leaveRepository from "../repository/leaveRepository";

// ✅ ส่งคำขอลา (Employee)
// ✅ ส่งคำขอลา (Employee)
// ✅ ส่งคำขอลา (Employee)
export const createLeaveRequest = async (req: Request, res: Response) => {
  const { user_id, leave_type, start_date, end_date, reason, status } =
    req.body;

  try {
    // 1) บันทึกคำขอลาลงตาราง leave_requests
    const requestId = await leaveRepository.createLeaveRequest(req.body);

    // DEBUG LOG
    console.log(`[CreateLeave] RequestID: ${requestId}, Status: ${status}`);

    // =========================================================================
    // CASE A: Force Approve (Admin Action)
    // =========================================================================
    if (status === "Approved" || status === "approved") {
      const emp: any =
        await leaveRepository.findEmployeeWithDepartment(user_id);

      // Log locally if needed, but Audit Trail is in User Logs already via Frontend/LogService.
      // If Database has 'approver_id', we should update it here.
      // Assuming no 'approver_id' column based on previous context, relying on 'status'.

      // Notification to Employee (The Owner of Leave)
      // "HR has approved your leave"
      if (emp) {
        const message = `พนักงาน HR ได้ทำการอนุมัติการลาของคุณ (${leave_type}) เรียบร้อยแล้ว`;
        await leaveRepository.createNotification(
          emp.id,
          "system",
          message,
          requestId,
        );
      }

      res.json({
        message: "✅ บันทึกการลาเรียบร้อย (อนุมัติทันทีโดย HR)",
        requestId: requestId,
      });
      return;
    }

    // =========================================================================
    // CASE B: Standard Approval Flow
    // =========================================================================

    // 2) ดึงข้อมูลพนักงาน (รวม department และ role_name)
    const emp: any = await leaveRepository.findEmployeeWithDepartment(user_id);

    if (!emp) {
      return res.status(404).json({ message: "❌ ไม่พบข้อมูลพนักงาน" });
    }

    let approver: any = null;

    // 3) กำหนดผู้อนุมัติตาม Role
    const roleName = emp.role_name || "";

    if (roleName === "Employee" || roleName === "Head of Department") {
      // Normal Employee -> Head of Department
      approver = await leaveRepository.findHeadOfDepartment(emp.department_id);

      // Fallback 1: If No Head of Department (e.g., Dept 2 has no head)
      if (!approver) {
        console.warn(
          `[Leave] No Head found for Dept ID ${emp.department_id}. Falling back to HR Manager.`,
        );
        approver = await leaveRepository.findUserByRoleName("HR Manager");
      }

      // Fallback 2: If No HR Manager, try CHRO
      if (!approver) {
        console.warn(`[Leave] No HR Manager found. Falling back to CHRO.`);
        approver = await leaveRepository.findUserByRoleName("CHRO");
      }

      // Self-approval prevention: If Head is requesting, send to CHRO
      if (approver && approver.id === emp.id) {
        approver = await leaveRepository.findUserByRoleName("CHRO");
      }
    } else if (roleName === "HR" || roleName === "HR Staff") {
      // HR Staff -> HR Manager
      approver = await leaveRepository.findUserByRoleName("HR Manager");
      // Fallback
      if (!approver)
        approver = await leaveRepository.findUserByRoleName("CHRO");
    } else if (roleName === "HR Manager") {
      // HR Manager -> CHRO
      approver = await leaveRepository.findUserByRoleName("CHRO");
    } else {
      // Fallback Default
      approver = await leaveRepository.findHeadOfDepartment(emp.department_id);
    }

    if (approver) {
      // 4) สร้างแจ้งเตือนให้ผู้อนุมัติ
      const message = `คำขอลาใหม่: ${emp.first_name} ${emp.last_name} (${leave_type}) ${start_date} ถึง ${end_date}`;
      await leaveRepository.createNotification(
        approver.id,
        "system",
        message,
        requestId,
      );
    } else {
      // Critical: No one to approve
      console.error(`[Critical] No approver found for User ID ${user_id}`);
      // Potentially notify Admin/CHRO hardcoded?
    }

    res.json({
      message: "✅ ส่งคำขอลาสำเร็จ",
      requestId: requestId,
    });
  } catch (err: any) {
    console.error("❌ Error createLeaveRequest:", err.message);
    res.status(500).json({ message: "❌ เกิดข้อผิดพลาด", error: err.message });
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
