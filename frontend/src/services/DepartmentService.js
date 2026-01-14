import api from "./api";

const DepartmentService = {
  getAllDepartments: async () => {
    try {
      const response = await api.get("/api/departments");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createDepartment: async (departmentName) => {
    try {
      const response = await api.post("/api/departments", {
        department_name: departmentName,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default DepartmentService;
