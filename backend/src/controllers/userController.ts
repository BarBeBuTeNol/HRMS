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
      prefix_id = null, // Frontend sends prefix_id as the value selection
      prefix = null     // Or maybe prefix direct
    } = req.body;

    const fName = first_name || firstName;
    const lName = last_name || lastName;
    const tel = phone || telephone;
    
    // Map prefix_id (which holds the enum string "Mr.", "Mrs." etc from frontend) to prefix
    const userPrefix = prefix || prefix_id;

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
        prefix: userPrefix
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

// PUT /api/users/:id
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, role_id, department_id, status, position } = req.body;

    const data: any = {};
    if (firstName) data.firstName = firstName;
    if (lastName) data.lastName = lastName;
    if (email) data.email = email;
    if (role_id) data.role_id = role_id;
    if (department_id) data.department_id = department_id;
    if (status) data.status = status;

    const success = await userRepository.update(id, data);
    
    // Update Job Position if provided
    if (position) {
        await userRepository.updateJobPosition(id, position);
    }
    
    // Let's rely on the new repository methods or update the repo update method? 
    // I missed updating the repo `update` method to include role/dept/status.
    // I will fix `userRepository.ts` in the previous step? No, I can't go back.
    // I will add a patch to `userRepository.ts` OR just use `bulkUpdate` for single update too effectively? 
    // No, I'll update `userRepository.ts` AGAIN in a bit or utilize `bulkUpdate` for single by passing [id].
    
    // Actually, for this controller, I'll just call the repository methods.
    // Since I didn't update repo.update to handle role/dept, I should probably use `bulkUpdate` for single complex updates 
    // OR create a better `update` in repo. 
    // checking repo code... `update` only had 3 fields. 
    // I shall fix the repo first OR update the controller to handle it manually.
    // Better: Update controller to use `bulkUpdate` for single user if complex fields are present.
    
    if (role_id || department_id || status) {
         await userRepository.bulkUpdate([id], { role_id, department_id, status });
    }

    // Log the action
    if (req.user && req.user.id) {
        const changes = [];
        if (firstName) changes.push(`Name to ${firstName} ${lastName || ''}`);
        if (role_id) changes.push(`Role ID to ${role_id}`);
        if (department_id) changes.push(`Dept ID to ${department_id}`);
        if (status) changes.push(`Status to ${status}`);
        if (position) changes.push(`Position to ${position}`);
        
        await userRepository.logAction(
            req.user.id, 
            "Update User", 
            `Updated User ID ${id}. Changes: ${changes.join(', ')}`, 
            req.ip || '', 
            'Info', 
            `User ID ${id}`
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

        const success = await userRepository.bulkUpdate(ids, { role_id, department_id, status });
        
        if (success && req.user && req.user.id) {
            const updates = [];
            if (role_id) updates.push(`Role ID: ${role_id}`);
            if (department_id) updates.push(`Dept ID: ${department_id}`);
            if (status) updates.push(`Status: ${status}`);

            await userRepository.logAction(
                req.user.id,
                "Bulk Update Users",
                `Bulk updated ${ids.length} users. Set: ${updates.join(', ')}`,
                req.ip || '',
                'Info',
                `User IDs: ${ids.join(', ')}`
            );
        }

        res.json({ message: "Users updated successfully", success });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
}

// POST /api/users/:id/reset-password
export const resetUserPassword = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body; // Check for custom password
        
        // Use provided password or fallback to default
        const passwordToSet = newPassword || "ChangeMe123!"; 
        
        const bcrypt = require("bcryptjs");
        const hashedPassword = await bcrypt.hash(passwordToSet, 10);

        // await userRepository.resetPassword(id, hashedPassword); // Duplicate removed

        
        await userRepository.resetPassword(id, hashedPassword);
        
        // Log action with Actor ID (req.user.id) not target ID
        if (req.user && req.user.id) {
             await userRepository.logAction(
                 req.user.id, 
                 "Reset Password", 
                 `Reset password for User ID ${id}`, 
                 req.ip || '', 
                 'Warning', 
                 `User ID ${id}`
            );
        }

        res.json({ message: "Password reset successfully", isDefault: !newPassword });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
}
