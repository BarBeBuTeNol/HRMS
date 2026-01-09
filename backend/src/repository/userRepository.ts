import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface UserFilterParams {
    search?: string;
    role?: string;
    department?: string;
    limit: number;
    offset: number;
}

class UserRepository {
    async findAll(params: UserFilterParams) {
        const { search, role, department, limit, offset } = params;
        
        const filters: string[] = [];
        const queryParams: any[] = [];

        if (search) {
            const like = `%${search}%`;
            filters.push(`(u.username LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)`);
            queryParams.push(like, like, like, like, like);
        }
        if (role) {
            filters.push(`r.role_name = ?`);
            queryParams.push(role);
        }
        if (department) {
            filters.push(`d.department_name = ?`);
            queryParams.push(department);
        }

        const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

        const [rows] = await pool.query<RowDataPacket[]>(
            `
            SELECT 
                u.id, u.username, u.first_name, u.last_name, u.email, u.phone,
                r.role_name, d.department_name, p.prefix_name,
                ei.job_position, ei.emp_code
            FROM users u
            LEFT JOIN roles r        ON u.role_id = r.id
            LEFT JOIN departments d  ON u.department_id = d.id
            LEFT JOIN prefixes p     ON u.prefix_id = p.id
            LEFT JOIN emp_info ei    ON u.id = ei.user_id
                AND ei.id = (SELECT MAX(id) FROM emp_info WHERE user_id = u.id)
            LEFT JOIN user_detail ud ON u.id = ud.user_id
            ${where}
            ORDER BY u.id DESC
            LIMIT ${limit} OFFSET ${offset}
            `,
            queryParams
        );

        const [countRows] = await pool.query<RowDataPacket[]>(
            `
            SELECT COUNT(*) as total
            FROM users u
            LEFT JOIN roles r        ON u.role_id = r.id
            LEFT JOIN departments d  ON u.department_id = d.id
            ${where}
            `,
            queryParams
        );

        const total = countRows[0]?.total ?? 0;

        return { rows, total };
    }

    async findById(id: string) {
        const [rows] = await pool.query<RowDataPacket[]>(
            `
            SELECT 
                u.*, r.role_name, d.department_name, p.prefix_name,
                ud.address, ud.birthdate as birth_date, ud.gender, ud.marital_status,
                ud.nationality, ud.religion, ud.blood_type,
                ud.emergency_contact_name, ud.emergency_contact_phone, 
                ud.relation_to_emergency_contact,
                ei.emp_code, ei.employment_status, ei.work_start_time, ei.work_end_time,
                ei.hire_date, ei.salary, ei.benefits, ei.job_position,
                ei.performance_review, ei.training_info,
                edu.education_level, edu.institution, edu.program, edu.skills, edu.previous_experience
            FROM users u
            LEFT JOIN roles r        ON u.role_id = r.id
            LEFT JOIN departments d  ON u.department_id = d.id
            LEFT JOIN prefixes p     ON u.prefix_id = p.id
            LEFT JOIN user_detail ud ON ud.user_id = u.id
            LEFT JOIN emp_info ei    ON ei.user_id = u.id AND ei.id = (SELECT MAX(id) FROM emp_info WHERE user_id = u.id)
            LEFT JOIN education_info edu ON edu.user_id = u.id AND edu.id = (SELECT MAX(id) FROM education_info WHERE user_id = u.id)
            WHERE u.id = ?
            `,
            [id]
        );
        return rows[0];
    }

    async findByUsernameOrEmail(username: string, email: string) {
        const [rows] = await pool.query<RowDataPacket[]>(
            "SELECT id FROM users WHERE username = ? OR email = ?",
            [username, email]
        );
        return rows[0];
    }

    async findRoleByName(roleName: string) {
        const [rows] = await pool.query<RowDataPacket[]>("SELECT id FROM roles WHERE role_name = ?", [roleName]);
        return rows[0];
    }

    async create(user: any, hashedPassword: string, roleId: number | null) {
        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO users 
             (username, password, first_name, last_name, email, phone, role_id, department_id, prefix_id, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [user.username, hashedPassword, user.firstName, user.lastName, user.email, user.phone, roleId, user.departmentId, user.prefixId]
        );
        return result.insertId;
    }

    async logAction(userId: number, action: string, details: string) {
        await pool.query(
            `INSERT INTO user_logs (user_id, action, details, created_at)
             VALUES (?, ?, ?, NOW())`,
            [userId, action, details]
        );
    }

    async delete(id: string) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const [user] = await connection.query<RowDataPacket[]>("SELECT username FROM users WHERE id = ?", [id]);
            if (user.length === 0) {
                await connection.rollback();
                return false; // User not found
            }

            await connection.query("DELETE FROM user_sessions WHERE user_id = ?", [id]);
            await connection.query("DELETE FROM user_logs WHERE user_id = ?", [id]);
            await connection.query("DELETE FROM education_info WHERE user_id = ?", [id]);
            await connection.query("DELETE FROM emp_info WHERE user_id = ?", [id]);
            await connection.query("DELETE FROM user_detail WHERE user_id = ?", [id]);
            await connection.query("DELETE FROM users WHERE id = ?", [id]);

            await connection.commit();
            return true;
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    }
}

export default new UserRepository();
