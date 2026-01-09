import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const useHeartbeat = () => {
  const location = useLocation();

  useEffect(() => {
    const sendHeartbeat = async () => {
      // ✅ Use "currentUser" to match LoginPage
      const storedUser = localStorage.getItem("currentUser");
      if (!storedUser) return;

      try {
        const user = JSON.parse(storedUser);
        if (user?.id) {
          // console.log("💓 Sending heartbeat for user:", user.id);
          await axios.post("http://localhost:5000/api/users/heartbeat", {
            userId: user.id,
          });
          // console.log("✅ Heartbeat success");
        }
      } catch (err) {
        console.error("❌ Heartbeat error:", err);
      }
    };

    // 1. Send immediately on mount/route change
    sendHeartbeat();

    // 2. Set interval every 4 minutes (240000 ms)
    const intervalId = setInterval(sendHeartbeat, 240000);

    return () => clearInterval(intervalId);
  }, [location.pathname]); // Re-run when path changes
};

export default useHeartbeat;
