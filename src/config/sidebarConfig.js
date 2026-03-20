// src/config/sidebarConfig.js
import {
  LayoutDashboard, Users, BookOpen, Wallet, Calendar,
  DollarSign, ClipboardCheck, FileText, Settings, MapPin,
  Bell, GraduationCap, UserCheck, BadgeDollarSign,
  MessageSquare, Bus, Cpu, UsersRound, BookUser, LayoutGrid,
  School, Receipt, CreditCard,
} from 'lucide-react'

export const sidebarMenuItems = [

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📊 DASHBOARD — no restriction
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id:         'dashboard',
    label:      'Dashboard',
    icon:       LayoutDashboard,
    path:       '/admin',
    permission: null,           // open to all logged-in users
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🏫 SCHOOL PROFILE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // {
  //   id:         'school-profile',
  //   label:      'School Profile',
  //   icon:       School,
  //   path:       '/admin/school-profile',
  //   permission: 'view_school_profile',              // ✅ NEW mapped key
  // },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎓 ACADEMIC MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id:      'group-academic',
    label:   'Academic Management',
    icon:    GraduationCap,
    isGroup: true,
    color:   'blue',

    items: [

      {
        id:          'students',
        label:       'Students',
        icon:        Users,
        hasDropdown: true,
        permission:  'view_all_student',            // ✅ frontend key
        subItems: [
          { id: 'student-list', label: 'All Students', path: '/admin/students',     permission: 'view_all_student' },
          { id: 'add-student',  label: 'Add Student',  path: '/admin/students/add', permission: 'add_student'      },
        ],
      },

      {
        id:          'class-sections',
        label:       'Classes & Sections',
        icon:        LayoutGrid,
        hasDropdown: false,
        path:        '/admin/classes/sections',
        permission:  'view_classes',
      },

      {
        id:          'subjects',
        label:       'Subjects',
        icon:        BookOpen,
        hasDropdown: true,
        permission:  'view_subjects',
        subItems: [
          { id: 'subject-list', label: 'All Subjects', path: '/admin/subject',     permission: 'view_subjects' },
          { id: 'add-subject',  label: 'Add Subject',  path: '/admin/subject/add', permission: 'view_subjects' },
        ],
      },

      {
        id:          'homework',
        label:       'Homework',
        icon:        BookOpen,
        hasDropdown: true,
        permission:  'view_hw_from_student',
        subItems: [
          { id: 'create-homework', label: 'Create Homework', path: '/admin/homework/create', permission: 'teacher_create_homework' },
          { id: 'homework-list',   label: 'Homework List',   path: '/admin/homework',        permission: 'view_hw_from_student'   },
        ],
      },

      {
        id:          'timetable',
        label:       'Timetable',
        icon:        Calendar,
        hasDropdown: true,
        permission:  'view_timetable',
        subItems: [
          { id: 'create-timetable', label: 'Create Timetable', path: '/admin/timetable/create', permission: 'manage_timetable' },
          { id: 'view-timetable',   label: 'View Timetable',   path: '/admin/timetable/view',   permission: 'view_timetable'   },
        ],
      },

    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📝 EXAMS MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id:      'group-exams',
    label:   'Exams Management',
    icon:    FileText,
    isGroup: true,
    color:   'violet',

    items: [
      {
        id:          'exams',
        label:       'Exams',
        icon:        FileText,
        hasDropdown: true,
        permission:  'view_subjects',
        subItems: [
          { id: 'create-exam',           label: 'Create Exam',          path: '/admin/exams/add',                 permission: 'view_subjects'     },
          { id: 'exam-timetable-create', label: 'Exam Timetable',       path: '/admin/exams/timetable/create',    permission: 'view_timetable'    },
          { id: 'assign-marks',          label: 'Create Marks',         path: '/admin/exams/assign-marks',        permission: 'manage_exam_marks' },  // ✅ updated key
          { id: 'marks-list',            label: 'Marks List',           path: '/admin/exams/marks-list',          permission: 'manage_exam_marks' },  // ✅ updated key
          { id: 'co-scholastic-grades',  label: 'Co-Scholastic Grades', path: '/admin/exams/co-scholastic',       permission: 'manage_exam_marks' },  // ✅ updated key
          { id: 'marksheet-generator',   label: 'Generate Marksheet',   path: '/admin/exams/marksheet-generator', permission: 'generate_marksheet' }, // ✅ NEW key
          { id: 'generate-admit-card',   label: 'Admit & ID Cards',     path: '/admin/exams/admit-card',          permission: 'view_subjects'     },
        ],
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 👨‍🏫 STAFF MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id:      'group-staff',
    label:   'Staff Management',
    icon:    UsersRound,
    isGroup: true,
    color:   'purple',

    items: [

      {
        id:          'teachers',
        label:       'Teachers',
        icon:        BookUser,
        hasDropdown: true,
        permission:  'view_all_teacher',            // ✅ frontend key
        subItems: [
          { id: 'teacher-list', label: 'All Teachers', path: '/admin/teachers',     permission: 'view_all_teacher' },
          { id: 'add-teacher',  label: 'Add Teacher',  path: '/admin/teachers/add', permission: 'add_teacher'      },
        ],
      },

      {
        id:          'accountants',
        label:       'Accountants',
        icon:        Wallet,
        hasDropdown: true,
        permission:  'view_accountants',
        subItems: [
          { id: 'accountant-list', label: 'All Accountants', path: '/admin/accountants',     permission: 'view_accountants' },
          { id: 'add-accountant',  label: 'Add Accountant',  path: '/admin/accountants/add', permission: 'add_accountant'   },
        ],
      },

    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📅 ATTENDANCE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id:      'group-attendance',
    label:   'Attendance',
    icon:    ClipboardCheck,
    isGroup: true,
    color:   'green',

    items: [

      {
        id:         'student-attendance',
        label:      'Student Attendance',
        icon:       Users,
        path:       '/admin/attendance',
        // ✅ either mark_student_attendance OR view_all_student grants access
        permission: 'mark_student_attendance',
      },

      {
        id:         'teacher-attendance',
        label:      'Teacher Attendance',
        icon:       BookUser,
        path:       '/admin/teacher-attendance',
        permission: 'view_all_teacher',             // ✅ frontend key
      },

      {
        id:         'accountant-attendance',
        label:      'Accountant Attendance',
        icon:       Wallet,
        path:       '/admin/accountant-attendance',
        permission: 'view_accountants',
      },

    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🚍 TRANSPORT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id:      'group-transport',
    label:   'Transport',
    icon:    Bus,
    isGroup: true,
    color:   'orange',

    items: [

      {
        id:         'transport-routes',
        label:      'Routes Management',
        icon:       Bus,
        path:       '/admin/transport/routes',
        permission: 'manage_school_settings',
      },

      {
        id:         'transport-stops',
        label:      'Stops Management',
        icon:       MapPin,
        path:       '/admin/transport/stops',
        permission: 'manage_school_settings',
      },

      {
        id:         'assign-transport',
        label:      'Assign Transport',
        icon:       UserCheck,
        path:       '/admin/transport/assign-student',
        permission: 'manage_school_settings',
      },

    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 💰 FINANCE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id:      'group-finance',
    label:   'Finance',
    icon:    BadgeDollarSign,
    isGroup: true,
    color:   'amber',

    items: [

      {
        id:          'fees',
        label:       'Fee Management',
        icon:        DollarSign,
        hasDropdown: true,
        permission:  'view_fees',
        subItems: [
          { id: 'fee-heads',      label: 'Fee Heads',            path: '/admin/fees/heads',           permission: 'view_fees'      },
          { id: 'fee-fine-rules', label: 'Fine Rules',           path: '/admin/fees/fine-rule',       permission: 'view_fees'      },
          { id: 'create-fee',     label: 'Create Fee Structure', path: '/admin/fees/create',          permission: 'manage_fees'    },
          { id: 'fee-preview',    label: 'View Fee Structure',   path: '/admin/fees/preview',         permission: 'view_fees'      },
          { id: 'collect-fee',    label: 'Collect Fee',          path: '/admin/fees-payment/collect', permission: 'collect_payment' },
        ],
      },

      {
        id:          'payments',
        label:       'Payments',
        icon:        CreditCard,
        hasDropdown: true,
        permission:  'view_payments',               // ✅ NEW menu entry for view_payments
        subItems: [
          { id: 'view-payments', label: 'Payment Records', path: '/admin/payments',        permission: 'view_payments'   },
          { id: 'fee-receipt',   label: 'Fee Receipts',    path: '/admin/fees-payment/receipts', permission: 'generate_receipt' }, // ✅ NEW
        ],
      },

    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔔 COMMUNICATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id:      'group-communication',
    label:   'Communication',
    icon:    MessageSquare,
    isGroup: true,
    color:   'sky',

    items: [

      {
        id:          'notifications',
        label:       'Notifications',
        icon:        Bell,
        hasDropdown: true,
        permission:  'notification_view',           // ✅ frontend key (was notification.view)
        subItems: [
          { id: 'create-notification', label: 'Send Notification',  path: '/admin/notifications/create', permission: 'notification_send'   }, // ✅
          { id: 'sent-notifications',  label: 'Sent Notifications', path: '/admin/notifications',        permission: 'notification_view'   }, // ✅
          { id: 'my-notifications',    label: 'My Inbox',           path: '/admin/my-notifications',     permission: null                  },
        ],
      },

    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⚙️ SYSTEM SETTINGS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id:      'group-system',
    label:   'System Settings',
    icon:    Cpu,
    isGroup: true,
    color:   'gray',

    items: [

      {
        id:          'settings',
        label:       'Settings',
        icon:        Settings,
        hasDropdown: true,
        permission:  'manage_permissions',
        subItems: [
          { id: 'role-permissions', label: 'Role Permissions', path: '/admin/settings/role-permissions', permission: 'manage_permissions' },
          { id: 'user-permissions', label: 'User Permissions', path: '/admin/settings/user-permissions', permission: 'manage_permissions' },
        ],
      },

    ],
  },

]