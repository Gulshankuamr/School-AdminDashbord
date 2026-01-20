// src/pages/attendance/MarkAttendance.jsx
import React, { useState } from 'react'
import AttendanceFilters from '../../components/attendance/AttendanceFilters'
import AttendanceTable from '../../components/attendance/AttendanceTable'

const MarkAttendance = () => {
  // ✅ FIXED: Single state for filters
  const [selectedFilters, setSelectedFilters] = useState({
    date: '',
    class: '',
    section: ''
  })

  const [showList, setShowList] = useState(false)

  // ✅ Show List handler (called from AttendanceFilters)
  const handleShowList = (filters) => {
    if (!filters.date || !filters.class || !filters.section) {
      alert('Please select Date, Class and Section')
      return
    }

    setSelectedFilters(filters)
    setShowList(true)
  }

  // ✅ After successful save
  const handleUpdate = () => {
    alert('Attendance saved successfully!')
    setShowList(false)
    // ✅ Reset filters if needed
    setSelectedFilters({
      date: '',
      class: '',
      section: ''
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black">Mark Attendance</h1>
        <p className="text-black mt-2">
          Mark attendance for students by selecting date, class, and section
        </p>
      </div>

      {/* Filters */}
      <AttendanceFilters
        onShowList={handleShowList}
        initialFilters={selectedFilters}
      />

      {/* ✅ FIXED: Correct component import */}
      {showList && (
        <div className="mt-6">
          <AttendanceTable
            date={selectedFilters.date}
            classId={selectedFilters.class}
            sectionId={selectedFilters.section}
            onUpdate={handleUpdate}
          />
        </div>
      )}

      {/* Instructions */}
      {!showList && (
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-black mb-2">
            📋 Instructions:
          </h3>
          <ol className="list-decimal pl-5 space-y-2 text-black">
            <li>Select the attendance date</li>
            <li>Choose the class from dropdown</li>
            <li>Select the section</li>
            <li>Click "Show List" to load students</li>
            <li>Mark attendance for each student (P/A/L/H)</li>
            <li>Add remarks if needed</li>
            <li>Click "Save Attendance"</li>
          </ol>
        </div>
      )}
    </div>
  )
}

export default MarkAttendance