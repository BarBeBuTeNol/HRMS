import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./EditEmpNav.css";

const EditEmpNav = ({ userId, activeTab }) => {
  const tabs = [
    {
      id: "personal",
      label: "Personal Info",
      path: userId ? `/hr/edit-emp-personal/${userId}` : "/hr/add-emp-personal",
    },
    {
      id: "job",
      label: "Job Info",
      path: userId ? `/hr/edit-emp-info/${userId}` : "/hr/add-emp-info",
    },
    {
      id: "education",
      label: "Education",
      path: userId
        ? `/hr/edit-emp-education/${userId}`
        : "/hr/add-emp-education",
    },
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
