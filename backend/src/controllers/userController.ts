// src/controllers/users.controller.ts
import { Request, Response } from "express";
import userRepository from "../repository/userRepository";

// GET /api/users?search=&role=&department=&page=1&pageSize=20
export const listUsers = async (req: Request, res: Response) => {
  try {
    const {
      search = "",
      role = "",
      department = "",
      page = "1",
      pageSize = "20",
    } = req.query as Record<string, string>;

    const _pageSize = Number.isFinite(parseInt(pageSize)) ? Math.max(1, parseInt(pageSize)) : 20;
    const _page = Number.isFinite(parseInt(page)) ? Math.max(1, parseInt(page)) : 1;
    const offset = (_page - 1) * _pageSize;

    const { rows, total } = await userRepository.findAll({
        search,
        role,
        department,
        limit: _pageSize,
        offset
    });

    res.json({
      data: rows,
      pagination: {
        page: _page,
        pageSize: _pageSize,
        total,
        totalPages: Math.ceil(total / _pageSize),
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/:id
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await userRepository.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const reqUser: any = (req as any).user;
    if (reqUser?.role === "Employee" && Number(reqUser?.id) !== Number(id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(user);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/users
export const createUser = async (req: Request, res: Response) => {
  try {
    const {
      empId,
      username,
      password,
      firstName, first_name,
      lastName, last_name,
      email,
      telephone, phone,
      role = "Employee",
      department_id = null,
      prefix_id = null
    } = req.body;

    const fName = first_name || firstName;
    const lName = last_name || lastName;
    const tel = phone || telephone;

    if (!username || !password || !fName || !lName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await userRepository.findByUsernameOrEmail(username, email);
    if (existing) {
      return res.status(400).json({ message: "Username or Email already exists" });
    }

    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);

    let roleId = null;
    const roleData = await userRepository.findRoleByName(role);
    if (roleData) {
      roleId = roleData.id;
    }

    const newUserId = await userRepository.create({
        username,
        firstName: fName,
        lastName: lName,
        email,
        phone: tel,
        departmentId: department_id,
        prefixId: prefix_id
    }, hashedPassword, roleId);

    await userRepository.logAction(newUserId, "Create User", `Created user ${username} (EmpID: ${empId})`);

    res.status(201).json({ 
        message: "User created successfully", 
        userId: newUserId 
    });

  } catch (err: any) {
    console.error("Create User Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/users/:id
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const success = await userRepository.delete(id);
    
    if (!success) {
        return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err: any) {
    console.error("Delete User Error:", err);
    res.status(500).json({ message: err.message });
  }
};
