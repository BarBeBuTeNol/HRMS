import React, { useState, useEffect } from "react";
import "./DelegateShiftPage.css";
import HeadSidebar from "../../../Component/Head/HeadSidebar";
import {
  FaExchangeAlt,
  FaBriefcase,
  FaCheckCircle,
  FaSearch,
  FaCalendarAlt,
  FaArrowRight,
  FaHistory,
  FaExclamationTriangle,
  FaClock,
  FaUserFriends,
  FaChartLine
} from "react-icons/fa";
import api from "../../../../services/api";
import PopupDoneHead from "../../../Component/poup_done/poup_done-head/PopupDoneHead";

const DelegateShiftPage = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [filterDate, setFilterDate] = useState("");
  const [filterName, setFilterName] = useState("");
  
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedReplacement, setSelectedReplacement] = useState(null);
  const [delegationReason, setDelegationReason] = useState("");
  const [priority, setPriority] = useState("Normal");

  const [shifts, setShifts] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock stats for the "Hero" section (In real app, fetch these)
  const stats = {
    activeDelegations: 12,
    pendingApproval: 4,
    efficiency: "94%"
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const currentUserStr = localStorage.getItem("currentUser");
      const user = currentUserStr ? JSON.parse(currentUserStr) : null;
      if (!user || !user.id) return;

      const response = await api.get(`/head/delegation-data/${user.id}`);
      const { workItems, employees } = response.data;

      const formattedShifts = workItems.map((item) => ({
        id: item.id,
        employee: `${item.first_name} ${item.last_name}`,
        type: item.type, 
        title: item.title,
        date: item.work_date ? item.work_date.split("T")[0] : "N/A",
        status: "Active",
        original_user_id: item.user_id,
        image: item.profile_image_url || null
      }));
      setShifts(formattedShifts);

      const formattedStaff = employees.map((emp) => ({
        id: emp.id,
        name: `${emp.first_name} ${emp.last_name}`,
        role: emp.position_name || "Employee",
        status: "Available", // Logic placeholder
        image: emp.profile_image_url || null,
      }));
      setStaffList(formattedStaff);
    } catch (error) {
      console.error("Error fetching delegation data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredShifts = shifts.filter((shift) => {
    const matchesName =
      filterName === "" ||
      shift.employee.toLowerCase().includes(filterName.toLowerCase()) ||
      shift.title.toLowerCase().includes(filterName.toLowerCase());
    const matchesDate = filterDate === "" || shift.date === filterDate;
    return matchesName && matchesDate;
  });

  const filteredStaff = staffList.filter(
    (s) =>
      s.name.toLowerCase().includes(filterName.toLowerCase()) ||
      s.role.toLowerCase().includes(filterName.toLowerCase())
  );

  const handleTaskSelect = (task) => setSelectedTask(task);
  
  const handleReplacementSelect = (staff) => {
    if (staff.status === "Busy") return;
    setSelectedReplacement(staff);
  };

  const handleNextStep = () => {
    if (activeStep === 1 && selectedTask) setActiveStep(2);
    else if (activeStep === 2 && selectedReplacement) setActiveStep(3);
  };

  const handlePrevStep = () => {
    if (activeStep > 1) setActiveStep(activeStep - 1);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        task_id: selectedTask.type === "Task" ? selectedTask.id : null,
        shift_id: selectedTask.type === "Shift" ? selectedTask.id : null,
        original_user_id: selectedTask.original_user_id,
        replacement_user_id: selectedReplacement.id,
        reason: delegationReason,
        priority: priority,
      };

      await api.post("/head/delegate-work", payload);
      setIsPopupOpen(true);
      
      setActiveStep(1);
      setSelectedTask(null);
      setSelectedReplacement(null);
      setDelegationReason("");
      fetchData();
    } catch (error) {
      alert("Failed to delegate shift.");
    }
  };

  return (
    <div className="delegate-shift-container">
      <HeadSidebar />

      <div className="delegate-main-content">
        {/* --- Header Section --- */}
        <header className="delegate-header">
          <div className="header-title-group">
            <h1>Delegate Work Manager</h1>
            <p>Optimize your team's workflow by reassigning tasks efficiently.</p>
          </div>
          <div className="header-stats">
            <div className="stat-pill">
              <FaClock /> Pending: <strong>{stats.pendingApproval}</strong>
            </div>
            <div className="stat-pill">
              <FaBriefcase /> Active: <strong>{stats.activeDelegations}</strong>
            </div>
            <div className="stat-pill">
              <FaChartLine /> Efficiency: <strong>{stats.efficiency}</strong>
            </div>
          </div>
        </header>

        {/* --- Interactive Stepper --- */}
        <div className="delegate-stepper">
          <div className="stepper-track"></div>
          {[
            { id: 1, label: "Select Work", icon: <FaBriefcase /> },
            { id: 2, label: "Assign Staff", icon: <FaUserFriends /> },
            { id: 3, label: "Confirm", icon: <FaCheckCircle /> },
          ].map((step) => (
            <div
              key={step.id}
              className={`stepper-item ${activeStep >= step.id ? "active" : ""} ${activeStep > step.id ? "completed" : ""}`}
              onClick={() => { if(step.id < activeStep) setActiveStep(step.id) }} 
            >
              <div className="stepper-icon-box">{step.icon}</div>
              <span className="stepper-label">{step.label}</span>
            </div>
          ))}
        </div>

        {/* --- Main Content Grid --- */}
        <div className="delegate-content-grid">
          
          {/* Left Column: Dynamic Content based on Step */}
          <div className="delegate-col-main">
            
            {/* STEP 1: Select Work */}
            {activeStep === 1 && (
              <div className="selection-card-unified">
                <div className="card-header-row">
                  <h3><FaBriefcase /> Available Work Items</h3>
                </div>

                <div className="filter-toolbar">
                  <div className="search-input-wrapper">
                    <FaSearch className="search-icon-float" />
                    <input 
                      type="text" 
                      placeholder="Search task, shift, or employee..." 
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                    />
                  </div>
                  <div className="date-picker-wrapper" onClick={() => document.getElementById('chk-date').showPicker()}>
                     <input 
                       id="chk-date"
                       type="date" 
                       value={filterDate}
                       min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]}
                       onChange={(e) => setFilterDate(e.target.value)}
                     />
                  </div>
                </div>

                <div className="work-item-list">
                   {loading ? (
                     <div className="state-loading"><span>Loading...</span></div>
                   ) : filteredShifts.length > 0 ? (
                     filteredShifts.map((item) => (
                        <div 
                          key={`${item.type}-${item.id}`}
                          className={`work-item-card ${selectedTask?.id === item.id && selectedTask?.type === item.type ? 'selected' : ''}`}
                          onClick={() => handleTaskSelect(item)}
                        >
                          <div className={`wi-icon type-${item.type.toLowerCase()}`}>
                            {item.type === 'Shift' ? <FaClock/> : <FaBriefcase/>}
                          </div>
                          <div className="wi-details">
                            <h4>{item.title}</h4>
                            <span className="wi-type-badge">{item.type} • #{item.id}</span>
                          </div>
                          <div className="wi-owner">
                            <div className="owner-avatar">
                              {item.image ? <img src={item.image} alt="owner" /> : <div className="placeholder">{item.employee.charAt(0)}</div>}
                            </div>
                            <span className="owner-name">{item.employee}</span>
                          </div>
                          <div className="wi-date">{item.date}</div>
                          <div className="wi-status">
                            <span className="status-badge status-active">Active</span>
                          </div>
                        </div>
                     ))
                   ) : (
                     <div className="state-empty">
                       <FaBriefcase />
                       <p>No work items found</p>
                     </div>
                   )}
                </div>
              </div>
            )}

            {/* STEP 2: Select Staff */}
            {activeStep === 2 && (
              <div className="selection-card-unified">
                <div className="card-header-row">
                  <h3><FaUserFriends /> Select Replacement</h3>
                  <div className="search-input-wrapper" style={{maxWidth: '300px'}}>
                    <FaSearch className="search-icon-float" />
                    <input 
                      type="text" 
                      placeholder="Find staff..." 
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="staff-selection-grid">
                  {filteredStaff.map((staff) => (
                    <div 
                      key={staff.id}
                      className={`staff-card-modern ${selectedReplacement?.id === staff.id ? 'selected' : ''} ${staff.status === 'Busy' ? 'disabled' : ''}`}
                      onClick={() => handleReplacementSelect(staff)}
                    >
                      <div className="staff-img-wrapper">
                         {staff.image ? <img src={staff.image} alt={staff.name} /> : <div className="placeholder">{staff.name.charAt(0)}</div>}
                         <div className={`availability-dot dot-${staff.status.toLowerCase()}`}></div>
                      </div>
                      <h4>{staff.name}</h4>
                      <p>{staff.role}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: Confirm */}
            {activeStep === 3 && (
              <div className="selection-card-unified">
                <div className="confirm-glass-card">
                  <div className="card-header-row">
                    <h3><FaCheckCircle /> Final Confirmation</h3>
                  </div>
                  
                  <div className="input-modern-group">
                    <label>Reason for Delegation</label>
                    <textarea 
                      className="textarea-modern"
                      placeholder="Please explain why this delegation is occurring..."
                      value={delegationReason}
                      onChange={(e) => setDelegationReason(e.target.value)}
                    />
                  </div>

                  <div className="input-modern-group">
                    <label>Priority Level</label>
                    <div className="priority-selector">
                      {["Low", "Normal", "High", "Urgent"].map(p => (
                        <div 
                          key={p} 
                          className={`p-option ${priority === p ? 'active' : ''} ${p.toLowerCase()}`}
                          onClick={() => setPriority(p)}
                        >
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{display: 'flex', gap: '1rem', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '12px', alignItems: 'center'}}>
                    <FaExclamationTriangle style={{color: '#ef4444', fontSize: '1.5rem'}} />
                    <div style={{color: '#fca5a5', fontSize: '0.9rem'}}>
                      <strong>Warning:</strong> Delegating this task will transfer full responsibility to the selected employee. An instant notification will be sent.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Summary */}
          <div className="delegate-col-sidebar">
            <div className="summary-glass-panel">
              <div className="summary-title">Summary</div>
              
              <div className="summary-details">
                <div className="summary-item">
                  <label>Selected Work</label>
                  <div className="summary-value">
                     {selectedTask ? (
                       <><FaBriefcase /> {selectedTask.title}</>
                     ) : <span className="empty-val">- None -</span>}
                  </div>
                </div>
                
                <div className="summary-item">
                   <label>Current Owner</label>
                   <div className="summary-value">
                     {selectedTask ? (
                       <>{selectedTask.employee}</>
                     ) : <span className="empty-val">-</span>}
                   </div>
                </div>

                <div style={{height: '1px', background: 'rgba(255,255,255,0.1)'}}></div>

                <div className="summary-item">
                  <label>Assigned To</label>
                  <div className="summary-value">
                    {selectedReplacement ? (
                       <><FaExchangeAlt /> {selectedReplacement.name}</>
                     ) : <span className="empty-val">- None -</span>}
                  </div>
                </div>

                <div className="summary-item">
                  <label>New Role</label>
                  <div className="summary-value">
                     {selectedReplacement ? selectedReplacement.role : <span className="empty-val">-</span>}
                  </div>
                </div>
              </div>

              <div className="action-buttons">
                {activeStep < 3 ? (
                  <button 
                    className="btn-primary-glow"
                    disabled={activeStep === 1 ? !selectedTask : !selectedReplacement}
                    onClick={handleNextStep}
                  >
                    Next Step <FaArrowRight style={{marginLeft:'8px'}}/>
                  </button>
                ) : (
                  <button className="btn-primary-glow" onClick={handleSubmit}>
                    Confirm Delegation
                  </button>
                )}

                {activeStep > 1 && (
                  <button className="btn-secondary-outline" onClick={handlePrevStep}>
                    Go Back
                  </button>
                )}
              </div>
            </div>

            {/* History Mini Widget */}
            <div style={{marginTop: '2rem'}}>
               <h4 style={{color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px'}}>
                 <FaHistory /> Recent History
               </h4>
               <div style={{fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '1rem', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px'}}>
                 No recent delegations found
               </div>
            </div>
          </div>
        </div>
      </div>
      <PopupDoneHead
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        message="Delegate Shift Submitted Successfully!"
      />
    </div>
  );
};

export default DelegateShiftPage;
