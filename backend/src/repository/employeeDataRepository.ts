import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

class EmployeeDataRepository {
    async savePersonalData(data: any) {
        const connection = await pool.getConnection(); // Use a connection if multi-statement or transactions needed, but single query is fine on pool too. 
        // Controller used connection explicitly but didn't use transaction. Pool query is simpler.
        // However, existing code used connection. I'll use pool.query for simplicity as it handles connection internally.
        
        const { userId, gender, birthDate, address, maritalStatus, nationality, religion, bloodType, emergencyContactName, emergencyContactPhone, relationToEmergencyContact, personalId } = data;

        await pool.query(
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
    }

    async saveJobData(data: any) {
        const { userId, empCode, departmentId, jobPosition, employmentStatus, workStartTime, workEndTime, hireDate, salary, benefits, performanceReview, trainingInfo } = data;

        await pool.query(
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
    }

    async saveEducationData(data: any) {
        const { userId, educationLevel, institution, program, previousExperience, skills } = data;

        await pool.query(
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
    }

    async getGenders() {
        const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM genders");
        return rows;
    }
}

export default new EmployeeDataRepository();
