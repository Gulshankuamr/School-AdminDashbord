// // import { useState, useEffect, useRef } from 'react'
// // import { Bell, Search, User, LogOut, Menu, ChevronDown, Settings, HelpCircle } from 'lucide-react'
// // import { useAuth } from '../context/AuthContext'
// // import { useNotifications } from '../context/NotificationContext'
// // import { useNavigate } from 'react-router-dom'

// // const Navbar = ({ onMenuClick, isCollapsed }) => {
// //   const { logout, user } = useAuth()
// //   const { unreadCount } = useNotifications()
// //   const navigate = useNavigate()
// //   const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
// //   const userMenuRef = useRef(null)

// //   const handleLogout = () => {
// //     logout()
// //     navigate('/login')
// //   }

// //   useEffect(() => {
// //     const handleClickOutside = (event) => {
// //       if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
// //         setIsUserMenuOpen(false)
// //       }
// //     }

// //     document.addEventListener('mousedown', handleClickOutside)
// //     return () => document.removeEventListener('mousedown', handleClickOutside)
// //   }, [])

// //   return (
// //     <nav className={`bg-white border-b border-gray-200 px-6 py-4 fixed top-0 left-0 ${
// //       isCollapsed ? 'lg:left-20' : 'lg:left-64'
// //     } right-0 z-30 transition-all duration-300`}>
// //       <div className="flex items-center justify-between">
// //         {/* Left Section */}
// //         <div className="flex items-center gap-4">
// //           <button
// //             onClick={onMenuClick}
// //             className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
// //           >
// //             <Menu className="w-6 h-6" />
// //           </button>
// //           <div className='ml-4'>
// //             <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
// //             <p className="text-sm text-gray-500 hidden md:block">
// //               Manage your school efficiently
// //             </p>
// //           </div>
// //         </div>

// //         {/* Right Section */}
// //         <div className="flex items-center gap-4">
// //           {/* Search Bar */}
// //           <div className="hidden lg:flex items-center bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
// //             <Search className="w-5 h-5 text-gray-400" />
// //             <input
// //               type="text"
// //               placeholder="Search students, teachers, fees..."
// //               className="bg-transparent border-none outline-none ml-3 w-72 text-gray-700 placeholder-gray-400"
// //             />
// //           </div>

// //           <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
// //             <Search className="w-5 h-5 text-gray-600" />
// //           </button>

// //           {/* Notifications - Just bell icon with count, no dropdown */}
// //           <button 
// //             className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
// //           >
// //             <Bell className="w-6 h-6 text-gray-600" />
// //             {unreadCount > 0 && (
// //               <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
// //                 {unreadCount > 99 ? '99+' : unreadCount}
// //               </span>
// //             )}
// //           </button>

// //           {/* User Menu */}
// //           <div className="relative flex items-center gap-3 pl-3 border-l border-gray-200" ref={userMenuRef}>
// //             <div className="hidden md:block text-right">
// //               <p className="text-sm font-semibold text-gray-900">
// //                 {user?.name || 'Administrator'}
// //               </p>
// //               <p className="text-xs text-gray-500">School Administrator</p>
// //             </div>
            
// //             <button
// //               onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
// //               className="flex items-center gap-2 hover:bg-blue-50 rounded-xl p-2 transition-all duration-200"
// //             >
// //               <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
// //                 <User className="w-6 h-6 text-white" />
// //               </div>
// //               <ChevronDown
// //                 className={`w-4 h-4 text-gray-600 transition-all duration-200 ${
// //                   isUserMenuOpen ? 'rotate-180' : ''
// //                 }`}
// //               />
// //             </button>

// //             {isUserMenuOpen && (
// //               <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
// //                 <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-800">
// //                   <p className="font-semibold text-white">{user?.name || 'Admin'}</p>
// //                   <p className="text-sm text-blue-100">{user?.email || 'admin@school.com'}</p>
// //                 </div>
// //                 <div className="py-2">
// //                   <button
// //                     onClick={() => {
// //                       setIsUserMenuOpen(false)
// //                       navigate('/admin/profile')
// //                     }}
// //                     className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
// //                   >
// //                     <User className="w-4 h-4" />
// //                     <span className="font-medium">My Profile</span>
// //                   </button>
// //                   <button
// //                     onClick={() => {
// //                       setIsUserMenuOpen(false)
// //                       navigate('/admin/settings')
// //                     }}
// //                     className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
// //                   >
// //                     <Settings className="w-4 h-4" />
// //                     <span className="font-medium">Settings</span>
// //                   </button>
// //                   <button
// //                     onClick={() => {
// //                       setIsUserMenuOpen(false)
// //                     }}
// //                     className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
// //                   >
// //                     <HelpCircle className="w-4 h-4" />
// //                     <span className="font-medium">Help & Support</span>
// //                   </button>
// //                 </div>
// //                 <div className="border-t border-gray-200">
// //                   <button
// //                     onClick={handleLogout}
// //                     className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
// //                   >
// //                     <LogOut className="w-4 h-4" />
// //                     <span className="font-semibold">Logout</span>
// //                   </button>
// //                 </div>
// //               </div>
// //             )}
// //           </div>
// //         </div>
// //       </div>
// //     </nav>
// //   )
// // }

