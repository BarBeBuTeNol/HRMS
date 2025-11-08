//PopupMain.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import './PopupMain.css' // Assuming you have a CSS file for styling

const PopupMain = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Popup Buttons */}
      <div className="popup-buttons">
        <button className="popup-btn" onClick={() => navigate('/login')}>Login</button>
        <button className="popup-btn" onClick={() => navigate('/company')}>Company</button>
      </div>
    </div>
  )
}

export default PopupMain