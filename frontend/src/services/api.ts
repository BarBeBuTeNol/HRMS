import axios from "axios";
import Swal from "sweetalert2";

// ✅ แก้ไขให้ดึงค่าจาก .env อย่างถูกต้อง
const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || "https://hrms-backend-0mkt.onrender.com") + "/api",
});

// แนบ Token อัตโนมัติ (โค้ดเดิมของคุณ)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// จัดการกรณี Token หมดอายุ หรือถูกเตะออกจากการล็อกอินซ้อน
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // หากเป็น endpoint ล็อกอิน ให้ปล่อยผ่าน ไม่ต้องดักจับเพื่อ redirect
    if (error.config && error.config.url && error.config.url.includes("/auth/login")) {
      return Promise.reject(error);
    }

    if (error.response && error.response.status === 401) {
      const message = error.response.data?.message || "";
      const isLoggedOutElsewhere = message.includes("another device") || error.response.data?.code === "LOGGED_IN_ELSEWHERE";

      // ลบ Session ในเบราว์เซอร์
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("userId");

      if (isLoggedOutElsewhere) {
        Swal.fire({
          title: "ตรวจพบการเข้าสู่ระบบซ้อน",
          text: "บัญชีของคุณมีการเข้าสู่ระบบจากอุปกรณ์อื่น ระบบได้นำคุณออกจากระบบเพื่อความปลอดภัย",
          icon: "warning",
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#d33",
          allowOutsideClick: false,
        }).then(() => {
          // พากลับไปที่ Root URL (ซึ่ง React Router จะพาไปหน้าล็อกอินโดยไม่เกิดปัญหา 404 บนเซิร์ฟเวอร์จริง)
          window.location.href = "/";
        });
      } else {
        Swal.fire({
          title: "เซสชันหมดอายุ",
          text: "กรุณาเข้าสู่ระบบใหม่อีกครั้ง",
          icon: "info",
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#3085d6",
          allowOutsideClick: false,
        }).then(() => {
          window.location.href = "/";
        });
      }
    }
    return Promise.reject(error);
  }
);

export default api;
