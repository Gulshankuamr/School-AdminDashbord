import React, { useState, useEffect } from 'react'
import { Save, FileText, BarChart2, Search } from 'lucide-react'
import { markExameService } from '../../services/examService/markExameService'

const AssignMarks = () => {

  // ─── Dropdown Data (from API) ─────────────────────────────────
  const [timetableList, setTimetableList] = useState([])   // getExamTimetable
  const [classList, setClassList]         = useState([])   // getAllClassList
  const [sectionList, setSectionList]     = useState([])   // getAllSections (by class)
  const [subjectList, setSubjectList]     = useState([])   // getAllSubjects

  // ─── Filter Selections ────────────────────────────────────────
  const [selectedExam, setSelectedExam]       = useState('')  // timetable_id
  const [selectedClass, setSelectedClass]     = useState('')  // class_id
  const [selectedSection, setSelectedSection] = useState('')  // section_id
  const [selectedSubject, setSelectedSubject] = useState('')  // subject_id

  // ─── Auto-filled from timetable match ────────────────────────
  const [matchedTimetable, setMatchedTimetable] = useState(null)
  const [examData, setExamData] = useState({
    maxMarks:    100,
    minPass:     33,
    date:        '',
    startTime:   '',
    endTime:     '',
    subjectName: '',
    roomNo:      '',
  })

  // ─── Students & Stats ─────────────────────────────────────────
  const [students, setStudents] = useState([])
  const [stats, setStats]       = useState({ total: 0, present: 0, absent: 0, average: '0.0' })

  // ─── UI State ─────────────────────────────────────────────────
  const [loadingInit, setLoadingInit]         = useState(false)
  const [loadingSections, setLoadingSections] = useState(false)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [saving, setSaving]                   = useState(false)
  const [message, setMessage]                 = useState({ type: '', text: '' })

  // ─────────────────────────────────────────────────────────────
  // 1. On Mount: fetch timetable + classes + subjects in parallel
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setLoadingInit(true)
      try {
        const [timetableRes, classRes, subjectRes] = await Promise.all([
          markExameService.getExamTimetable(),
          markExameService.getAllClassList(),
          markExameService.getAllSubjects(),
        ])
        setTimetableList(timetableRes.data || [])
        setClassList(classRes.data     || [])
        setSubjectList(subjectRes.data || [])
      } catch (err) {
        console.error('Init fetch error:', err)
        setMessage({ type: 'error', text: 'Failed to load initial data. Please refresh.' })
      } finally {
        setLoadingInit(false)
      }
    }
    init()
  }, [])

  // ─────────────────────────────────────────────────────────────
  // 2. When Class changes → fetch sections, reset section/students
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedClass) {
      setSectionList([])
      setSelectedSection('')
      setStudents([])
      setMatchedTimetable(null)
      return
    }
    const fetchSections = async () => {
      setLoadingSections(true)
      setSelectedSection('')
      setStudents([])
      try {
        const res = await markExameService.getAllSections(selectedClass)
        setSectionList(res.data || [])
      } catch (err) {
        console.error('Sections fetch error:', err)
        setSectionList([])
      } finally {
        setLoadingSections(false)
      }
    }
    fetchSections()
  }, [selectedClass])

  // ─────────────────────────────────────────────────────────────
  // 3. When class + section + subject + exam all selected
  //    → auto-match timetable & fill exam details
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedClass || !selectedSection || !selectedSubject || !selectedExam) {
      setMatchedTimetable(null)
      return
    }
    // Find timetable that matches all 4 filters
    const match = timetableList.find(
      (t) =>
        String(t.timetable_id) === String(selectedExam)    &&
        String(t.class_id)     === String(selectedClass)   &&
        String(t.section_id)   === String(selectedSection) &&
        String(t.subject_id)   === String(selectedSubject)
    )

    if (match) {
      setMatchedTimetable(match)
      const rawDate = match.exam_date
        ? new Date(match.exam_date).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
          })
        : ''
      setExamData({
        maxMarks:    parseFloat(match.max_marks)          || 100,
        minPass:     parseFloat(match.min_passing_marks)  || 33,
        date:        rawDate,
        startTime:   match.start_time   || '',
        endTime:     match.end_time     || '',
        subjectName: match.subject_name || '',
        roomNo:      match.room_no      || '',
      })
    } else {
      // selectedExam is timetable_id — use it directly
      const byId = timetableList.find(
        (t) => String(t.timetable_id) === String(selectedExam)
      )
      if (byId) {
        setMatchedTimetable(byId)
        const rawDate = byId.exam_date
          ? new Date(byId.exam_date).toLocaleDateString('en-GB', {
              day: '2-digit', month: 'short', year: 'numeric',
            })
          : ''
        setExamData({
          maxMarks:    parseFloat(byId.max_marks)         || 100,
          minPass:     parseFloat(byId.min_passing_marks) || 33,
          date:        rawDate,
          startTime:   byId.start_time   || '',
          endTime:     byId.end_time     || '',
          subjectName: byId.subject_name || '',
          roomNo:      byId.room_no      || '',
        })
      }
    }
  }, [selectedExam, selectedClass, selectedSection, selectedSubject, timetableList])

  // ─────────────────────────────────────────────────────────────
  // 4. Load Students → by class_id + section_id
  // ─────────────────────────────────────────────────────────────
  const handleLoadStudents = async () => {
    if (!selectedClass) {
      setMessage({ type: 'error', text: 'Please select a class first.' })
      return
    }
    if (!selectedExam) {
      setMessage({ type: 'error', text: 'Please select an exam timetable first.' })
      return
    }
    setLoadingStudents(true)
    setMessage({ type: '', text: '' })
    try {
      const res = await markExameService.getStudentsByClass(
        selectedClass,
        selectedSection || undefined
      )
      const raw = res.data || []

      const mapped = raw.map((item) => ({
        id:         item.student_id,
        student_id: item.student_id,
        rollNo:     item.roll_no      || item.student_id,
        name:       item.student_name || item.name || `Student ${item.student_id}`,
        marks:      0,
        is_absent:  false,
        status:     'ABSENT',
        remark:     '',
        avatar:     item.avatar || item.profile_image || null,
      }))

      setStudents(mapped)
      computeStats(mapped)

      if (mapped.length === 0) {
        setMessage({ type: 'error', text: 'No students found for selected class/section.' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to load students.' })
    } finally {
      setLoadingStudents(false)
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Compute Helpers
  // ─────────────────────────────────────────────────────────────
  const computeStatus = (marks, isAbsent) => {
    if (isAbsent) return 'ABSENT'
    if (!marks || marks === 0) return 'ABSENT'
    return marks >= examData.minPass ? 'PASS' : 'FAIL'
  }

  const computeStats = (list) => {
    const total   = list.length
    const absent  = list.filter((s) => s.is_absent).length
    const present = total - absent
    const totalM  = list.filter((s) => !s.is_absent).reduce((sum, s) => sum + (s.marks || 0), 0)
    const avg     = present > 0
      ? ((totalM / (present * examData.maxMarks)) * 100).toFixed(1)
      : '0.0'
    setStats({ total, present, absent, average: avg })
  }

  const handleMarksChange = (studentId, value) => {
    let marks = parseInt(value) || 0
    if (marks > examData.maxMarks) marks = examData.maxMarks
    if (marks < 0) marks = 0

    const updated = students.map((s) =>
      s.id === studentId
        ? { ...s, marks, status: computeStatus(marks, s.is_absent) }
        : s
    )
    setStudents(updated)
    computeStats(updated)
  }

  const handleAbsentToggle = (studentId) => {
    const updated = students.map((s) => {
      if (s.id === studentId) {
        const newAbsent = !s.is_absent
        return {
          ...s,
          is_absent: newAbsent,
          marks:     newAbsent ? 0 : s.marks,
          status:    computeStatus(newAbsent ? 0 : s.marks, newAbsent),
        }
      }
      return s
    })
    setStudents(updated)
    computeStats(updated)
  }

  const handleRemarkChange = (studentId, remark) => {
    setStudents(students.map((s) => (s.id === studentId ? { ...s, remark } : s)))
  }

  // ─────────────────────────────────────────────────────────────
  // 5. SAVE ALL → POST createExamMarks per student
  // ─────────────────────────────────────────────────────────────
  const handleSaveAll = async () => {
    if (!selectedExam) {
      setMessage({ type: 'error', text: 'No exam timetable selected.' })
      return
    }
    if (students.length === 0) {
      setMessage({ type: 'error', text: 'No students loaded.' })
      return
    }

    // Validate — present students must have marks > 0
    const invalid = students.filter((s) => !s.is_absent && s.marks === 0)
    if (invalid.length > 0) {
      setMessage({
        type: 'error',
        text: `${invalid.length} present student(s) have 0 marks. Please enter marks or mark as absent.`,
      })
      return
    }

    setSaving(true)
    setMessage({ type: '', text: '' })
    try {
      const result = await markExameService.saveAllMarks(students, selectedExam)
      if (result.success) {
        setMessage({ type: 'success', text: `✅ ${result.message}` })
      } else {
        setMessage({ type: 'error', text: `⚠️ ${result.message}` })
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save marks.' })
    } finally {
      setSaving(false)
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Style Helpers
  // ─────────────────────────────────────────────────────────────
  const statusColor = (status) =>
    ({
      PASS:   'text-green-600  bg-green-50  border border-green-200',
      FAIL:   'text-red-600    bg-red-50    border border-red-200',
      ABSENT: 'text-orange-600 bg-orange-50 border border-orange-200',
    }[status] || '')

  const marksInputBorder = (status) =>
    ({
      PASS:   'border-green-400 focus:ring-green-200',
      FAIL:   'border-red-400   focus:ring-red-200',
      ABSENT: 'border-gray-200  bg-gray-100',
    }[status] || 'border-gray-300')

  const initials = (name = '') =>
    name.split(' ').slice(0, 2).map((n) => n[0]?.toUpperCase()).join('')

  const avatarBg = (name = '') => {
    const colors = ['bg-blue-500','bg-violet-500','bg-pink-500','bg-indigo-500','bg-teal-500','bg-rose-500','bg-amber-500','bg-cyan-500']
    return colors[(name.charCodeAt(0) || 0) % colors.length]
  }

  // ─── Dropdown label for timetable option ─────────────────────
  const timetableLabel = (t) => {
    const d = t.exam_date
      ? new Date(t.exam_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : ''
    return `${t.subject_name || 'Subject'} — Class ${t.class_id} / Sec ${t.section_id} (${d})`
  }

  const selectCls = 'border border-gray-300 rounded-lg px-3 py-2 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-300'

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">✏️ Exam Marks Entry</h1>
          <p className="text-gray-500 text-sm mt-1">
            Select class and exam details to manage student performance.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-black hover:bg-gray-100 text-sm font-medium">
            <FileText size={16} />
            Print Marksheet
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving || students.length === 0}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save All'}
          </button>
        </div>
      </div>

      {/* ── Alert ── */}
      {message.text && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
          message.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* ── Filters ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
        {loadingInit ? (
          <p className="text-sm text-gray-400">Loading exam data...</p>
        ) : (
          <div className="flex flex-wrap gap-4 items-end">

            {/* SELECT EXAM (timetable) */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-black uppercase tracking-wide">
                Select Exam
              </label>
              <select
                className={`${selectCls} min-w-[200px]`}
                value={selectedExam}
                onChange={(e) => {
                  setSelectedExam(e.target.value)
                  setStudents([])
                  setMessage({ type: '', text: '' })
                }}
              >
                <option value="">-- Select Exam --</option>
                {timetableList.map((t) => (
                  <option key={t.timetable_id} value={t.timetable_id}>
                    {timetableLabel(t)}
                  </option>
                ))}
              </select>
            </div>

            {/* CLASS */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-black uppercase tracking-wide">
                Class
              </label>
              <select
                className={`${selectCls} min-w-[130px]`}
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value)
                  setStudents([])
                  setMessage({ type: '', text: '' })
                }}
              >
                <option value="">-- Select Class --</option>
                {classList.map((cls) => (
                  <option key={cls.class_id} value={cls.class_id}>
                    {cls.class_name}
                  </option>
                ))}
              </select>
            </div>

            {/* SECTION */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-black uppercase tracking-wide">
                Section
              </label>
              <select
                className={`${selectCls} min-w-[130px]`}
                value={selectedSection}
                onChange={(e) => {
                  setSelectedSection(e.target.value)
                  setStudents([])
                  setMessage({ type: '', text: '' })
                }}
                disabled={loadingSections || !selectedClass}
              >
                <option value="">
                  {loadingSections ? 'Loading...' : '-- Select Section --'}
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
              <label className="text-xs font-bold text-black uppercase tracking-wide">
                Subject
              </label>
              <select
                className={`${selectCls} min-w-[140px]`}
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value)
                  setStudents([])
                  setMessage({ type: '', text: '' })
                }}
              >
                <option value="">-- Select Subject --</option>
                {subjectList.map((sub) => (
                  <option key={sub.subject_id} value={sub.subject_id}>
                    {sub.subject_name}
                  </option>
                ))}
              </select>
            </div>

            {/* LOAD STUDENTS */}
            <button
              onClick={handleLoadStudents}
              disabled={loadingStudents || !selectedClass || !selectedExam}
              className="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-semibold disabled:opacity-50"
            >
              <Search size={15} />
              {loadingStudents ? 'Loading...' : 'Load Students'}
            </button>
          </div>
        )}
      </div>

      {/* ── Exam Details Bar (auto-filled) ── */}
      {matchedTimetable && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-bold text-black text-sm">Exam Details:</span>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
              Max Marks: {examData.maxMarks}
            </span>
            <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold">
              Min Pass: {examData.minPass}
            </span>
            {examData.date && (
              <span className="text-black text-xs font-medium">📅 {examData.date}</span>
            )}
            {examData.startTime && examData.endTime && (
              <span className="text-black text-xs font-medium">
                🕙 {examData.startTime} – {examData.endTime}
              </span>
            )}
            {examData.roomNo && (
              <span className="text-black text-xs font-medium">
                🚪 Room: {examData.roomNo}
              </span>
            )}
          </div>
          <button className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
            <BarChart2 size={16} />
            View Subject Analytics
          </button>
        </div>
      )}

      {/* ── Students Table ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-5">

        {/* Table Header */}
        <div className="grid grid-cols-[80px_1fr_180px_100px_1fr] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-black uppercase tracking-wide">
          <span>Roll No</span>
          <span>Student Name</span>
          <span>Marks Obtained</span>
          <span>Absent</span>
          <span>Remarks / Comments</span>
        </div>

        {/* Empty State */}
        {students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <span className="text-3xl">📋</span>
            <p className="text-gray-400 text-sm">
              {loadingStudents
                ? 'Loading students...'
                : !selectedExam
                ? 'Select an exam timetable to get started'
                : !selectedClass
                ? 'Select a class to get started'
                : 'Click "Load Students" to load the student list'}
            </p>
          </div>
        ) : (
          students.map((student) => (
            <div
              key={student.id}
              className="grid grid-cols-[80px_1fr_180px_100px_1fr] gap-4 items-center px-6 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors"
            >
              {/* Roll No */}
              <span className="text-sm font-bold text-black">{student.rollNo}</span>

              {/* Student Name */}
              <div className="flex items-center gap-3">
                {student.avatar ? (
                  <img src={student.avatar} alt={student.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${avatarBg(student.name)}`}>
                    {initials(student.name)}
                  </div>
                )}
                <span className="text-sm font-medium text-black truncate">{student.name}</span>
              </div>

              {/* Marks Input + Status */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={student.marks}
                  disabled={student.is_absent}
                  onChange={(e) => handleMarksChange(student.id, e.target.value)}
                  className={`w-20 border rounded-lg px-3 py-1.5 text-sm text-center text-black font-semibold focus:outline-none focus:ring-2 transition-all ${marksInputBorder(student.status)}`}
                  min="0"
                  max={examData.maxMarks}
                />
                <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${statusColor(student.status)}`}>
                  {student.status}
                </span>
              </div>

              {/* Absent Toggle */}
              <div className="flex items-center">
                <button
                  onClick={() => handleAbsentToggle(student.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    student.is_absent ? 'bg-red-500' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    student.is_absent ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Remark */}
              {student.is_absent ? (
                <span className="text-xs font-bold text-red-500 uppercase tracking-wide">
                  ABSENT – NO MARK ENTRY
                </span>
              ) : (
                <input
                  type="text"
                  placeholder="Add remark..."
                  value={student.remark}
                  onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 w-full"
                />
              )}
            </div>
          ))
        )}
      </div>

      {/* ── Stats + Save Bar ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-8 text-sm flex-wrap">
          <div>
            <span className="text-gray-500 font-medium">TOTAL STUDENTS</span>
            <span className="ml-2 font-bold text-black">{stats.total || 48}</span>
          </div>
          <div>
            <span className="text-gray-500 font-medium">PRESENT</span>
            <span className="ml-2 font-bold text-green-600">{stats.present || 45}</span>
          </div>
          <div>
            <span className="text-gray-500 font-medium">ABSENT</span>
            <span className="ml-2 font-bold text-orange-500">
              {String(stats.absent || 3).padStart(2, '0')}
            </span>
          </div>
          <div>
            <span className="text-gray-500 font-medium">CLASS AVERAGE</span>
            <span className="ml-2 font-bold text-blue-600">{stats.average || '72.4'}%</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-black hover:bg-gray-50 text-sm font-medium">
            <BarChart2 size={16} />
            View Report
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving || students.length === 0}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'SAVE ALL MARKS'}
          </button>
        </div>
      </div>

    </div>
  )
}

export default AssignMarks