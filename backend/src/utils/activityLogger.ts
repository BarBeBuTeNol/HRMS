import pool from "../config/db";

export const logUserAction = async (
  userId: number,
  action: string,
  details: string
) => {
  try {
    await pool.query(
      "INSERT INTO user_logs (user_id, action, details) VALUES (?, ?, ?)",
      [userId, action, details || ""]
    );
    console.log(`[LOG] Action recorded: User ${userId} -> ${action}`);
  } catch (error) {
    console.error("[LOG ERROR] Failed to record user action:", error);
  }
};
