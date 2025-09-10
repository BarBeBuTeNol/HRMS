import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import HeadSidebar from '../../../Component/Head/HeadSidebar';
import './HeadNotificationPage.css';

function HeadNotificationPage() {
  const navigate = useNavigate();
  const [notis, setNotis] = useState([]);

  const headId = localStorage.getItem('userId');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/notifications/${headId}`);
      setNotis(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleOpen = async (id) => {
    setNotis((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, open: !item.open, is_read: 1 } : item
      )
    );
    await axios.put(`http://localhost:5000/api/notifications/${id}/read`);
  };

  return (
    <div className="layout-container">
      <HeadSidebar />

      <main className="noti-main">
        <button className="back-btn" onClick={() => navigate('/head/dashboard')}>
          ← กลับแดชบอร์ด
        </button>

        <h1>ศูนย์แจ้งเตือนหัวหน้า</h1>

        {notis.length === 0 ? (
          <p style={{ marginTop: '2rem' }}>— ไม่มีแจ้งเตือน —</p>
        ) : (
          <ul className="noti-list">
            {notis.map((noti) => (
              <li
                key={noti.id}
                className={`noti-item ${noti.is_read ? 'read' : 'unread'}`}
              >
                <div
                  className="noti-summary"
                  onClick={() => toggleOpen(noti.id)}
                >
                  <span className="noti-type">🔔</span>
                  <span className="noti-title">{noti.message}</span>
                  <span className="noti-date">
                    {new Date(noti.created_at).toLocaleString()}
                  </span>
                </div>

                {noti.open && (
                  <div className="noti-details">
                    {noti.message}
                    <br />
<button
  className="approve-btn"
  onClick={() => navigate("/head/leave-approvals")}
>
  ไปหน้าอนุมัติการลา
</button>


                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

export default HeadNotificationPage;
