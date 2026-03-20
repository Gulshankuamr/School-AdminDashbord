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
// 🔔 NOTIFICATIONS
// ════════════════════════════════════════════════
import CreateNotification  from './pages/notifications/CreateNotification'
import NotificationList    from './pages/notifications/NotificationList'
import NotificationDetails from './pages/notifications/NotificationDetails'
import MyNotificationsPage from './pages/notifications/MyNotificationsPage'

// ════════════════════════════════════════════════
// 📊 DASHBOARD
// ════════════════════════════════════════════════
import AdminDashboard  from './pages/admin/AdminDashboard'
import RolePermissions from './pages/admin/RolePermissions'
import UserPermissions from './pages/admin/UserPermissions'

// ════════════════════════════════════════════════
// 🏫 SCHOOL PROFILE
// ════════════════════════════════════════════════
// import SchoolProfile from './pages/school/SchoolProfile'   // ✅ NEW

// ════════════════════════════════════════════════
// 🎓 STUDENTS
// ════════════════════════════════════════════════
import StudentList from './pages/students/StudentList'
import AddStudent  from './pages/students/AddStudent'
import EditStudent from './pages/students/EditStudent'

// ════════════════════════════════════════════════
// 👨‍🏫 TEACHERS
// ════════════════════════════════════════════════
import TeacherList from './pages/teachers/TeacherList'
import AddTeacher  from './pages/teachers/AddTeacher'
import EditTeacher from './pages/teachers/EditTeacher'

// ════════════════════════════════════════════════
// 💼 ACCOUNTANTS
// ════════════════════════════════════════════════
import AccountantList from './pages/accountants/AccountantList'
import AddAccountant  from './pages/accountants/AddAccountant'
import EditAccountant from './pages/accountants/EditAccountant'

// ════════════════════════════════════════════════
// 🏫 CLASSES
// ════════════════════════════════════════════════
import ClassList           from './pages/classes/ClassList'
import AddClass            from './pages/classes/AddClass'
import EditClass           from './pages/classes/EditClass'
import ClassSectionManager from './pages/classes/ClassSectionManager'

// ════════════════════════════════════════════════
// 📋 SECTIONS
// ════════════════════════════════════════════════
import SectionList from './pages/sections/SectionList'
import AddSection  from './pages/sections/AddSection'
import EditSection from './pages/sections/EditSection'

// ════════════════════════════════════════════════
// 📚 SUBJECTS
// ════════════════════════════════════════════════
import SubjectList from './pages/subject/SubjectList'
import AddSubject  from './pages/subject/AddSubject'
import EditSubject from './pages/subject/EditSubject'

// ════════════════════════════════════════════════
// ✅ ATTENDANCE — STUDENT
// ════════════════════════════════════════════════
import MarkAttendance   from './pages/attendance/MarkAttendance'
import AttendanceList   from './pages/attendance/AttendanceList'
import AttendanceReport from './pages/attendance/AttendanceReport'

// ════════════════════════════════════════════════
// ✅ ATTENDANCE — TEACHER
// ════════════════════════════════════════════════
import MarkTeacherAttendance   from './pages/teacherAttendance/MarkTeacherAttendance'
import TeacherAttendanceList   from './pages/teacherAttendance/TeacherAttendanceList'
import TeacherAttendanceReport from './pages/teacherAttendance/TeacherAttendanceReport'

// ════════════════════════════════════════════════
// ✅ ATTENDANCE — ACCOUNTANT
// ════════════════════════════════════════════════
import MarkAccountantAttendance   from './pages/accountantAttendance/MarkAccountantAttendance'
import AccountantAttendanceList   from './pages/accountantAttendance/AccountantAttendanceList'
import AccountantAttendanceReport from './pages/accountantAttendance/AccountantAttendanceReport'

// ════════════════════════════════════════════════
// 📅 TIMETABLE
// ════════════════════════════════════════════════
import CreateTimetable from './pages/timetable/CreateTimetable'
import ViewTimetable   from './pages/timetable/ViewTimetable'

