import { Request, Response } from "express";
import employeeDataRepository from "../repository/employeeDataRepository";

// 1. Save Personal Data (user_detail)
export const savePersonalData = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) throw new Error("User ID is required");

    let data = { ...req.body };

    // Handle File Upload
    if (req.file) {
      // Store relative path (or full URL if preferred, but relative is portable)
      // Example: /uploads/avatars/avatar-123456789.jpg
      // Note: Make sure your express app serves 'uploads' folder as static
      data.profile_image_url = `/uploads/avatars/${req.file.filename}`;
    }

    await employeeDataRepository.savePersonalData(data);

    res.json({
      message: "Personal data saved successfully",
      imageUrl: data.profile_image_url, // Return URL so frontend can update preview
    });
  } catch (error: any) {
    console.error("Error saving personal data:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// 3. Save Job Data (emp_info)
export const saveJobData = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) throw new Error("User ID is required");

    // Save tabular data
    await employeeDataRepository.saveJobData(req.body);

    // Handle File Uploads
    // Type casting for multer files since TS might not infer specific fields structure
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files) {
      const processFiles = async (fileList: Express.Multer.File[]) => {
        for (const file of fileList) {
          const fileData = {
            refId: userId, // Using User ID as requested for user_profile related docs
            refType: "user_profile",
            fileName: file.originalname,
            filePath: `/uploads/attachments/${file.filename}`,
            fileExtension: file.originalname.split(".").pop()?.toLowerCase(),
            fileSize: file.size,
            uploadedBy: userId, // Assuming user is uploading their own or admin (request doesn't clarify uploader, usually taken from auth token but using userId for now)
          };
          await employeeDataRepository.saveAttachment(fileData);
        }
      };

      if (files["performanceFiles"]) {
        await processFiles(files["performanceFiles"]);
      }
      if (files["trainingFiles"]) {
        await processFiles(files["trainingFiles"]);
      }
    }

    res.json({ message: "Job info and attachments saved successfully" });
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

    // Handle File Uploads (Education Files)
    if (req.files) {
      const files = req.files as Express.Multer.File[];
      // Iterate over array of files
      if (Array.isArray(files)) {
        for (const file of files) {
          const fileData = {
            refId: userId, // Using User ID for now; ideally could be education_id if we had one per record
            refType: "education",
            fileName: file.originalname,
            filePath: `/uploads/attachments/${file.filename}`,
            fileExtension: file.originalname.split(".").pop()?.toLowerCase(),
            fileSize: file.size,
            uploadedBy: userId,
          };
          await employeeDataRepository.saveAttachment(fileData);
        }
      }
    }

    res.json({ message: "Education info and attachments saved successfully" });
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
      { id: 3, gender_name: "Other" },
    ];
    res.json(defaults);
  }
};
