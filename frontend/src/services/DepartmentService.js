import api from "./api";

const DepartmentService = {
  getAllDepartments: async () => {
    try {
      // api instance already has baseURL ending with /api
      const response = await api.get("/departments");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createDepartment: async (departmentName) => {
    try {
      const response = await api.post("/departments", {
        department_name: departmentName,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default DepartmentService;
