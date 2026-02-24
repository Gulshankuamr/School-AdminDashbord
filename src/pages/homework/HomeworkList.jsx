import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { homeWorkService } from '../../services/homeWorkService/homeWorkService'


const subjectColors = {
  Mathematics: { bg: '#fff3e0', color: '#e65100', border: '#ffb74d' },
  Physics: { bg: '#e3f2fd', color: '#0d47a1', border: '#64b5f6' },
  History: { bg: '#fce4ec', color: '#880e4f', border: '#f48fb1' },
  Biology: { bg: '#e8f5e9', color: '#1b5e20', border: '#81c784' },
  Chemistry: { bg: '#f3e5f5', color: '#4a148c', border: '#ce93d8' },
  Literature: { bg: '#e0f7fa', color: '#006064', border: '#4dd0e1' },
  English: { bg: '#e8eaf6', color: '#1a237e', border: '#9fa8da' },
  default: { bg: '#f5f5f5', color: '#424242', border: '#bdbdbd' },
}

const getSubjectStyle = (name) =>
  subjectColors[name] || subjectColors.default

const statusBadge = (status) => {
  const map = {
    Submitted: { bg: '#e8f5e9', color: '#2e7d32' },
    Pending: { bg: '#fff3e0', color: '#e65100' },
    Late: { bg: '#fce4ec', color: '#c62828' },
  }
  const s = map[status] || { bg: '#f5f5f5', color: '#666' }
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: '2px 10px',
        borderRadius: 20,
        fontWeight: 600,
        fontSize: 12,
      }}
    >
      {status}
    </span>
  )
}

