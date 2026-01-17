import pool from '../config/db';
import { RowDataPacket } from 'mysql2';

class MasterDataRepository {
    async getAllDepartments() {
        const [rows] = await pool.query<RowDataPacket[]>("SELECT id, department_name FROM departments ORDER BY id ASC");
        return rows;
    }

    async getAllPrefixes() {
        // Return static list matching enum('Mr.','Mrs.','Ms.','Dr.','Other')
        return [
            { id: 'Mr.', prefix_name: 'Mr.' },
            { id: 'Mrs.', prefix_name: 'Mrs.' },
            { id: 'Ms.', prefix_name: 'Ms.' },
            { id: 'Dr.', prefix_name: 'Dr.' },
            { id: 'Other', prefix_name: 'Other' }
        ];
    }

    async getAllRoles() {
        const [rows] = await pool.query<RowDataPacket[]>("SELECT id, role_name FROM roles ORDER BY id ASC");
        return rows;
    }

    async createDepartment(departmentName: string) {
        const [result] = await pool.query("INSERT INTO departments (department_name) VALUES (?)", [departmentName]);
        return result;
    }

}

export default new MasterDataRepository();
