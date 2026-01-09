import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./EditEmpNav.css";

const EditEmpNav = ({ userId, activeTab }) => {
  const tabs = [
    { id: "personal", label: "Personal Info", path: "/hr/add-emp-personal" },
    { id: "job", label: "Job Info", path: "/hr/add-emp-info" },
    { id: "education", label: "Education", path: "/hr/add-emp-education" },
  ];

  return (
    <div className="edit-emp-nav">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          to={tab.path}
          state={{ userId: userId, isEditMode: true }}
          className={`edit-nav-tab ${activeTab === tab.id ? "active" : ""}`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
};

export default EditEmpNav;