export default function HomeworkList() {
  const navigate = useNavigate()
  const [homeworks, setHomeworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Filters
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [subjects, setSubjects] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 6

  // Stats
  const [stats, setStats] = useState({ total: 0, submissionRate: 0, pending: 0 })

  // Load dropdowns
  useEffect(() => {
    homeWorkService.getAllClasses().then((d) => setClasses(d.data || [])).catch(() => {})
    homeWorkService.getAllSubjects().then((d) => setSubjects(d.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (selectedClass) {
      setSections([])
      setSelectedSection('')
      homeWorkService.getAllSections(selectedClass).then((d) => setSections(d.data || [])).catch(() => {})
    } else {
      setSections([])
      setSelectedSection('')
    }
  }, [selectedClass])

  // Load homework list — using teacher endpoint as primary list source
  const fetchHomework = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Using teacher homework endpoint with optional teacher_id
      // If you have a global list endpoint replace here
      const data = await homeWorkService.getTeacherHomeworkByTeacherId('')
      const list = data.data || []
      setHomeworks(list)

      // Compute stats
      const total = list.length
      const submitted = list.filter((h) => h.status === 'Submitted' || h.submitted_count > 0).length
      const pending = list.filter((h) => h.status === 'Pending' || h.pending_count > 0).length
      const rate = total > 0 ? Math.round((submitted / total) * 100) : 0
      setStats({ total, submissionRate: rate, pending })
    } catch (err) {
      setError(err.message || 'Failed to load homework')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHomework()
  }, [fetchHomework])

  // Filter logic
  const filtered = homeworks.filter((h) => {
    const matchSearch =
      !search ||
      h.title?.toLowerCase().includes(search.toLowerCase()) ||
      h.class_name?.toLowerCase().includes(search.toLowerCase()) ||
      h.teacher_name?.toLowerCase().includes(search.toLowerCase())
    const matchClass = !selectedClass || String(h.class_id) === String(selectedClass)
    const matchSection = !selectedSection || String(h.section_id) === String(selectedSection)
    const matchSubject = !selectedSubject || String(h.subject_id) === String(selectedSubject)
    const matchFrom = !dateFrom || new Date(h.due_date) >= new Date(dateFrom)
    const matchTo = !dateTo || new Date(h.due_date) <= new Date(dateTo)
    return matchSearch && matchClass && matchSection && matchSubject && matchFrom && matchTo
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleDelete = async () => {
    if (!deleteConfirm) return
    setDeleting(true)
    try {
      await homeWorkService.deleteStudentHomeworkPermanently(deleteConfirm)
      setDeleteConfirm(null)
      fetchHomework()
    } catch (err) {
      alert(err.message || 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div style={{ padding: 24, background: '#f8f9fb', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#1a1a2e' }}>Homework Management</h1>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>
            Manage and track student assignments across all grades.
          </p>
        </div>
        <button
          onClick={() => navigate('/homework/create')}
          style={{
            background: '#4f46e5',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 20px',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          + Create Homework
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Assigned', value: stats.total.toLocaleString(), icon: '📋', color: '#4f46e5' },
          { label: 'Submission Rate', value: `${stats.submissionRate}%`, icon: '✅', color: '#10b981' },
          { label: 'Pending Review', value: stats.pending, icon: '⏳', color: '#f59e0b' },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: '20px 24px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <span style={{ fontSize: 28 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#1a1a2e' }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: '16px 20px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          <input
            type="text"
            placeholder="🔍  Search by title, class, or teacher"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
            style={{
              flex: 1,
              minWidth: 220,
              padding: '9px 14px',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              fontSize: 14,
              outline: 'none',
            }}
          />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1) }}
            style={filterInputStyle}
            title="From date"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1) }}
            style={filterInputStyle}
            title="To date"
          />
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <select
            value={selectedClass}
            onChange={(e) => { setSelectedClass(e.target.value); setCurrentPage(1) }}
            style={filterInputStyle}
          >
            <option value="">Class</option>
            {classes.map((c) => (
              <option key={c.class_id} value={c.class_id}>{c.class_name}</option>
            ))}
          </select>
          <select
            value={selectedSection}
            onChange={(e) => { setSelectedSection(e.target.value); setCurrentPage(1) }}
            style={filterInputStyle}
            disabled={!selectedClass}
          >
            <option value="">Section</option>
            {sections.map((s) => (
              <option key={s.section_id} value={s.section_id}>{s.section_name}</option>
            ))}
          </select>
          <select
            value={selectedSubject}
            onChange={(e) => { setSelectedSubject(e.target.value); setCurrentPage(1) }}
            style={filterInputStyle}
          >
            <option value="">Subject</option>
            {subjects.map((s) => (
              <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Loading homework...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#ef4444' }}>{error}</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>No homework found.</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            {paginated.map((hw) => {
              const subStyle = getSubjectStyle(hw.subject_name)
              const total = hw.total_students || hw.total_count || 0
              const submitted = hw.submitted_count || 0
              const pending = hw.pending_count || (total - submitted)
              const progress = total > 0 ? Math.round((submitted / total) * 100) : 0

              return (
                <div
                  key={hw.homework_id || hw.id}
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    padding: 20,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  {/* Top row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        background: subStyle.bg,
                        color: subStyle.color,
                        border: `1px solid ${subStyle.border}`,
                        padding: '2px 10px',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      {hw.subject_name || 'N/A'}
                    </span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => navigate(`/homework/edit/${hw.homework_id || hw.id}`)}
                        style={iconBtn('#f0f9ff', '#0369a1')}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(hw.homework_id || hw.id)}
                        style={iconBtn('#fef2f2', '#dc2626')}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Class */}
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    {hw.class_name}{hw.section_name ? ` - ${hw.section_name}` : ''}
                  </div>

                  {/* Title */}
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e', lineHeight: 1.4 }}>
                    {hw.title || hw.homework_title}
                  </div>

                  {/* Due date */}
                  <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                    📅 Due: {hw.due_date ? new Date(hw.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                      <span>Submissions Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div style={{ background: '#f3f4f6', borderRadius: 99, height: 6, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${progress}%`,
                          background: progress >= 80 ? '#10b981' : progress >= 50 ? '#f59e0b' : '#ef4444',
                          height: '100%',
                          borderRadius: 99,
                          transition: 'width 0.5s',
                        }}
                      />
                    </div>
                  </div>

                  {/* Counts */}
                  <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
                    <div>
                      <div style={{ color: '#6b7280', fontSize: 11 }}>TOTAL</div>
                      <div style={{ fontWeight: 700 }}>{total}</div>
                    </div>
                    <div>
                      <div style={{ color: '#10b981', fontSize: 11 }}>SUB</div>
                      <div style={{ fontWeight: 700 }}>{submitted}</div>
                    </div>
                    <div>
                      <div style={{ color: '#f59e0b', fontSize: 11 }}>PEN</div>
                      <div style={{ fontWeight: 700 }}>{pending}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/homework/${hw.homework_id || hw.id}`)}
                    style={{
                      marginTop: 4,
                      background: 'none',
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      padding: '7px 0',
                      cursor: 'pointer',
                      color: '#4f46e5',
                      fontWeight: 600,
                      fontSize: 13,
                    }}
                  >
                    View Details
                  </button>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 13, color: '#6b7280' }}>
                Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} assignments
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      border: p === currentPage ? 'none' : '1px solid #e5e7eb',
                      background: p === currentPage ? '#4f46e5' : '#fff',
                      color: p === currentPage ? '#fff' : '#374151',
                      fontWeight: p === currentPage ? 700 : 400,
                      cursor: 'pointer',
                      fontSize: 13,
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 32,
              maxWidth: 380,
              width: '90%',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, color: '#1a1a2e' }}>Delete Homework?</h3>
            <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 24px' }}>
              This action is permanent and cannot be undone. All student submissions will also be deleted.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                style={{
                  padding: '10px 24px',
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                  background: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  padding: '10px 24px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#dc2626',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const filterInputStyle = {
  padding: '9px 14px',
  borderRadius: 8,
  border: '1px solid #e5e7eb',
  fontSize: 14,
  outline: 'none',
  background: '#fff',
  cursor: 'pointer',
}

const iconBtn = (bg, color) => ({
  background: bg,
  color,
  border: 'none',
  borderRadius: 6,
  padding: '4px 8px',
  cursor: 'pointer',
  fontSize: 14,
})