import React from "react";
import "./PopupSentDataChro.css";
import LoadingCHRO from "../../loading/loading-chro/LoadingCHRO"; // Reuse existing loading if matches, or create simple one.
// User asked to use this popup AS the "Sending Data" state.
// Detailed instruction: "When updated sending data, want to call this popup".

const PopupSentDataChro = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="chro-sending-overlay">
      <div className="chro-sending-card">
        <div className="chro-sending-spinner"></div>
        <h3 className="chro-sending-title">INITIALIZING DATA UPLINK</h3>
        <p className="chro-sending-desc">
          Securely transmitting executive directive...
        </p>
      </div>
    </div>
  );
};

export default PopupSentDataChro;
