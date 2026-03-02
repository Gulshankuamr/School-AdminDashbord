import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { homeWorkService } from '../../services/homeWorkService/homeWorkService'

// ─── helpers ────────────────────────────────────────────────────────────────
const fmt = (d, withTime = false) => {
  if (!d) return '—'
  const date = new Date(d)
  const datePart = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  if (!withTime) return datePart
  const timePart = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  return `${datePart}, ${timePart}`
}

const fileIcon = (name = '') => {
  const ext = (name.split('.').pop() || '').toLowerCase()
  if (['jpg', 'jpeg', 'png', 'svg', 'webp'].includes(ext)) return '🖼️'
  if (ext === 'pdf') return '📕'
  return '📄'
}

const fmtSize = (bytes) => {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

// ─── STATUS BADGE ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    Submitted: { bg: '#dcfce7', color: '#15803d', emoji: '🟢' },
    Pending:   { bg: '#fef9c3', color: '#92400e', emoji: '🟡' },
    Overdue:   { bg: '#fee2e2', color: '#b91c1c', emoji: '🔴' },
    Active:    { bg: '#dcfce7', color: '#15803d', emoji: '🟢' },
    Upcoming:  { bg: '#e0e7ff', color: '#3730a3', emoji: '⬜' },
  }
  const s = map[status] || { bg: '#f3f4f6', color: '#6b7280', emoji: '' }
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '3px 12px', borderRadius: 20,
      fontWeight: 600, fontSize: 12,
      display: 'inline-flex', alignItems: 'center', gap: 4,
    }}>
      {s.emoji} {status}
    </span>
  )
}

