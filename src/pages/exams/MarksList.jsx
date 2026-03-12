import React, { useState, useEffect } from 'react'
import { Search, Download, Printer, RefreshCw, Eye, Filter, X, Award, User, BookOpen, Calendar, Clock, TrendingUp } from 'lucide-react'
import { markExameService } from '../../services/examService/markExameService'

// ─────────────────────────────────────────────────────────────────────────────
// MARKSHEET MODAL — prints only this section
// ─────────────────────────────────────────────────────────────────────────────
const MarksheetModal = ({ student, onClose }) => {
  if (!student) return null

  const handlePrint = () => {
    const printContent = document.getElementById('marksheet-print-area').innerHTML
    const win = window.open('', '_blank', 'width=800,height=900')
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Marksheet — ${student.name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #111; }
            .sheet { max-width: 720px; margin: 0 auto; padding: 40px 48px; }
            .school-logo { text-align: center; margin-bottom: 4px; }
            .school-logo svg { width: 52px; height: 52px; color: #1d4ed8; }
            .school-name { text-align: center; font-size: 22px; font-weight: 800; letter-spacing: 1px; color: #111; margin: 6px 0 2px; }
            .school-addr { text-align: center; font-size: 11px; color: #666; margin-bottom: 18px; }
            .exam-badge { text-align: center; border: 1.5px solid #1d4ed8; border-radius: 4px; display: inline-block; padding: 5px 28px; font-size: 13px; font-weight: 700; color: #1d4ed8; letter-spacing: 1px; width: 100%; }
            .exam-sub { text-align: center; font-size: 10px; letter-spacing: 3px; color: #888; margin-top: 4px; margin-bottom: 20px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 20px; }
            .info-cell { padding: 10px 16px; border-bottom: 1px solid #f3f4f6; }
            .info-cell:nth-child(odd) { border-right: 1px solid #e5e7eb; }
            .info-label { font-size: 9px; font-weight: 700; color: #9ca3af; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 2px; }
            .info-value { font-size: 13px; font-weight: 600; color: #111; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            thead { background: #f8fafc; }
            th { padding: 10px 14px; font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.8px; text-align: left; border-bottom: 2px solid #e5e7eb; }
            td { padding: 11px 14px; font-size: 12.5px; color: #111; border-bottom: 1px solid #f3f4f6; }
            .pass { color: #16a34a; font-weight: 700; }
            .fail { color: #dc2626; font-weight: 700; }
            .absent { color: #d97706; font-weight: 700; }
            .total-row td { font-weight: 800; font-size: 13px; border-top: 2px solid #e5e7eb; background: #f8fafc; }
            .summary-bar { background: #111; border-radius: 10px; padding: 18px 28px; display: flex; justify-content: space-between; align-items: center; color: #fff; margin-bottom: 28px; }
            .sum-item { text-align: center; }
            .sum-label { font-size: 9px; letter-spacing: 1.5px; color: #9ca3af; text-transform: uppercase; margin-bottom: 4px; }
            .sum-value { font-size: 18px; font-weight: 800; }
            .sum-sub { font-size: 10px; color: #4ade80; margin-top: 2px; }
            .promoted { color: #4ade80; }
            .sig-row { display: flex; justify-content: space-between; padding-top: 32px; }
            .sig-box { text-align: center; }
            .sig-line { width: 160px; border-top: 1px solid #aaa; margin: 0 auto 4px; }
            .sig-label { font-size: 10px; color: #777; }
            .footer { display: flex; justify-content: space-between; font-size: 9px; color: #bbb; margin-top: 20px; padding-top: 12px; border-top: 1px solid #f3f4f6; }
            .bar-bg { background: #e5e7eb; border-radius: 4px; height: 5px; width: 80px; overflow: hidden; margin-top: 4px; }
            .bar-fill-pass { background: #16a34a; height: 100%; border-radius: 4px; }
            .bar-fill-fail { background: #dc2626; height: 100%; border-radius: 4px; }
            .bar-fill-absent { background: #d97706; height: 100%; border-radius: 4px; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `)
    win.document.close()
    setTimeout(() => { win.print(); win.close() }, 400)
  }

  const pct = student.maxMarks > 0
    ? ((student.marks / student.maxMarks) * 100).toFixed(1)
    : '0.0'

  const grade =
    pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : pct >= 35 ? 'D' : 'F'

  const resultVerdict = student.status === 'ABSENT' ? 'ABSENT' : student.status === 'PASS' ? 'PROMOTED' : 'FAILED'
  const verdictColor  = student.status === 'PASS' ? 'text-green-400' : student.status === 'FAIL' ? 'text-red-400' : 'text-yellow-400'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">Student Marksheet</h2>
              <p className="text-xs text-gray-400">Academic Progress Report</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              <Printer size={14} /> Print
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div id="marksheet-print-area">
          <div className="sheet" style={{ padding: '40px 48px', maxWidth: '720px', margin: '0 auto' }}>

            {/* School Header */}
            <div className="text-center mb-5">
              <div className="flex justify-center mb-2">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                  <Award size={28} className="text-blue-600" />
                </div>
              </div>
              <h1 className="text-xl font-black text-gray-900 tracking-wide uppercase">Excel International School</h1>
              <p className="text-xs text-gray-400 mt-1">123 Education Lane, Academic District, City Center - 400012</p>
              <p className="text-xs text-gray-400">Contact: +1 234 567 890 | Website: www.excel-international.edu</p>
            </div>

            {/* Exam Badge */}
            <div className="text-center mb-6">
              <div className="inline-block border-2 border-blue-600 rounded px-8 py-2">
                <span className="text-sm font-bold text-blue-600 tracking-widest uppercase">
                  {student.examName || 'Half Yearly Examination 2024-25'}
                </span>
              </div>
              <p className="text-xs text-gray-400 tracking-widest mt-1 uppercase">Academic Progress Report</p>
            </div>

            {/* Student Info Grid */}
            <div className="grid grid-cols-2 gap-0 border border-gray-200 rounded-xl overflow-hidden mb-6">
              {[
                { label: 'Student Name',     value: student.name },
                { label: 'Roll Number',      value: student.rollNo },
                { label: 'Class & Section',  value: student.classSection || '—' },
                { label: 'Date of Examination', value: student.examDate || '—' },
                { label: 'Parent/Guardian', value: student.guardian || '—' },
                { label: 'Attendance Status', value: student.attendance || '—' },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`px-4 py-3 ${i % 2 === 0 ? 'border-r border-gray-100' : ''} ${i < 4 ? 'border-b border-gray-100' : ''}`}
                >
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-800">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Marks Table */}
            <table className="w-full mb-6">
              <thead>
                <tr className="bg-gray-50">
                  {['Subject Name', 'Max Marks', 'Min Pass', 'Marks Obtained', 'Result'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide border-b-2 border-gray-200">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Single subject row for this mark */}
                <tr className="border-b border-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-800 font-medium">{student.subjectName || 'Subject'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{student.maxMarks}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{student.minPass || 33}</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">{student.status === 'ABSENT' ? '—' : student.marks}</td>
                  <td className={`px-4 py-3 text-sm font-bold ${
                    student.status === 'PASS' ? 'text-green-600' :
                    student.status === 'FAIL' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {student.status === 'PASS' ? 'Pass' : student.status === 'FAIL' ? 'Fail' : 'Absent'}
                  </td>
                </tr>
                {/* Total Row */}
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">Overall Total</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">{student.maxMarks}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">—</td>
                  <td className="px-4 py-3 text-sm font-black text-blue-600">{student.status === 'ABSENT' ? '—' : student.marks}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">—</td>
                </tr>
              </tbody>
            </table>

            {/* Summary Bar */}
            <div className="bg-gray-900 rounded-xl px-6 py-5 flex items-center justify-between mb-8">
              <div className="text-center">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Aggregate Score</p>
                <p className="text-2xl font-black text-white">{pct}%</p>
                <p className="text-xs text-green-400 font-semibold mt-0.5">{grade} Grade</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Final Result</p>
                <p className={`text-xl font-black ${verdictColor} flex items-center gap-2`}>
                  {student.status === 'PASS' && <span>✅</span>}
                  {resultVerdict}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Rank in Class</p>
                <p className="text-2xl font-black text-white">{student.rank || '—'}</p>
                {student.rank && <p className="text-xs text-gray-400 mt-0.5">ND Position</p>}
              </div>
            </div>

            {/* Signature Row */}
            <div className="flex justify-between pt-4">
              <div className="text-center">
                <div className="w-40 border-t border-gray-300 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Class Teacher's Signature</p>
              </div>
              <div className="text-center">
                <div className="w-40 border-t border-gray-300 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Principal's Signature</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between mt-5 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">Date of Issue: {new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}</p>
              <p className="text-xs text-gray-400">🔒 System-Generated Report · SchoolPro ERP</p>
              <p className="text-xs text-gray-400">Page 01 of 01</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MARKS LIST PAGE
// ─────────────────────────────────────────────────────────────────────────────
const MarksList = () => {

  // ─── Dropdown Data ────────────────────────────────────────────
  const [examList,    setExamList]    = useState([])
  const [classList,   setClassList]   = useState([])
  const [sectionList, setSectionList] = useState([])
  const [subjectList, setSubjectList] = useState([])

  // ─── Filter State ─────────────────────────────────────────────
  const [selectedExam,    setSelectedExam]    = useState('')
  const [selectedClass,   setSelectedClass]   = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [searchTerm,      setSearchTerm]      = useState('')

  // ─── Data State ───────────────────────────────────────────────
  const [allData,      setAllData]      = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [stats, setStats] = useState({ total: 0, pass: 0, fail: 0, absent: 0, average: '0.0' })

  // ─── UI State ─────────────────────────────────────────────────
  const [loadingInit,     setLoadingInit]     = useState(false)
  const [loadingSections, setLoadingSections] = useState(false)
  const [loading,         setLoading]         = useState(false)
  const [error,           setError]           = useState('')
  const [currentPage,     setCurrentPage]     = useState(1)
  const [viewStudent,     setViewStudent]     = useState(null)
  const pageSize = 10

  // ═══════════════════════════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const init = async () => {
      setLoadingInit(true)
      try {
        const [examRes, classRes, subjectRes] = await Promise.all([
          markExameService.getExams(),
          markExameService.getAllClassList(),
          markExameService.getAllSubjects(),
        ])
        setExamList(examRes.data      || [])
        setClassList(classRes.data    || [])
        setSubjectList(subjectRes.data || [])
      } catch (err) {
        console.error('Init error:', err)
      } finally {
        setLoadingInit(false)
      }
    }
    init()
    fetchMarks()
  }, [])

  // CLASS → sections
  useEffect(() => {
    setSelectedSection('')
    setSectionList([])
    if (!selectedClass) return
    const fetch_ = async () => {
      setLoadingSections(true)
      try {
        const res = await markExameService.getAllSections(selectedClass)
        setSectionList(res.data || [])
      } catch (_) { setSectionList([]) }
      finally { setLoadingSections(false) }
    }
    fetch_()
  }, [selectedClass])

  // ═══════════════════════════════════════════════════════════════
  // FETCH MARKS
  // ═══════════════════════════════════════════════════════════════
  const fetchMarks = async (params = {}) => {
    setLoading(true)
    setError('')
    try {
      const data   = await markExameService.getExamMarks(params)
      const raw    = data.data || []
      const mapped = raw.map((item, idx) => ({
        rollNo:       item.roll_no         || `#${1024 + idx}`,
        name:         item.student_name    || item.name || `Student ${item.student_id}`,
        marks:        item.marks_obtained  ?? 0,
        maxMarks:     item.max_marks       || 100,
        minPass:      item.min_passing_marks || item.min_pass || 33,
        status:       item.is_absent
          ? 'ABSENT'
          : ((item.marks_obtained ?? 0) >= (item.min_passing_marks || item.min_pass || 33)
              ? 'PASS' : 'FAIL'),
        remarks:      item.remarks         || getDefaultRemark(item),
        examName:     item.exam_name       || '',
        subjectName:  item.subject_name    || '',
        classSection: item.class_section   || '',
        examDate:     item.exam_date
          ? new Date(item.exam_date).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })
          : '',
        guardian:     item.father_name     || item.guardian_name || '',
        attendance:   item.attendance      || '',
        rank:         item.rank            || null,
        student_id:   item.student_id,
        mark_id:      item.mark_id,
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

  const getDefaultRemark = (item) => {
    if (item.is_absent) return 'Medical leave documented'
    const m = item.marks_obtained || 0
    if (m >= 90) return 'Exceptional performance'
    if (m >= 75) return 'Consistent improvement'
    if (m >= 35) return 'Satisfactory performance'
    return 'Retake required in next term'
  }

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

  const handleLoadData = () => {
    const params = {}
    if (selectedExam)    params.exam_id    = selectedExam
    if (selectedClass)   params.class_id   = selectedClass
    if (selectedSection) params.section_id = selectedSection
    if (selectedSubject) params.subject_id = selectedSubject
    fetchMarks(params)
  }

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(term)
    const filtered = allData.filter(
      (s) => s.name.toLowerCase().includes(term) || String(s.rollNo).toLowerCase().includes(term)
    )
    setFilteredData(filtered)
    computeStats(filtered)
    setCurrentPage(1)
  }

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
    a.href = url
    a.download = `exam_marks_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize)
  const pageData   = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // Style helpers
  const statusStyle = (s) => ({
    PASS:   'bg-green-100 text-green-700',
    FAIL:   'bg-red-100   text-red-600',
    ABSENT: 'bg-yellow-100 text-yellow-700',
  }[s] || 'bg-gray-100 text-gray-600')

  const initials    = (name = '') => name.split(' ').slice(0, 2).map((n) => n[0]?.toUpperCase()).join('')
  const avatarColor = (name = '') => {
    const c = ['bg-blue-500','bg-purple-500','bg-pink-500','bg-indigo-500','bg-teal-500','bg-rose-500']
    return c[(name.charCodeAt(0) || 0) % c.length]
  }
  const marksBarColor = (s) => ({ PASS: 'bg-green-500', FAIL: 'bg-red-400', ABSENT: 'bg-gray-300' }[s] || 'bg-gray-300')

  // ── Shared select class ──────────────────────────────────────
  const selectCls = 'border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed'

  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* View Marksheet Modal */}
      {viewStudent && (
        <MarksheetModal student={viewStudent} onClose={() => setViewStudent(null)} />
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            📊 Exam Marks List
          </h1>
          <p className="text-gray-500 text-sm mt-1">View and manage student exam results across all grades</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => fetchMarks()}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 text-sm font-medium"
          >
            <RefreshCw size={15} /> Refresh
          </button>
        
        </div>
      </div>

      {/* ── Stats Cards ── */}
      {/* <div className="grid grid-cols-5 gap-4 mb-6">
        {[
          { label: 'TOTAL STUDENTS', value: stats.total,   color: 'text-gray-800',   icon: '👥' },
          { label: 'PASS',           value: stats.pass,    color: 'text-green-600',  icon: '✅' },
          { label: 'FAIL',           value: stats.fail,    color: 'text-red-600',    icon: '❌' },
          { label: 'ABSENT',         value: stats.absent,  color: 'text-yellow-600', icon: '🚫' },
          { label: 'AVERAGE',        value: `${stats.average}%`, color: 'text-blue-600', icon: '📈' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{card.icon}</span>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{card.label}</p>
            </div>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div> */}

      {/* ── Filters ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5">
        {loadingInit ? (
          <p className="text-sm text-gray-400 animate-pulse">Loading filters...</p>
        ) : (
          <div className="flex flex-wrap gap-3 items-end justify-between">
            <div className="flex gap-3 flex-wrap items-end">

              {/* EXAM */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600 uppercase">Exam</label>
                <select
                  className={`${selectCls} min-w-[170px]`}
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                >
                  <option value="">-- All Exams --</option>
                  {examList.map((exam) => (
                    <option key={exam.exam_id} value={exam.exam_id}>
                      {exam.exam_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* CLASS */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600 uppercase">Class</label>
                <select
                  className={`${selectCls} min-w-[120px]`}
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="">-- All Classes --</option>
                  {classList.map((cls) => (
                    <option key={cls.class_id} value={cls.class_id}>
                      {cls.class_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* SECTION */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600 uppercase">Section</label>
                <select
                  className={`${selectCls} min-w-[120px]`}
                  value={selectedSection}
                  disabled={!selectedClass || loadingSections}
                  onChange={(e) => setSelectedSection(e.target.value)}
                >
                  <option value="">
                    {loadingSections ? 'Loading...' : '-- All Sections --'}
                  </option>
                  {sectionList.map((sec) => (
                    <option key={sec.section_id} value={sec.section_id}>
                      {sec.section_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* SUBJECT */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600 uppercase">Subject</label>
                <select
                  className={`${selectCls} min-w-[130px]`}
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <option value="">-- All Subjects --</option>
                  {subjectList.map((sub) => (
                    <option key={sub.subject_id} value={sub.subject_id}>
                      {sub.subject_name}
                    </option>
                  ))}
                </select>
              </div>

     {/* Search + icons */}
            <div className="flex gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Roll No / Name"
                  className="border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 w-52"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
           
            </div>




              <button
                onClick={handleLoadData}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold disabled:opacity-50"
              >
                <Filter size={14} />
                {loading ? 'Loading...' : 'Load Data'}
              </button>
            </div>

          
          </div>
        )}
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
                <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-gray-400 text-sm">Loading marks data...</td>
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
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">{student.rollNo}</td>

                  {/* Name + Avatar */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${avatarColor(student.name)}`}>
                        {initials(student.name)}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{student.name}</span>
                    </div>
                  </td>

                  {/* Marks + Bar */}
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

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusStyle(student.status)}`}>
                      {student.status}
                    </span>
                  </td>

                  {/* Remarks */}
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{student.remarks}</td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewStudent(student)}
                        className="flex items-center gap-1 text-xs text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 font-medium"
                      >
                        <Eye size={13} /> View
                      </button>
                      <button
                        onClick={() => setViewStudent(student)}
                        className="flex items-center gap-1 text-xs text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 font-medium"
                      >
                        <Printer size={13} /> Print
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-50">
          <p className="text-sm text-gray-500">
            Showing {filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} students
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 text-gray-700"
            >
              ‹
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
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
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  {totalPages}
                </button>
              </>
            )}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 text-gray-700"
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