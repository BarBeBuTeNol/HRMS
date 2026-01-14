import React from "react";
import PopupNotification from "./PopupNotification";
import "./PopupNotification.css"; // Ensure CSS is available

const CHROPopup = (props) => {
  // We override type to use our custom executive theme class
  // We also hijack the 'message' to optionally ensure it has correct formatting if needed

  return (
    <PopupNotification
      {...props}
      type="chro-executive"
      // We force the type to 'chro-executive' which we will style in CSS
      // If the user passed a type (like 'success'), we can append it if we want icons,
      // but for CHRO we want a custom Gold look.
    />
  );
};

export default CHROPopup;
