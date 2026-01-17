import axios from "axios";

// ✅ แก้ไขให้ดึงค่าจาก .env อย่างถูกต้อง
const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api",
});

// แนบ Token อัตโนมัติ (โค้ดเดิมของคุณ)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
