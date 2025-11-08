import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import PopupMain from './assets/Page/PopupMain'
import Login from './assets/Page/Login' // Importing the Login component
import MainHR from './assets/Page/HR/MainHR/MainHR' // Importing the MainHR component
import MainCHRO from './assets/Page/CHRO/MainCHRO/MainCHRO' // Importing the MainCHRO component
import Add_user from './assets//Page/HR/Add_user/Add_user'
import Add_emp_personal from './assets/Page/HR/Add_emp_personal/Add_emp_personal' // Importing the Add_emp_personal component
import Add_emp_info from './assets/Page/HR/Add_emp_info/Add_emp_info'
import AddEmpEducation from './assets/Page/HR/Add_emp_education/Add_emp_education';
import Show_emp from './assets/Page/HR/Show_emp/Show_emp'
import Show_leave from './assets/Page/HR/Show_leave/Show_leave'
import Show_static_switch from './assets/Page/HR/Show_static_switch/Show_static_switch'
import Send_notifi from './assets/Page/HR/Send_notifi/Send_notifi'
import Announcements from './assets/Page/HR/Announcements/Announcements'
import Leave_info from './assets/Page/HR/Leave_info/Leave_info'


import DecideCHRO from './assets/Page/CHRO/DecideCHRO/DecideCHRO'
import DirectPosition from './assets/Page/CHRO/Direct_Position/Direct-Position'
import ShowLog from './assets/Page/CHRO/Show-Log/Show-Log'
function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <div className="app-container">
        <Routes>
        -------------------HR------------------------------------------------
          <Route path="/" element={<PopupMain />} />
          <Route path="/login" element={<Login />} />
          <Route path="/mainhr" element={<MainHR />} />
          <Route path="/MainCHRO" element={<MainCHRO />} />
          <Route path="/add-user" element={<Add_user />} />
          <Route path="/add-emp-personal" element={<Add_emp_personal />} />
          <Route path="/add_emp_info" element={<Add_emp_info />} />
          <Route path="/add_emp_education" element={<AddEmpEducation />} />
          <Route path="/show_emp" element={<Show_emp />} />
          <Route path="/show_leave" element={<Show_leave />} />
          <Route path="/show_static_switch" element={<Show_static_switch />} />
          <Route path="/send_notifi" element={<Send_notifi />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/leave_info" element={<Leave_info />} />

          -------------------CHRO------------------------------------------------
          <Route path="/decide-chro" element={<DecideCHRO />} />
          <Route path="/direct-position" element={<DirectPosition />} />
          <Route path="/show-log" element={<ShowLog />} />

          
        </Routes>
      </div>
    </Router>
  )
}

export default App
