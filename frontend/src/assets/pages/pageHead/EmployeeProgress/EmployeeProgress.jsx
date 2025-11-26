import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HeadSidebar from "../../../Component/Head/HeadSidebar";
import api from "../../../../services/api"; 
import "./EmployeeProgress.css";

export default function EmployeeProgress() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get(`/api/users/${id}/task_assignments`);
        const tasks = res.data;

        if (!tasks || tasks.length === 0) {
          setData(null);
          return;
        }

        setData({
          id,
          name: tasks[0]?.assignedToName || `พนักงาน ${id}`,
          position: tasks[0]?.position || "พนักงาน",
          tasks,
        });
      } catch (err) {
        console.error("❌ โหลดข้อมูลงานไม่สำเร็จ:", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [id]);

  if (loading) return <div>⏳ กำลังโหลดข้อมูลงาน...</div>;

  if (data === null) {
    return (
      <div className="ep-layout-container">
        <HeadSidebar />
        <main className="ep-main-content">
          <button className="ep-btn-back" onClick={() => navigate(-1)}>← ย้อนกลับ</button>
          <p>ไม่พบข้อมูลงานของพนักงานคนนี้</p>
        </main>
      </div>
    );
  }
  const updateTaskProgress = async (taskId, newProgress) => {
  try {
    const response = await api.patch(`/api/task_assignments/${taskId}`, {
      progress: newProgress,
      status: newProgress === 100 ? "เสร็จสิ้น" : "กำลังทำ"
    });

    if (response.data.success) {
      alert("✅ อัปเดตความคืบหน้าเรียบร้อย");
    }
  } catch (err) {
    console.error("❌ Error updating task:", err);
    alert("เกิดข้อผิดพลาดในการอัปเดตงาน");
  }
};

  const displayStatus = (task) => {
    if (task.progress > 0 && task.progress < 100) return "กำลังทำ";
    if (task.progress === 100) return "เสร็จสิ้น";
    return task.status || "ยังไม่เริ่ม";
  };

  return (
    <div className="ep-layout-container">
      <HeadSidebar />
      <main className="ep-main-content">
        <div className="ep-header-buttons">
          <button className="ep-btn-back" onClick={() => navigate(-1)}>← ย้อนกลับ</button>
          <button className="ep-btn-assign" onClick={() => navigate(`/head/employee/${id}/add-work`)}>มอบหมายงาน</button>
        </div>

        <h3 className="ep-header-title">ความคืบหน้างาน: {data.name}</h3>
        <p className="ep-emp-position"><strong>ตำแหน่ง:</strong> {data.position}</p>

        {data.tasks.map((task, index) => (
          <div className="ep-progress-card" key={task.id}>
            <p><strong>งานที่ {index + 1}:</strong> {task.task_name}</p>
            <p><strong>รายละเอียด:</strong> {task.description}</p>

            <div className="ep-progress-bar">
              <div
                className="ep-progress-fill"
                style={{ width: `${task.progress || 0}%` }}
              >
                {task.progress || 0}%
              </div>
            </div>

            <p><strong>กำหนดส่ง:</strong> {task.deadline ? new Date(task.deadline).toLocaleString() : '-'}</p>
            <p><strong>สถานะ:</strong> {displayStatus(task)}</p>
          </div>
        ))}
      </main>
    </div>
  );
}
