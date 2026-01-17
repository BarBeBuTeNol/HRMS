import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../../../services/api";
import EmployeeSidebar from "../../../Component/Employee/EmployeeSidebar";
import "./my-info.css";
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
  BookOpen,
  GraduationCap,
  ChevronLeft,
  Star,
  BadgeCheck, // Added
} from "lucide-react";

const ProfilePage = () => {
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
      <div className="my-info-loading">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <div className="my-info-loader-spinner"></div>
        </motion.div>
        <p>Loading Profile...</p>
      </div>
    );

  if (error) return <div className="my-info-error">{error}</div>;

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return dayjs(date).format("D MMMM YYYY");
  };

  return (
    <div className="my-info-container">
      <EmployeeSidebar />
      <motion.div
        className="my-info-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Navigation */}
        <button className="my-info-back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={20} /> Back
        </button>

        {/* Header Card */}
        <motion.div className="my-info-header-card" variants={itemVariants}>
          <div className="my-info-cover-bg"></div>
          <div className="my-info-header-content">
            <motion.div
              className="my-info-avatar-wrapper"
              whileHover={{ scale: 1.05 }}
            >
              {profile.profile_pic ? (
                <img
                  src={profile.profile_pic}
                  alt="Profile"
                  className="my-info-pic"
                />
              ) : (
                <div className="my-info-pic-placeholder">
                  <User size={64} />
                </div>
              )}
            </motion.div>
            <div className="my-info-identity">
              <div className="my-info-name-row">
                <h1>{profile.full_name}</h1>
                <BadgeCheck size={32} className="verified-badge" />
              </div>
              <p className="my-info-role-badge">
                {profile.work?.jobTitle || profile.role_name}
              </p>
              <div className="my-info-contact-pills">
                <span className="my-info-pill">
                  <Mail size={16} className="text-blue" /> {profile.email}
                </span>
                <span className="my-info-pill">
                  <Phone size={16} className="text-accent" />{" "}
                  {profile.phone || "No Phone"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Grid */}
        <div className="my-info-grid">
          {/* Left Col: Personal Info */}
          <div className="my-info-col-left">
            <motion.section className="my-info-card" variants={itemVariants}>
              <div className="my-info-card-header">
                <User size={20} className="text-accent" />
                <h3>Personal Details</h3>
              </div>
              <div className="my-info-list">
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
                  icon={<Hearts size={16} />}
                  label="Marital Status"
                  value={profile.maritalStatus}
                />
                <InfoRow
                  icon={<Calendar size={16} />}
                  label="Birthday"
                  value={formatDate(profile.birthday)}
                />
                <InfoRow
                  icon={<MapPin size={16} />}
                  label="Address"
                  value={profile.address}
                />
                <InfoRow
                  icon={<Flag size={16} />}
                  label="Religion"
                  value={profile.religion}
                />
              </div>
            </motion.section>

            <motion.section className="my-info-card" variants={itemVariants}>
              <div className="my-info-card-header">
                <Heart size={20} className="text-danger" />
                <h3>Emergency Contact</h3>
              </div>
              <div className="my-info-list">
                <InfoRow label="Name" value={profile.emergencyContact?.name} />
                <InfoRow
                  label="Relation"
                  value={profile.emergencyContact?.relation}
                />
                <InfoRow
                  label="Phone"
                  value={profile.emergencyContact?.phone}
                />
              </div>
            </motion.section>
          </div>

          {/* Right Col: Work & Education */}
          <div className="my-info-col-right">
            <motion.section className="my-info-card" variants={itemVariants}>
              <div className="my-info-card-header">
                <Briefcase size={20} className="text-blue" />
                <h3>Employment Information</h3>
              </div>
              <div className="my-info-grid-2-col">
                <InfoBox label="Employee Code" value={profile.work?.empCode} />
                <InfoBox label="Department" value={profile.work?.department} />
                <InfoBox
                  label="Work Hours"
                  value={`${profile.work?.startOption} - ${profile.work?.endOption}`}
                />
                <InfoBox
                  label="Hire Date"
                  value={formatDate(profile.work?.hireDate)}
                />
                <InfoBox label="Status" value={profile.work?.status} isBadge />
                <InfoBox label="Job Title" value={profile.work?.jobTitle} />
              </div>
            </motion.section>

            <motion.section className="my-info-card" variants={itemVariants}>
              <div className="my-info-card-header">
                <GraduationCap size={20} className="text-purple" />
                <h3>Education & Skills</h3>
              </div>
              <div className="my-info-list">
                <div className="my-info-edu-item">
                  <h4>{profile.education?.institution}</h4>
                  <p className="my-info-edu-degree">
                    {profile.education?.level} in {profile.education?.program}
                  </p>
                </div>
                {profile.education?.skills && (
                  <div className="my-info-skills-container">
                    <strong>Skills:</strong>
                    <div className="my-info-skill-tags">
                      {profile.education.skills.split(",").map((skill, i) => (
                        <span key={i} className="my-info-skill-tag">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.section>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Helper Components
const InfoRow = ({ icon, label, value }) => (
  <div className="my-info-row">
    {icon && <span className="my-info-icon-wrapper">{icon}</span>}
    <span className="my-info-label">{label}:</span>
    <span className="my-info-value">{value || "-"}</span>
  </div>
);

const InfoBox = ({ label, value, isBadge }) => (
  <div className="my-info-box">
    <span className="my-info-box-label">{label}</span>
    {isBadge ? (
      <span className="my-info-status-badge active">{value}</span>
    ) : (
      <span className="my-info-box-value">{value || "-"}</span>
    )}
  </div>
);

// Lucide icon wrapper for Heart/Hearts consistency
const Hearts = (props) => <Heart {...props} />;

export default ProfilePage;
