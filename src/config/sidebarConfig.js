import {
  LayoutDashboard,
  Users,
  BookOpen,
  Wallet,
  Calendar,
  DollarSign,
  ClipboardCheck,
  FileText,
  BarChart3,
  Settings,
  Layers,
 Inbox,
  List,
 Bell,
   Send,

 ShieldCheck,
 
  PlusCircle,
} from 'lucide-react'

export const sidebarMenuItems = [
  // {
  //   id: 'dashboard',
  //   label: 'Dashboard',
  //   icon: LayoutDashboard,
  //   hasDropdown: true,
  //   subItems: [
  //     { id: 'admin-dashboard', label: 'Admin Dashboard', path: '/admin' },
  //   ],
  // },

     {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/admin',
    hasDropdown: false,
  },
  
// ✅ NEW NOTIFICATIONS SECTION
{
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    hasDropdown: true,
    subItems: [
      {
        id: 'create-notification',
        label: 'Send Notification',
        path: '/admin/notifications/create',
        icon: Send,
      },
      {
        id: 'sent-notifications',
        label: 'Sent Box',
        path: '/admin/notifications',
        icon: List,
      },
      {
        id: 'my-notifications',
        label: 'My Inbox',
        path: '/admin/my-notifications',
        icon: Inbox,
        // badge: true  ← Sidebar mein badge show karne ke liye
        //               Sidebar.jsx mein useNotifications().unreadCount use karo
      },
    ],
  },



  {
    id: 'students',
    label: 'Students',
    icon: Users,
    hasDropdown: true,
    subItems: [
      { id: 'student-list', label: 'View All Student', path: '/admin/students' },
      { id: 'add-student', label: 'Add Student', path: '/admin/students/add' },
    ],
  },
  {
    id: 'teachers',
    label: 'Teachers',
    icon: BookOpen,
    hasDropdown: true,
    subItems: [
      { id: 'teacher-list', label: 'View All Teacher', path: '/admin/teachers' },
      { id: 'add-teacher', label: 'Add Teacher', path: '/admin/teachers/add' },
    ],
  },
  {
    id: 'accountants',
    label: 'Accountants',
    icon: Wallet,
    hasDropdown: true,
    subItems: [
      { id: 'accountant-list', label: 'View All Accountant', path: '/admin/accountants' },
      { id: 'add-accountant', label: 'Add Accountant', path: '/admin/accountants/add' },
    ],
  },

  {
  id: 'classes',
  label: 'Classes',
  icon: Calendar,
  hasDropdown: true,
  subItems: [
    { id: 'class-list', label: 'View All Classes', path: '/admin/classes' ,  icon: List, },
    { id: 'add-class', label: 'Add Class', path: '/admin/classes/add' },
  ],
},

{
  id: 'sections',
  label: 'Sections',
  icon: Layers,
  hasDropdown: true,
  subItems: [
    { id: 'section-list', label: 'View All Sections', path: '/admin/sections' },
    { id: 'add-section', label: 'Add Section', path: '/admin/sections/add' },
  ],
},

{
  id: 'subjects',
  label: 'Subjects',
  icon: BookOpen,
  hasDropdown: true,
  subItems: [
    { id: 'subject-list', label: 'View All subject', path: '/admin/subject' },
    { id: 'add-subject', label: 'Add subject', path: '/admin/subject/add' },
  ],
},

{
  id: 'attendance',
  label: 'Student Attendance',
  icon: ClipboardCheck,
  hasDropdown: true,
  subItems: [
    { id: 'mark-attendance', label: 'Mark Attendance', path: '/admin/attendance' },
    { id: 'attendance-list', label: 'Attendance List', path: '/admin/attendance/list' },
    { id: 'attendance-report', label: 'Attendance Report', path: '/admin/attendance/report' }
  ]
},



{
  id: 'teacher-attendance',
  label: 'Teacher Attendance',
  icon: ClipboardCheck,
  hasDropdown: true,
  subItems: [
    {id: 'mark-teacher-attendance',label: 'Mark Attendance',path: '/admin/teacher-attendance'},
    {id: 'teacher-attendance-list',label: 'Attendance List',path: '/admin/teacher-attendance/list'},
    {id: 'teacher-attendance-report',label: 'Attendance Report',path: '/admin/teacher-attendance/report'}
  ]
},


{
  id: 'accountant-attendance',
  label: 'Accountant Attendance',
  icon: ClipboardCheck,
  hasDropdown: true,
  subItems: [
    {id: 'mark-accountant-attendance',label: 'Mark Attendance',path: '/admin/accountant-attendance'},
    {id: 'accountant-attendance-list',label: 'Attendance List',path: '/admin/accountant-attendance/list'},
    {id: 'accountant-attendance-report',label: 'Attendance Report',path: '/admin/accountant-attendance/report'}
  ]
},




   {
  id: 'timetable',
  label: 'Timetable',
  icon: Calendar,
  hasDropdown: true,
  subItems: [
    {id: 'create-timetable',label: 'Create Timetable',path: '/admin/timetable/create',icon: PlusCircle,},
    {id: 'view-timetable',label: 'View Timetable',path: '/admin/timetable/view',icon: List,},
  ],
},



// fees========================================================
// sidebarMenuItems array mein fees section update karein:
// src/components/SidebarMenuItems.js (or wherever you keep it)
{
  id: 'fees',
  label: 'Fee Management',
  icon: DollarSign,
  hasDropdown: true,
  subItems: [
    { id: 'fee-heads', label: 'Fee Heads', path: '/admin/fees/heads' },
    { id: 'fee-fine-rules', label: 'Fine Rules', path: '/admin/fees/fine-rule' },
    { id: 'create-fee', label: 'Create Fee Structure', path: '/admin/fees/create' }, // ✅ Add this
    { id: 'fee-preview', label: 'View fee Structure ', path: '/admin/fees/preview' }, // ✅ Optional preview page
    { label: 'Collect Fee', path: '/admin/fees-payment/collect' },
  ],
},


//  ========================Exam==================================================
// {
//   id: 'exams',
//   label: 'Exams',
//   icon: FileText,
//   hasDropdown: true,
//   subItems: [
//     { label: 'Exam Types', path: '/admin/exams/types' },

//     { label: 'Create Exam', path: '/admin/exams' },  // ✅ NEW

//     { label: 'Create Exam Timetable', path: '/admin/exams/timetable/create' },  // ✅

//     { label: 'View Exam Timetable', path: '/admin/exams/timetable/view' },  // ✅

//     { label: 'Assign Marks', path: '/admin/exams/assign-marks' },
//   ],
// },


{
  id: 'exams',
  label: 'Exams',
  icon: FileText,
  hasDropdown: true,
  subItems: [
    // { id: 'exam-types', label: 'Exam Types List', path: '/admin/exams/types' },
    // { id: 'add-exam-type', label: 'Create Exam Type', path: '/admin/exams/types/add' },

    { id: 'exam-list', label: 'Exam List', path: '/admin/exams' },
    { id: 'create-exam', label: 'Create Exam', path: '/admin/exams/add' },

    { id: 'exam-timetable-create', label: 'Create Exam Timetable', path: '/admin/exams/timetable/create' },
    // { id: 'exam-timetable-view', label: 'View Exam Timetable', path: '/admin/exams/timetable/view' },
    // { id: 'exam-timetable-preview', label: 'Timetable Preview', path: '/admin/exams/timetable/preview' },

    // ✅ ENABLE MARKS
    { id: 'assign-marks', label: 'Assign Marks', path: '/admin/exams/assign-marks' },
    { id: 'marks-list', label: 'Marks List', path: '/admin/exams/marks-list' },
    
  ],
},

  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    hasDropdown: true,
    subItems: [
      {
        id: 'role-permissions',
        label: 'Role Permissions',
        path: '/admin/settings/role-permissions',
        icon: ShieldCheck,
      },
    ],
  },
  // { id: 'classes', label: 'Classes', icon: Calendar, path: '/admin/classes', hasDropdown: false },
  // { id: 'fees', label: 'Fees', icon: DollarSign, path: '/admin/fees', hasDropdown: false },
  // { id: 'attendance', label: 'Attendance', icon: ClipboardCheck, path: '/admin/attendance', hasDropdown: false },
  // { id: 'exams', label: 'Exams', icon: FileText, path: '/admin/exams', hasDropdown: false },
  // { id: 'reports', label: 'Reports', icon: BarChart3, path: '/admin/reports', hasDropdown: false },
  // { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings', hasDropdown: false },
  
  // ── Settings (with Role Permissions) ───────────────────────
]
