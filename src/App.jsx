// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useState } from 'react'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/auth/LoginPage'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Unauthorized from './pages/Unauthorized'
import Report from './pages/Report'

// ════════════════════════════════════════════════
// 🔔 NOTIFICATIONS MODULE
// ════════════════════════════════════════════════
import CreateNotification from './pages/notifications/CreateNotification'
import NotificationList from './pages/notifications/NotificationList'
import NotificationDetails from './pages/notifications/NotificationDetails'
import MyNotificationsPage from './pages/notifications/MyNotificationsPage'

// ════════════════════════════════════════════════
// 📊 DASHBOARD MODULE
// ════════════════════════════════════════════════
import AdminDashboard from './pages/admin/AdminDashboard'
import RolePermissions from './pages/admin/RolePermissions'

// ════════════════════════════════════════════════
// 🎓 STUDENTS MODULE
// ════════════════════════════════════════════════
import StudentList from './pages/students/StudentList'
import AddStudent from './pages/students/AddStudent'
import EditStudent from './pages/students/EditStudent'

// ════════════════════════════════════════════════
// 👨‍🏫 TEACHERS MODULE
// ════════════════════════════════════════════════
import TeacherList from './pages/teachers/TeacherList'
import AddTeacher from './pages/teachers/AddTeacher'
import EditTeacher from './pages/teachers/EditTeacher'

// ════════════════════════════════════════════════
// 💼 ACCOUNTANTS MODULE
// ════════════════════════════════════════════════
import AccountantList from './pages/accountants/AccountantList'
import AddAccountant from './pages/accountants/AddAccountant'
import EditAccountant from './pages/accountants/EditAccountant'

// ════════════════════════════════════════════════
// 🏫 CLASSES MODULE
// ════════════════════════════════════════════════
import ClassList from './pages/classes/ClassList'
import AddClass from './pages/classes/AddClass'
import EditClass from './pages/classes/EditClass'
// ✅ NEW — Classes & Sections Manager (accordion view)
import ClassSectionManager from './pages/classes/ClassSectionManager'

// ════════════════════════════════════════════════
// 📋 SECTIONS MODULE
// ════════════════════════════════════════════════
import SectionList from './pages/sections/SectionList'
import AddSection from './pages/sections/AddSection'
import EditSection from './pages/sections/EditSection'

// ════════════════════════════════════════════════
// 📚 SUBJECTS MODULE
// ════════════════════════════════════════════════
import AddSubject from './pages/subject/AddSubject'
import EditSubject from './pages/subject/EditSubject'
import SubjectList from './pages/subject/SubjectList'

// ════════════════════════════════════════════════
// ✅ STUDENT ATTENDANCE MODULE
// ════════════════════════════════════════════════
import MarkAttendance from './pages/attendance/MarkAttendance'
import AttendanceList from './pages/attendance/AttendanceList'
import AttendanceReport from './pages/attendance/AttendanceReport'

// ════════════════════════════════════════════════
// ✅ TEACHER ATTENDANCE MODULE
// ════════════════════════════════════════════════
import MarkTeacherAttendance from './pages/teacherAttendance/MarkTeacherAttendance'
import TeacherAttendanceList from './pages/teacherAttendance/TeacherAttendanceList'
import TeacherAttendanceReport from './pages/teacherAttendance/TeacherAttendanceReport'

// ════════════════════════════════════════════════
// ✅ ACCOUNTANT ATTENDANCE MODULE
// ════════════════════════════════════════════════
import MarkAccountantAttendance from './pages/accountantAttendance/MarkAccountantAttendance'
import AccountantAttendanceList from './pages/accountantAttendance/AccountantAttendanceList'
import AccountantAttendanceReport from './pages/accountantAttendance/AccountantAttendanceReport'

// ════════════════════════════════════════════════
// 📅 TIMETABLE MODULE
// ════════════════════════════════════════════════
import CreateTimetable from './pages/timetable/CreateTimetable'
import ViewTimetable from './pages/timetable/ViewTimetable'