// ════════════════════════════════════════════════
// 💰 FEES
// ════════════════════════════════════════════════
import FeeHeads   from './pages/fees/FeeHeads'
import FineRule   from './pages/fees/FineRule'
import CreateFee  from './pages/fees/CreateFee'
import FeePreview from './pages/fees/FeePreview'

// ════════════════════════════════════════════════
// 💳 FEE PAYMENT
// ════════════════════════════════════════════════
import CollectFee        from './pages/feesPayment/CollectFee'
import StudentFeeProfile from './pages/feesPayment/StudentFeeProfile'
import CollectFeePayment from './pages/feesPayment/CollectFeePayment'
import FeeReceipt        from './pages/feesPayment/FeeReceipt'

// ════════════════════════════════════════════════
// 📝 EXAMS
// ════════════════════════════════════════════════
import ExamList                 from './pages/exams/ExamList'
import CreateExam               from './pages/exams/CreateExam'
import ExamTypeList             from './pages/exams/ExamTypeList'
import CreateExamType           from './pages/exams/CreateExamType'
import ViewExamTimetable        from './pages/exams/ViewExamTimetable'
import CreateExamTimetable      from './pages/exams/CreateExamTimetable'
import TimetablePreview         from './pages/exams/TimetablePreview'
import AssignMarks              from './pages/exams/AssignMarks'
import MarksList                from './pages/exams/MarksList'
import PrintMarksheet           from './pages/exams/PrintMarksheet'
import GenerateAdmitCard        from './pages/exams/GenerateAdmitCard'
import MarksheetGenerator       from './pages/exams/MarksheetGenerator'
import CreateCoScholasticGrades from './pages/exams/CreateCoScholasticGrades'
import CoScholasticGradesList   from './pages/exams/CoScholasticGradesList'

// ════════════════════════════════════════════════
// 🚍 TRANSPORT
// ════════════════════════════════════════════════
import RouteManagement        from './pages/transport/RouteManagement'
import StopManagement         from './pages/transport/StopManagement'
import AssignStudentTransport from './pages/transport/AssignStudentTransport'

// ════════════════════════════════════════════════
// 📖 HOMEWORK
// ════════════════════════════════════════════════
import HomeworkList    from './pages/homework/HomeworkList'
import CreateHomework  from './pages/homework/CreateHomework'
import HomeworkDetails from './pages/homework/HomeworkDetails'
import EditHomework    from './pages/homework/EditHomework'

