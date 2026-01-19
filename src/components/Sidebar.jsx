import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { X, ChevronDown, ChevronRight } from 'lucide-react'
import { sidebarMenuItems } from '../config/sidebarConfig'

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()
  const [openDropdowns, setOpenDropdowns] = useState({ students: true })

  const toggleDropdown = (itemId) => {
    setOpenDropdowns((prev) => ({ ...prev, [itemId]: !prev[itemId] }))
  }

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose}></div>}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transition-transform duration-300 lg:translate-x-0 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between py-5 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-900">School Admin</h2>
          <button onClick={onClose} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5  text-gray-900 border border-black" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {sidebarMenuItems.map((item) => {
            const Icon = item.icon
            const isDropdownOpen = openDropdowns[item.id] || false
            const isActive =
              item.path === location.pathname ||
              (item.subItems && item.subItems.some((sub) => sub.path === location.pathname))

            return (
              <div key={item.id}>
                {item.hasDropdown ? (
                  <button
                    onClick={() => toggleDropdown(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition font-medium ${
                      isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                    {isDropdownOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                ) : (
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                        isActive ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-800 hover:bg-gray-100 font-medium'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </NavLink>
                )}

                {item.hasDropdown && isDropdownOpen && item.subItems && (
                  <div className="ml-8 mt-1 mb-2 space-y-1">
                    {item.subItems.map((subItem) => (
                      <NavLink
                        key={subItem.id}
                        to={subItem.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition ${
                            isActive ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                          }`
                        }
                      >
                        <span className="w-1.5 h-1.5 bg-current rounded-full"></span>
                        <span>{subItem.label}</span>
                      </NavLink>
                    ))}
                  </div>
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