// ════════════════════════════════════════════════
// 💰 FEES MODULE
// ════════════════════════════════════════════════
import FeeHeads from './pages/fees/FeeHeads'
import FineRule from './pages/fees/FineRule'
import CreateFee from './pages/fees/CreateFee'
import FeePreview from './pages/fees/FeePreview'

// ════════════════════════════════════════════════
// 💳 FEE PAYMENT MODULE
// ════════════════════════════════════════════════
import CollectFee from './pages/feesPayment/CollectFee'
import CollectFeePayment from './pages/feesPayment/CollectFeePayment'
import FeeReceipt from './pages/feesPayment/FeeReceipt'

// ════════════════════════════════════════════════
// 📝 EXAMS MODULE
// ════════════════════════════════════════════════
import ExamTypeList from './pages/exams/ExamTypeList'
import CreateExamType from './pages/exams/CreateExamType'
import ExamList from './pages/exams/ExamList'
import CreateExam from './pages/exams/CreateExam'
import CreateExamTimetable from './pages/exams/CreateExamTimetable'
import ViewExamTimetable from './pages/exams/ViewExamTimetable'
import TimetablePreview from './pages/exams/TimetablePreview'
import AssignMarks from './pages/exams/AssignMarks'
import MarksList from './pages/exams/MarksList'
import PrintMarksheet from './pages/exams/PrintMarksheet'

// ════════════════════════════════════════════════
// 📖 HOMEWORK MODULE
// ════════════════════════════════════════════════
import HomeworkList from './pages/homework/HomeworkList'
import CreateHomework from './pages/homework/CreateHomework'
import HomeworkDetails from './pages/homework/HomeworkDetails'
import EditHomework from './pages/homework/EditHomework'

// ════════════════════════════════════════════════
// 👤 PROFILE MODULE
// ════════════════════════════════════════════════
import Profile from './pages/profile/Profile'

// ════════════════════════════════════════════════
// 🏗️ ADMIN LAYOUT
// ════════════════════════════════════════════════
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
      <main className={`pt-20 transition-all duration-300 ${
        isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      } p-6`}>
        <Outlet />
      </main>
    </div>
  )
}

