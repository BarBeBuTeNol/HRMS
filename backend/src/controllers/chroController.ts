import { Request, Response } from "express";
import chroRepository from "../repository/chroRepository";
import leaveRepository from "../repository/leaveRepository";
import workScheduleRepository from "../repository/workScheduleRepository";
import userRepository from "../repository/userRepository";

class ChroController {
  async getDashboardStats(req: Request, res: Response) {
    try {
      const stats = await chroRepository.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching CHRO dashboard stats:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getApprovals(req: Request, res: Response) {
    try {
      const approvals = await chroRepository.getPendingApprovals();
      res.json(approvals);
    } catch (error) {
      console.error("Error fetching CHRO approvals:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async handleLeaveAction(req: Request, res: Response) {
    try {
      const { requestId, status, reason, approverId } = req.body;
      if (!requestId || !status) {
        res.status(400).json({ message: "Missing requestId or status" });
        return;
      }

      // Use provided approverId or default to 999 (System)
      await chroRepository.updateLeaveStatus(
        requestId,
        status,
        approverId || 999,
        reason,
      );
      res.json({ message: `Leave request ${status} successfully` });
    } catch (error) {
      console.error("Error updating leave status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async handleDelegationAction(req: Request, res: Response) {
    try {
      const { requestId, action } = req.body;
      if (!requestId || action !== "acknowledge") {
        res.status(400).json({ message: "Invalid request" });
        return;
      }

      await chroRepository.acknowledgeDelegation(requestId);
      res.json({ message: "Delegation acknowledged successfully" });
    } catch (error) {
      console.error("Error acknowledging delegation:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async handleMarkAsRead(req: Request, res: Response) {
    try {
      const { requestId } = req.body;
      if (!requestId) {
        res.status(400).json({ message: "Missing requestId" });
        return;
      }

      await chroRepository.markAsRead(requestId);
      res.json({ message: "Marked as read successfully" });
    } catch (error) {
      console.error("Error marking as read:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async createCHROLeave(req: Request, res: Response) {
    try {
      const { user_id, leave_type, start_date, end_date, reason } = req.body;

      // 1. Create Leave Request (Auto-Approved)
      const requestId = await leaveRepository.createLeaveRequest({
        user_id,
        leave_type,
        start_date,
        end_date,
        reason,
        status: "Approved",
      });

      // 2. Update Work Schedules (Day Off)
      const startDateObj = new Date(start_date);
      const endDateObj = new Date(end_date);

      for (let d = startDateObj; d <= endDateObj; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split("T")[0];
        await workScheduleRepository.updateScheduleStatus(
          user_id,
          dateStr,
          "Day Off",
          requestId,
        );
      }

      // 3. Log Action
      const userIdInt = parseInt(user_id as string, 10);
      const userIp = req.ip || "0.0.0.0";

      console.log(`[CHRO] Logging action for user ${userIdInt}`);

      // 3. Log Action (Non-blocking as requested)
      // We explicitly DO NOT await this to prevent it from delaying the main response or timing out
      userRepository
        .logAction(
          userIdInt,
          "CREATE_LEAVE_REQUEST",
          `CHRO submitted leave request (Auto-Approved): ${leave_type} (${start_date} - ${end_date})`,
          userIp,
          "Info",
          "leave_requests table",
          undefined, // changeRequestId is explicitly undefined (which becomes NULL in repo)
        )
        .then(() => {
          console.log(`[CHRO] Log saved successfully for user ${userIdInt}`);
        })
        .catch((logError) => {
          console.error("[CHRO] Failed to save log (Background):", logError);
        });

      // 4. Notify HR/Heads (Simplification: Notify all with role 'HR' or 'Head of Department' if possible, or just specific heads)
      // For now, let's fetch IDs of HR and Heads.
      // We'll assume Role IDs: 3=HR, 4=Head (Common standard here, but better to query by name if unsure)
      // Or use userRepository.findAll with role filter.
      // Let's rely on strings if userRepository supports it well, or direct SQL if needed.
      // As a robust fallback, let's just notify 'System' or a known admin group?
      // Requirement: "Role HR หรือ Head คนอื่น"

      // Let's attempt to fetch HR and Heads.
      const hrUsers = await userRepository.findAll({
        role: "HR",
        limit: 100,
        offset: 0,
      }); // Role name 'HR'
      const headUsers = await userRepository.findAll({
        role: "Head of Department",
        limit: 100,
        offset: 0,
      });

      const recipients = [...hrUsers.rows, ...headUsers.rows];
      // Filter out self if CHRO is also in these lists (unlikely but safe)
      const uniqueRecipients = recipients.filter((u: any) => u.id != user_id);

      const notiMessage = `CHRO Leave: ${leave_type} (${start_date} to ${end_date})`;

      for (const recipient of uniqueRecipients) {
        await leaveRepository.createNotification(
          recipient.id,
          "announcement",
          notiMessage,
          requestId,
        );
      }

      res.status(201).json({
        message: "CHRO Leave request created and approved successfully",
        requestId,
      });
    } catch (error) {
      console.error("Error creating CHRO leave:", error);
      res.status(500).json({ message: "Internal server error", error });
    }
  }
}

export default new ChroController();
