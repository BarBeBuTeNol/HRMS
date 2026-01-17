import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../../../services/api";
import HeadSidebar from "../../../Component/Head/HeadSidebar";
import "./HeadProfilePage.css";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Flag,
  Droplet,
  Briefcase,
  Award,
  GraduationCap,
  ChevronLeft,
  BadgeCheck,
  Shield,
  Layers,
} from "lucide-react";

const HeadProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const useUserId = () => {
    const { search } = useLocation();
    const qs = new URLSearchParams(search);
    const qId = Number(qs.get("userId"));
    if (!Number.isNaN(qId) && qId > 0) return qId;

    // Fallback to local storage
    const storageUser = JSON.parse(localStorage.getItem("currentUser"));
    return storageUser?.id || 0;
  };

  const userId = useUserId();

  useEffect(() => {
    if (!userId) {
      setError("User ID not found");
      setLoading(false);
      return;
    }

    // Reuse the same API endpoint as Employee Profile
    api
      .get(`/api/users/${userId}/profile`)
      .then((res) => setProfile(res.data))
      .catch((err) => {
        console.error(err);
        setError("Failed to load profile data.");
      })
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading)
    return (
      <div className="head-profile-loading">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <div className="head-profile-loader-spinner"></div>
        </motion.div>
        <p>Retrieving Head Profile...</p>
      </div>
    );

  if (error) return <div className="head-profile-error">{error}</div>;

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return dayjs(date).format("D MMMM YYYY");
  };

  return (
    <div className="head-profile-layout">
      <div className="head-profile-sidebar-wrapper">
        <HeadSidebar />
      </div>
      <div className="head-profile-container">
        <motion.div
          className="head-profile-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header Section */}
          <motion.div
            className="head-profile-header-card"
            variants={itemVariants}
          >
            <div className="head-profile-cover-bg"></div>
            <div className="head-profile-header-content">
              <motion.div
                className="head-profile-avatar-wrapper"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {profile.profile_pic ? (
                  <img
                    src={profile.profile_pic}
                    alt="Profile"
                    className="head-profile-pic"
                  />
                ) : (
                  <div className="head-profile-pic-placeholder">
                    <User size={64} />
                  </div>
                )}
              </motion.div>

              <div className="head-profile-identity">
                <h1>
                  {profile.full_name}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <BadgeCheck
                      size={32}
                      className="head-profile-verified-badge"
                    />
                  </motion.div>
                </h1>
                <span className="head-profile-role-badge">
                  {profile.work?.jobTitle ||
                    profile.role_name ||
                    "Department Head"}
                </span>

                <div className="head-profile-contact-pills">
                  <div className="head-profile-pill">
                    <Mail size={16} className="text-blue" />
                    {profile.email}
                  </div>
                  <div className="head-profile-pill">
                    <Phone size={16} className="text-green" />
                    {profile.phone || "No Phone"}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Information Grid */}
          <div className="head-profile-grid">
            {/* Left Column: Personal Info */}
            <div className="head-profile-col">
              <motion.section
                className="head-profile-section-card"
                variants={itemVariants}
              >
                <div className="head-profile-card-header">
                  <Shield size={24} className="head-icon-accent" />
                  <h3>Personal Information</h3>
                </div>

                <div className="head-profile-info-list">
                  <InfoRow
                    icon={<Flag size={16} />}
                    label="Nationality"
                    value={profile.nationality}
                  />
                  <InfoRow
                    icon={<Droplet size={16} />}
                    label="Blood Type"
                    value={profile.bloodType}
                  />
                  <InfoRow
                    icon={<Heart size={16} />}
                    label="Marital Status"
                    value={profile.maritalStatus}
                  />
                  <InfoRow
                    icon={<Calendar size={16} />}
                    label="Date of Birth"
                    value={formatDate(profile.birthday)}
                  />
                  <InfoRow
                    icon={<MapPin size={16} />}
                    label="Address"
                    value={profile.address}
                  />
                  <InfoRow
                    icon={<Layers size={16} />}
                    label="Religion"
                    value={profile.religion}
                  />
                </div>
              </motion.section>

              <motion.section
                className="head-profile-section-card"
                variants={itemVariants}
                style={{ marginTop: "2rem" }}
              >
                <div className="head-profile-card-header">
                  <Heart size={24} className="head-icon-rose" />
                  <h3>Emergency Contact</h3>
                </div>
                <div className="head-profile-info-list">
                  <InfoRow
                    label="Contact Name"
                    value={profile.emergencyContact?.name}
                  />
                  <InfoRow
                    label="Relationship"
                    value={profile.emergencyContact?.relation}
                  />
                  <InfoRow
                    label="Phone Number"
                    value={profile.emergencyContact?.phone}
                  />
                </div>
              </motion.section>
            </div>

            {/* Right Column: Work & Education */}
            <div className="head-profile-col">
              <motion.section
                className="head-profile-section-card"
                variants={itemVariants}
              >
                <div className="head-profile-card-header">
                  <Briefcase size={24} className="head-icon-blue" />
                  <h3>Employment Details</h3>
                </div>

                <div className="head-profile-info-grid-2">
                  <InfoBox label="Employee ID" value={profile.work?.empCode} />
                  <InfoBox
                    label="Department"
                    value={profile.work?.department}
                  />
                  <InfoBox
                    label="Work Schedule"
                    value={`${profile.work?.startOption || "-"} - ${
                      profile.work?.endOption || "-"
                    }`}
                  />
                  <InfoBox
                    label="Date Hired"
                    value={formatDate(profile.work?.hireDate)}
                  />
                  <InfoBox
                    label="Current Status"
                    value={profile.work?.status}
                    isBadge
                  />
                  <InfoBox label="Position" value={profile.work?.jobTitle} />
                </div>
              </motion.section>

              <motion.section
                className="head-profile-section-card"
                variants={itemVariants}
                style={{ marginTop: "2rem" }}
              >
                <div className="head-profile-card-header">
                  <GraduationCap size={24} className="head-icon-purple" />
                  <h3>Education & Expertise</h3>
                </div>

                <div className="head-profile-edu-item">
                  <h4>
                    {profile.education?.institution || "Institution Name"}
                  </h4>
                  <p className="head-profile-edu-degree">
                    {profile.education?.level || "Degree"} in{" "}
                    {profile.education?.program || "Field of Study"}
                  </p>
                </div>

                {profile.education?.skills && (
                  <div className="head-profile-skills-wrapper">
                    <strong>Professional Skills</strong>
                    <div className="head-profile-skill-tags">
                      {profile.education.skills.split(",").map((skill, i) => (
                        <span key={i} className="head-profile-skill-tag">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.section>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Helper Components
const InfoRow = ({ icon, label, value }) => (
  <div className="head-profile-info-row">
    {icon && <div className="head-profile-row-icon">{icon}</div>}
    <div className="head-profile-row-content">
      <span className="head-profile-row-label">{label}</span>
      <span className="head-profile-row-value">{value || "-"}</span>
    </div>
  </div>
);

const InfoBox = ({ label, value, isBadge }) => (
  <div className="head-profile-info-box">
    <span className="head-profile-box-label">{label}</span>
    {isBadge ? (
      <span className="head-profile-status-badge active">{value}</span>
    ) : (
      <span className="head-profile-box-value">{value || "-"}</span>
    )}
  </div>
);

export default HeadProfilePage;