// ════════════════════════════════════════════════
// 🚀 APP — ROUTES
// ════════════════════════════════════════════════
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public Routes ── */}
        <Route path="/login" element={<LoginPage />} />

        {/* ── Protected Admin Routes ── */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route index element={<AdminDashboard />} />

          {/* ── Profile ─────────────────────────────── */}
          <Route path="profile" element={<Profile />} />

          {/* ── Notifications ───────────────────────── */}
          <Route path="notifications"        element={<NotificationList />} />
          <Route path="notifications/create" element={<CreateNotification />} />
          <Route path="notifications/:id"    element={<NotificationDetails />} />
          <Route path="my-notifications"     element={<MyNotificationsPage />} />

          {/* ── Students ────────────────────────────── */}
          <Route path="students"          element={<StudentList />} />
          <Route path="students/add"      element={<AddStudent />} />
          <Route path="students/edit/:id" element={<EditStudent />} />

          {/* ── Teachers ────────────────────────────── */}
          <Route path="teachers"          element={<TeacherList />} />
          <Route path="teachers/add"      element={<AddTeacher />} />
          <Route path="teachers/edit/:id" element={<EditTeacher />} />

          {/* ── Accountants ─────────────────────────── */}
          <Route path="accountants"          element={<AccountantList />} />
          <Route path="accountants/add"      element={<AddAccountant />} />
          <Route path="accountants/edit/:id" element={<EditAccountant />} />

          {/* ── Classes ─────────────────────────────── */}
          <Route path="classes"          element={<ClassList />} />
          <Route path="classes/add"      element={<AddClass />} />
          <Route path="classes/edit/:id" element={<EditClass />} />
          {/* ✅ NEW — Classes & Sections accordion manager */}
          <Route path="classes/sections" element={<ClassSectionManager />} />

          {/* ── Sections ────────────────────────────── */}
          <Route path="sections"          element={<SectionList />} />
          <Route path="sections/add"      element={<AddSection />} />
          <Route path="sections/edit/:id" element={<EditSection />} />

          {/* ── Subjects ────────────────────────────── */}
          <Route path="subject"          element={<SubjectList />} />
          <Route path="subject/add"      element={<AddSubject />} />
          <Route path="subject/edit/:id" element={<EditSubject />} />

          {/* ── Student Attendance ──────────────────── */}
          <Route path="attendance"        element={<MarkAttendance />} />
          <Route path="attendance/list"   element={<AttendanceList />} />
          <Route path="attendance/report" element={<AttendanceReport />} />

          {/* ── Teacher Attendance ──────────────────── */}
          <Route path="teacher-attendance"        element={<MarkTeacherAttendance />} />
          <Route path="teacher-attendance/list"   element={<TeacherAttendanceList />} />
          <Route path="teacher-attendance/report" element={<TeacherAttendanceReport />} />

          {/* ── Accountant Attendance ───────────────── */}
          <Route path="accountant-attendance"        element={<MarkAccountantAttendance />} />
          <Route path="accountant-attendance/list"   element={<AccountantAttendanceList />} />
          <Route path="accountant-attendance/report" element={<AccountantAttendanceReport />} />

          {/* ── Timetable ───────────────────────────── */}
          <Route path="timetable/create" element={<CreateTimetable />} />
          <Route path="timetable/view"   element={<ViewTimetable />} />

          {/* ── Fees ────────────────────────────────── */}
          <Route path="fees/heads"     element={<FeeHeads />} />
          <Route path="fees/fine-rule" element={<FineRule />} />
          <Route path="fees/create"    element={<CreateFee />} />
          <Route path="fees/preview"   element={<FeePreview />} />

          {/* ── Fee Payment ─────────────────────────── */}
          <Route path="fees-payment/collect"            element={<CollectFee />} />
          <Route path="fees-payment/collect/:studentId" element={<CollectFeePayment />} />
          <Route path="fees-payment/receipt/:receiptId" element={<FeeReceipt />} />

          {/* ── Exams ───────────────────────────────── */}
          <Route path="exams"                       element={<ExamList />} />
          <Route path="exams/add"                   element={<CreateExam />} />
          <Route path="exams/types"                 element={<ExamTypeList />} />
          <Route path="exams/types/add"             element={<CreateExamType />} />
          <Route path="exams/timetable"             element={<ViewExamTimetable />} />
          <Route path="exams/timetable/create"      element={<CreateExamTimetable />} />
          <Route path="exams/timetable/edit/:id"    element={<CreateExamTimetable />} />
          <Route path="exams/timetable/preview/:id" element={<TimetablePreview />} />
          <Route path="exams/assign-marks"          element={<AssignMarks />} />
          <Route path="exams/marks"                 element={<MarksList />} />
          <Route path="exams/print-marksheet"       element={<PrintMarksheet />} />

          {/* ── Homework ────────────────────────────── */}
          <Route path="homework"          element={<HomeworkList />} />
          <Route path="homework/create"   element={<CreateHomework />} />
          <Route path="homework/:id"      element={<HomeworkDetails />} />
          <Route path="homework/edit/:id" element={<EditHomework />} />

          {/* ── Reports ─────────────────────────────── */}
          <Route path="reports" element={<Report />} />

          {/* ── Settings ────────────────────────────── */}
          <Route path="settings" />
          <Route path="settings/role-permissions" element={<RolePermissions />} />

        </Route>

        {/* ── Fallback Routes ── */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/"  element={<Navigate to="/login" replace />} />
        <Route path="*"  element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App