// ─── FILE POPUP (drawer/modal) ───────────────────────────────────────────────
function SubmissionPopup({ student, onClose }) {
  if (!student) return null
  const attachments = student.attachments || student.files || []
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 16,
        padding: '28px 32px', maxWidth: 480, width: '90%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }} onClick={(e) => e.stopPropagation()}>

        {/* header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#111827' }}>
              {student.student_name} – Submitted Files
            </h3>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
              Submitted: {fmt(student.submitted_at, true)}
            </div>
            {student.remarks && (
              <div style={{ marginTop: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '7px 12px', fontSize: 13, color: '#15803d' }}>
                💬 "{student.remarks}"
              </div>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6b7280', lineHeight: 1, padding: 0 }}>✕</button>
        </div>

        {/* files */}
        {attachments.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: '24px 0', fontSize: 14 }}>No files attached</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {attachments.map((att, i) => {
              const name = att.name || att.url?.split('/').pop() || `File ${i + 1}`
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: '#f9fafb', border: '1px solid #e5e7eb',
                  borderRadius: 10, padding: '11px 14px',
                }}>
                  <span style={{ fontSize: 24 }}>{fileIcon(name)}</span>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {name}
                    </div>
                    {att.size && <div style={{ fontSize: 11, color: '#9ca3af' }}>{fmtSize(att.size)}</div>}
                  </div>
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#2563eb', fontWeight: 600, fontSize: 13, textDecoration: 'none', padding: '5px 12px', background: '#eff6ff', borderRadius: 7, flexShrink: 0 }}
                  >
                    View
                  </a>
                </div>
              )
            })}
          </div>
        )}

        <div style={{ textAlign: 'right', marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: '9px 24px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', color: '#374151' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
export default function HomeworkDetails() {
  const { id }    = useParams()
  const navigate  = useNavigate()

  const [homework,      setHomework]      = useState(null)
  const [submissions,   setSubmissions]   = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState(null)
  const [statusFilter,  setStatusFilter]  = useState('All')
  const [searchStudent, setSearchStudent] = useState('')
  const [activeStudent, setActiveStudent] = useState(null)  // popup
  const [currentPage,   setCurrentPage]   = useState(1)
  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await homeWorkService.getHomeworkById(id)
        const hw   = Array.isArray(data.data) ? data.data[0] : (data.data || {})
        setHomework(hw)
        setSubmissions(hw.submissions || hw.student_submissions || [])
      } catch (err) {
        setError(err.message || 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  // ── derived ──────────────────────────────────────────────────────────────────
  const total     = homework?.total_students   || 0
  const submitted = Number(homework?.submitted_count) || 0
  const overdue   = Number(homework?.overdue_count)   || 0
  const pending   = Number(homework?.pending_count)   ?? (total - submitted - overdue)
  const pct       = total > 0 ? Math.round((submitted / total) * 100) : 0
  const pctColor  = pct >= 80 ? '#16a34a' : pct >= 40 ? '#d97706' : '#dc2626'

  const attachments = (() => {
    if (!homework?.attachment) return []
    if (Array.isArray(homework.attachment)) return homework.attachment
    return [{ url: homework.attachment, name: homework.attachment_name || 'Attachment' }]
  })()

  // ── filter submissions ───────────────────────────────────────────────────────
  const filtered = submissions.filter((s) => {
    const matchStatus = statusFilter === 'All' || s.status === statusFilter
    const matchSearch = !searchStudent ||
      (s.student_name || '').toLowerCase().includes(searchStudent.toLowerCase()) ||
      String(s.roll_no || '').includes(searchStudent)
    return matchStatus && matchSearch
  })
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  if (loading) return <div style={{ padding: 80, textAlign: 'center', color: '#6b7280', fontFamily: 'system-ui' }}>Loading...</div>
  if (error)   return <div style={{ padding: 80, textAlign: 'center', color: '#ef4444', fontFamily: 'system-ui' }}>{error}</div>

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* breadcrumb + back */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
        <button onClick={() => navigate('/homework')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', fontSize: 13, fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
          ← Back
        </button>
        <span>›</span>
        <span style={{ color: '#374151', fontWeight: 500 }}>{homework?.title || homework?.homework_title || 'Homework Details'}</span>
      </div>

      {/* ── Header Card ── */}
      <div style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: '#111827' }}>
              {homework?.title || homework?.homework_title}
            </h1>
            <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#6b7280', flexWrap: 'wrap' }}>
              <span>Class: <strong style={{ color: '#374151' }}>{homework?.class_name}{homework?.section_name ? ` ${homework.section_name}` : ''}</strong></span>
              <span>Subject: <strong style={{ color: '#374151' }}>{homework?.subject_name || '—'}</strong></span>
              <span>Due: <strong style={{ color: '#374151' }}>{fmt(homework?.due_date)}</strong></span>
            </div>
          </div>
          <StatusBadge status={homework?.status || 'Active'} />
        </div>

        {/* attachments row */}
        {attachments.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>📎</span>
            {attachments.map((att, i) => {
              const name = att.name || att.url?.split('/').pop() || `File ${i + 1}`
              return (
                <a key={i} href={att.url} target="_blank" rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#f0f9ff', color: '#0369a1', padding: '3px 10px', borderRadius: 8, fontSize: 12, fontWeight: 500, textDecoration: 'none', border: '1px solid #bae6fd' }}>
                  {fileIcon(name)} {name} [View]
                </a>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Summary Card ── */}
      <div style={{ background: '#fff', borderRadius: 14, padding: '18px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 12 }}>
          <span style={{ fontSize: 14, color: '#374151' }}>Total: <strong>{total}</strong></span>
          <span style={{ fontSize: 14, color: '#16a34a' }}>Submitted: <strong>{submitted}</strong> 🟢</span>
          <span style={{ fontSize: 14, color: '#d97706' }}>Pending: <strong>{pending}</strong> 🟡</span>
          <span style={{ fontSize: 14, color: '#dc2626' }}>Overdue: <strong>{overdue}</strong> 🔴</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: pctColor, marginLeft: 'auto' }}>{pct}%</span>
        </div>
        <div style={{ background: '#f3f4f6', borderRadius: 99, height: 10, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: pctColor, borderRadius: 99, transition: 'width 0.6s' }} />
        </div>
      </div>

      {/* ── Submissions Table ── */}
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>

        {/* table toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f3f4f6', flexWrap: 'wrap', gap: 10 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>Student Submissions</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
              style={filterInput}
            >
              {['All', 'Submitted', 'Pending', 'Overdue'].map((s) => <option key={s}>{s}</option>)}
            </select>
            <input
              type="text"
              placeholder="🔍 Search Student..."
              value={searchStudent}
              onChange={(e) => { setSearchStudent(e.target.value); setCurrentPage(1) }}
              style={{ ...filterInput, minWidth: 180 }}
            />
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['Student', 'Roll No', 'Status', 'Submitted On', 'Action'].map((h) => (
                <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #e5e7eb' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 48, textAlign: 'center', color: '#9ca3af' }}>No submissions found</td>
              </tr>
            ) : (
              paginated.map((s, i) => {
                const hasFiles = (s.attachments || s.files || []).length > 0
                const hasRemark = !!s.remarks
                return (
                  <tr key={s.student_id || i} style={{ borderBottom: '1px solid #f3f4f6' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* student */}
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                          {(s.student_name || '?')[0].toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 500, color: '#111827' }}>{s.student_name}</span>
                      </div>
                    </td>

                    {/* roll */}
                    <td style={{ padding: '13px 16px', color: '#374151' }}>{s.roll_no || '—'}</td>

                    {/* status */}
                    <td style={{ padding: '13px 16px' }}><StatusBadge status={s.status} /></td>

                    {/* submitted on + meta */}
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ color: '#374151', fontSize: 13 }}>{fmt(s.submitted_at, true)}</div>
                      {hasFiles && (
                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>
                          📎 {(s.attachments || s.files || []).length} file{(s.attachments || s.files || []).length > 1 ? 's' : ''}
                          <button
                            onClick={() => setActiveStudent(s)}
                            style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: '0 4px' }}
                          >
                            [View]
                          </button>
                        </div>
                      )}
                      {hasRemark && (
                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>💬 "{s.remarks}"</div>
                      )}
                      {!s.submitted_at && <span style={{ color: '#9ca3af', fontSize: 13 }}>—</span>}
                    </td>

                    {/* action */}
                    <td style={{ padding: '13px 16px' }}>
                      {hasFiles ? (
                        <button
                          onClick={() => setActiveStudent(s)}
                          style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 7, padding: '5px 12px', cursor: 'pointer', fontSize: 12, color: '#374151', fontWeight: 500 }}
                        >
                          👁️ View
                        </button>
                      ) : (
                        <span style={{ color: '#d1d5db', fontSize: 13 }}>—</span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {/* pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderTop: '1px solid #f3f4f6' }}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>
              Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setCurrentPage(p)} style={{
                  width: 32, height: 32, borderRadius: 8,
                  border: p === currentPage ? 'none' : '1px solid #e5e7eb',
                  background: p === currentPage ? '#2563eb' : '#fff',
                  color: p === currentPage ? '#fff' : '#374151',
                  fontWeight: p === currentPage ? 700 : 400,
                  cursor: 'pointer', fontSize: 13,
                }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* file popup */}
      <SubmissionPopup student={activeStudent} onClose={() => setActiveStudent(null)} />
    </div>
  )
}

const filterInput = {
  padding: '8px 12px', borderRadius: 8,
  border: '1px solid #e5e7eb', fontSize: 13,
  outline: 'none', background: '#fff', color: '#374151', cursor: 'pointer',
}