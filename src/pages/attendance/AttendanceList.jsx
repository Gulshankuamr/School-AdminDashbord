// src/pages/attendance/AttendanceList.jsx
import React, { useState, useEffect } from 'react'
import { Search, Calendar, Download, Users, CheckCircle, XCircle, Clock, Home, Edit, Save, Trash2, X, User, Hash, BookOpen, Layers } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { attendanceService } from '../../services/attendanceService'

const AttendanceList = () => {
  const [attendanceList, setAttendanceList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState(new Date())
  const [classFilter, setClassFilter] = useState('')
  const [sectionFilter, setSectionFilter] = useState('')
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [deleteLoading, setDeleteLoading] = useState(null)
  // const [classFilter, setClassFilter] = useState('')     // 👈 real logic
const [uiClassValue, setUiClassValue] = useState('')   // 👈 sirf UI

  const [notification, setNotification] = useState({ show: false, message: '', type: '' })

  // Status options
  const statusOptions = [
    { value: 'P', label: 'Present', icon: <CheckCircle className="w-4 h-4" />, color: 'bg-green-100 text-green-800 border-green-200' },
    { value: 'A', label: 'Absent', icon: <XCircle className="w-4 h-4" />, color: 'bg-red-100 text-red-800 border-red-200' },
    { value: 'L', label: 'Late', icon: <Clock className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { value: 'H', label: 'Holiday', icon: <Home className="w-4 h-4" />, color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: 'OL', label: 'On Leave', icon: <Users className="w-4 h-4" />, color: 'bg-purple-100 text-purple-800 border-purple-200' }
  ]

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' })
    }, 3000)
  }

  // Fetch classes on component mount
  useEffect(() => {
    fetchClasses()
  }, [])

  // Fetch sections when class changes
  useEffect(() => {
    if (classFilter) {
      fetchSections(classFilter)
    } else {
      setSections([])
      setSectionFilter('')
    }
  }, [classFilter])

  // Fetch attendance when filters change
  useEffect(() => {
    if (classFilter && sectionFilter && dateFilter) {
      fetchAttendanceList()
    }
  }, [dateFilter, classFilter, sectionFilter])

  // const fetchClasses = async () => {
  //   try {
  //     const response = await attendanceService.getAllClasses()
  //     if (response.success) {
  //       setClasses(response.data || [])
  //       // Auto-select first class if available
  //       if (response.data && response.data.length > 0) {
  //         setClassFilter(response.data[0].class_id)
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error fetching classes:', error)
  //     showNotification('Failed to load classes', 'error')
  //   }
  // }
  const fetchClasses = async () => {
  try {
    const response = await attendanceService.getAllClasses()
    if (response.success) {
      setClasses(response.data || [])

      if (response.data && response.data.length > 0) {
        setClassFilter(response.data[0].class_id) // ✅ logic same
        setUiClassValue('') // 👈 Select Class dikhane ke liye
      }
    }
  } catch (error) {
    console.error('Error fetching classes:', error)
  }
}


  const fetchSections = async (classId) => {
    try {
      const response = await attendanceService.getSectionsByClass(classId)
      if (response.success) {
        setSections(response.data || [])
        // Auto-select first section if available
        if (response.data && response.data.length > 0) {
          setSectionFilter(response.data[0].section_id)
        }
      }
    } catch (error) {
      console.error('Error fetching sections:', error)
      showNotification('Failed to load sections', 'error')
    }
  }

  const fetchAttendanceList = async () => {
    try {
      if (!classFilter || !sectionFilter || !dateFilter) {
        setAttendanceList([])
        setLoading(false)
        return
      }

      setLoading(true)
      setEditingId(null)
      
      const formattedDate = formatDate(dateFilter)
      
      const response = await attendanceService.getAttendanceByClassSection(
        classFilter,
        sectionFilter,
        formattedDate
      )
      
      if (response.success) {
        const students = response.data?.students || []
        // Transform API response to match our table structure
        const formattedList = students.map(student => ({
          id: student.student_id, // Using student_id as ID
          student_id: student.student_id,
          admission_no: student.admission_no,
          roll_no: student.roll_no,
          student_name: student.student_name,
          father_name: student.father_name,
          user_email: student.user_email,
          status: student.marked_at ? 'P' : 'A', // If marked_at exists, assume Present
          remarks: '', // Add remarks field
          date: response.data?.date,
          class_id: response.data?.class_id,
          section_id: response.data?.section_id,
          marked_at: student.marked_at,
          attendance_id: student.attendance_id // ✅ Now we have attendance_id from API
        }))
        
        setAttendanceList(formattedList)
      } else {
        setAttendanceList([])
      }
    } catch (error) {
      console.error('Error fetching attendance list:', error)
      showNotification('Failed to load attendance data', 'error')
      setAttendanceList([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    // Client-side search only
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    if (classes.length > 0) {
      setClassFilter(classes[0].class_id)
    } else {
      setClassFilter('')
    }
    setSectionFilter('')
    setDateFilter(new Date())
  }

  const handleEdit = (student) => {
    setEditingId(student.id)
    setEditForm({
      student_id: student.student_id,
      status: student.status || 'P',
      remarks: student.remarks || ''
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleSave = async (student) => {
    try {
      const formattedDate = formatDate(dateFilter)
      
      const updateData = {
        attendance_date: formattedDate,
        students: [
          {
            student_id: editForm.student_id,
            status: editForm.status,
            remarks: editForm.remarks
          }
        ]
      }

      const response = await attendanceService.updateAttendance(updateData)
      
      if (response.success) {
        // Update local state
        setAttendanceList(prevList =>
          prevList.map(item =>
            item.id === student.id
              ? {
                  ...item,
                  status: editForm.status,
                  remarks: editForm.remarks,
                  marked_at: new Date().toISOString()
                }
              : item
          )
        )
        
        setEditingId(null)
        setEditForm({})
        showNotification('Attendance updated successfully')
      }
    } catch (error) {
      console.error('Error updating attendance:', error)
      showNotification(error.message || 'Failed to update attendance', 'error')
    }
  }

  const handleDelete = async (student) => {
    if (!student.attendance_id) {
      showNotification('Cannot delete: attendance_id not available', 'error')
      return
    }

    if (!window.confirm(`Are you sure you want to delete attendance for ${student.student_name}? This action cannot be undone.`)) {
      return
    }

    try {
      setDeleteLoading(student.id)
      
      // ✅ Use the deleteStudentAttendance API (with attendance_id in body)
      const response = await attendanceService.deleteStudentAttendance(student.attendance_id)
      
      if (response.success) {
        // ✅ Remove from local state AND refetch from API
        // First remove from UI immediately
        setAttendanceList(prevList => prevList.filter(item => item.id !== student.id))
        
        // ✅ Then refetch fresh data from API to sync with database
        fetchAttendanceList()
        
        showNotification('Attendance deleted successfully from database')
      }
    } catch (error) {
      console.error('Error deleting attendance:', error)
      showNotification(error.message || 'Failed to delete attendance', 'error')
    } finally {
      setDeleteLoading(null)
    }
  }

  const getStatusBadge = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status) || statusOptions[0]
    
    return (
      <div className={`px-3 py-1.5 rounded-md border ${statusOption.color} flex items-center gap-2`}>
        {statusOption.icon}
        <span className="font-medium">{statusOption.label}</span>
      </div>
    )
  }

  const handleExport = () => {
    const exportData = {
      filters: {
        date: formatDate(dateFilter),
        class: classes.find(c => c.class_id == classFilter)?.class_name,
        section: sections.find(s => s.section_id == sectionFilter)?.section_name
      },
      data: attendanceList
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `attendance_${formatDate(dateFilter)}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showNotification('Data exported successfully')
  }

  // Filter attendance list based on search term
  const filteredAttendanceList = attendanceList.filter(student => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      student.student_name?.toLowerCase().includes(searchLower) ||
      student.admission_no?.toLowerCase().includes(searchLower) ||
      student.roll_no?.toString().includes(searchTerm)
    )
  })

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${notification.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-green-100 text-green-800 border border-green-200'}`}>
          <div className={`w-2 h-2 rounded-full ${notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}></div>
          <span className="font-medium">{notification.message}</span>
        </div>
      )}
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Attendance List</h1>
            <p className="text-gray-600 mt-2">Manage and track student attendance records</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Search & Filter</h2>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, admission no, or roll no..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800 placeholder-gray-500"
              />
            </div>
          </div>

          <button
            onClick={handleExport}
            className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 flex items-center gap-2 whitespace-nowrap shadow-md hover:shadow-lg transition-all duration-200"
            disabled={attendanceList.length === 0}
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Date Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Select Date
            </label>
            <DatePicker
              selected={dateFilter}
              onChange={(date) => setDateFilter(date)}
              dateFormat="dd/MM/yyyy"
              placeholderText="Choose date"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800"
            />
          </div>

          {/* Class Filter */}
          {/* <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Class
            </label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800"
            >
              <option value="" disabled className="text-gray-500">Select Class</option>
              {classes.map(cls => (
                <option key={cls.class_id} value={cls.class_id} className="text-gray-800">
                  {cls.class_name}
                </option>
              ))}
            </select>
          </div> */}

          <div>
  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
    <BookOpen className="w-4 h-4" />
    Class
  </label>

  <select
    value={uiClassValue}
    onChange={(e) => {
      setUiClassValue(e.target.value)   // 👈 UI update
      setClassFilter(e.target.value)    // 👈 real value
    }}
    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800"
  >
    <option value="" disabled className="text-gray-500">
      Select Class
    </option>

    {classes.map((cls) => (
      <option
        key={cls.class_id}
        value={cls.class_id}
        className="text-gray-800"
      >
        {cls.class_name}
      </option>
    ))}
  </select>
</div>


          {/* Section Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Section
            </label>
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              disabled={!classFilter}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50 text-gray-800"
            >
              <option value="" disabled className="text-gray-500">Select Section</option>
              {sections.map(section => (
                <option key={section.section_id} value={section.section_id} className="text-gray-800">
                  {section.section_name}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-end gap-2 col-span-2">
            <button
              onClick={fetchAttendanceList}
              className="w-full px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              disabled={!classFilter || !sectionFilter}
            >
              Load Attendance
            </button>
            <button
              onClick={handleClearFilters}
              className="w-full px-5 py-2.5 bg-white text-gray-700 rounded-lg hover:bg-gray-50 border border-gray-300 font-semibold transition-colors duration-200"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Total Students</p>
              <p className="text-3xl font-bold text-gray-800">{attendanceList.length}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Selected Date</p>
              <p className="text-xl font-bold text-gray-800">{formatDisplayDate(dateFilter)}</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Class</p>
              <p className="text-xl font-bold text-gray-800">
                {classes.find(c => c.class_id == classFilter)?.class_name || '--'}
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Section</p>
              <p className="text-xl font-bold text-gray-800">
                {sections.find(s => s.section_id == sectionFilter)?.section_name || '--'}
              </p>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg">
              <Layers className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Table Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Attendance Records</h2>
          <p className="text-sm text-gray-600 mt-1">
            Showing {filteredAttendanceList.length} of {attendanceList.length} students
          </p>
        </div>

        {/* Scrollable Table Area */}
        <div className="overflow-auto" style={{ maxHeight: '500px' }}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Student Details
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50">
                  Remarks
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50">
                  Marked Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
                      <p className="text-gray-700 font-medium">Loading attendance records...</p>
                      <p className="text-sm text-gray-500 mt-1">Please wait</p>
                    </div>
                  </td>
                </tr>
              ) : filteredAttendanceList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-gray-100 p-4 rounded-full mb-4">
                        <Users className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-700 font-medium text-lg mb-2">
                        {attendanceList.length === 0 
                          ? 'No attendance records found' 
                          : 'No matching students found'}
                      </p>
                      <p className="text-gray-500 max-w-md">
                        {attendanceList.length === 0 
                          ? 'Select Class, Section, and Date to load attendance records' 
                          : 'Try a different search term or adjust your filters'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAttendanceList.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors duration-150">
                    {/* Student Details */}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center shadow-sm">
                          <span className="text-blue-600 font-bold text-lg">
                            {record.student_name?.[0]?.toUpperCase() || 'S'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-800">
                            {record.student_name || 'Student'}
                          </div>
                          <div className="flex items-center gap-4 mt-1">
                            {/* Removed ID: */}
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-600">Roll: {record.roll_no || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-600">Admission: {record.admission_no || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status - Editable when editing */}
                    <td className="px-6 py-4">
                      {editingId === record.id ? (
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800 bg-white"
                        >
                          {statusOptions.map(option => (
                            <option key={option.value} value={option.value} className="text-gray-800">
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        getStatusBadge(record.status)
                      )}
                    </td>

                    {/* Remarks - Editable when editing */}
                    <td className="px-6 py-4">
                      {editingId === record.id ? (
                        <input
                          type="text"
                          value={editForm.remarks}
                          onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                          placeholder="Enter remarks..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800 bg-white"
                        />
                      ) : (
                        <div className={`text-sm font-medium ${record.remarks ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                          {record.remarks || 'No remarks'}
                        </div>
                      )}
                    </td>

                    {/* Marked Time */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.marked_at ? (
                        <div className="flex flex-col">
                          <div className="text-sm font-semibold text-gray-800">
                            {new Date(record.marked_at).toLocaleDateString('en-GB')}
                          </div>
                          <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded mt-1 inline-block">
                            {new Date(record.marked_at).toLocaleTimeString('en-GB', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Not marked</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {editingId === record.id ? (
                          <>
                            <button
                              onClick={() => handleSave(record)}
                              className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 flex items-center gap-1.5 text-sm font-semibold shadow-sm hover:shadow transition-all duration-200"
                            >
                              <Save className="w-3.5 h-3.5" />
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300 flex items-center gap-1.5 text-sm font-semibold transition-colors duration-200"
                            >
                              <X className="w-3.5 h-3.5" />
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(record)}
                              className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 flex items-center gap-1.5 text-sm font-semibold shadow-sm hover:shadow transition-all duration-200"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(record)}
                              disabled={deleteLoading === record.id}
                              className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 flex items-center gap-1.5 text-sm font-semibold shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50"
                            >
                              {deleteLoading === record.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                                  <span>Deleting...</span>
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete
                                </>
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {filteredAttendanceList.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-sm text-gray-700">
                <span className="font-semibold">{filteredAttendanceList.length} students</span> displayed • 
                Date: <span className="font-semibold">{formatDisplayDate(dateFilter)}</span>
              </div>
              <div className="text-sm text-gray-700">
                Class: <span className="font-semibold">{classes.find(c => c.class_id == classFilter)?.class_name || '--'}</span> • 
                Section: <span className="font-semibold">{sections.find(s => s.section_id == sectionFilter)?.section_name || '--'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Info */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  )
}

export default AttendanceList