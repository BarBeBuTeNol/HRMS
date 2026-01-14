import { Request, Response } from "express";
import employeeDataRepository from "../repository/employeeDataRepository";

// 1. Save Personal Data (user_detail)
export const savePersonalData = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) throw new Error("User ID is required");

    await employeeDataRepository.savePersonalData(req.body);

    res.json({ message: "Personal data saved successfully" });
  } catch (error: any) {
    console.error("Error saving personal data:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// 2. Save Job Data (emp_info)
export const saveJobData = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) throw new Error("User ID is required");

    await employeeDataRepository.saveJobData(req.body);

    res.json({ message: "Job info saved successfully" });
  } catch (error: any) {
    console.error("Error saving job data:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};


// 3. Save Education Data (education_info)
export const saveEducationData = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) throw new Error("User ID is required");

    await employeeDataRepository.saveEducationData(req.body);

    res.json({ message: "Education info saved successfully" });
  } catch (error: any) {
    console.error("Error saving education data:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// 4. Get Genders (Master Data)
export const getGenders = async (req: Request, res: Response) => {
    try {
        const rows = await employeeDataRepository.getGenders();
        res.json(rows);
    } catch (err) {
        // If table doesn't exist or query fails, return standard list
        // console.warn("Could not fetch genders from DB, using defaults:", err);
        const defaults = [
            { id: 1, gender_name: "Male" },
            { id: 2, gender_name: "Female" },
            { id: 3, gender_name: "Other" }
        ];
        res.json(defaults);
    }
};

