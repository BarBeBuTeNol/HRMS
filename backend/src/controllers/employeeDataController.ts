import { Request, Response } from "express";
import pool from "../config/db";

// 1. Save Personal Data (user_detail)
export const savePersonalData = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const {
      userId,
      gender,
      birthDate,
      address,
      maritalStatus,
      nationality,
      religion,
      bloodType,
      emergencyContactName,
      emergencyContactPhone,
      relationToEmergencyContact,
      personalId
    } = req.body;

    if (!userId) throw new Error("User ID is required");

    await connection.query(
      `INSERT INTO user_detail 
      (user_id, gender, birthdate, address, marital_status, nationality, religion, blood_type, emergency_contact_name, emergency_contact_phone, relation_to_emergency_contact, personal_id, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
      gender=VALUES(gender), birthdate=VALUES(birthdate), address=VALUES(address), marital_status=VALUES(marital_status), 
      nationality=VALUES(nationality), religion=VALUES(religion), blood_type=VALUES(blood_type), 
      emergency_contact_name=VALUES(emergency_contact_name), emergency_contact_phone=VALUES(emergency_contact_phone), 
      relation_to_emergency_contact=VALUES(relation_to_emergency_contact), personal_id=VALUES(personal_id), updated_at=NOW()`,
      [
        userId,
        gender || null,
        birthDate || null,
        address || null,
        maritalStatus || null,
        nationality || null,
        religion || null,
        bloodType || null,
        emergencyContactName || null,
        emergencyContactPhone || null,
        relationToEmergencyContact || null,
        personalId || null
      ]
    );

    res.json({ message: "Personal data saved successfully" });
  } catch (error: any) {
    console.error("Error saving personal data:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  } finally {
    connection.release();
  }
};

// 2. Save Job Data (emp_info)
export const saveJobData = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const {
      userId,
      empCode,
      departmentId,
      jobPosition,
      employmentStatus,
      workStartTime,
      workEndTime,
      hireDate,
      salary,
      benefits,
      performanceReview,
      trainingInfo
    } = req.body;

    if (!userId) throw new Error("User ID is required");

    await connection.query(
        `INSERT INTO emp_info
        (user_id, emp_code, department_id, job_position, employment_status, work_start_time, work_end_time, hire_date, salary, benefits, performance_review, training_info, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
        emp_code=VALUES(emp_code), department_id=VALUES(department_id), job_position=VALUES(job_position),
        employment_status=VALUES(employment_status), work_start_time=VALUES(work_start_time), work_end_time=VALUES(work_end_time),
        hire_date=VALUES(hire_date), salary=VALUES(salary), benefits=VALUES(benefits), 
        performance_review=VALUES(performance_review), training_info=VALUES(training_info), updated_at=NOW()`,
        [
            userId,
            empCode || null,
            departmentId || null,
            jobPosition || null,
            employmentStatus || null,
            workStartTime || null,
            workEndTime || null,
            hireDate || null,
            salary || 0.00,
            benefits || null,
            performanceReview || null,
            trainingInfo || null
        ]
    );

    res.json({ message: "Job info saved successfully" });
  } catch (error: any) {
    console.error("Error saving job data:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  } finally {
    connection.release();
  }
};


// 3. Save Education Data (education_info)
export const saveEducationData = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const {
      userId,
      educationLevel,
      institution,
      program,
      previousExperience,
      skills
    } = req.body;

    if (!userId) throw new Error("User ID is required");

    await connection.query(
        `INSERT INTO education_info
        (user_id, education_level, institution, program, previous_experience, skills, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
        education_level=VALUES(education_level), institution=VALUES(institution), program=VALUES(program),
        previous_experience=VALUES(previous_experience), skills=VALUES(skills), updated_at=NOW()`,
        [
            userId,
            educationLevel || null,
            institution || null,
            program || null,
            previousExperience || null,
            skills || null
        ]
    );

    res.json({ message: "Education info saved successfully" });
  } catch (error: any) {
    console.error("Error saving education data:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  } finally {
    connection.release();
  }
};

// 4. Get Genders (Master Data)
export const getGenders = async (req: Request, res: Response) => {
    try {
        // Try to fetch from DB if 'genders' table exists
        const [rows] = await pool.query("SELECT * FROM genders");
        res.json(rows);
    } catch (err) {
        // If table doesn't exist or query fails, return standard list
        // console.warn("Could not fetch genders from DB, using defaults:", err);
        const defaults = [
            { id: 1, name: "Male" },
            { id: 2, name: "Female" },
            { id: 3, name: "Other" }
        ];
        res.json(defaults);
    }
};

