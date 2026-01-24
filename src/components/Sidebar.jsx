// src/components/Sidebar.jsx
import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { X, ChevronDown, ChevronRight, School, ChevronLeft } from 'lucide-react'
import { sidebarMenuItems } from '../config/sidebarConfig'

const Sidebar = ({ isOpen, onClose, onToggleCollapse, isCollapsed }) => {
  const location = useLocation()
  const [openDropdowns, setOpenDropdowns] = useState({})
  const [hoveredItem, setHoveredItem] = useState(null)
  const [hoverTimeout, setHoverTimeout] = useState(null)

  // Initialize open dropdowns based on current route
  useEffect(() => {
    const newOpenDropdowns = {}
    sidebarMenuItems.forEach(item => {
      if (item.hasDropdown && item.subItems) {
        const isActive = item.subItems.some(subItem => 
          subItem.path === location.pathname || 
          location.pathname.startsWith(subItem.path)
        )
        if (isActive) {
          newOpenDropdowns[item.id] = true
        }
      }
    })
    setOpenDropdowns(newOpenDropdowns)
  }, [location.pathname])

  const toggleDropdown = (itemId) => {
    setOpenDropdowns((prev) => ({ ...prev, [itemId]: !prev[itemId] }))
  }

  const handleItemHover = (itemId) => {
    if (isCollapsed) {
      if (hoverTimeout) clearTimeout(hoverTimeout)
      setHoveredItem(itemId)
    }
  }

  const handleItemLeave = () => {
    if (isCollapsed) {
      const timeout = setTimeout(() => {
        setHoveredItem(null)
      }, 200)
      setHoverTimeout(timeout)
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transition-all duration-300 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isCollapsed ? 'w-20' : 'w-64'
        } lg:translate-x-0`}
      >
        {/* Top Section with Logo and Toggle */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} py-5 px-4 border-b border-gray-200 sticky top-0 bg-white z-10`}>
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <School className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">SchoolPro</h2>
                  <p className="text-xs text-gray-500">Admin Panel</p>
                </div>
              </div>
              
              {/* Open/Close Toggle Button */}
              <button 
                onClick={onToggleCollapse}
                className="hidden lg:flex p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Close Sidebar"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
            </>
          ) : (
            <>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <School className="w-6 h-6 text-white" />
              </div>
              
              {/* Open/Close Toggle Button */}
              <button 
                onClick={onToggleCollapse}
                className="hidden lg:flex absolute right-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Open Sidebar"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 rotate-180" />
              </button>
            </>
          )}

          {/* Close button for mobile */}
          <button 
            onClick={onClose} 
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-900" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1">
          {sidebarMenuItems.map((item) => {
            const Icon = item.icon
            const isDropdownOpen = openDropdowns[item.id] || false
            const isActive = 
              item.path === location.pathname || 
              (item.subItems && item.subItems.some(subItem => 
                subItem.path === location.pathname || 
                location.pathname.startsWith(subItem.path)
              ))
            const isHovered = hoveredItem === item.id

            return (
              <div 
                key={item.id}
                className="relative"
                onMouseEnter={() => handleItemHover(item.id)}
                onMouseLeave={handleItemLeave}
              >
                {item.hasDropdown ? (
                  <>
                    <button
                      onClick={() => toggleDropdown(item.id)}
                      className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-${isCollapsed ? '3' : '4'} py-3 rounded-lg transition-all duration-200 font-medium ${
                        isActive 
                          ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        {!isCollapsed && <span>{item.label}</span>}
                      </div>
                      {!isCollapsed && (
                        isDropdownOpen ? 
                          <ChevronDown className="w-4 h-4" /> : 
                          <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    {/* Dropdown for expanded mode */}
                    {!isCollapsed && isDropdownOpen && item.subItems && (
                      <div className="ml-8 mt-1 mb-2 space-y-1 border-l-2 border-blue-100 pl-3">
                        {item.subItems.map((subItem) => {
                          const isSubActive = subItem.path === location.pathname
                          return (
                            <NavLink
                              key={subItem.id}
                              to={subItem.path}
                              onClick={onClose}
                              className={({ isActive }) =>
                                `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                                  isActive || isSubActive
                                    ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-100' 
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`
                              }
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                isSubActive ? 'bg-blue-600' : 'bg-gray-300'
                              }`}></span>
                              <span>{subItem.label}</span>
                            </NavLink>
                          )
                        })}
                      </div>
                    )}

                    {/* Floating dropdown for collapsed mode */}
                    {isCollapsed && isHovered && item.subItems && (
                      <div className="absolute left-full top-0 ml-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-in slide-in-from-left-2">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="font-semibold text-gray-900">{item.label}</p>
                        </div>
                        <div className="py-1">
                          {item.subItems.map((subItem) => {
                            const isSubActive = subItem.path === location.pathname
                            return (
                              <NavLink
                                key={subItem.id}
                                to={subItem.path}
                                onClick={onClose}
                                className={({ isActive }) =>
                                  `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-all duration-200 ${
                                    isActive || isSubActive
                                      ? 'bg-blue-50 text-blue-600 font-semibold' 
                                      : 'text-gray-600 hover:bg-gray-100'
                                  }`
                                }
                              >
                                <span className={`w-2 h-2 rounded-full ${
                                  isSubActive ? 'bg-blue-600' : 'bg-gray-400'
                                }`}></span>
                                <span>{subItem.label}</span>
                              </NavLink>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-${isCollapsed ? '3' : '4'} py-3 rounded-lg transition-all duration-200 font-medium ${
                        isActive 
                          ? 'bg-blue-50 text-blue-600 border border-blue-100 font-semibold' 
                          : 'text-gray-700 hover:bg-gray-100'
                      } ${isCollapsed ? 'justify-center' : ''}`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </NavLink>
                )}
              </div>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

export default Sidebar