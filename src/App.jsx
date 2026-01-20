// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useState } from 'react'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/auth/LoginPage'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Unauthorized from './pages/Unauthorized'


// Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import StudentList from './pages/students/StudentList'
import AddStudent from './pages/students/AddStudent'
import EditStudent from './pages/students/EditStudent'
// import StudentView from './pages/students/StudentView'
import TeacherList from './pages/teachers/TeacherList'
import AddTeacher from './pages/teachers/AddTeacher'
import EditTeacher from './pages/teachers/EditTeacher'
// import TeacherDetails from './pages/teachers/TeacherDetails'
import AccountantList from './pages/accountants/AccountantList'
import AddAccountant from './pages/accountants/AddAccountant'
import EditAccountant from './pages/accountants/EditAccountant'
// import AccountantDetails from './pages/accountants/AccountantDetails'
// class importa -----------------------------------------------------
import ClassList from './pages/classes/ClassList'
import AddClass from './pages/classes/AddClass'
import EditClass from './pages/classes/EditClass'

// sections----------------------

import SectionList from './pages/sections/SectionList'
import AddSection from './pages/sections/AddSection'
import EditSection from './pages/sections/EditSection'


// subject-------------

import AddSubject from './pages/subject/AddSubject'
import EditSubject from './pages/subject/EditSubject'
import SubjectList from './pages/subject/SubjectList'

// attendence-------------------------------------

// attendance pages
import MarkAttendance from './pages/attendance/MarkAttendance'
import AttendanceList from './pages/attendance/AttendanceList'
import AttendanceReport from './pages/attendance/AttendanceReport'


// Layout shown only after login
function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="lg:ml-64 pt-20 p-6">
        <Outlet />
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected admin area */}
        <Route
          path="/admin/*"
          element={
            // <ProtectedRoute>
            //   <AdminLayout />
            // </ProtectedRoute>
            <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
            </ProtectedRoute>

          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<StudentList />} />
          <Route path="students/add" element={<AddStudent />} />
          <Route path="students/edit/:id" element={<EditStudent />} />
          {/* <Route path="students/view/:admission_no" element={<StudentView />} /> */}

          <Route path="teachers" element={<TeacherList />} />
          <Route path="teachers/add" element={<AddTeacher />} />
          <Route path="teachers/edit/:id" element={<EditTeacher />} />
          {/* <Route path="teachers/:id" element={<TeacherDetails />} /> */}

          <Route path="accountants" element={<AccountantList />} />
          <Route path="accountants/add" element={<AddAccountant />} />
          <Route path="accountants/edit/:id" element={<EditAccountant />} />
          {/* <Route path="accountants/:id" element={<AccountantDetails />} /> */}

          {/* classs---------------------------------- */}

          <Route path="classes" element={<ClassList />} />
          <Route path="classes/add" element={<AddClass />} />
          <Route path="classes/edit/:id" element={<EditClass />} />

           {/* sections------------------------------------------------ */}

           <Route path="sections" element={<SectionList />} />
           <Route path="sections/add" element={<AddSection />} />
           <Route path="sections/edit/:id" element={<EditSection />} />

           {/* subject-------------------------------------------------- */}

           <Route path="subject" element={<SubjectList/>}/>
           <Route path="subject/add" element={<AddSubject/>}/>
           <Route path="subject/edit/:id" element={<EditSubject/>}/>
           
               {/* ================= Attendance ================= */}

<Route path="attendance" element={<MarkAttendance />} />
<Route path="attendance/list" element={<AttendanceList />} />
<Route path="attendance/report" element={<AttendanceReport />} />



          {/* Placeholder pages */}
          <Route
            path="classes"
            element={
              <div className="text-center py-20">
                <h1 className="text-2xl font-bold">Classes Page (Coming Soon)</h1>
              </div>
            }
          />
          <Route
            path="fees"
            element={
              <div className="text-center py-20">
                <h1 className="text-2xl font-bold">Fees Page (Coming Soon)</h1>
              </div>
            }
          />
          <Route
            path="attendance"
            element={
              <div className="text-center py-20">
                <h1 className="text-2xl font-bold">Attendance Page (Coming Soon)</h1>
              </div>
            }
          />
          <Route
            path="exams"
            element={
              <div className="text-center py-20">
                <h1 className="text-2xl font-bold">Exams Page (Coming Soon)</h1>
              </div>
            }
          />
          <Route
            path="reports"
            element={
              <div className="text-center py-20">
                <h1 className="text-2xl font-bold">Reports Page (Coming Soon)</h1>
              </div>
            }
          />
          <Route
            path="settings"
            element={
              <div className="text-center py-20">
                <h1 className="text-2xl font-bold">Settings Page (Coming Soon)</h1>
              </div>
            }
          />
        </Route>
      <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Redirect root to admin */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App