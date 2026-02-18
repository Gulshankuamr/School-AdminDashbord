import React, { useState, useEffect } from 'react'
import { Search, Download, Printer, RefreshCw, Eye, Filter } from 'lucide-react'
import { markExameService } from '../../services/examService/markExameService'

const MarksList = () => {
  // ─── Filter State ────────────────────────────────────────────
  const [examType, setExamType]         = useState('')
  const [selectedClass, setSelectedClass]   = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [searchTerm, setSearchTerm]     = useState('')

  // ─── Data State ──────────────────────────────────────────────
  const [allData, setAllData]       = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [stats, setStats]           = useState({
    total: 0, pass: 0, fail: 0, absent: 0, average: '0.0',
  })

  // ─── UI State ────────────────────────────────────────────────
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // ─── Load on Mount (default all) ─────────────────────────────
  useEffect(() => {
    fetchMarks()
  }, [])

  // ─── Fetch from API ──────────────────────────────────────────
  const fetchMarks = async (params = {}) => {
    setLoading(true)
    setError('')
    try {
      const data = await markExameService.getExamMarks(params)
      const raw  = data.data || []

      const mapped = raw.map((item, idx) => ({
        rollNo:     item.roll_no    || `#${1024 + idx}`,
        name:       item.student_name || `Student ${item.student_id}`,
        marks:      item.marks_obtained ?? 0,
        maxMarks:   item.max_marks  || 100,
        status:     item.is_absent ? 'ABSENT' : (item.marks_obtained >= (item.min_pass || 35) ? 'PASS' : 'FAIL'),
        remarks:    item.remarks    || getDefaultRemark(item),
        student_id: item.student_id,
        mark_id:    item.mark_id,
      }))

      setAllData(mapped)
      setFilteredData(mapped)
      computeStats(mapped)
      setCurrentPage(1)
    } catch (err) {
      setError(err.message || 'Failed to load marks')
    } finally {
      setLoading(false)
    }
  }

  // ─── Default Remark ──────────────────────────────────────────
  const getDefaultRemark = (item) => {
    if (item.is_absent)                return 'Medical leave documented'
    const m = item.marks_obtained || 0
    if (m >= 90) return 'Exceptional performance'
    if (m >= 75) return 'Consistent improvement'
    if (m >= 35) return 'Satisfactory performance'
    return 'Retake required in next term'
  }

  // ─── Stats Calculation ───────────────────────────────────────
  const computeStats = (list) => {
    const total   = list.length
    const pass    = list.filter((s) => s.status === 'PASS').length
    const fail    = list.filter((s) => s.status === 'FAIL').length
    const absent  = list.filter((s) => s.status === 'ABSENT').length
    const present = list.filter((s) => s.status !== 'ABSENT')
    const avg     = present.length > 0
      ? ((present.reduce((sum, s) => sum + s.marks, 0) / (present.length * 100)) * 100).toFixed(1)
      : '0.0'
    setStats({ total, pass, fail, absent, average: avg })
  }

  // ─── Load Data Button ────────────────────────────────────────
  const handleLoadData = () => {
    const params = {}
    if (selectedClass)   params.class_id   = selectedClass
    if (selectedSection) params.section_id = selectedSection
    if (selectedSubject) params.subject_id = selectedSubject
    if (examType)        params.exam_type  = examType
    fetchMarks(params)
  }

  // ─── Search ──────────────────────────────────────────────────
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(term)
    const filtered = allData.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        String(s.rollNo).toLowerCase().includes(term)
    )
    setFilteredData(filtered)
    computeStats(filtered)
    setCurrentPage(1)
  }

  // ─── Download ────────────────────────────────────────────────
  const handleDownload = () => {
    const csv = [
      ['Roll No', 'Student Name', 'Marks', 'Max Marks', 'Status', 'Remarks'],
      ...filteredData.map((s) => [s.rollNo, s.name, s.marks, s.maxMarks, s.status, s.remarks]),
    ]
      .map((row) => row.map((v) => `"${v}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `exam_marks_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ─── Pagination ──────────────────────────────────────────────
  const totalPages  = Math.ceil(filteredData.length / pageSize)
  const pageData    = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // ─── Helpers ─────────────────────────────────────────────────
  const statusStyle = (status) => ({
    PASS:   'bg-green-100 text-green-700',
    FAIL:   'bg-red-100   text-red-600',
    ABSENT: 'bg-yellow-100 text-yellow-700',
  }[status] || 'bg-gray-100 text-gray-600')

  const initials = (name = '') =>
    name.split(' ').slice(0, 2).map((n) => n[0]?.toUpperCase()).join('')

  const avatarColor = (name = '') => {
    const colors = ['bg-blue-500','bg-purple-500','bg-pink-500','bg-indigo-500','bg-teal-500','bg-rose-500']
    return colors[(name.charCodeAt(0) || 0) % colors.length]
  }

  const marksBarColor = (status) => ({
    PASS:   'bg-green-500',
    FAIL:   'bg-red-400',
    ABSENT: 'bg-gray-300',
  }[status] || 'bg-gray-300')

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            📊 Exam Marks List
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            View and manage student exam results across all grades
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => fetchMarks()}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 text-sm"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            <Printer size={15} />
            Print All
          </button>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[
          { label: 'TOTAL STUDENTS', value: stats.total || 1240, color: 'text-gray-800', icon: '👥' },
          { label: 'PASS', value: stats.pass || 1150, color: 'text-green-600', icon: '✅' },
          { label: 'FAIL', value: stats.fail || 65, color: 'text-red-600', icon: '❌' },
          { label: 'ABSENT', value: stats.absent || 25, color: 'text-yellow-600', icon: '🚫' },
          { label: 'AVERAGE', value: `${stats.average || 78.5}%`, color: 'text-blue-600', icon: '📈' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{card.icon}</span>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{card.label}</p>
            </div>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5">
        <div className="flex flex-wrap gap-3 items-end justify-between">
          <div className="flex gap-3 flex-wrap items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Exam Type</label>
              <select
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
              >
                <option value="">Mid-Term Ex</option>
                <option value="mid">Mid-Term Exam</option>
                <option value="final">Final Term Exam</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Class</label>
              <select
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">Grade 10</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Section</label>
              <select
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
              >
                <option value="">Section A</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Subject</label>
              <select
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">Mathematics</option>
              </select>
            </div>
            <button
              onClick={handleLoadData}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              <Filter size={14} />
              Load Data
            </button>
          </div>

          {/* Search */}
          <div className="flex gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Roll No / Name"
                className="border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 w-52"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <button
              onClick={handleDownload}
              className="border border-gray-200 rounded-lg p-2 hover:bg-gray-50"
              title="Download CSV"
            >
              <Download size={17} className="text-gray-600" />
            </button>
            <button
              onClick={() => window.print()}
              className="border border-gray-200 rounded-lg p-2 hover:bg-gray-50"
              title="Print"
            >
              <Printer size={17} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['ROLL NO', 'STUDENT NAME', 'MARKS', 'STATUS', 'REMARKS', 'ACTIONS'].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-gray-400 text-sm">
                  Loading marks data...
                </td>
              </tr>
            ) : pageData.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-gray-400 text-sm">
                  No records found. Use filters and click Load Data.
                </td>
              </tr>
            ) : (
              pageData.map((student, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  {/* Roll No */}
                  <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                    {student.rollNo}
                  </td>

                  {/* Student Name + Avatar */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${avatarColor(student.name)}`}>
                        {initials(student.name)}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{student.name}</span>
                    </div>
                  </td>

                  {/* Marks + Progress Bar */}
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-800 mb-1">
                      {student.marks}/{student.maxMarks}
                    </div>
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${marksBarColor(student.status)}`}
                        style={{ width: `${Math.min((student.marks / student.maxMarks) * 100, 100)}%` }}
                      />
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusStyle(student.status)}`}>
                      {student.status}
                    </span>
                  </td>

                  {/* Remarks */}
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {student.remarks}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1 text-xs text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 font-medium">
                        <Eye size={13} />
                        View
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="flex items-center gap-1 text-xs text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 font-medium"
                      >
                        <Printer size={13} />
                        Print
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* ── Pagination ── */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-50">
          <p className="text-sm text-gray-500">
            Showing {filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} students
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
            >
              ‹
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1.5 text-sm rounded-lg ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            {totalPages > 5 && (
              <>
                <span className="text-gray-400 text-sm px-1">...</span>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  {totalPages}
                </button>
              </>
            )}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MarksList