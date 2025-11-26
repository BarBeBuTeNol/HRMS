import React, { useState } from "react";
import Sidebar_HR from "../../../Component/HR/Sidebar_HR";
import "./Show_static_switch.css";

const leaveStats = [
  { type: "ลาป่วย", count: 12, color: "#a3cef1" },
  { type: "ลากิจ", count: 8, color: "#eebbc3" },
  { type: "ลาพักร้อน", count: 5, color: "#b388ff" },
  { type: "ขาดงาน", count: 2, color: "#ff6363" },
];

const switchStats = [
  { name: "สมชาย ใจดี", count: 3 },
  { name: "สมหญิง สายบุญ", count: 2 },
  { name: "อนันต์ รักงาน", count: 1 },
];

const totalLeave = leaveStats.reduce((sum, l) => sum + l.count, 0);

const barMax = Math.max(...leaveStats.map(l => l.count));

const Show_static_switch = () => {
  const [view, setView] = useState("donut"); // donut | bar | number

  return (
    <div className="static-switch-container">
      <Sidebar_HR />
      <main className="static-switch-main">
        <h1 className="fade-in">รายงานสถิติการลาและการสลับเวร</h1>
        <section className="stat-leave card-hover">
          <h2>สถิติการลา</h2>
          <div className="stat-leave-actions">
            <button className="stat-leave-btn" onClick={() => setView("donut")}>กราฟวงกลม</button>
            <button className="stat-leave-btn" onClick={() => setView("bar")}>กราฟแท่ง</button>
            <button className="stat-leave-btn" onClick={() => setView("number")}>ตัวเลขรวม</button>
          </div>
          <div className="stat-leave-graph">
            {view === "donut" && (
              <svg width="140" height="140" viewBox="0 0 40 40" className="donut animate-in">
                {leaveStats.reduce((acc, stat, i) => {
                  const prev = acc.offset;
                  const val = (stat.count / totalLeave) * 100;
                  acc.offset += val;
                  acc.segments.push(
                    <circle
                      key={stat.type}
                      className="donut-segment"
                      cx="20" cy="20" r="15.9155"
                      fill="transparent"
                      stroke={stat.color}
                      strokeWidth="4"
                      strokeDasharray={`${val} ${100 - val}`}
                      strokeDashoffset={100 - prev}
                    />
                  );
                  return acc;
                }, { offset: 0, segments: [] }).segments}
              </svg>
            )}
            {view === "bar" && (
              <div className="bar-graph animate-in">
                {leaveStats.map(stat => (
                  <div className="bar-graph-row" key={stat.type}>
                    <span className="bar-label">{stat.type}</span>
                    <div className="bar-bg">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${(stat.count / barMax) * 100}%`,
                          background: stat.color,
                        }}
                      >
                        <span className="bar-count">{stat.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {view === "number" && (
              <div className="number-summary animate-in">
                {leaveStats.map(stat => (
                  <div className="number-card" key={stat.type} style={{ borderColor: stat.color }}>
                    <span className="number-type" style={{ color: stat.color }}>{stat.type}</span>
                    <span className="number-value">{stat.count}</span>
                    <span className="number-unit">วัน</span>
                  </div>
                ))}
              </div>
            )}
            <ul className="stat-leave-legend">
              {leaveStats.map(stat => (
                <li key={stat.type}>
                  <span className="legend-dot" style={{ background: stat.color }}></span>
                  {stat.type}: <b>{stat.count}</b> วัน
                </li>
              ))}
            </ul>
          </div>
          <div className="stat-leave-summary">
            รวมวันลา: <span className="summary-number">{totalLeave}</span> วัน
          </div>
        </section>
        <section className="stat-switch card-hover">
          <h2>สถิติการสลับเวร</h2>
          <div className="stat-switch-table-wrapper">
            <table className="stat-switch-table">
              <thead>
                <tr>
                  <th>ชื่อพนักงาน</th>
                  <th>จำนวนครั้งที่สลับเวร</th>
                </tr>
              </thead>
              <tbody>
                {switchStats.map((row, idx) => (
                  <tr key={row.name} className={idx % 2 === 0 ? "even" : "odd"}>
                    <td>{row.name}</td>
                    <td>{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Show_static_switch;