// // export default Navbar



// import { useState, useEffect, useRef } from 'react'
// import {
//   Bell, Search, LogOut, Menu, ChevronDown,
//   Settings, HelpCircle, User, Shield, Sparkles
// } from 'lucide-react'
// import { useAuth } from '../context/AuthContext'
// import { useNotifications } from '../context/NotificationContext'
// import { useNavigate } from 'react-router-dom'

// // Helper: get initials from name
// const getInitials = (name) => {
//   if (!name) return 'A'
//   return name
//     .split(' ')
//     .map((n) => n[0])
//     .join('')
//     .toUpperCase()
//     .slice(0, 2)
// }

// // Helper: get avatar gradient based on name
// const getAvatarGradient = (name) => {
//   const gradients = [
//     'from-violet-500 to-purple-600',
//     'from-blue-500 to-cyan-500',
//     'from-emerald-500 to-teal-600',
//     'from-orange-500 to-rose-500',
//     'from-pink-500 to-fuchsia-600',
//   ]
//   if (!name) return gradients[0]
//   const idx = name.charCodeAt(0) % gradients.length
//   return gradients[idx]
// }

// const Navbar = ({ onMenuClick, isCollapsed }) => {
//   const { logout, user } = useAuth()
//   const { unreadCount } = useNotifications()
//   const navigate = useNavigate()
//   const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
//   const userMenuRef = useRef(null)

//   const handleLogout = () => {
//     setIsUserMenuOpen(false)
//     logout()
//     navigate('/login')
//   }

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
//         setIsUserMenuOpen(false)
//       }
//     }
//     document.addEventListener('mousedown', handleClickOutside)
//     return () => document.removeEventListener('mousedown', handleClickOutside)
//   }, [])

//   const initials = getInitials(user?.name)
//   const avatarGradient = getAvatarGradient(user?.name)

//   return (
//     <nav
//       className={`bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-3 fixed top-0 left-0 ${
//         isCollapsed ? 'lg:left-20' : 'lg:left-64'
//       } right-0 z-30 transition-all duration-300 shadow-sm`}
//     >
//       <div className="flex items-center justify-between">
//         {/* Left Section */}
//         <div className="flex items-center gap-4">
//           <button
//             onClick={onMenuClick}
//             className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
//           >
//             <Menu className="w-5 h-5" />
//           </button>
//           <div className="ml-3">
//             <h1 className="text-lg font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
//             <p className="text-xs text-gray-400 hidden md:block">Manage your school efficiently</p>
//           </div>
//         </div>

//         {/* Right Section */}
//         <div className="flex items-center gap-2">
//           {/* Search Bar */}
//           {/* <div className="hidden lg:flex items-center bg-gray-50 rounded-xl px-4 py-2 border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
//             <Search className="w-4 h-4 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search students, teachers..."
//               className="bg-transparent border-none outline-none ml-3 w-64 text-sm text-gray-700 placeholder-gray-400"
//             />
//           </div> */}

//           <button className="lg:hidden p-2 hover:bg-gray-100 rounded-xl">
//             <Search className="w-5 h-5 text-gray-600" />
//           </button>

//           {/* Notifications */}
//           <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
//             <Bell className="w-5 h-5 text-gray-600" />
//             {unreadCount > 0 && (
//               <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
//                 {unreadCount > 99 ? '99+' : unreadCount}
//               </span>
//             )}
//           </button>

//           {/* Divider */}
//           <div className="h-8 w-px bg-gray-200 mx-1" />

//           {/* User Menu */}
//           <div className="relative" ref={userMenuRef}>
//             <button
//               onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
//               className={`flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-all duration-200 ${
//                 isUserMenuOpen ? 'bg-gray-100' : 'hover:bg-gray-50'
//               }`}
//             >
//               {/* Avatar */}
//               <div
//                 className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center shadow-md flex-shrink-0`}
//               >
//                 <span className="text-white text-sm font-bold">{initials}</span>
//               </div>

