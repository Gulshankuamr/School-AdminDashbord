import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { homeWorkService } from '../../services/homeWorkService/homeWorkService'

// ─── helpers ────────────────────────────────────────────────────────────────
const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const progressColor = (pct) =>
  pct >= 80 ? '#16a34a' : pct >= 40 ? '#d97706' : '#dc2626'

const fileIcon = (name = '') => {
  if (!name) return '📄'
  const ext = name.split('.').pop().toLowerCase()
  if (['jpg', 'jpeg', 'png', 'svg', 'webp'].includes(ext)) return '🖼️'
  if (ext === 'pdf') return '📕'
  return '📄'
}

// ─── STATUS BADGE ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    Active:   { bg: '#dcfce7', color: '#15803d', dot: '#16a34a' },
    Overdue:  { bg: '#fee2e2', color: '#b91c1c', dot: '#dc2626' },
    Upcoming: { bg: '#e0e7ff', color: '#3730a3', dot: '#4f46e5' },
    Pending:  { bg: '#fef9c3', color: '#92400e', dot: '#d97706' },
  }
  const s = map[status] || { bg: '#f3f4f6', color: '#6b7280', dot: '#9ca3af' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: s.bg, color: s.color,
      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
      {status || 'Active'}
    </span>
  )
}

// ─── PROGRESS BAR ────────────────────────────────────────────────────────────
function ProgressRow({ total = 0, submitted = 0, pending = 0, overdue = 0 }) {
  const pct = total > 0 ? Math.round((submitted / total) * 100) : 0
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
          <span style={{ color: '#374151' }}>Total: <strong>{total}</strong></span>
          <span style={{ color: '#16a34a' }}>Submitted: <strong>{submitted}</strong> 🟢</span>
          <span style={{ color: '#d97706' }}>Pending: <strong>{pending}</strong> 🟡</span>
          <span style={{ color: '#dc2626' }}>Overdue: <strong>{overdue}</strong> 🔴</span>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: progressColor(pct) }}>{pct}%</span>
      </div>
      <div style={{ background: '#f3f4f6', borderRadius: 99, height: 8, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: progressColor(pct),
          borderRadius: 99,
          transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  )
}

// ─── HOMEWORK CARD ────────────────────────────────────────────────────────────
function HomeworkCard({ hw, onView }) {
  const attachments = (() => {
    if (!hw.attachment) return []
    if (Array.isArray(hw.attachment)) return hw.attachment
    return [{ url: hw.attachment, name: hw.attachment_name || 'Attachment' }]
  })()

  const total     = hw.total_students  || 0
  const submitted = Number(hw.submitted_count) || 0
  const overdue   = Number(hw.overdue_count)   || 0
  const pending   = Number(hw.pending_count)   ?? (total - submitted - overdue)

  return (
    <div style={{
      background: '#fff',
      borderRadius: 14,
      padding: '20px 24px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
      border: '1px solid #e5e7eb',
      transition: 'box-shadow 0.2s',
    }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.07)'}
    >
      {/* top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 20, marginTop: 2 }}>📄</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 4 }}>
              {hw.title || hw.homework_title}
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <span>Class: <strong style={{ color: '#374151' }}>{hw.class_name}{hw.section_name ? ` ${hw.section_name}` : ''}</strong></span>
              <span>Subject: <strong style={{ color: '#374151' }}>{hw.subject_name || '—'}</strong></span>
              <span>Due: <strong style={{ color: '#374151' }}>{fmt(hw.due_date)}</strong></span>
            </div>
            {hw.teacher_name && (
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 3 }}>
                Created by: {hw.created_by_role === 'school_admin' ? 'School Admin' : hw.teacher_name}
              </div>
            )}
          </div>
        </div>
        <StatusBadge status={hw.status} />
      </div>

      {/* attachments */}
      {attachments.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
          {attachments.map((att, i) => {
            const name = att.name || att.url?.split('/').pop() || `File ${i + 1}`
            return (
              <a
                key={i}
                href={att.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: '#f0f9ff', color: '#0369a1',
                  padding: '3px 10px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                  textDecoration: 'none', border: '1px solid #bae6fd',
                }}
              >
                {fileIcon(name)} {name}
              </a>
            )
          })}
        </div>
      )}
      {attachments.length === 0 && (
        <div style={{ marginTop: 8, fontSize: 12, color: '#d1d5db' }}>📎 (no attachments)</div>
      )}

      {/* progress */}
      <ProgressRow total={total} submitted={submitted} pending={pending} overdue={overdue} />

      {/* action */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
        <button
          onClick={() => onView(hw.homework_id || hw.id)}
          style={{
            background: 'none',
            border: '1px solid #2563eb',
            color: '#2563eb',
            borderRadius: 8,
            padding: '7px 18px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          View Submissions <span>→</span>
        </button>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function HomeworkList() {
  const navigate = useNavigate()
  const [homeworks,       setHomeworks]       = useState([])
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

  const fetchHomework = useCallback(async (filters = {}) => {
    setLoading(true)
    setError(null)
    try {
      const data = await homeWorkService.getAllHomeworks(filters)
      setHomeworks(data.data || [])
    } catch (err) {
      setError(err.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchHomework() }, [fetchHomework])

  const handleFilter = () => {
    fetchHomework({
      class_id:   selectedClass,
      subject_id: selectedSubject,
      status:     selectedStatus,
    })
  }

  const handleReset = () => {
    setSelectedClass('')
    setSelectedSubject('')
    setSelectedStatus('')
    fetchHomework()
  }

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* breadcrumb */}
      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>
        <span style={{ color: '#2563eb', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>Dashboard</span>
        {' › '}
        <span style={{ color: '#374151' }}>Homework</span>
      </div>

      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#111827' }}>Homework Management</h1>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 13 }}>Manage and track student assignments across all grades.</p>
        </div>
        <button
          onClick={() => navigate('/homework/create')}
          style={{
            background: '#2563eb', color: '#fff', border: 'none',
            borderRadius: 9, padding: '10px 20px', fontWeight: 600,
            fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          + Assign New Homework
        </button>
      </div>

      {/* filters */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 160px' }}>
            <label style={lbl}>All Classes</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} style={sel}>
              <option value="">All Classes</option>
              {classes.map((c) => <option key={c.class_id} value={c.class_id}>{c.class_name}</option>)}
            </select>
          </div>
          <div style={{ flex: '1 1 160px' }}>
            <label style={lbl}>All Subjects</label>
            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} style={sel}>
              <option value="">All Subjects</option>
              {subjects.map((s) => <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>)}
            </select>
          </div>
          <div style={{ flex: '1 1 140px' }}>
            <label style={lbl}>All Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} style={sel}>
              <option value="">All Status</option>
              {['Active', 'Overdue', 'Upcoming', 'Pending'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <button onClick={handleReset} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', color: '#374151' }}>
            Reset
          </button>
          <button onClick={handleFilter} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            Apply Filter
          </button>
        </div>
      </div>

      {/* list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Loading homework...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#ef4444' }}>{error}</div>
      ) : homeworks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>No homework found</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Try adjusting filters or create new homework.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {homeworks.map((hw) => (
            <HomeworkCard
              key={hw.homework_id || hw.id}
              hw={hw}
              onView={(id) => navigate(`/homework/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const lbl = { display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.4 }
const sel = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, color: '#374151', background: '#fff', outline: 'none', cursor: 'pointer' }