import {
  LayoutDashboard,
  Users,
  BookOpen,
  Wallet,
  Calendar,
  DollarSign,
  ClipboardCheck,
  FileText,
  Settings,
  Layers,
  Inbox,
  List,
  Bell,
  Send,
  ShieldCheck,
  PlusCircle,
  GraduationCap,
  UserCheck,
  BadgeDollarSign,
  MessageSquare,
  Cpu,
  UsersRound,
  BookUser,
  LayoutGrid, // ✅ NEW — Classes & Sections icon
} from 'lucide-react'

export const sidebarMenuItems = [

  // ════════════════════════════════════════════════
  // 📊 DASHBOARD
  // ════════════════════════════════════════════════
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/admin',
    hasDropdown: false,
  },

  // ════════════════════════════════════════════════
  // 🎓 ACADEMIC GROUP
  // ════════════════════════════════════════════════
  {
    id: 'group-academic',
    label: 'Academic',
    icon: GraduationCap,
    isGroup: true,
    color: 'blue',
    items: [

      // ── Students Module ──────────────────────────
      {
        id: 'students',
        label: 'Students',
        icon: Users,
        highlight: true,
        hasDropdown: true,
        subItems: [
          { id: 'student-list', label: 'View All Students', path: '/admin/students' },
          { id: 'add-student',  label: 'Add Student',       path: '/admin/students/add' },
        ],
      },

      // ── Class & Sections Module ──────────────────
      {
        id: 'sections',
        label: 'Class-Sections',
        icon: Layers,
        highlight: true,
        hasDropdown: true,
        subItems: [
          // { id: 'class-list',     label: 'All Classes',        path: '/admin/classes',           icon: List       },
          // { id: 'section-list',   label: 'All Sections',       path: '/admin/sections'                            },
          // ✅ NEW — Classes & Sections Manager page
          { id: 'class-sections', label: 'Classes & Sections', path: '/admin/classes/sections',  icon: LayoutGrid },
        ],
      },

      // ── Subjects Module ──────────────────────────
      {
        id: 'subjects',
        label: 'Subjects',
        icon: BookOpen,
        highlight: true,
        hasDropdown: true,
        subItems: [
          { id: 'subject-list', label: 'View All Subjects', path: '/admin/subject' },
          { id: 'add-subject',  label: 'Add Subject',       path: '/admin/subject/add' },
        ], 
      },

      // ── Homework Module ──────────────────────────
      {
        id: 'homework',
        label: 'Homework',
        icon: BookOpen,
        highlight: true,
        hasDropdown: true,
        subItems: [
          { id: 'create-homework', label: 'Create Homework', path: '/admin/homework/create' },
          { id: 'homework-list',   label: 'View Homework',   path: '/admin/homework' },
        ],
      },

      // ── Exams Module ─────────────────────────────
      {
        id: 'exams',
        label: 'Exams',
        icon: FileText,
        highlight: true,
        hasDropdown: true,
        subItems: [
          { id: 'exam-list',             label: 'Exam List',             path: '/admin/exams' },
          { id: 'create-exam',           label: 'Create Exam',           path: '/admin/exams/add' },
          { id: 'exam-timetable-create', label: 'Create Exam Timetable', path: '/admin/exams/timetable/create' },
          { id: 'assign-marks',          label: 'Assign Marks',          path: '/admin/exams/assign-marks' },
          { id: 'marks-list',            label: 'Marks List',            path: '/admin/exams/marks-list' },
        ],
      },

      // ── Timetable Module ─────────────────────────
      {
        id: 'timetable',
        label: 'Timetable',
        icon: Calendar,
        highlight: true,
        hasDropdown: true,
        subItems: [
          { id: 'create-timetable', label: 'Create Timetable', path: '/admin/timetable/create', icon: PlusCircle },
          { id: 'view-timetable',   label: 'View Timetable',   path: '/admin/timetable/view',   icon: List       },
        ],
      },

    ],
  },

  // ════════════════════════════════════════════════
  // 📅 ATTENDANCE GROUP
  // ════════════════════════════════════════════════
  {
    id: 'group-attendance',
    label: 'Attendance',
    icon: UserCheck,
    isGroup: true,
    color: 'green',
    items: [

      // ── Student Attendance Module ────────────────
      {
        id: 'attendance',
        label: 'Student Attendance',
        icon: ClipboardCheck,
        highlight: true,
        hasDropdown: true,
        subItems: [
          { id: 'mark-attendance',    label: 'Mark Attendance',   path: '/admin/attendance' },
          { id: 'attendance-list',    label: 'Attendance List',   path: '/admin/attendance/list' },
          { id: 'attendance-report',  label: 'Attendance Report', path: '/admin/attendance/report' },
        ],
      },

      // ── Teacher Attendance Module ────────────────
      {
        id: 'teacher-attendance',
        label: 'Teacher Attendance',
        icon: ClipboardCheck,
        highlight: true,
        hasDropdown: true,
        subItems: [
          { id: 'mark-teacher-attendance',    label: 'Mark Attendance',   path: '/admin/teacher-attendance' },
          { id: 'teacher-attendance-list',    label: 'Attendance List',   path: '/admin/teacher-attendance/list' },
          { id: 'teacher-attendance-report',  label: 'Attendance Report', path: '/admin/teacher-attendance/report' },
        ],
      },

      // ── Accountant Attendance Module ─────────────
      {
        id: 'accountant-attendance',
        label: 'Accountant Attendance',
        icon: ClipboardCheck,
        highlight: true,
        hasDropdown: true,
        subItems: [
          { id: 'mark-accountant-attendance',   label: 'Mark Attendance',   path: '/admin/accountant-attendance' },
          { id: 'accountant-attendance-list',   label: 'Attendance List',   path: '/admin/accountant-attendance/list' },
          { id: 'accountant-attendance-report', label: 'Attendance Report', path: '/admin/accountant-attendance/report' },
        ],
      },

    ],
  },

  // ════════════════════════════════════════════════
  // 👨‍🏫 STAFF GROUP
  // ════════════════════════════════════════════════
  {
    id: 'group-staff',
    label: 'Staff',
    icon: UsersRound,
    isGroup: true,
    color: 'violet',
    items: [

      // ── Teachers Module ──────────────────────────
      {
        id: 'teachers',
        label: 'Teachers',
        icon: BookUser,
        highlight: true,
        hasDropdown: true,
        subItems: [
          { id: 'teacher-list', label: 'View All Teachers', path: '/admin/teachers' },
          { id: 'add-teacher',  label: 'Add Teacher',       path: '/admin/teachers/add' },
        ],
      },

      // ── Accountants Module ───────────────────────
      {
        id: 'accountants',
        label: 'Accountants',
        icon: Wallet,
        highlight: true,
        hasDropdown: true,
        subItems: [
          { id: 'accountant-list', label: 'View All Accountants', path: '/admin/accountants' },
          { id: 'add-accountant',  label: 'Add Accountant',       path: '/admin/accountants/add' },
        ],
      },

    ],
  },

  // ════════════════════════════════════════════════
  // 💰 FINANCE GROUP
  // ════════════════════════════════════════════════
  {
    id: 'group-finance',
    label: 'Finance',
    icon: BadgeDollarSign,
    isGroup: true,
    color: 'amber',
    items: [

      // ── Fee Management Module ────────────────────
      {
        id: 'fees',
        label: 'Fee Management',
        icon: DollarSign,
        highlight: true,
        hasDropdown: true,
        subItems: [
          { id: 'fee-heads',      label: 'Fee Heads',            path: '/admin/fees/heads' },
          { id: 'fee-fine-rules', label: 'Fine Rules',           path: '/admin/fees/fine-rule' },
          { id: 'create-fee',     label: 'Create Fee Structure', path: '/admin/fees/create' },
          { id: 'fee-preview',    label: 'View Fee Structure',   path: '/admin/fees/preview' },
          { id: 'collect-fee',    label: 'Collect Fee',          path: '/admin/fees-payment/collect' },
        ],
      },

    ],
  },

  // ════════════════════════════════════════════════
  // 🔔 COMMUNICATION GROUP
  // ════════════════════════════════════════════════
  {
    id: 'group-communication',
    label: 'Communication',
    icon: MessageSquare,
    isGroup: true,
    color: 'sky',
    items: [

      // ── Notifications Module ─────────────────────
      {
        id: 'notifications',
        label: 'Notifications',
        icon: Bell,
        highlight: true,
        hasDropdown: true,
        subItems: [
          { id: 'create-notification', label: 'Send Notification', path: '/admin/notifications/create', icon: Send  },
          { id: 'sent-notifications',  label: 'Sent Box',          path: '/admin/notifications',        icon: List  },
          { id: 'my-notifications',    label: 'My Inbox',          path: '/admin/my-notifications',     icon: Inbox },
        ],
      },

    ],
  },

  // ════════════════════════════════════════════════
  // ⚙️ SYSTEM GROUP
  // ════════════════════════════════════════════════
  {
    id: 'group-system',
    label: 'System',
    icon: Cpu,
    isGroup: true,
    color: 'gray',
    items: [

      // ── Settings Module ──────────────────────────
      {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        highlight: true,
        hasDropdown: true,
        // subItems: [
        //   { id: 'role-permissions', label: 'Role Permissions', path: '/admin/settings/role-permissions', icon: ShieldCheck },
        // ],
        subItems: [
             { id: 'role-permissions', label: 'Role Permissions', path: '/admin/settings/role-permissions', icon: ShieldCheck, },
             { id: 'user-permissions', label: 'User Permissions', path: '/admin/settings/user-permissions', icon: Users, },
]
      },

    ],
  },

]