//               {/* Name & Role */}
//               <div className="hidden md:block text-left">
//                 <p className="text-sm font-semibold text-gray-900 leading-tight">
//                   {user?.name || 'Administrator'}
//                 </p>
//                 <p className="text-xs text-gray-400 leading-tight capitalize">
//                   {user?.role?.replace('_', ' ') || 'School Admin'}
//                 </p>
//               </div>

//               <ChevronDown
//                 className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
//                   isUserMenuOpen ? 'rotate-180' : ''
//                 }`}
//               />
//             </button>

//             {/* Dropdown */}
//             {isUserMenuOpen && (
//               <div
//                 className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
//                 style={{
//                   animation: 'dropdownIn 0.18s cubic-bezier(0.16, 1, 0.3, 1) both',
//                 }}
//               >
//                 {/* Profile Header */}
//                 <div className="relative px-4 py-4 overflow-hidden">
//                   {/* Decorative background */}
//                   <div
//                     className={`absolute inset-0 bg-gradient-to-br ${avatarGradient} opacity-10`}
//                   />
//                   <div className="relative flex items-center gap-3">
//                     <div
//                       className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center shadow-lg flex-shrink-0`}
//                     >
//                       <span className="text-white text-base font-bold">{initials}</span>
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <p className="font-bold text-gray-900 text-sm truncate">
//                         {user?.name || 'Administrator'}
//                       </p>
//                       <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@school.com'}</p>
//                       <div className="flex items-center gap-1 mt-1">
//                         <Shield className="w-3 h-3 text-blue-500" />
//                         <span className="text-[11px] text-blue-600 font-semibold capitalize">
//                           {user?.role?.replace('_', ' ') || 'School Admin'}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="h-px bg-gray-100 mx-3" />

//                 {/* Menu Items */}
//                 <div className="p-2">
//                   <button
//                     onClick={() => { setIsUserMenuOpen(false); navigate('/admin/profile') }}
//                     className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors group"
//                   >
//                     <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
//                       <User className="w-4 h-4 text-blue-600" />
//                     </div>
//                     <span className="font-medium">My Profile</span>
//                   </button>

//                   <button
//                     onClick={() => { setIsUserMenuOpen(false); navigate('/admin/settings') }}
//                     className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors group"
//                   >
//                     <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center group-hover:bg-violet-100 transition-colors">
//                       <Settings className="w-4 h-4 text-violet-600" />
//                     </div>
//                     <span className="font-medium">Settings</span>
//                   </button>

//                   <button
//                     onClick={() => setIsUserMenuOpen(false)}
//                     className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors group"
//                   >
//                     <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
//                       <HelpCircle className="w-4 h-4 text-amber-600" />
//                     </div>
//                     <span className="font-medium">Help & Support</span>
//                   </button>
//                 </div>

//                 <div className="h-px bg-gray-100 mx-3" />

//                 {/* Logout */}
//                 <div className="p-2">
//                   <button
//                     onClick={handleLogout}
//                     className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors group"
//                   >
//                     <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
//                       <LogOut className="w-4 h-4 text-red-500" />
//                     </div>
//                     <span className="font-semibold">Logout</span>
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Dropdown animation */}
//       <style>{`
//         @keyframes dropdownIn {
//           from { opacity: 0; transform: translateY(-8px) scale(0.96); }
//           to   { opacity: 1; transform: translateY(0)   scale(1);    }
//         }
//       `}</style>
//     </nav>
//   )
// }

// export default Navbar




