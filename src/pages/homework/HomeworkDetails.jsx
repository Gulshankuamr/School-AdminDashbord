// src/pages/admin/Homework/HomeworkDetails.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { homeWorkService } from '../../services/homeWorkService/homeWorkService'
import Sidebar from '../../components/Sidebar'
import Navbar  from '../../components/Navbar'
import {
  ArrowLeft, Download, ExternalLink, Search,
  CheckCircle2, Clock, AlertCircle, Users,
  BookOpen, Calendar, FileText, X, ChevronLeft, ChevronRight, Edit2,
} from 'lucide-react'

const fmt = (d, withTime = false) => {
  if (!d) return '—'
  const date     = new Date(d)
  const datePart = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  if (!withTime) return datePart
  const timePart = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  return `${datePart}, ${timePart}`
}

const fileIcon = (url = '') => {
  const ext = (url.split('.').pop() || '').toLowerCase()
  if (['jpg','jpeg','png','svg','webp'].includes(ext)) return { icon: '🖼️', cls: 'text-green-600 bg-green-50 border-green-200' }
  if (ext === 'pdf') return { icon: '📕', cls: 'text-red-500 bg-red-50 border-red-200' }
  return { icon: '📄', cls: 'text-blue-500 bg-blue-50 border-blue-200' }
}
const fileName = (url = '') => url.split('/').pop() || 'Attachment'

const pctColor = (p) => p >= 80 ? '#16a34a' : p >= 40 ? '#d97706' : '#dc2626'
const pctBg    = (p) => p >= 80 ? 'bg-green-500' : p >= 40 ? 'bg-amber-400' : 'bg-red-500'

const STATUS_STYLE = {
  submitted: 'bg-green-100 text-green-700',
  pending:   'bg-amber-100 text-amber-700',
  overdue:   'bg-red-100 text-red-700',
  checked:   'bg-blue-100 text-blue-700',
  late:      'bg-orange-100 text-orange-700',
}
const statusLabel = (s = '') => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()

const ITEMS_PER_PAGE = 10

