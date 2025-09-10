import { Routes, Route } from 'react-router-dom';
import LoginPage from './assets/pages/LoginPage';

/* -------- EMPLOYEE -------- */
import EmployeeDashboard from './assets/pages/pageEmployee/EMPDashboard/EmployeeDashboard';
import ProfilePage from './assets/pages/pageEmployee/Profile/ProfilePage';
import RequestLeavePage from './assets/pages/pageEmployee/RequestLeave/RequestLeavePage';
import LeaveHistoryPage from './assets/pages/pageEmployee/LeaveHistory/LeaveHistoryPage';
import ShiftRequestsPage from './assets/pages/pageEmployee/ShiftRequests/ShiftRequestsPage';
import MySchedulePage from './assets/pages/pageEmployee/MySchedule/MySchedulePage';
import NotificationPage from './assets/pages/pageEmployee/Notification/NotificationPage';
import MyWork from './assets/pages/pageEmployee/myWork/myWork';

/* -------- HEAD -------- */
import HeadDashboardPage from './assets/pages/pageHead/Headdashbord/HeadDashboardPage';
import HeadProfilePage from './assets/pages/pageHead/HeadProfile/HeadProfilePage';
import EmployeeList from './assets/pages/pageHead/EMPList/EmployeeList';
import EmployeeDetail from './assets/pages/pageHead/EMPDetail/EmployeeDetail';
import LeaveRequestsForHead from './assets/pages/pageHead/LeaveRequestsForHeadFolder/LeaveRequestsForHead';
import RequestLeavePageHead from './assets/pages/pageHead/HeadRequestLeave/RequestLeavePageHead';
import HeadSchedulePage from './assets/pages/pageHead/HeadSchedulePage/HeadSchedulePage';
import HeadNotificationPage from "./assets/pages/pageHead/HeadNotificationPage/HeadNotificationPage";
import DelegateShiftPage from "./assets/pages/pageHead/DelegateShiftPage/DelegateShiftPage";
import TestSidebarNotification from "./assets/pages/pageHead/TestNoti/TestSidebarNoti";
import HeadLeaveStats from "./assets/pages/pageHead/HeadLeaveStats/HeadLeaveStats";
import EmployeeProgress from './assets/pages/pageHead/EmployeeProgress/EmployeeProgress';
import AddWorkPage from './assets/pages/pageHead/Addwork/AddWorkPage';
import HeadTeamLeaveHistory from './assets/pages/pageHead/HeadTeamLeaveHistory/HeadTeamLeaveHistory';


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
      <Route path="/head/employee/:id/progress" element={<EmployeeProgress />} />
      <Route path="/head/request-leave" element={<RequestLeavePageHead />} />
      <Route path="/head/leave-approvals" element={<LeaveRequestsForHead />} />
      <Route path="/head/schedule" element={<HeadSchedulePage />} />
      <Route path="/head/notifications" element={<HeadNotificationPage />} />
      <Route path="/head/delegate-shift" element={<DelegateShiftPage />} />
      <Route path="/head/delegate-shift/:id" element={<DelegateShiftPage />} />
      <Route path="/test-sidebar" element={<TestSidebarNotification />} />
      <Route path="/head/leave-stats" element={<HeadLeaveStats />} />
      <Route path="/head/employee/:id/add-work" element={<AddWorkPage />} />
      <Route path="/head/team-leave-history" element={<HeadTeamLeaveHistory />} />

    </Routes>
  );
}

export default App;
