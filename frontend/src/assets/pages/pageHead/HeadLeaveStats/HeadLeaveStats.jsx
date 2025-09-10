import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";
import "dayjs/locale/th";
import localeData from "dayjs/plugin/localeData";
import { motion } from "framer-motion";
import HeadSidebar from "../../../Component/Head/HeadSidebar";
import "./HeadLeaveStats.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";


dayjs.extend(localeData);
dayjs.locale("th");

const handleExportExcel = () => {
  // สร้าง worksheet จาก barData
  const worksheet = XLSX.utils.json_to_sheet(
    barData.map((item) => ({
      ชื่อ: item.name,
      จำนวนวันลา: item.leave,
    }))
  );

  // สร้าง workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "LeaveStats");

  // เขียนเป็นไฟล์ Excel
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  // สร้าง Blob และดาวน์โหลด
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, `leave_stats_${selectedMonth}.xlsx`);
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

const formatThaiMonth = (dateStr) => {
  const d = dayjs(dateStr);
  const month = d.format("MMMM");
  const year = d.year() + 543;
  return `${month} ${year}`;
};

export default function HeadLeaveStats() {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format("YYYY-MM"));
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);

  const headId = localStorage.getItem("userId");

  useEffect(() => {
    fetchStats();
  }, [selectedMonth]);

  const fetchStats = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/leave-requests/stats/department/${headId}`
      );
      const { pieData, barData } = res.data;

      const monthPie = pieData
        .filter((d) => d.month === selectedMonth)
        .map((d) => ({ name: d.leave_type, value: d.value }));

      const monthBar = barData
        .filter((d) => d.month === selectedMonth)
        .map((d) => ({ name: d.name, leave: d.leaveCount }));

      setPieData(monthPie);
      setBarData(monthBar);
    } catch (err) {
      console.error("❌ Error fetching leave stats:", err);
    }
  };

  // ✅ ย้ายมาที่นี่ เพื่อใช้ state barData + selectedMonth ได้
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      barData.map((item) => ({
        ชื่อ: item.name,
        จำนวนวันลา: item.leave,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "LeaveStats");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `leave_stats_${selectedMonth}.xlsx`);
  };

  const totalLeave = barData.reduce((sum, item) => sum + item.leave, 0);
  const averageLeave =
    barData.length > 0 ? (totalLeave / barData.length).toFixed(2) : 0;


  return (
    <div className="flex w-screen h-screen overflow-hidden bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 text-white">
      <HeadSidebar />

      <div className="main-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-4 bg-white text-black shadow flex justify-between items-center"
        >
          <div>
            <h1 className="text-xl font-bold">
              สถิติการลาในแผนก — {formatThaiMonth(selectedMonth)}
            </h1>
            <div className="flex gap-4 text-sm mt-2">
              <span>จำนวนลาทั้งหมด: {totalLeave} วัน</span>
              <span>ลาเฉลี่ยต่อคน: {averageLeave} วัน</span>
              <span>คนที่ลาบ่อย: {barData[0]?.name || "-"}</span>
            </div>
          </div>
          <button
  onClick={handleExportExcel}
  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
>
  Export Excel
</button>

          <div className="flex gap-2">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </div>
        </motion.div>

        {/* Charts */}
        <div className="chart-container">
          {/* Pie Chart */}
          <div className="chart-left">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute bottom-4">
              <button
                className="text-blue-700 underline"
                onClick={() => setShowDetails((prev) => !prev)}
              >
                {showDetails ? "ซ่อนรายละเอียด ▲" : "ดูรายละเอียด ▼"}
              </button>
              {showDetails && (
                <ul className="mt-2 text-sm text-black">
                  {pieData.map((item) => (
                    <li key={item.name}>
                      {item.name}: {item.value} ครั้ง
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Bar Chart */}
          <div className="chart-right">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="leave" fill="#4fc3f7" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
