// React & Router
import { Routes, Route } from "react-router-dom";
import LoginPage from "./assets/pages/LoginPage";

// =========================================
//               EMPLOYEE PAGES
// =========================================
import EmployeeDashboard from "./assets/pages/pageEmployee/EMPDashboard/EmployeeDashboard";
import MyInfoPage from "./assets/pages/pageEmployee/my-info/my-info";
import RequestLeavePage from "./assets/pages/pageEmployee/RequestLeave/RequestLeavePage";
import ShiftRequestsPage from "./assets/pages/pageEmployee/ShiftRequests/ShiftRequestsPage";
import MySchedulePage from "./assets/pages/pageEmployee/MySchedule/MySchedulePage";
import NotificationPage from "./assets/pages/pageEmployee/notification-emp/NotificationPage";
import MyWork from "./assets/pages/pageEmployee/myWork/myWork";

// =========================================
//                 HEAD PAGES
// =========================================
import HeadDashboard from "./assets/pages/pageHead/Headdashbord/HeadDashboardPage";
import HeadProfilePage from "./assets/pages/pageHead/head-profile/HeadProfilePage";
import EmployeeList from "./assets/pages/pageHead/epm-list/EmployeeList";
import LeaveApproval from "./assets/pages/pageHead/leave-appoval/LeaveApproval";
import RequestLeavePageHead from "./assets/pages/pageHead/leave-request/RequestLeaveHead";
import HeadSchedulePage from "./assets/pages/pageHead/team-schedule/HeadSchedulePage";

import DelegateShiftPage from "./assets/pages/pageHead/delegate-shift/DelegateShiftPage";
import LeaveAnalytics from "./assets/pages/pageHead/leave-analytics/LeaveAnalytics";
import HeadTeamLeaveHistory from "./assets/pages/pageHead/HeadTeamLeaveHistory/HeadTeamLeaveHistory";
import TaskAssignmentHead from "./assets/pages/pageHead/task-assignment/TaskAssignmentHead";
import DataApproval from "./assets/pages/pageHead/data-appoval/DataApproval";
import ShiftRequestHead from "./assets/pages/pageHead/shift-request/ShiftRequestHead";
import DepartmentNewsHead from "./assets/pages/pageHead/department-new/DepartmentNewsHead";
import TeamPerformanceHead from "./assets/pages/pageHead/team-performance/TeamPerformanceHead";
import CreateProject from "./assets/pages/pageHead/create-project/CreateProject";

// =========================================
//                  HR PAGES
// =========================================
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

// =========================================
//                 CHRO PAGES
// =========================================
import MainCHRO from "./assets/pages/CHRO/MainCHRO/MainCHRO";
import DecideCHRO from "./assets/pages/CHRO/DecideCHRO/DecideCHRO";
import DirectPosition from "./assets/pages/CHRO/Direct_Position/Direct-Position";
import ShowLog from "./assets/pages/CHRO/Show-Log/Show-Log";
import AnnouncementsCHRO from "./assets/pages/CHRO/announcements/AnnouncementsCHRO";
import EmployeeDirectoryCHRO from "./assets/pages/CHRO/emp_directory/EmployeeDirectoryCHRO";
import EditEmployeeCHRO from "./assets/pages/CHRO/emp_directory/EditEmployeeCHRO";
import LeaveRequestCHRO from "./assets/pages/CHRO/leave_request/LeaveRequestCHRO";

// =========================================
//               COMMON COMPONENTS
// =========================================
import ExclusiveCalendar from "./assets/Component/calendar/Calendar";

