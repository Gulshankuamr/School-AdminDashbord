// src/components/Navbar.jsx
import { useState, useEffect, useRef } from 'react'
import { Bell, Search, User, LogOut, Menu, ChevronDown, Settings, HelpCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Navbar = ({ onMenuClick, isCollapsed }) => {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const userMenuRef = useRef(null)
  const notificationRef = useRef(null)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className={`bg-white border-b border-gray-200 px-6 py-4 fixed top-0 left-0 ${
      isCollapsed ? 'lg:left-20' : 'lg:left-64'
    } right-0 z-30 transition-all duration-300`}>
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Title */}
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 hidden md:block">
              Manage your school efficiently
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="hidden lg:flex items-center bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students, teachers, fees..."
              className="bg-transparent border-none outline-none ml-3 w-72 text-gray-700 placeholder-gray-400"
            />
          </div>

          {/* Mobile Search Button */}
          <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
            <Search className="w-5 h-5 text-gray-600" />
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>
            
            {isNotificationOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in slide-in-from-top-2">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <p className="font-semibold text-gray-900">Notifications</p>
                  <p className="text-sm text-gray-500">You have 3 unread messages</p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {[
                    { id: 1, title: 'New Student Registered', time: '5 min ago', unread: true },
                    { id: 2, title: 'Fee Payment Due', time: '1 hour ago', unread: true },
                    { id: 3, title: 'Teacher Meeting', time: '2 hours ago', unread: false },
                    { id: 4, title: 'System Update', time: '1 day ago', unread: false },
                  ].map((notification) => (
                    <div 
                      key={notification.id}
                      className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                        notification.unread ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.unread ? 'bg-blue-600' : 'bg-gray-300'
                        }`}></div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{notification.title}</p>
                          <p className="text-sm text-gray-500">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 bg-gray-50">
                  <button className="w-full px-4 py-3 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative flex items-center gap-3 pl-3 border-l border-gray-200" ref={userMenuRef}>
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-gray-900">
                {user?.name || 'Administrator'}
              </p>
              <p className="text-xs text-gray-500">School Administrator</p>
            </div>
            
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 hover:bg-blue-50 rounded-xl p-2 transition-all duration-200"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <User className="w-6 h-6 text-white" />
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-600 transition-all duration-200 ${
                  isUserMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in slide-in-from-top-2">
                <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-800">
                  <p className="font-semibold text-white">{user?.name || 'Admin'}</p>
                  <p className="text-sm text-blue-100">{user?.email || 'admin@school.com'}</p>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false)
                      navigate('/admin/profile')
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="font-medium">My Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false)
                      navigate('/admin/settings')
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="font-medium">Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span className="font-medium">Help & Support</span>
                  </button>
                </div>
                <div className="border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-semibold">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar