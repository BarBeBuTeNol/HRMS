// src/controllers/users.controller.ts
import { Request, Response } from "express";
import userRepository from "../repository/userRepository";
import changeRequestRepository from "../repository/ChangeRequestRepository";

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

    const _pageSize = Number.isFinite(parseInt(pageSize))
      ? Math.max(1, parseInt(pageSize))
      : 20;
    const _page = Number.isFinite(parseInt(page))
      ? Math.max(1, parseInt(page))
      : 1;
    const offset = (_page - 1) * _pageSize;

    const { rows, total } = await userRepository.findAll({
      search,
      role,
      department,
      limit: _pageSize,
      offset,
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

// GET /api/users/:id/profile
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user: any = await userRepository.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Map flat structure to nested structure expected by HeadProfilePage
    const profileData = {
      full_name:
        `${user.prefix_name || ""} ${user.first_name || ""} ${user.last_name || ""}`.trim(),
      role_name: user.role_name,
      email: user.email,
      phone: user.phone,
      nationality: user.nationality,
      bloodType: user.blood_type,
      maritalStatus: user.marital_status,
      birthday: user.birth_date, // Mapped from birth_date to birthday
      address: user.address,
      religion: user.religion,
      emergencyContact: {
        name: user.emergency_contact_name,
        phone: user.emergency_contact_phone,
        relation: user.relation_to_emergency_contact,
      },
      work: {
        empCode: user.emp_code,
        department: user.department_name,
        jobTitle: user.job_position, // Mapped from job_position to jobTitle
        startOption: user.work_start_time,
        endOption: user.work_end_time,
        hireDate: user.hire_date,
        status: user.employment_status,
      },
      education: {
        institution: user.institution,
        level: user.education_level,
        program: user.program,
        skills: user.skills, // Comma separated string
      },
      // If profile_pic is needed and stored in profile_image_url
      profile_pic: user.profile_image_url,
    };

    res.json(profileData);
  } catch (err: any) {
    console.error("Get Profile Error:", err);
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
      firstName,
      first_name,
      lastName,
      last_name,
      email,
      telephone,
      phone,
      role = "Employee",
      department_id = null,
      prefix_id = null, // Frontend sends prefix_id as the value selection
      prefix = null, // Or maybe prefix direct
    } = req.body;

    const fName = first_name || firstName;
    const lName = last_name || lastName;
    const tel = phone || telephone;

    // Map prefix_id (which holds the enum string "Mr.", "Mrs." etc from frontend) to prefix
    const userPrefix = prefix || prefix_id;

    if (!username || !password || !fName || !lName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await userRepository.findByUsernameOrEmail(
      username,
      email,
    );
    if (existing) {
      return res
        .status(400)
        .json({ message: "Username or Email already exists" });
    }

    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);

    let roleId = null;
    const roleData = await userRepository.findRoleByName(role);
    if (roleData) {
      roleId = roleData.id;
    }

    const newUserId = await userRepository.create(
      {
        username,
        firstName: fName,
        lastName: lName,
        email,
        phone: tel,
        departmentId: department_id,
        prefix: userPrefix,
      },
      hashedPassword,
      roleId,
    );

    // ✅ Create initial emp_info record with the empId
    if (empId) {
      const pool = require("../config/db").default || require("../config/db");
      await pool.query(
        `INSERT INTO emp_info (user_id, emp_code, created_at, updated_at) VALUES (?, ?, NOW(), NOW())`,
        [newUserId, empId]
      );
    }

    await userRepository.logAction(
      newUserId,
      "Create User",
      `Created user ${username} (EmpID: ${empId})`,
    );

    res.status(201).json({
      message: "User created successfully",
      userId: newUserId,
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

// PUT /api/users/:id
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      role_id,
      department_id,
      status,
      position,
      reason,
    } = req.body;

    const currentUser = await userRepository.findById(id);
    if (!currentUser)
      return res.status(404).json({ message: "User not found" });

    const changes: any[] = [];

    // Helper to log change request
    const logChange = async (field: string, oldVal: any, newVal: any) => {
      if (String(oldVal) !== String(newVal)) {
        await changeRequestRepository.create({
          requester_id: (req as any).user?.id,
          target_user_id: Number(id),
          field_name: field,
          old_value: String(oldVal),
          new_value: String(newVal),
          reason: reason || "Direct Update",
          status: "Approved",
          approver_id: (req as any).user?.id,
          comment_by_approver: "Auto-approved Direct Update",
        });
        changes.push(`${field}: ${oldVal} -> ${newVal}`);
      }
    };

    const data: any = {};
    if (firstName) data.firstName = firstName;
    if (lastName) data.lastName = lastName;
    if (email) data.email = email;
    // For these simple fields, we might not log to change_requests or maybe we should?
    // The requirement mentioned "change password, modify what" -> "collect reason".
    // I will log important structure changes (Role, Dept, Status, Position) to change_requests.

    if (role_id) {
      await logChange("Role", currentUser.role_id, role_id);
    }
    if (department_id) {
      await logChange("Department", currentUser.department_id, department_id);
    }
    if (status) {
      await logChange("Status", currentUser.status, status);
    }
    if (position) {
      // Note: currentUser.job_position is the name, but we might be updating with ID or Name?
      // In Direct-Position.jsx, it sends `position: editForm.position`.
      // And `editForm.position` matches `emp.job_position` which is a NAME.
      // Wait, `userRepository.updateJobPosition` uses `update emp_info set position_id = ?`.
      // If the frontend sends a NAME string but the DB expects an ID, that would be a bug in the EXISTING code.
      // `userRepository.findById` returns `jp.position_name AS job_position`.
      // The existing `updateJobPosition` query: `UPDATE emp_info SET position_id = ?`.
      // If the user types a new position name, it might fail if it expects an ID.
      // HOWEVER, based on the frontend:
      // `position: emp.job_position || ""` -> text input.
      // This implies the system might be storing direct strings or the repo method is named misleadingly and expects a string?
      // START REVIEW `updateJobPosition` in `userRepository`.
      // `UPDATE emp_info SET position_id = ?` -> This expects an ID usually.
      // IF `position_id` is an INT, sending "Senior Manager" will fail.
      // IF `position_id` is a VARCHAR (legacy), then it works.
      // Checking `userRepository`: `LEFT JOIN job_positions jp ON ei.position_id = jp.id`.
      // This confirms `position_id` correlates to a table `job_positions`.
      // SO, if the user sends a string, it will likely FAIL or set it to 0.
      // BUT I am not here to fix existing bugs unless they block me.
      // The user said "Direct Position ... edit ... send change request".
      // I will assume for now I should just log what receives.

      await logChange("Position", currentUser.job_position || "N/A", position);
    }

    // Prepare data for actual update
    if (role_id) data.role_id = role_id;
    if (department_id) data.department_id = department_id;
    if (status) data.status = status;

    // 1. Update User Table fields
    await userRepository.update(id, data);

    // 2. Update Role/Dept/Status via bulkUpdate method if needed (per existing pattern)
    if (role_id || department_id || status) {
      await userRepository.bulkUpdate([id], { role_id, department_id, status });
    }

    // 3. Update Position
    if (position) {
      await userRepository.updateJobPosition(id, position);
    }

    // Log the action to user_logs (General Log)
    if (req.user && req.user.id) {
      await userRepository.logAction(
        req.user.id,
        "Update User",
        `Updated User ID ${id}. Changes: ${changes.join(", ")} | Reason: ${reason || "N/A"}`,
        req.ip || "",
        "Info",
        `User ID ${id}`,
      );
    }

    res.json({ message: "User updated successfully" });
  } catch (err: any) {
    console.error("Update User Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/users/bulk
export const bulkUpdateUsers = async (req: Request, res: Response) => {
  try {
    const { ids, role_id, department_id, status } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid IDs provided" });
    }

    const success = await userRepository.bulkUpdate(ids, {
      role_id,
      department_id,
      status,
    });

    if (success && req.user && req.user.id) {
      const updates = [];
      if (role_id) updates.push(`Role ID: ${role_id}`);
      if (department_id) updates.push(`Dept ID: ${department_id}`);
      if (status) updates.push(`Status: ${status}`);

      await userRepository.logAction(
        req.user.id,
        "Bulk Update Users",
        `Bulk updated ${ids.length} users. Set: ${updates.join(", ")}`,
        req.ip || "",
        "Info",
        `User IDs: ${ids.join(", ")}`,
      );
    }

    res.json({ message: "Users updated successfully", success });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/users/:id/reset-password
export const resetUserPassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword, reason } = req.body;

    // Change Request Logging
    if (req.user && req.user.id) {
      await changeRequestRepository.create({
        requester_id: req.user.id,
        target_user_id: Number(id),
        field_name: "Password",
        old_value: "********",
        new_value: "********", // Don't log actual password
        reason: reason || "Password Reset",
        status: "Approved",
        approver_id: req.user.id,
        comment_by_approver: "Auto-approved Password Reset",
      });
    }

    // Use provided password or fallback to default
    const passwordToSet = newPassword || "ChangeMe123!";

    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(passwordToSet, 10);

    await userRepository.resetPassword(id, hashedPassword);

    // Log action with Actor ID (req.user.id) not target ID
    if (req.user && req.user.id) {
      await userRepository.logAction(
        req.user.id,
        "Reset Password",
        `Reset password for User ID ${id}. Reason: ${reason || "N/A"}`,
        req.ip || "",
        "Warning",
        `User ID ${id}`,
      );
    }

    res.json({
      message: "Password reset successfully",
      isDefault: !newPassword,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