// ════════════════════════════════════════════════
// 👤 PROFILE
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
// 🚀 APP ROUTES
//
// Permission keys used in <ProtectedRoute permission="..."> MUST be
// frontend keys (post-mapping) — the same keys used in sidebarConfig.js.
//
// school_admin always passes every ProtectedRoute check (bypass in can()).
// Non-admin roles (e.g. accountant) are checked against their mapped perms.
// ════════════════════════════════════════════════
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected — 'school_admin' matches backend role exactly */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['school_admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* ── Dashboard (open to all logged-in) ── */}
          <Route index element={<AdminDashboard />} />

          {/* ── Profile (open to all logged-in) ── */}
          <Route path="profile" element={<Profile />} />

          {/* ── School Profile ── */}
        

          {/* ── Notifications ── */}
          <Route
            path="notifications"
            element={
              <ProtectedRoute permission="notification_view">    {/* ✅ mapped key */}
                <NotificationList />
              </ProtectedRoute>
            }
          />
          <Route
            path="notifications/create"
            element={
              <ProtectedRoute permission="notification_send">   {/* ✅ mapped key */}
                <CreateNotification />
              </ProtectedRoute>
            }
          />
          <Route
            path="notifications/:id"
            element={
              <ProtectedRoute permission="notification_view">   {/* ✅ mapped key */}
                <NotificationDetails />
              </ProtectedRoute>
            }
          />
          <Route path="my-notifications" element={<MyNotificationsPage />} /> {/* open to all */}

          {/* ── Students ── */}
          <Route
            path="students"
            element={
              <ProtectedRoute permission="view_all_student">    {/* ✅ mapped key */}
                <StudentList />
              </ProtectedRoute>
            }
          />
          <Route
            path="students/add"
            element={
              <ProtectedRoute permission="add_student">
                <AddStudent />
              </ProtectedRoute>
            }
          />
          <Route
            path="students/edit/:id"
            element={
              <ProtectedRoute permission="edit_student">
                <EditStudent />
              </ProtectedRoute>
            }
          />

          {/* ── Teachers ── */}
          <Route
            path="teachers"
            element={
              <ProtectedRoute permission="view_all_teacher">    {/* ✅ mapped key */}
                <TeacherList />
              </ProtectedRoute>
            }
          />
          <Route
            path="teachers/add"
            element={
              <ProtectedRoute permission="add_teacher">
                <AddTeacher />
              </ProtectedRoute>
            }
          />
          <Route
            path="teachers/edit/:id"
            element={
              <ProtectedRoute permission="edit_teacher">
                <EditTeacher />
              </ProtectedRoute>
            }
          />

          {/* ── Accountants ── */}
          <Route
            path="accountants"
            element={
              <ProtectedRoute permission="view_accountants">
                <AccountantList />
              </ProtectedRoute>
            }
          />
          <Route
            path="accountants/add"
            element={
              <ProtectedRoute permission="add_accountant">
                <AddAccountant />
              </ProtectedRoute>
            }
          />
          <Route
            path="accountants/edit/:id"
            element={
              <ProtectedRoute permission="edit_accountants">
                <EditAccountant />
              </ProtectedRoute>
            }
          />

          {/* ── Classes ── */}
          <Route
            path="classes"
            element={
              <ProtectedRoute permission="view_classes">
                <ClassList />
              </ProtectedRoute>
            }
          />
          <Route
            path="classes/add"
            element={
              <ProtectedRoute permission="manage_classes">
                <AddClass />
              </ProtectedRoute>
            }
          />
          <Route
            path="classes/edit/:id"
            element={
              <ProtectedRoute permission="manage_classes">
                <EditClass />
              </ProtectedRoute>
            }
          />
          <Route
            path="classes/sections"
            element={
              <ProtectedRoute permission="view_classes">
                <ClassSectionManager />
              </ProtectedRoute>
            }
          />

          {/* ── Sections ── */}
          <Route
            path="sections"
            element={
              <ProtectedRoute permission="view_sections">       {/* ✅ now used */}
                <SectionList />
              </ProtectedRoute>
            }
          />
          <Route
            path="sections/add"
            element={
              <ProtectedRoute permission="manage_sections">     {/* ✅ now used */}
                <AddSection />
              </ProtectedRoute>
            }
          />
          <Route
            path="sections/edit/:id"
            element={
              <ProtectedRoute permission="manage_sections">     {/* ✅ now used */}
                <EditSection />
              </ProtectedRoute>
            }
          />

          {/* ── Subjects ── */}
          <Route
            path="subject"
            element={
              <ProtectedRoute permission="view_subjects">
                <SubjectList />
              </ProtectedRoute>
            }
          />
          <Route
            path="subject/add"
            element={
              <ProtectedRoute permission="view_subjects">
                <AddSubject />
              </ProtectedRoute>
            }
          />
          <Route
            path="subject/edit/:id"
            element={
              <ProtectedRoute permission="view_subjects">
                <EditSubject />
              </ProtectedRoute>
            }
          />

          {/* ── Student Attendance ── */}
          <Route
            path="attendance"
            element={
              <ProtectedRoute permission="mark_student_attendance">  {/* ✅ NEW key */}
                <MarkAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="attendance/list"
            element={
              <ProtectedRoute permission="view_all_student">
                <AttendanceList />
              </ProtectedRoute>
            }
          />
          <Route
            path="attendance/report"
            element={
              <ProtectedRoute permission="view_one_student_attendance">  {/* ✅ NEW key */}
                <AttendanceReport />
              </ProtectedRoute>
            }
          />

          {/* ── Teacher Attendance ── */}
          <Route
            path="teacher-attendance"
            element={
              <ProtectedRoute permission="view_all_teacher">
                <MarkTeacherAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="teacher-attendance/list"
            element={
              <ProtectedRoute permission="view_all_teacher">
                <TeacherAttendanceList />
              </ProtectedRoute>
            }
          />
          <Route
            path="teacher-attendance/report"
            element={
              <ProtectedRoute permission="view_one_teacher_attendance">  {/* ✅ NEW key */}
                <TeacherAttendanceReport />
              </ProtectedRoute>
            }
          />

          {/* ── Accountant Attendance ── */}
          <Route
            path="accountant-attendance"
            element={
              <ProtectedRoute permission="view_accountants">
                <MarkAccountantAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="accountant-attendance/list"
            element={
              <ProtectedRoute permission="view_accountants">
                <AccountantAttendanceList />
              </ProtectedRoute>
            }
          />
          <Route
            path="accountant-attendance/report"
            element={
              <ProtectedRoute permission="view_accountants">
                <AccountantAttendanceReport />
              </ProtectedRoute>
            }
          />

          {/* ── Timetable ── */}
          <Route
            path="timetable/create"
            element={
              <ProtectedRoute permission="manage_timetable">
                <CreateTimetable />
              </ProtectedRoute>
            }
          />
          <Route
            path="timetable/view"
            element={
              <ProtectedRoute permission="view_timetable">
                <ViewTimetable />
              </ProtectedRoute>
            }
          />

          {/* ── Fees ── */}
          <Route
            path="fees/heads"
            element={
              <ProtectedRoute permission="view_fees">
                <FeeHeads />
              </ProtectedRoute>
            }
          />
          <Route
            path="fees/fine-rule"
            element={
              <ProtectedRoute permission="view_fees">
                <FineRule />
              </ProtectedRoute>
            }
          />
          <Route
            path="fees/create"
            element={
              <ProtectedRoute permission="manage_fees">
                <CreateFee />
              </ProtectedRoute>
            }
          />
          <Route
            path="fees/preview"
            element={
              <ProtectedRoute permission="view_fees">
                <FeePreview />
              </ProtectedRoute>
            }
          />

          {/* ── Fee Payment ── */}
          <Route
            path="fees-payment/collect"
            element={
              <ProtectedRoute permission="collect_payment">
                <CollectFee />
              </ProtectedRoute>
            }
          />
          <Route
            path="fees-payment/student/:studentId"
            element={
              <ProtectedRoute permission="view_payments">      {/* ✅ now used */}
                <StudentFeeProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="fees-payment/collect/:studentId"
            element={
              <ProtectedRoute permission="collect_payment">
                <CollectFeePayment />
              </ProtectedRoute>
            }
          />
          <Route
            path="fees-payment/receipt/:receiptId"
            element={
              <ProtectedRoute permission="generate_receipt">   {/* ✅ now used */}
                <FeeReceipt />
              </ProtectedRoute>
            }
          />
          {/* ── Payments list (new sidebar entry) ── */}
          <Route
            path="payments"
            element={
              <ProtectedRoute permission="view_payments">      {/* ✅ NEW route */}
                <CollectFee />   {/* replace with a PaymentList page if you have one */}
              </ProtectedRoute>
            }
          />

          {/* ── Exams ── */}
          <Route
            path="exams"
            element={
              <ProtectedRoute permission="view_subjects">
                <ExamList />
              </ProtectedRoute>
            }
          />
          <Route
            path="exams/add"
            element={
              <ProtectedRoute permission="view_subjects">
                <CreateExam />
              </ProtectedRoute>
            }
          />
          <Route
            path="exams/types"
            element={
              <ProtectedRoute permission="view_subjects">
                <ExamTypeList />
              </ProtectedRoute>
            }
          />
          <Route
            path="exams/types/add"
            element={
              <ProtectedRoute permission="view_subjects">
                <CreateExamType />
              </ProtectedRoute>
            }
          />
          <Route
            path="exams/timetable"
            element={
              <ProtectedRoute permission="view_timetable">
                <ViewExamTimetable />
              </ProtectedRoute>
            }
          />
          <Route
            path="exams/timetable/create"
            element={
              <ProtectedRoute permission="view_timetable">
                <CreateExamTimetable />
              </ProtectedRoute>
            }
          />
          <Route
            path="exams/timetable/edit/:id"
            element={
              <ProtectedRoute permission="view_timetable">
                <CreateExamTimetable />
              </ProtectedRoute>
            }
          />
          <Route
            path="exams/timetable/preview/:id"
            element={
              <ProtectedRoute permission="view_timetable">
                <TimetablePreview />
              </ProtectedRoute>
            }
          />
          <Route
            path="exams/assign-marks"
            element={
              <ProtectedRoute permission="manage_exam_marks">  {/* ✅ NEW key */}
                <AssignMarks />
              </ProtectedRoute>
            }
          />
          <Route
            path="exams/marks-list"
            element={
              <ProtectedRoute permission="manage_exam_marks">  {/* ✅ NEW key */}
                <MarksList />
              </ProtectedRoute>
            }
          />
          <Route
            path="exams/print-marksheet"
            element={
              <ProtectedRoute permission="generate_marksheet"> {/* ✅ NEW key */}
                <PrintMarksheet />
              </ProtectedRoute>
            }
          />
          <Route
            path="exams/admit-card"
            element={
              <ProtectedRoute permission="view_subjects">
                <GenerateAdmitCard />
              </ProtectedRoute>
            }
          />
          <Route
            path="exams/marksheet-generator"
            element={
              <ProtectedRoute permission="generate_marksheet"> {/* ✅ NEW key */}
                <MarksheetGenerator />
              </ProtectedRoute>
            }
          />
          <Route
            path="exams/co-scholastic"
            element={
              <ProtectedRoute permission="manage_exam_marks">  {/* ✅ NEW key */}
                <CreateCoScholasticGrades />
              </ProtectedRoute>
            }
          />
          <Route
            path="exams/co-scholastic/list"
            element={
              <ProtectedRoute permission="manage_exam_marks">  {/* ✅ NEW key */}
                <CoScholasticGradesList />
              </ProtectedRoute>
            }
          />

          {/* ── Homework ── */}
          <Route
            path="homework"
            element={
              <ProtectedRoute permission="view_hw_from_student">
                <HomeworkList />
              </ProtectedRoute>
            }
          />
          <Route
            path="homework/create"
            element={
              <ProtectedRoute permission="teacher_create_homework">
                <CreateHomework />
              </ProtectedRoute>
            }
          />
          <Route
            path="homework/:id"
            element={
              <ProtectedRoute permission="view_hw_from_student">
                <HomeworkDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="homework/edit/:id"
            element={
              <ProtectedRoute permission="teacher_create_homework">
                <EditHomework />
              </ProtectedRoute>
            }
          />

          {/* ── Transport ── */}
          <Route
            path="transport/routes"
            element={
              <ProtectedRoute permission="manage_school_settings">
                <RouteManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="transport/stops"
            element={
              <ProtectedRoute permission="manage_school_settings">
                <StopManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="transport/assign-student"
            element={
              <ProtectedRoute permission="manage_school_settings">
                <AssignStudentTransport />
              </ProtectedRoute>
            }
          />

          {/* ── Reports ── */}
          <Route path="reports" element={<Report />} />

          {/* ── Settings ── */}
          <Route path="settings">
            <Route
              path="role-permissions"
              element={
                <ProtectedRoute permission="manage_permissions">
                  <RolePermissions />
                </ProtectedRoute>
              }
            />
            <Route
              path="user-permissions"
              element={
                <ProtectedRoute permission="manage_permissions">
                  <UserPermissions />
                </ProtectedRoute>
              }
            />
          </Route>

        </Route>

        {/* Fallback */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/"  element={<Navigate to="/login" replace />} />
        <Route path="*"  element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App