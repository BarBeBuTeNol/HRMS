import db from "../config/db.js";

export const bulkUpsertSchedules = async (req, res) => {
  const schedules = req.body;
  try {
    for (const item of schedules) {
      const { user_id, date, shift, department_id } = item;

      // ✅ ใช้ REPLACE INTO เพื่อเพิ่มหรืออัปเดต
      await db.query(
        `REPLACE INTO work_schedules (user_id, date, shift, department_id)
         VALUES (?, ?, ?, ?)`,
        [user_id, date, shift, department_id]
      );
    }

    res.json({ message: "บันทึกข้อมูลสำเร็จ" });
  } catch (err) {
    console.error("❌ Error saving schedules:", err);
    res.status(500).json({ error: "บันทึกไม่สำเร็จ" });
  }
};
