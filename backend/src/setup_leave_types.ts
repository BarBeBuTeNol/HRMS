import pool from "./config/db";

async function setupLeaveTypes() {
  try {
    console.log("🛠️  Setting up leave_types table...");

    // 1. Reset Table (Safe for Dev)
    await pool.query(`DROP TABLE IF EXISTS leave_types`);
    
    // 2. Create Table
    await pool.query(`
      CREATE TABLE leave_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE, 
        label_th VARCHAR(100) NOT NULL,
        label_en VARCHAR(100) NOT NULL,
        default_quota INT DEFAULT 10,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Table 'leave_types' checked/created.");

    // 2. Default Data
    const defaultTypes = [
      { name: "Sick Leave", label_th: "ลาป่วย", label_en: "Sick Leave", quota: 30 },
      { name: "Personal Leave", label_th: "ลากิจ", label_en: "Personal Leave", quota: 7 },
      { name: "Vacation Leave", label_th: "ลาพักร้อน", label_en: "Vacation", quota: 10 },
      { name: "Ordination", label_th: "ลาบวช", label_en: "Ordination", quota: 15 },
      { name: "Maternity Leave", label_th: "ลาคลอด", label_en: "Maternity Leave", quota: 90 },
      { name: "Other", label_th: "อื่นๆ", label_en: "Other", quota: 5 },
    ];

    for (const type of defaultTypes) {
      // Upsert (Insert if not exists)
      await pool.query(`
        INSERT IGNORE INTO leave_types (name, label_th, label_en, default_quota)
        VALUES (?, ?, ?, ?)
      `, [type.name, type.label_th, type.label_en, type.quota]);
    }
    
    // Check data
    const [rows] = await pool.query("SELECT * FROM leave_types");
    console.log("📊 Leave Types in DB:", rows);

  } catch (e) {
    console.error("❌ Error setting up leave types:", e);
  } finally {
    process.exit();
  }
}

setupLeaveTypes();
