// src/components/Sidebar.jsx
import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { X, ChevronDown, GraduationCap, Menu } from 'lucide-react'
import { sidebarMenuItems } from '../config/sidebarConfig'

const Sidebar = ({ isOpen, onClose, onToggleCollapse, isCollapsed }) => {
  const location = useLocation()
  const [openDropdowns, setOpenDropdowns] = useState({})
  const [hoveredItem, setHoveredItem] = useState(null)
  const [hoverTimeout, setHoverTimeout] = useState(null)

  // Initialize open dropdowns based on current route
  useEffect(() => {
    const newOpenDropdowns = {}
    sidebarMenuItems.forEach((item) => {
      if (item.hasDropdown && item.subItems) {
        const isActive = item.subItems.some(
          (subItem) =>
            subItem.path === location.pathname ||
            location.pathname.startsWith(subItem.path)
        )
        if (isActive) newOpenDropdowns[item.id] = true
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
      const timeout = setTimeout(() => setHoveredItem(null), 200)
      setHoverTimeout(timeout)
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-100 z-50 transition-all duration-300 overflow-y-auto flex flex-col shadow-sm ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'w-[72px]' : 'w-64'} lg:translate-x-0`}
      >
        {/* ── Header ── */}
        <div
          className={`flex items-center gap-3 px-4 py-[18px] border-b border-gray-100 sticky top-0 bg-white z-10 ${
            isCollapsed ? 'flex-col py-4' : ''
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-200">
            <GraduationCap className="text-white w-5 h-5" />
          </div>

          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="font-bold text-gray-800 text-sm leading-tight whitespace-nowrap">
                SchoolPro
              </p>
              <p className="text-xs text-gray-400 whitespace-nowrap">Admin Panel</p>
            </div>
          )}

          {/* Desktop toggle */}
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Mobile close */}
          <button
            onClick={onClose}
            className="lg:hidden ml-auto w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {sidebarMenuItems.map((item) => {
            const Icon = item.icon
            const isDropdownOpen = openDropdowns[item.id] || false
            const isActive =
              item.path === location.pathname ||
              (item.subItems &&
                item.subItems.some(
                  (subItem) =>
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
                    {/* Dropdown trigger button */}
                    <button
                      onClick={() => toggleDropdown(item.id)}
                      title={isCollapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                        isCollapsed ? 'justify-center' : 'justify-between'
                      } ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                        {!isCollapsed && <span>{item.label}</span>}
                      </div>
                      {!isCollapsed && (
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            isDropdownOpen ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </button>

                    {/* Expanded inline dropdown */}
                    {!isCollapsed && isDropdownOpen && item.subItems && (
                      <div className="ml-4 mt-0.5 pl-4 border-l-2 border-blue-100 space-y-0.5 mb-1">
                        {item.subItems.map((subItem) => {
                          const isSubActive = subItem.path === location.pathname
                          return (
                            <NavLink
                              key={subItem.id}
                              to={subItem.path}
                              onClick={onClose}
                              className={({ isActive }) =>
                                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                  isActive || isSubActive
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'
                                }`
                              }
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                  isSubActive ? 'bg-blue-500' : 'bg-gray-300'
                                }`}
                              />
                              {subItem.label}
                            </NavLink>
                          )
                        })}
                      </div>
                    )}

                    {/* Collapsed hover flyout */}
                    {isCollapsed && isHovered && item.subItems && (
                      <div
                        className="absolute left-full top-0 ml-3 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50"
                        style={{ animation: 'flyoutIn 0.15s cubic-bezier(0.16,1,0.3,1) both' }}
                      >
                        <div className="px-4 py-2.5 border-b border-gray-50">
                          <p className="font-semibold text-gray-800 text-sm">{item.label}</p>
                        </div>
                        <div className="p-1.5 space-y-0.5">
                          {item.subItems.map((subItem) => {
                            const isSubActive = subItem.path === location.pathname
                            return (
                              <NavLink
                                key={subItem.id}
                                to={subItem.path}
                                onClick={onClose}
                                className={({ isActive }) =>
                                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                                    isActive || isSubActive
                                      ? 'bg-blue-50 text-blue-600 font-medium'
                                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                                  }`
                                }
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                    isSubActive ? 'bg-blue-500' : 'bg-gray-300'
                                  }`}
                                />
                                {subItem.label}
                              </NavLink>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* Simple nav link */
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    title={isCollapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                        isCollapsed ? 'justify-center' : ''
                      } ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                      }`
                    }
                  >
                    <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </NavLink>
                )}
              </div>
            )
          })}
        </nav>
      </aside>

      <style>{`
        @keyframes flyoutIn {
          from { opacity: 0; transform: translateX(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </>
  )
}

export default Sidebar