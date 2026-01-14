import { Routes, Route } from "react-router-dom";
import useHeartbeat from "./hooks/useHeartbeat"; // Import Hook
import LoginPage from "./assets/pages/LoginPage";

/* -------- EMPLOYEE -------- */
import EmployeeDashboard from "./assets/pages/pageEmployee/EMPDashboard/EmployeeDashboard";
import ProfilePage from "./assets/pages/pageEmployee/Profile/ProfilePage";
import RequestLeavePage from "./assets/pages/pageEmployee/RequestLeave/RequestLeavePage";
import LeaveHistoryPage from "./assets/pages/pageEmployee/LeaveHistory/LeaveHistoryPage";
import ShiftRequestsPage from "./assets/pages/pageEmployee/ShiftRequests/ShiftRequestsPage";
import MySchedulePage from "./assets/pages/pageEmployee/MySchedule/MySchedulePage";
import NotificationPage from "./assets/pages/pageEmployee/Notification/NotificationPage";
import MyWork from "./assets/pages/pageEmployee/myWork/myWork";

/* -------- HEAD -------- */
import HeadDashboardPage from "./assets/pages/pageHead/Headdashbord/HeadDashboardPage";
import HeadProfilePage from "./assets/pages/pageHead/HeadProfile/HeadProfilePage";
import EmployeeList from "./assets/pages/pageHead/EMPList/EmployeeList";
import EmployeeDetail from "./assets/pages/pageHead/EMPDetail/EmployeeDetail";
import LeaveRequestsForHead from "./assets/pages/pageHead/LeaveRequestsForHeadFolder/LeaveRequestsForHead";
import RequestLeavePageHead from "./assets/pages/pageHead/HeadRequestLeave/RequestLeavePageHead";
import HeadSchedulePage from "./assets/pages/pageHead/HeadSchedulePage/HeadSchedulePage";
import HeadNotificationPage from "./assets/pages/pageHead/HeadNotificationPage/HeadNotificationPage";
import DelegateShiftPage from "./assets/pages/pageHead/DelegateShiftPage/DelegateShiftPage";
import HeadLeaveStats from "./assets/pages/pageHead/HeadLeaveStats/HeadLeaveStats";
import EmployeeProgress from "./assets/pages/pageHead/EmployeeProgress/EmployeeProgress";
import AddWorkPage from "./assets/pages/pageHead/Addwork/AddWorkPage";
import HeadTeamLeaveHistory from "./assets/pages/pageHead/HeadTeamLeaveHistory/HeadTeamLeaveHistory";

// ---------------- HR ----------------
import MainHR from "./assets/pages/HR/MainHR/MainHR";
import Add_user from "./assets/pages/HR/Add_user/Add_user";
import Add_emp_personal from "./assets/pages/HR/Add_emp_personal/Add_emp_personal";
import Add_emp_info from "./assets/pages/HR/Add_emp_info/Add_emp_info";
import AddEmpEducation from "./assets/pages/HR/Add_emp_education/Add_emp_education";
import Show_emp from "./assets/pages/HR/Show_emp/Show_emp";
import Show_leave from "./assets/pages/HR/Show_leave/Show_leave";
import Show_static_switch from "./assets/pages/HR/Show_static_switch/Show_static_switch";
import Send_notifi from "./assets/pages/HR/Send_notifi/Send_notifi";
import Announcements from "./assets/pages/HR/Announcements/Announcements";

import Leave_info from "./assets/pages/HR/Leave_info/Leave_info";
import AddDepartment from "./assets/pages/HR/add_department/add_department";

// ---------------- CHRO ----------------
import MainCHRO from "./assets/pages/CHRO/MainCHRO/MainCHRO";
import DecideCHRO from "./assets/pages/CHRO/DecideCHRO/DecideCHRO";
import DirectPosition from "./assets/pages/CHRO/Direct_Position/Direct-Position";
import ShowLog from "./assets/pages/CHRO/Show-Log/Show-Log";
import AnnouncementsCHRO from "./assets/pages/CHRO/announcements/AnnouncementsCHRO";
import EmployeeDirectoryCHRO from "./assets/pages/CHRO/emp_directory/EmployeeDirectoryCHRO";
import EditEmployeeCHRO from "./assets/pages/CHRO/emp_directory/EditEmployeeCHRO";

function App() {
  return (
    <Routes>
      {/* ---------- AUTH ---------- */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* ---------- EMPLOYEE ---------- */}
      <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
      <Route path="/employee/profile" element={<ProfilePage />} />
      <Route path="/employee/request-leave" element={<RequestLeavePage />} />
      <Route path="/employee/leave-history" element={<LeaveHistoryPage />} />
      <Route path="/employee/shift-requests" element={<ShiftRequestsPage />} />
      <Route path="/employee/schedule" element={<MySchedulePage />} />
      <Route path="/employee/notifications" element={<NotificationPage />} />
      <Route path="/employee/mywork" element={<MyWork />} />

      {/* ---------- HEAD ---------- */}
      <Route path="/head/dashboard" element={<HeadDashboardPage />} />
      <Route path="/head/profile" element={<HeadProfilePage />} />
      <Route path="/head/employee-list" element={<EmployeeList />} />
      <Route path="/head/employee/:id" element={<EmployeeDetail />} />
      <Route
        path="/head/employee/:id/progress"
        element={<EmployeeProgress />}
      />
      <Route path="/head/request-leave" element={<RequestLeavePageHead />} />
      <Route path="/head/leave-approvals" element={<LeaveRequestsForHead />} />
      <Route path="/head/schedule" element={<HeadSchedulePage />} />
      <Route path="/head/notifications" element={<HeadNotificationPage />} />
      <Route path="/head/delegate-shift" element={<DelegateShiftPage />} />
      <Route path="/head/delegate-shift/:id" element={<DelegateShiftPage />} />
      <Route path="/head/leave-stats" element={<HeadLeaveStats />} />
      <Route path="/head/employee/:id/add-work" element={<AddWorkPage />} />
      <Route
        path="/head/team-leave-history"
        element={<HeadTeamLeaveHistory />}
      />

      {/* ---------- HR ---------- */}
      <Route path="/hr/dashboard" element={<MainHR />} />
      <Route path="/chro/dashboard" element={<MainCHRO />} />
      <Route path="/hr/add-user" element={<Add_user />} />
      <Route path="/hr/add-emp-personal" element={<Add_emp_personal />} />
      <Route path="/hr/add-emp-info" element={<Add_emp_info />} />
      <Route path="/hr/add-emp-education" element={<AddEmpEducation />} />
      <Route path="/hr/show-emp" element={<Show_emp />} />
      <Route path="/hr/show-leave" element={<Show_leave />} />
      <Route path="/hr/show-static-switch" element={<Show_static_switch />} />
      <Route path="/hr/send-notification" element={<Send_notifi />} />
      <Route path="/hr/announcements" element={<Announcements />} />
      <Route path="/hr/leave-info" element={<Leave_info />} />
      <Route path="/hr/add-department" element={<AddDepartment />} />

      {/* ---------- CHRO ---------- */}
      <Route path="/chro/decide" element={<DecideCHRO />} />
      <Route path="/chro/direct-position" element={<DirectPosition />} />
      <Route path="/chro/show-log" element={<ShowLog />} />
      <Route path="/chro/announcements" element={<AnnouncementsCHRO />} />
      <Route
        path="/chro/employee-directory"
        element={<EmployeeDirectoryCHRO />}
      />
      <Route path="/chro/edit-employee" element={<EditEmployeeCHRO />} />
    </Routes>
  );
}

export default App;
