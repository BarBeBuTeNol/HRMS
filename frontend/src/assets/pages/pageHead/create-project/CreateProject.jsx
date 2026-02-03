import React, { useState, useEffect } from "react";
import HeadSidebar from "../../../Component/Head/HeadSidebar";
import api from "../../../../services/api";
import "./CreateProject.css";
import {
  FaProjectDiagram,
  FaCalendarAlt,
  FaUsers,
  FaCloudUploadAlt,
  FaCheck,
  FaRocket
} from "react-icons/fa";
import PopupDoneHead from "../../../Component/poup_done/poup_done-head/PopupDoneHead";
import PopupErrorHead from "../../../Component/popup-error/popup-error-head/PopupErrorHead";
import PopupHead from "../../../Component/popup_notifications/popup_notifications-head/PopupHead";
import LoadingHead from "../../../Component/loading/loading-head/LoadingHead";

const CreateProject = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  
  // Data
  const [employees, setEmployees] = useState([]);
  const [existingProjects, setExistingProjects] = useState([]);
  const [workloadData, setWorkloadData] = useState({});

  // Form State
  const [formData, setFormData] = useState({
    project_name: "",
    description: "",
    start_date: "",
    end_date: "",
    priority: "Medium",
    status: "Planning",
    attachments: null
  });
  
  const [selectedMembers, setSelectedMembers] = useState([]);

  // Popups
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [popupMsg, setPopupMsg] = useState("");
  const [warningMsg, setWarningMsg] = useState("");

  const headId = localStorage.getItem("userId");

  // Helper for Timeline
  const getTimelineStyle = (start, end) => {
     if(!start || !end) return { width: 0, left: 0 };
     
     const now = new Date();
     // View window: 1 month before today to 5 months after (6 months total)
     const viewStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
     const viewEnd = new Date(now.getFullYear(), now.getMonth() + 5, 0);
     const totalDuration = viewEnd - viewStart;

     const s = new Date(start);
     const e = new Date(end);

     // Clip dates to view window
     const activeStart = s < viewStart ? viewStart : s;
     const activeEnd = e > viewEnd ? viewEnd : e;

     if(activeEnd < activeStart) return { width: 0, left: 0, display: 'none' }; // Out of view

     const offset = ((activeStart - viewStart) / totalDuration) * 100;
     const width = ((activeEnd - activeStart) / totalDuration) * 100;

     return { left: `${Math.max(0, offset)}%`, width: `${Math.min(100, width)}%` };
  };

  const getStatusColor = (status) => {
      switch(status) {
          case 'Active': return '#10b981'; // Green
          case 'Planning': return '#f59e0b'; // Orange
          case 'Completed': return '#3b82f6'; // Blue
          default: return 'var(--head-text-muted)';
      }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!headId) return;
        
        const [empRes, projRes, delegationRes] = await Promise.all([
          api.get(`/head/employees/${headId}`),
          api.get(`/head/projects`),
          api.get(`/head/delegation-data/${headId}`)
        ]);

        setEmployees(empRes.data);
        setExistingProjects(projRes.data || []);
        
        const workMap = {};
        const workItems = delegationRes.data.workItems || [];
        
        workItems.forEach(item => {
           const uid = item.user_id || item.id;
           if(!workMap[uid]) workMap[uid] = 0;
           workMap[uid] += 10;
        });
        setWorkloadData(workMap);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [headId]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setIsSidebarOpen(false); // Force collapsed on mobile
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleMember = (empId) => {
    setSelectedMembers(prev => 
      prev.includes(empId) 
        ? prev.filter(id => id !== empId)
        : [...prev, empId]
    );
  };

  const handleFileUpload = (e) => {
     const file = e.target.files[0];
     if(file) {
        const allowedExts = ['png', 'jpg', 'jpeg', 'pdf', 'xls', 'xlsx', 'csv', 'doc', 'docx'];
        const ext = file.name.split('.').pop().toLowerCase();
        
        if (!allowedExts.includes(ext)) {
            setWarningMsg("Invalid file type. Allowed: PNG, JPG, PDF, EXCEL, CSV, DOC");
            setShowWarning(true);
            e.target.value = null; // Reset input
            return;
        }

        setFormData(prev => ({ ...prev, attachments: file.name }));
     }
  };

  const isFormValid = formData.project_name && formData.start_date && formData.end_date;

  const handleSubmit = async () => {
    if (!isFormValid) {
      setWarningMsg("Please fill in all required fields.");
      setShowWarning(true);
      return;
    }

    try {
      const projectPayload = {
        project_name: formData.project_name,
        description: formData.description,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status,
        created_by: headId
      };

      const res = await api.post("/head/projects/create", projectPayload);
      
      if (res.data.success) {
        const newProjectId = res.data.projectId;
        
        if (selectedMembers.length > 0) {
           const infoTaskPromises = selectedMembers.map(uid => 
             api.post("/head/tasks/create", {
                project_id: newProjectId,
                assigned_to_user_id: uid,
                task_name: "Project Kickoff",
                description: "Initial assignment to project " + formData.project_name,
                priority: formData.priority,
                deadline: formData.end_date,
                assigned_by_head_id: headId
             })
           );
           await Promise.all(infoTaskPromises);
        }

        // Update local state for immediate timeline reflection
        const newProject = {
            id: newProjectId,
            project_name: formData.project_name,
            description: formData.description,
            start_date: formData.start_date,
            end_date: formData.end_date,
            status: formData.status,
            priority: formData.priority,
            created_by: headId
        };
        setExistingProjects(prev => [...prev, newProject]);

        setPopupMsg("Project created successfully!");
        setShowSuccess(true);
        setFormData({
            project_name: "",
            description: "",
            start_date: "",
            end_date: "",
            priority: "Medium",
            status: "Planning",
            attachments: null
        });
        setSelectedMembers([]);
      }

    } catch (err) {
      console.error("Creation Error:", err);
      setPopupMsg("Failed to create project. " + (err.response?.data?.message || ""));
      setShowError(true);
    }
  };

  if (loading) return <LoadingHead />;

  const months = [-1,0,1,2,3,4].map(offset => {
      const d = new Date();
      d.setMonth(d.getMonth() + offset);
      return d.toLocaleString('default', { month: 'short' });
  });

  return (
    <div className="create-project-container">
      <HeadSidebar onToggle={setIsSidebarOpen} />
      
      <main className={`cp-content-grid ${isSidebarOpen ? 'expanded' : 'collapsed'}`}>
        
        {/* Top Row: Form & Team Split */}
        <div className="cp-top-row">
           {/* Initialize Project */}
           <div className="cp-card cp-card-form">
              <div className="cp-header">
                <h1><FaRocket /> Initialize Project</h1>
                <p>Set specific goals, timeline, and resources.</p>
              </div>

              <div className="cp-form-container">
                 <div className="cp-form-grid">
                   {/* Name & Priority Row */}
                   <div className="cp-form-group">
                     <label className="cp-label">Project Name <span style={{color:'red'}}>*</span></label>
                     <input 
                       type="text" 
                       name="project_name"
                       className="cp-input" 
                       value={formData.project_name}
                       onChange={handleInputChange}
                       onKeyDown={(e) => {
                         if (e.key === " ") e.preventDefault();
                       }}
                       maxLength={255}
                       placeholder="Enter project name..."
                       autoComplete="off"
                     />
                   </div>
                   
                   <div className="cp-form-group">
                     <label className="cp-label">Priority</label>
                     <div className="cp-priority-options">
                       {["Low", "Medium", "High", "Urgent"].map(p => (
                         <button 
                            key={p} 
                            className={`cp-priority-btn ${formData.priority === p ? 'selected' : ''}`}
                            onClick={() => setFormData(pre => ({...pre, priority: p}))}
                            data-priority={p}
                         >
                           {p}
                         </button>
                       ))}
                     </div>
                   </div>

                   {/* Dates Row */}
                   <div className="cp-form-group full-width cp-dual-group">
                      <div className="cp-dual-item">
                        <label className="cp-label"><FaCalendarAlt /> Start Date <span style={{color:'red'}}>*</span></label>
                        <input 
                          type="date" 
                          name="start_date"
                          className="cp-input"
                          value={formData.start_date}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split('T')[0]} 
                          onClick={(e) => e.target.showPicker && e.target.showPicker()}
                        />
                      </div>
                      <div className="cp-dual-item">
                         <label className="cp-label"><FaCalendarAlt /> End Date <span style={{color:'red'}}>*</span></label>
                         <input 
                           type="date" 
                           name="end_date"
                           className="cp-input"
                           value={formData.end_date}
                           onChange={handleInputChange}
                           min={formData.start_date || new Date().toISOString().split('T')[0]}
                           onClick={(e) => e.target.showPicker && e.target.showPicker()}
                         />
                      </div>
                   </div>

                   {/* Description */}
                   <div className="cp-form-group full-width">
                     <label className="cp-label">Description & Objectives</label>
                     <textarea 
                       name="description"
                       className="cp-textarea"
                       value={formData.description}
                       onChange={handleInputChange}
                       placeholder="Outline key deliverables..."
                     ></textarea>
                   </div>

                   {/* File Upload */}
                   <div className="cp-form-group full-width">
                      <div className="cp-file-upload" onClick={() => document.getElementById('brief-upload').click()}>
                         <FaCloudUploadAlt className="cp-upload-icon" style={{ fontSize: '1.5rem', marginBottom:0 }} />
                         <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                            <span style={{ fontSize: '0.9rem' }}>Upload Brief / Specs</span>
                            {formData.attachments && <span className="cp-file-name" style={{ fontSize: '0.8rem' }}>{formData.attachments}</span>}
                            <span style={{ fontSize: '0.7rem', color:'var(--head-text-muted)', marginTop:'0.3rem' }}>
                               Supports: PNG, JPG, PDF, EXCEL, CSV, DOC
                            </span>
                         </div>
                         <input 
                            id="brief-upload" 
                            type="file" 
                            hidden 
                            accept=".png,.jpg,.jpeg,.pdf,.xls,.xlsx,.csv,.doc,.docx"
                            onChange={handleFileUpload}
                         />
                      </div>
                   </div>
                 </div>
              </div>

              {/* Footer Button */}
              <div className="cp-footer-actions">
                <button className="cp-btn cp-btn-cancel" onClick={() => setFormData({
                   project_name: "", description: "", start_date: "", end_date: "", priority: "Medium", status: "Planning", attachments: null
                })}>Clear</button>
                <button 
                   className={`cp-btn cp-btn-submit ${!isFormValid ? 'disabled' : ''}`} 
                   onClick={handleSubmit}
                   disabled={!isFormValid}
                   style={{ opacity: !isFormValid ? 0.5 : 1, cursor: !isFormValid ? 'not-allowed' : 'pointer' }}
                >
                   Create Project
                </button>
              </div>
           </div>

           {/* Select Team */}
           <div className="cp-card cp-card-team">
              <div className="cp-header" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--cp-border)', paddingBottom: '0.8rem' }}>
                 <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap: '0.8rem' }}>
                       <FaUsers style={{ color: 'var(--head-accent-color)' }} /> 
                       <span>Select Team</span>
                       <span style={{ fontSize: '0.85rem', color: 'var(--head-text-secondary)', fontWeight: '400' }}>Available Resources</span>
                    </div>
                    <span style={{ background: 'var(--head-accent-color)', color: '#000', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight:'bold' }}>
                       {selectedMembers.length} Selected
                    </span>
                 </h3>
              </div>
              
              <div className="cp-team-list">
                 {employees.map(emp => {
                    const load = Math.min(workloadData[emp.id] || 0, 100);
                    const loadClass = load > 75 ? 'high' : load > 40 ? 'medium' : 'low';
                    const isSelected = selectedMembers.includes(emp.id);

                    return (
                       <div 
                         key={emp.id} 
                         className={`cp-team-card ${isSelected ? 'selected' : ''}`}
                         onClick={() => toggleMember(emp.id)}
                       >
                          {isSelected && <FaCheck className="cp-check-icon" />}
                          <div className="cp-avatar-lg">{emp.first_name[0]}</div>
                          <div className="cp-member-name">{emp.first_name} {emp.last_name}</div>
                          <div className="cp-member-role">{emp.position_name || "Employee"}</div>
                          
                          <div style={{ width: '100%', marginTop: '0.4rem' }}>
                             <div className="cp-load-indicator">
                                <div className={`cp-workload-fill ${loadClass}`} style={{ width: `${load}%` }}></div>
                             </div>
                             <div style={{ textAlign: 'right', fontSize: '0.65rem', color: 'var(--head-text-muted)', marginTop: '2px' }}>
                                {load}% Load
                             </div>
                          </div>
                       </div>
                    );
                 })}
              </div>
           </div>
        </div>

        {/* Bottom Row: Timeline Full Width */}
        <div className="cp-bottom-row">
           <div className="cp-card cp-card-timeline">
              <div className="cp-header" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--cp-border)', paddingBottom: '1rem' }}>
                 <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <FaCalendarAlt style={{ color: 'var(--head-accent-color)' }} /> 
                    <span>Project Timeline</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--head-text-secondary)', fontWeight: '400', background:'rgba(255,255,255,0.1)', padding:'2px 8px', borderRadius:'12px' }}>6 Months View</span>
                 </h3>
              </div>
              
              {/* Timeline Header (Months) */}
              <div className="cp-timeline-header-row" style={{ display: 'flex', background:'rgba(0,0,0,0.2)', padding:'0.8rem 0', borderRadius:'8px', marginBottom: '0.8rem' }}>
                 <div style={{ width: '200px', paddingLeft: '1rem', color:'var(--head-text-secondary)', fontSize:'0.75rem', display:'flex', alignItems:'center', flexShrink: 0 }}>Project</div>
                 {months.map((m, i) => (
                    <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '0.85rem', fontWeight:'600', color: 'var(--head-text-primary)', minWidth: '60px' }}>{m}</div>
                 ))}
              </div>

              <div className="cp-timeline-mini">
                 {existingProjects.length === 0 && <p className="cp-label" style={{textAlign:'center', marginTop:'1rem'}}>No active projects.</p>}
                 {existingProjects.map(proj => {
                    const style = getTimelineStyle(proj.start_date, proj.end_date);
                    if(style.display === 'none') return null; // Skip out of range

                    return (
                       <div key={proj.id} className="cp-timeline-row">
                          <div className="cp-timeline-name" data-title={proj.project_name}>{proj.project_name}</div>
                          <div className="cp-timeline-bar-wrapper">
                             <div 
                                className="cp-timeline-bar" 
                                style={{ 
                                   ...style, 
                                   background: getStatusColor(proj.status),
                                   opacity: 0.7 
                                }}
                                title={`${proj.start_date} - ${proj.end_date}`}
                             ></div>
                          </div>
                       </div>
                    );
                 })}
                 
                 {/* New Project Preview */}
                 {formData.start_date && formData.end_date && (
                    <div className="cp-timeline-row">
                       <div className="cp-timeline-name" style={{ color: 'var(--head-accent-color)' }}>New Project</div>
                       <div className="cp-timeline-bar-wrapper">
                          <div 
                             className="cp-timeline-bar new-project" 
                             style={{
                                ...getTimelineStyle(formData.start_date, formData.end_date),
                                opacity: 1
                             }}
                          ></div>
                       </div>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </main>

      <PopupDoneHead 
         isOpen={showSuccess} 
         onClose={() => setShowSuccess(false)}
         message={popupMsg}
      />
      <PopupErrorHead 
         isOpen={showError} 
         onClose={() => setShowError(false)}
         message={popupMsg}
      />
      {/* Warning Popup */}
      <PopupHead
         isOpen={showWarning}
         onClose={() => setShowWarning(false)}
         title="Warning"
         message={warningMsg}
         type="warning"
      />
    </div>
  );
};

export default CreateProject;
