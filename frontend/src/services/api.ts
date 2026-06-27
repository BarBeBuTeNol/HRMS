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
          title: '<span style="font-family: \'Sarabun\', \'Inter\', sans-serif; font-weight: 700; color: #1e293b; font-size: 20px;">ตรวจพบการเข้าสู่ระบบซ้อน</span>',
          html: '<div style="font-family: \'Sarabun\', \'Inter\', sans-serif; font-size: 14px; color: #64748b; line-height: 1.6; margin-top: 10px;">บัญชีของคุณมีการเข้าสู่ระบบจากอุปกรณ์อื่นในเวลาเดียวกัน<br/><span style="color: #ef4444; font-weight: 600;">ระบบได้ดำเนินการออกจากระบบเครื่องนี้เพื่อความปลอดภัย</span></div>',
          icon: "warning",
          iconColor: "#ef4444",
          confirmButtonText: "ตกลง (รับทราบ)",
          confirmButtonColor: "#ef4444",
          background: "#ffffff",
          customClass: {
            popup: "custom-swal-popup-border"
          },
          allowOutsideClick: false,
          allowEscapeKey: false,
        }).then(() => {
          // พากลับไปที่ Root URL (ซึ่ง React Router จะพาไปหน้าล็อกอินโดยไม่เกิดปัญหา 404 บนเซิร์ฟเวอร์จริง)
          window.location.href = "/";
        });
      } else {
        Swal.fire({
          title: '<span style="font-family: \'Sarabun\', \'Inter\', sans-serif; font-weight: 700; color: #1e293b; font-size: 20px;">เซสชันหมดอายุ</span>',
          html: '<div style="font-family: \'Sarabun\', \'Inter\', sans-serif; font-size: 14px; color: #64748b; line-height: 1.6; margin-top: 10px;">กรุณาเข้าสู่ระบบใหม่อีกครั้งเพื่อความปลอดภัยในการใช้งาน</div>',
          icon: "info",
          iconColor: "#3b82f6",
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#3b82f6",
          background: "#ffffff",
          allowOutsideClick: false,
          allowEscapeKey: false,
        }).then(() => {
          window.location.href = "/";
        });
      }
    }
    return Promise.reject(error);
  }
);

export default api;