function App() {
  return (
    <Routes>
      {/* ========================================= */}
      {/*              AUTH ROUTES               */}
      {/* ========================================= */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      {/* ========================================= */}
      {/*            EMPLOYEE ROUTES             */}
      {/* ========================================= */}
      <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
      <Route path="/employee/my-info" element={<MyInfoPage />} />
      <Route path="/employee/request-leave" element={<RequestLeavePage />} />
      <Route path="/employee/shift-requests" element={<ShiftRequestsPage />} />
      <Route path="/employee/schedule" element={<MySchedulePage />} />
      <Route path="/employee/notifications" element={<NotificationPage />} />
      <Route path="/employee/mywork" element={<MyWork />} />
      {/* ========================================= */}
      {/*              HEAD ROUTES               */}
      {/* ========================================= */}
      <Route path="/head/dashboard" element={<HeadDashboard />} />
      <Route path="/head/department-news" element={<DepartmentNewsHead />} />
      <Route path="/head/profile" element={<HeadProfilePage />} />
      <Route path="/head/employee-list" element={<EmployeeList />} />
      <Route path="/head/request-leave" element={<RequestLeavePageHead />} />
      <Route path="/head/leave-approvals" element={<LeaveApproval />} />
      <Route path="/head/team-schedule" element={<HeadSchedulePage />} />
      <Route path="/head/delegate-shift" element={<DelegateShiftPage />} />
      <Route path="/head/delegate-shift/:id" element={<DelegateShiftPage />} />
      <Route path="/head/leave-stats" element={<LeaveAnalytics />} />
      <Route
        path="/head/team-leave-history"
        element={<HeadTeamLeaveHistory />}
      />
      <Route path="/head/task-assignment" element={<TaskAssignmentHead />} />
      <Route path="/head/data-approvals" element={<DataApproval />} />
      <Route path="/head/shift-replacements" element={<ShiftRequestHead />} />
      <Route path="/head/team-performance" element={<TeamPerformanceHead />} />
      <Route path="/head/create-project" element={<CreateProject />} />
      {/* ========================================= */}
      {/*               HR ROUTES                */}
      {/* ========================================= */}
      <Route path="/hr/dashboard" element={<MainHR />} />
      <Route path="/hr/add-user" element={<Add_user />} />
      <Route path="/hr/add-emp-personal" element={<Add_emp_personal />} />
      <Route
        path="/hr/edit-emp-personal/:userId"
        element={<Add_emp_personal />}
      />
      <Route path="/hr/add-emp-info" element={<Add_emp_info />} />
      <Route path="/hr/edit-emp-info/:userId" element={<Add_emp_info />} />
      <Route path="/hr/add-emp-education" element={<AddEmpEducation />} />
      <Route
        path="/hr/edit-emp-education/:userId"
        element={<AddEmpEducation />}
      />
      <Route path="/hr/show-emp" element={<Show_emp />} />
      <Route path="/hr/show-leave" element={<Show_leave />} />
      <Route path="/hr/show-static-switch" element={<Show_static_switch />} />
      <Route path="/hr/send-notification" element={<Send_notifi />} />
      <Route path="/hr/announcements" element={<Announcements />} />
      <Route path="/hr/leave-info" element={<Leave_info />} />
      <Route path="/hr/add-department" element={<AddDepartment />} />
      {/* ========================================= */}
      {/*              CHRO ROUTES               */}
      {/* ========================================= */}
      <Route path="/chro/dashboard" element={<MainCHRO />} />
      <Route path="/chro/decide" element={<DecideCHRO />} />
      <Route path="/chro/direct-position" element={<DirectPosition />} />
      <Route path="/chro/show-log" element={<ShowLog />} />
      <Route path="/chro/announcements" element={<AnnouncementsCHRO />} />
      <Route
        path="/chro/employee-directory"
        element={<EmployeeDirectoryCHRO />}
      />
      <Route path="/chro/edit-employee" element={<EditEmployeeCHRO />} />
      <Route path="/chro/leave-request" element={<LeaveRequestCHRO />} />
      {/* ========================================= */}
      {/*             COMMON ROUTES              */}
      {/* ========================================= */}
      <Route path="/calendar" element={<ExclusiveCalendar />} />
    </Routes>
  );
}

export default App;
