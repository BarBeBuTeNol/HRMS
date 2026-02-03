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

  updateDepartment: async (id, data) => {
    try {
      const response = await api.put(`/departments/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteDepartment: async (id) => {
    try {
      const response = await api.delete(`/departments/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default DepartmentService;