// ── FileCard ──────────────────────────────────────────────────
const FileCard = ({ url, label }) => {
  const { icon, cls } = fileIcon(url)
  const name = fileName(url)
  return (
    <div className={`flex items-center gap-3 border rounded-xl px-4 py-3 ${cls}`}>
      <div className={`w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 text-base ${cls}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        {label && <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>}
        <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        <a href={url} target="_blank" rel="noreferrer"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-current/20 bg-white/70 hover:bg-white transition-colors" title="Open">
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <a href={url} download
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-current/20 bg-white/70 hover:bg-white transition-colors" title="Download">
          <Download className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  )
}

// ── Submission Popup ──────────────────────────────────────────
const SubmissionPopup = ({ student, onClose }) => {
  if (!student) return null
  const submittedFile = student.submitted_file
  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        style={{ animation: 'modalIn .25s cubic-bezier(.34,1.56,.64,1) both' }}>

        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-sm">
                {(student.student_name || '?')[0].toUpperCase()}
              </div>
              <h3 className="text-base font-bold text-gray-900">{student.student_name}</h3>
            </div>
            {student.roll_no && (
              <p className="text-xs text-gray-400 ml-10">Roll No: <strong className="text-gray-600">{student.roll_no}</strong></p>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Status</p>
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[(student.status||'').toLowerCase()] || 'bg-gray-100 text-gray-600'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {statusLabel(student.status)}
              </span>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Submitted At</p>
              <p className="text-xs font-semibold text-gray-700">{fmt(student.submitted_at, true)}</p>
            </div>
          </div>

          {submittedFile?.url ? (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Student's Submission</p>
              <FileCard url={submittedFile.url} label={submittedFile.type?.toUpperCase()} />
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 font-medium text-center">
              No file submitted yet
            </div>
          )}
        </div>

        <div className="px-5 pb-5">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            Close
          </button>
        </div>
      </div>
      <style>{`@keyframes modalIn{from{opacity:0;transform:translate(-50%,-46%) scale(.95)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}`}</style>
    </>
  )
}

// ── Main ──────────────────────────────────────────────────────
export default function HomeworkDetails() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [homework,      setHomework]      = useState(null)
  const [students,      setStudents]      = useState([])
  const [summary,       setSummary]       = useState({})
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState(null)
  const [statusFilter,  setStatusFilter]  = useState('All')
  const [searchStudent, setSearchStudent] = useState('')
  const [activeStudent, setActiveStudent] = useState(null)
  const [currentPage,   setCurrentPage]   = useState(1)

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError(null)
      try {
        const res = await homeWorkService.getHomeworkById(id)
        const hw  = res.data || {}
        setHomework(hw)
        setSummary(hw.summary   || {})
        setStudents(hw.students || [])
      } catch (err) {
        setError(err.message || 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const total     = summary.total     || 0
  const submitted = summary.submitted || 0
  const checked   = summary.checked   || 0
  const late      = summary.late      || 0
  const pending   = Math.max(0, total - submitted)
  const pct       = total > 0 ? Math.round((submitted / total) * 100) : 0
  const teacherFile = homework?.attachment?.url ? homework.attachment : null

  const filtered = students.filter((s) => {
    const okStatus = statusFilter === 'All' || (s.status || '').toLowerCase() === statusFilter.toLowerCase()
    const okSearch = !searchStudent ||
      (s.student_name || '').toLowerCase().includes(searchStudent.toLowerCase()) ||
      String(s.roll_no || '').includes(searchStudent)
    return okStatus && okSearch
  })
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  return (
    <div className="flex min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans','Nunito',sans-serif" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 overflow-y-auto" style={{ padding: '28px 32px' }}>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
            <button onClick={() => navigate('/admin/homework')}
              className="flex items-center gap-1 font-semibold text-violet-600 hover:text-violet-700 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Homework
            </button>
            <span>›</span>
            <span className="text-gray-600 font-medium truncate max-w-xs">
              {homework?.description || `Homework #${id}`}
            </span>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col gap-4">
              {[1,2].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                  <div className="h-5 w-1/3 bg-gray-100 rounded mb-3" />
                  <div className="h-3 w-2/3 bg-gray-100 rounded mb-2" />
                  <div className="h-2 bg-gray-100 rounded-full mt-4" />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div><p className="font-bold text-sm">Failed to load</p><p className="text-xs mt-0.5">{error}</p></div>
              <button onClick={() => window.location.reload()} className="ml-auto text-xs font-bold border border-red-200 bg-white px-3 py-1.5 rounded-lg hover:bg-red-50">Retry</button>
            </div>
          )}

          {!loading && !error && homework && (
            <>
              {/* ── Header Card ── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-violet-600" />
                    </div>
                    <div>
                      <h1 className="text-xl font-extrabold text-gray-900 leading-snug mb-2">
                        {homework.description || `Homework #${homework.homework_id}`}
                      </h1>
                      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
                        <span>Class: <strong className="text-gray-700">{homework.class_name || '—'}{homework.section_name ? ` – ${homework.section_name}` : ''}</strong></span>
                        <span>Subject: <strong className="text-gray-700">{homework.subject_name || '—'}</strong></span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Due: <strong className="text-gray-700">{fmt(homework.due_date)}</strong></span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Created: <strong className="text-gray-700">{fmt(homework.created_at)}</strong></span>
                        {homework.created_by_role && <span>By: <strong className="text-gray-700 capitalize">{homework.created_by_role}</strong></span>}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/admin/homework/edit/${id}`)}
                    className="flex items-center gap-1.5 text-xs font-bold text-violet-600 border border-violet-200 bg-violet-50 hover:bg-violet-100 px-3 py-2 rounded-xl transition-colors flex-shrink-0">
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>

                {teacherFile && (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Teacher's Resource</p>
                    <FileCard url={teacherFile.url} label={teacherFile.type?.toUpperCase()} />
                  </div>
                )}
              </div>

              {/* ── Stats ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                {[
                  { label: 'Total Students', value: total,     icon: Users,        color: 'text-violet-600', bg: 'bg-violet-50' },
                  { label: 'Submitted',       value: submitted, icon: CheckCircle2, color: 'text-green-600',  bg: 'bg-green-50'  },
                  { label: 'Pending',         value: pending,   icon: Clock,        color: 'text-amber-500',  bg: 'bg-amber-50'  },
                  { label: 'Late',            value: late,      icon: AlertCircle,  color: 'text-red-500',    bg: 'bg-red-50'    },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div>
                      <p className="text-xl font-extrabold text-gray-900">{value}</p>
                      <p className="text-xs text-gray-400">{label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Progress ── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-700">Submission Progress</p>
                  <span className="text-sm font-extrabold" style={{ color: pctColor(pct) }}>{pct}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${pctBg(pct)}`} style={{ width: `${pct}%` }} />
                </div>
                {checked > 0 && <p className="text-xs text-blue-600 mt-2">✓ {checked} submission{checked > 1 ? 's' : ''} checked</p>}
              </div>

              {/* ── Students Table ── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-wrap gap-3">
                  <h3 className="text-sm font-bold text-gray-800">
                    Student Submissions
                    <span className="ml-2 text-xs font-normal text-gray-400">({filtered.length})</span>
                  </h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-400">
                      {['All','Submitted','Pending','Overdue','Late','Checked'].map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input type="text" placeholder="Search student…" value={searchStudent}
                        onChange={(e) => { setSearchStudent(e.target.value); setCurrentPage(1) }}
                        className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-400 w-44" />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        {['Student','Roll No','Status','Submitted On','Action'].map((h) => (
                          <th key={h} className="px-5 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.length === 0 ? (
                        <tr><td colSpan={5} className="py-14 text-center text-sm text-gray-400">No submissions found</td></tr>
                      ) : (
                        paginated.map((s, i) => {
                          const hasFile  = !!s.submitted_file?.url
                          const statusKey = (s.status || '').toLowerCase()
                          return (
                            <tr key={s.student_id || i} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors">
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                    {(s.student_name || '?')[0].toUpperCase()}
                                  </div>
                                  <span className="font-semibold text-gray-800">{s.student_name}</span>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-gray-500">{s.roll_no || '—'}</td>
                              <td className="px-5 py-4">
                                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[statusKey] || 'bg-gray-100 text-gray-600'}`}>
                                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                  {statusLabel(s.status)}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                {s.submitted_at
                                  ? <p className="text-gray-700 text-sm">{fmt(s.submitted_at, true)}</p>
                                  : <span className="text-gray-300 text-xs">Not submitted</span>}
                                {hasFile && <p className="text-xs text-gray-400 mt-0.5">📎 {s.submitted_file.type?.toUpperCase() || 'File'}</p>}
                              </td>
                              <td className="px-5 py-4">
                                {hasFile ? (
                                  <button onClick={() => setActiveStudent(s)}
                                    className="flex items-center gap-1.5 text-xs font-bold text-violet-600 border border-violet-200 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-colors">
                                    View File
                                  </button>
                                ) : (
                                  <span className="text-gray-300 text-xs">—</span>
                                )}
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                      Showing {Math.min((currentPage-1)*ITEMS_PER_PAGE+1, filtered.length)}–{Math.min(currentPage*ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
                    </span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setCurrentPage(p => Math.max(1,p-1))} disabled={currentPage===1}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                        <ChevronLeft className="w-4 h-4 text-gray-500" />
                      </button>
                      {Array.from({ length: totalPages }, (_,i) => i+1).map((p) => (
                        <button key={p} onClick={() => setCurrentPage(p)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${p===currentPage ? 'bg-violet-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                          {p}
                        </button>
                      ))}
                      <button onClick={() => setCurrentPage(p => Math.min(totalPages,p+1))} disabled={currentPage===totalPages}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

        </main>
      </div>
      <SubmissionPopup student={activeStudent} onClose={() => setActiveStudent(null)} />
    </div>
  )
}