// src/pages/admin/Homework/HomeworkList.jsx
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { homeWorkService } from '../../services/homeWorkService/homeWorkService'
import Sidebar from '../../components/Sidebar'
import Navbar  from '../../components/Navbar'
import {
  Plus, RefreshCw,
  BookOpen, Calendar, Users, ChevronRight,
  AlertCircle, Inbox,
} from 'lucide-react'

// ── Helpers ───────────────────────────────────────────────────
const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const pctColor = (p) => p >= 80 ? 'text-green-600' : p >= 40 ? 'text-amber-500' : 'text-red-500'
const pctBg    = (p) => p >= 80 ? 'bg-green-500'   : p >= 40 ? 'bg-amber-400'   : 'bg-red-500'

const STATUS_STYLE = {
  Active:    'bg-green-100 text-green-700',
  Submitted: 'bg-blue-100  text-blue-700',
  Pending:   'bg-amber-100 text-amber-700',
  Overdue:   'bg-red-100   text-red-700',
  Upcoming:  'bg-indigo-100 text-indigo-700',
}

const fileIcon = (name = '') => {
  const ext = (name.split('.').pop() || '').toLowerCase()
  if (['jpg','jpeg','png','svg','webp'].includes(ext)) return '🖼️'
  if (ext === 'pdf') return '📕'
  return '📄'
}

// ── Status Badge ──────────────────────────────────────────────
const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[status] || 'bg-gray-100 text-gray-600'}`}>
    <span className="w-1.5 h-1.5 rounded-full bg-current" />
    {status || 'Active'}
  </span>
)

// ── Homework Card ─────────────────────────────────────────────
const HomeworkCard = ({ hw, onView }) => {
  const total     = hw.total_students    || 0
  const submitted = Number(hw.submitted_count) || 0
  const overdue   = Number(hw.overdue_count)   || 0
  const pending   = Number(hw.pending_count)   ?? (total - submitted - overdue)
  const pct       = total > 0 ? Math.round((submitted / total) * 100) : 0

  const attachments = (() => {
    if (!hw.attachment) return []
    if (Array.isArray(hw.attachment)) return hw.attachment
    return [{ url: hw.attachment, name: hw.attachment_name || 'Attachment' }]
  })()

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Top accent bar */}
      <div className={`h-1 w-full ${pctBg(pct)}`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-gray-900 leading-snug mb-1">
                {hw.description || hw.title || hw.homework_title || `Homework #${hw.homework_id}`}
              </h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                <span>Class: <strong className="text-gray-700">{hw.class_name}{hw.section_name ? ` ${hw.section_name}` : ''}</strong></span>
                <span>Subject: <strong className="text-gray-700">{hw.subject_name || '—'}</strong></span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Due: <strong className="text-gray-700">{fmt(hw.due_date)}</strong>
                </span>
              </div>
              {hw.teacher_name && (
                <p className="text-[11px] text-gray-400 mt-1">
                  By: {hw.created_by_role === 'school_admin' ? 'School Admin' : hw.teacher_name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {attachments.map((att, i) => {
              const name = att.name || att.url?.split('/').pop() || `File ${i+1}`
              return (
                <a key={i} href={att.url} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-lg hover:bg-sky-100 transition-colors"
                >
                  {fileIcon(name)} {name}
                </a>
              )
            })}
          </div>
        )}

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex gap-4 text-xs">
              <span className="text-gray-500">Total: <strong className="text-gray-800">{total}</strong></span>
              <span className="text-green-600">Submitted: <strong>{submitted}</strong></span>
              <span className="text-amber-500">Pending: <strong>{pending}</strong></span>
              <span className="text-red-500">Overdue: <strong>{overdue}</strong></span>
            </div>
            <span className={`text-xs font-bold ${pctColor(pct)}`}>{pct}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${pctBg(pct)}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Action */}
        <div className="flex justify-end">
          <button
            onClick={() => onView(hw.homework_id || hw.id)}
            className="flex items-center gap-1.5 text-sm font-semibold text-violet-600 border border-violet-200 bg-violet-50 hover:bg-violet-100 px-4 py-2 rounded-xl transition-colors"
          >
            View Submissions <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────
