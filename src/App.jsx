// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useState } from 'react'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/auth/LoginPage'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Unauthorized from './pages/Unauthorized'
import Report from './pages/Report'

 
// Pages


// ── Notifications ──────────────────────────────────────────────
import CreateNotification from './pages/notifications/CreateNotification'
import NotificationList from './pages/notifications/NotificationList'
import NotificationDetails from './pages/notifications/NotificationDetails'
import MyNotificationsPage from './pages/notifications/MyNotificationsPage'  



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

//Student attendence-------------------------------------

// attendance pages
import MarkAttendance from './pages/attendance/MarkAttendance'
import AttendanceList from './pages/attendance/AttendanceList'
import AttendanceReport from './pages/attendance/AttendanceReport'

// Teacher attendance pages
import MarkTeacherAttendance from './pages/teacherAttendance/MarkTeacherAttendance'
import TeacherAttendanceList from './pages/teacherAttendance/TeacherAttendanceList'
import TeacherAttendanceReport from './pages/teacherAttendance/TeacherAttendanceReport'

// Accountant attendance pages
import MarkAccountantAttendance from './pages/accountantAttendance/MarkAccountantAttendance'
import AccountantAttendanceList from './pages/accountantAttendance/AccountantAttendanceList'
import AccountantAttendanceReport from './pages/accountantAttendance/AccountantAttendanceReport'



// timetable pages
// import CreateTimetable from './pages/timetable/CreateTimetable'
// import ViewTimetable from './pages/timetable/ViewTimetable'

import CreateTimetable from './pages/timetable/CreateTimetable';
import ViewTimetable from './pages/timetable/ViewTimetable';


// ========fees----------------------

import FeeHeads from './pages/fees/FeeHeads'
import FineRule from './pages/fees/FineRule'
import CreateFee from './pages/fees/CreateFee'
import FeePreview from './pages/fees/FeePreview'
// ================fee pymant mathed==============

import CollectFee from './pages/feesPayment/CollectFee'
import CollectFeePayment from './pages/feesPayment/CollectFeePayment'
import FeeReceipt from './pages/feesPayment/FeeReceipt'


// ================= Exams =================
import ExamTypeList from './pages/exams/ExamTypeList'
import CreateExamType from './pages/exams/CreateExamType'
import ExamList from './pages/exams/ExamList'
import CreateExam from './pages/exams/CreateExam'
import CreateExamTimetable from './pages/exams/CreateExamTimetable'
import ViewExamTimetable from './pages/exams/ViewExamTimetable'
import TimetablePreview from './pages/exams/TimetablePreview'

// ✅ Marks (inside exams folder)
import AssignMarks from './pages/exams/AssignMarks'
import MarksList from './pages/exams/MarksList'
import PrintMarksheet from './pages/exams/PrintMarksheet'




// =======================profile===================
// import
import Profile from './pages/profile/Profile'








// Layout shown only after login
// function AdminLayout() {
//   const [sidebarOpen, setSidebarOpen] = useState(false)
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar 
//         onMenuClick={() => setSidebarOpen(!sidebarOpen)}
//         isCollapsed={sidebarCollapsed}
//         onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
//       />
//       <Sidebar 
//         isOpen={sidebarOpen} 
//         onClose={() => setSidebarOpen(false)}
//         isCollapsed={sidebarCollapsed}
//         onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
//       />
//       <main 
//         className={`pt-20 p-6 transition-all duration-300 ease-in-out ${
//           sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'
//         }`}
//       >
//         <Outlet />
//       </main>
//     </div>
//   )
// }

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        isCollapsed={isCollapsed}
      />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isCollapsed={isCollapsed}
      />
      <main className={`pt-20 transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        } p-6`}>
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


          {/* ======================= Profile ======================= */}
          <Route path="profile" element={<Profile />} />
            

            {/* // AdminLayout ke routes mein yeh add karo (profile route ke baad) */}


            {/* ======================= Notifications ======================= */}


   {/* ── Notifications (Admin Sent Box) ── */}
          <Route path="notifications"        element={<NotificationList />} />
          <Route path="notifications/create" element={<CreateNotification />} />
          <Route path="notifications/:id"    element={<NotificationDetails />} />

          {/* ── My Notifications (Recipient Inbox) ──
              Admin bhi apni received notifications dekh sakta hai */}
          <Route path="my-notifications" element={<MyNotificationsPage />} />

          {/* student */}
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

          <Route path="subject" element={<SubjectList />} />
          <Route path="subject/add" element={<AddSubject />} />
          <Route path="subject/edit/:id" element={<EditSubject />} />

          {/* =================studentAttendance ================= */}

          <Route path="attendance" element={<MarkAttendance />} />
          <Route path="attendance/list" element={<AttendanceList />} />
          <Route path="attendance/report" element={<AttendanceReport />} />


          {/* ================= Teacher Attendance ================= */}

          <Route path="teacher-attendance" element={<MarkTeacherAttendance />} />
          <Route path="teacher-attendance/list" element={<TeacherAttendanceList />} />
          <Route path="teacher-attendance/report" element={<TeacherAttendanceReport />} />


          {/* ================= accountend Attendance ================= */}


          <Route path="accountant-attendance" element={<MarkAccountantAttendance />} />
          <Route path="accountant-attendance/list" element={<AccountantAttendanceList />} />
          <Route path="accountant-attendance/report" element={<AccountantAttendanceReport />} />


          {/* Report's--------------------- */}




          {/* ================= Timetable ================= */}

          <Route path="timetable/create" element={<CreateTimetable />} />
          <Route path="timetable/view" element={<ViewTimetable />} />

          {/* ===========================fees=============================== */}

          {/* ================= Fees ================= */}
          <Route path="fees/heads" element={<FeeHeads />} />
          <Route path="fees/fine-rule" element={<FineRule />} />
          <Route path="fees/create" element={<CreateFee />} />
          <Route path="fees/preview" element={<FeePreview />} />


          {/* ================= Exams ================= */}
          <Route path="exams/types" element={<ExamTypeList />} />
          <Route path="exams/types/add" element={<CreateExamType />} />

          <Route path="exams" element={<ExamList />} />
          <Route path="exams/add" element={<CreateExam />} />

          {/* ================= Exam Timetable ================= */}
          <Route path="exams/timetable" element={<ViewExamTimetable />} />
          <Route path="exams/timetable/create" element={<CreateExamTimetable />} />
          <Route path="exams/timetable/edit/:id" element={<CreateExamTimetable />} />
          <Route path="exams/timetable/preview/:id" element={<TimetablePreview />} />

          {/* ================= Marks ================= */}
          <Route path="exams/assign-marks" element={<AssignMarks />} />
          <Route path="exams/marks" element={<MarksList />} />
          <Route path="exams/print-marksheet" element={<PrintMarksheet />} />

          {/* ===== Fee Collection Flow ===== */}
          <Route path="fees-payment/collect" element={<CollectFee />} />
          <Route path="fees-payment/collect/:studentId" element={<CollectFeePayment />} />
          <Route path="fees-payment/receipt/:receiptId" element={<FeeReceipt />} />






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
          {/* ================= Reports ================= */}
          <Route path="reports" element={<Report />} />

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