// src/components/Navbar.jsx
import { useState, useEffect, useRef } from 'react'
import {
  Bell, Search, LogOut, Menu, ChevronDown,
  Settings, HelpCircle, User, Shield, Inbox
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import { useNavigate } from 'react-router-dom'

// ── Helpers ───────────────────────────────────────────────────────────────────
const getInitials = (name) => {
  if (!name) return 'A'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const getAvatarGradient = (name) => {
  const gradients = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-rose-500',
    'from-pink-500 to-fuchsia-600',
  ]
  if (!name) return gradients[0]
  return gradients[name.charCodeAt(0) % gradients.length]
}

// ── Component ─────────────────────────────────────────────────────────────────
const Navbar = ({ onMenuClick, isCollapsed }) => {
  const { logout, user }        = useAuth()
  const { unreadCount }         = useNotifications()   // ← from getMyNotifications
  const navigate                = useNavigate()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [bellPulse, setBellPulse]           = useState(false)
  const userMenuRef = useRef(null)

  // Pulse bell when unread count increases
  useEffect(() => {
    if (unreadCount > 0) {
      setBellPulse(true)
      const t = setTimeout(() => setBellPulse(false), 1000)
      return () => clearTimeout(t)
    }
  }, [unreadCount])

  const handleLogout = () => {
    setIsUserMenuOpen(false)
    logout()
    navigate('/login')
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initials        = getInitials(user?.name)
  const avatarGradient  = getAvatarGradient(user?.name)

  return (
    <nav className={`bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-3 fixed top-0 left-0 ${
      isCollapsed ? 'lg:left-20' : 'lg:left-64'
    } right-0 z-30 transition-all duration-300 shadow-sm`}>
      <div className="flex items-center justify-between">

        {/* ── Left ── */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="ml-3">
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-xs text-gray-400 hidden md:block">Manage your school efficiently</p>
          </div>
        </div>

        {/* ── Right ── */}
        <div className="flex items-center gap-2">

          {/* Mobile search */}
          <button className="lg:hidden p-2 hover:bg-gray-100 rounded-xl">
            <Search className="w-5 h-5 text-gray-600" />
          </button>

          {/* ── Bell Icon ──────────────────────────────────────────────────────
              Click → /admin/my-notifications  (recipient inbox)
              Badge → unreadCount from NotificationContext (getMyNotifications)
          ─────────────────────────────────────────────────────────────────── */}
          <button
            onClick={() => navigate('/admin/my-notifications')}
            title="My Notifications"
            className={`relative p-2 hover:bg-orange-50 rounded-xl transition-all duration-200
              ${bellPulse ? 'scale-110' : 'scale-100'}`}
          >
            <Bell className={`w-5 h-5 transition-colors duration-200
              ${unreadCount > 0 ? 'text-orange-500' : 'text-gray-600'}`}
            />
            {unreadCount > 0 && (
              <span className={`absolute -top-0.5 -right-0.5 bg-red-500 text-white
                text-[10px] font-bold rounded-full min-w-[18px] h-[18px]
                flex items-center justify-center px-1
                ${bellPulse ? 'animate-bounce' : ''}`}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-200 mx-1" />

          {/* ── User Menu ── */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-all duration-200
                ${isUserMenuOpen ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
            >
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center shadow-md flex-shrink-0`}>
                <span className="text-white text-sm font-bold">{initials}</span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-900 leading-tight">{user?.name || 'Administrator'}</p>
                <p className="text-xs text-gray-400 leading-tight capitalize">{user?.role?.replace('_', ' ') || 'School Admin'}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {isUserMenuOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                style={{ animation: 'dropdownIn 0.18s cubic-bezier(0.16,1,0.3,1) both' }}
              >
                {/* Profile header */}
                <div className="relative px-4 py-4 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${avatarGradient} opacity-10`} />
                  <div className="relative flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                      <span className="text-white text-base font-bold">{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{user?.name || 'Administrator'}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@school.com'}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Shield className="w-3 h-3 text-blue-500" />
                        <span className="text-[11px] text-blue-600 font-semibold capitalize">
                          {user?.role?.replace('_', ' ') || 'School Admin'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-100 mx-3" />

                {/* Menu Items */}
                <div className="p-2">
                  {/* My Profile */}
                  <button
                    onClick={() => { setIsUserMenuOpen(false); navigate('/admin/profile') }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-800 hover:bg-gray-50 rounded-xl transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium">My Profile</span>
                  </button>

                  {/* My Notifications — inbox shortcut from user menu */}
                  <button
                    onClick={() => { setIsUserMenuOpen(false); navigate('/admin/my-notifications') }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-800 hover:bg-gray-50 rounded-xl transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors relative">
                      <Inbox className="w-4 h-4 text-orange-500" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>
                    <span className="font-medium">My Notifications</span>
                    {unreadCount > 0 && (
                      <span className="ml-auto px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Settings */}
                  <button
                    onClick={() => { setIsUserMenuOpen(false); navigate('/admin/settings') }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-800 hover:bg-gray-50 rounded-xl transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center group-hover:bg-violet-100 transition-colors">
                      <Settings className="w-4 h-4 text-violet-600" />
                    </div>
                    <span className="font-medium">Settings</span>
                  </button>

                  {/* Help */}
                  <button
                    onClick={() => setIsUserMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-800 hover:bg-gray-50 rounded-xl transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                      <HelpCircle className="w-4 h-4 text-amber-600" />
                    </div>
                    <span className="font-medium">Help & Support</span>
                  </button>
                </div>

                <div className="h-px bg-gray-100 mx-3" />

                {/* Logout */}
                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                      <LogOut className="w-4 h-4 text-red-500" />
                    </div>
                    <span className="font-semibold">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>
    </nav>
  )
}

export default Navbar