export default function HomeworkList() {
  const navigate = useNavigate()

  const [allHomeworks,    setAllHomeworks]    = useState([])
  const [loading,         setLoading]         = useState(true)
  const [error,           setError]           = useState(null)
  const [classes,         setClasses]         = useState([])
  const [subjects,        setSubjects]        = useState([])
  const [selectedClass,   setSelectedClass]   = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedStatus,  setSelectedStatus]  = useState('')

  useEffect(() => {
    homeWorkService.getAllClasses().then((d)  => setClasses(d.data  || [])).catch(() => {})
    homeWorkService.getAllSubjects().then((d) => setSubjects(d.data || [])).catch(() => {})
  }, [])

  const fetchHomework = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const data = await homeWorkService.getAllHomeworks()
      setAllHomeworks(data.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchHomework() }, [fetchHomework])

  // ── Client-side instant filter — no API call on dropdown change ──
  const homeworks = allHomeworks.filter((hw) => {
    const okClass   = !selectedClass   || (hw.class_name   || '').toLowerCase() === selectedClass.toLowerCase()
    const okSubject = !selectedSubject || (hw.subject_name || '').toLowerCase() === selectedSubject.toLowerCase()

    // Status match — check hw.status OR derive from summary counts
    const hwStatus = (hw.status || '').toLowerCase()
    const isSubmitted = hwStatus === 'submitted' || Number(hw.submitted_count) > 0
    const isPending   = hwStatus === 'pending'   || (Number(hw.pending_count) > 0 && Number(hw.submitted_count) === 0)
    const isOverdue   = hwStatus === 'overdue'   || Number(hw.overdue_count)   > 0
    const isActive    = hwStatus === 'active'    || (!isOverdue && !isSubmitted)

    const sel = selectedStatus.toLowerCase()
    const okStatus = !selectedStatus || (
      (sel === 'submitted' && isSubmitted) ||
      (sel === 'pending'   && isPending)   ||
      (sel === 'overdue'   && isOverdue)   ||
      (sel === 'active'    && isActive)    ||
      hwStatus === sel
    )
    return okClass && okSubject && okStatus
  })

  const handleReset = () => { setSelectedClass(''); setSelectedSubject(''); setSelectedStatus('') }

  return (
    <div className="flex min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans','Nunito',sans-serif" }}>
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 overflow-y-auto" style={{ padding: '28px 32px' }}>

          {/* Page Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs text-gray-400 mb-1">
                <span className="cursor-pointer hover:text-violet-600" onClick={() => navigate('/admin/dashboard')}>Dashboard</span>
                {' › '}
                <span className="text-gray-600 font-medium">Homework</span>
              </p>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Homework Management</h1>
              <p className="text-sm text-gray-400 mt-0.5">Manage and track student assignments across all grades.</p>
            </div>
            <button
              onClick={() => navigate('/admin/homework/create')}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-sm shadow-violet-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Assign Homework
            </button>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[140px]">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Class</label>
                <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400">
                  <option value="">All Classes</option>
                  {classes.map((c) => <option key={c.class_id} value={c.class_name}>{c.class_name}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-[140px]">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Subject</label>
                <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400">
                  <option value="">All Subjects</option>
                  {subjects.map((s) => <option key={s.subject_id} value={s.subject_name}>{s.subject_name}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-[130px]">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Status</label>
                <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400">
                  <option value="">All Status</option>
                  {['Active','Submitted','Pending','Overdue'].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <button onClick={handleReset}
                className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                Reset
              </button>
              <button onClick={fetchHomework}
                className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                title="Refresh">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium mb-5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
              <button onClick={() => fetchHomework()} className="ml-auto text-xs underline font-semibold">Retry</button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col gap-4">
              {[1,2,3].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                  <div className="flex gap-3 mb-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                    <div className="flex-1">
                      <div className="h-4 w-1/2 bg-gray-100 rounded mb-2" />
                      <div className="h-3 w-3/4 bg-gray-100 rounded" />
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full" />
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && homeworks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              {/* Illustration */}
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-3xl bg-violet-50 border-2 border-dashed border-violet-200 flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-violet-300" strokeWidth={1.2} />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center text-base">
                  🔍
                </div>
              </div>

              {/* Message — changes based on filter active or not */}
              {(selectedClass || selectedSubject || selectedStatus) ? (
                <>
                  <h3 className="text-lg font-extrabold text-gray-800 mb-2">No Results Found</h3>
                  <p className="text-sm text-gray-400 max-w-xs leading-relaxed mb-3">
                    No homework matches your current filters.
                  </p>
                  {/* Active filters pill display */}
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {selectedClass && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200 px-3 py-1 rounded-full">
                        Class: {selectedClass}
                      </span>
                    )}
                    {selectedSubject && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 px-3 py-1 rounded-full">
                        Subject: {selectedSubject}
                      </span>
                    )}
                    {selectedStatus && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full">
                        Status: {selectedStatus}
                      </span>
                    )}
                  </div>
                  <button onClick={handleReset}
                    className="flex items-center gap-2 bg-violet-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-violet-700 transition-colors">
                    Clear Filters
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-extrabold text-gray-800 mb-2">No Homework Assigned Yet</h3>
                  <p className="text-sm text-gray-400 max-w-xs leading-relaxed mb-6">
                    Start by assigning the first homework to a class.
                  </p>
                  <button onClick={() => navigate('/admin/homework/create')}
                    className="flex items-center gap-2 bg-violet-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-violet-700 transition-colors">
                    <Plus className="w-4 h-4" /> Assign Homework
                  </button>
                </>
              )}
            </div>
          )}

          {/* List */}
          {!loading && !error && homeworks.length > 0 && (
            <div className="flex flex-col gap-4">
              {homeworks.map((hw) => (
                <HomeworkCard
                  key={hw.homework_id || hw.id}
                  hw={hw}
                  onView={(id) => navigate(`/admin/homework/${id}`)}
                />
              ))}
            </div>
          )}

        </main>
      </div>
    </div>
  )
}