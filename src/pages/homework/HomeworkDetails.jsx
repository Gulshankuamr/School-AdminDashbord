import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { homeWorkService } from '../../services/homeWorkService/homeWorkService'


export default function HomeworkDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [homework, setHomework] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  const [searchStudent, setSearchStudent] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await homeWorkService.getHomeworkById(id)
        const hw = data.data || {}
        setHomework(hw)
        setSubmissions(hw.submissions || [])
      } catch (err) {
        setError(err.message || 'Failed to load homework details')
      } finally {
        setLoading(false)
      }
    }
    fetchDetails()
  }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await homeWorkService.deleteStudentHomeworkPermanently(id)
      navigate('/homework')
    } catch (err) {
      alert(err.message || 'Delete failed')
      setDeleting(false)
    }
  }

  const filteredSubmissions = submissions.filter((s) => {
    const matchStatus = statusFilter === 'All Statuses' || s.status === statusFilter
    const matchSearch =
      !searchStudent ||
      (s.student_name || '').toLowerCase().includes(searchStudent.toLowerCase()) ||
      String(s.roll_no || '').includes(searchStudent)
    return matchStatus && matchSearch
  })

  const totalPages = Math.ceil(filteredSubmissions.length / ITEMS_PER_PAGE)
  const paginated = filteredSubmissions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const statusStyle = {
    Submitted: { bg: '#e8f5e9', color: '#2e7d32' },
    Pending: { bg: '#fff3e0', color: '#e65100' },
    Late: { bg: '#fce4ec', color: '#c62828' },
  }

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: '#6b7280', fontFamily: 'sans-serif' }}>
        Loading...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: '#ef4444', fontFamily: 'sans-serif' }}>
        {error}
      </div>
    )
  }

  return (
    <div style={{ padding: 24, background: '#f8f9fb', minHeight: '100vh', fontFamily: 'sans-serif', maxWidth: 1100, margin: '0 auto' }}>

      {/* Breadcrumb */}
      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
        <span style={{ cursor: 'pointer', color: '#4f46e5' }} onClick={() => navigate('/homework')}>
          Homework
        </span>
        {' › '}
        <span>Details</span>
      </div>

      {/* Subject + Class Tags */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {homework && homework.subject_name && (
          <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
            {homework.subject_name}
          </span>
        )}
        {homework && homework.class_name && (
          <span style={{ background: '#f3f4f6', color: '#374151', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
            {homework.class_name}{homework.section_name ? ` - ${homework.section_name}` : ''}
          </span>
        )}
      </div>

      {/* Title + Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 700, color: '#1a1a2e' }}>
            {homework ? (homework.title || homework.homework_title || 'Homework Details') : 'Homework Details'}
          </h1>
          <div style={{ fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
            📅 Due:{' '}
            {homework && homework.due_date
              ? new Date(homework.due_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'N/A'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => navigate('/homework/edit/' + id)}
            style={{
              background: '#4f46e5',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '9px 20px',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            ✏️ Edit Homework
          </button>
          <button
            onClick={() => setDeleteConfirm(true)}
            style={{
              background: '#fff',
              color: '#dc2626',
              border: '1px solid #fca5a5',
              borderRadius: 8,
              padding: '9px 20px',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* Main Grid: Instructions + Attachments */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginBottom: 24 }}>

        {/* Instructions */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 16, color: '#1a1a2e' }}>
            📄 Instructions
          </h3>
          <p style={{ color: '#374151', fontSize: 14, lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
            {homework ? (homework.description || homework.instructions || 'No instructions provided.') : 'No instructions provided.'}
          </p>
        </div>

        {/* Attachments */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16, color: '#1a1a2e' }}>
              📎 Attachments
            </h3>
          </div>
          {homework && homework.attachment ? (
            <div
              style={{
                background: '#f8f9fb',
                border: '1px solid #e5e7eb',
                borderRadius: 10,
                padding: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 28 }}>📄</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>
                    {homework.attachment_name || 'Attachment'}
                  </div>
                </div>
              </div>
              <a
                href={homework.attachment}
                target="_blank"
                rel="noreferrer"
                style={{ color: '#4f46e5', fontSize: 18 }}
                title="Download"
              >
                ⬇️
              </a>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#6b7280', fontSize: 13, padding: '20px 0' }}>
              No attachments
            </div>
          )}
        </div>
      </div>

      {/* Student Submissions */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, color: '#1a1a2e' }}>Student Submissions</h3>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="text"
              placeholder="🔍 Search student name..."
              value={searchStudent}
              onChange={(e) => { setSearchStudent(e.target.value); setCurrentPage(1) }}
              style={{
                padding: '7px 12px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                fontSize: 13,
                outline: 'none',
              }}
            />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
              style={{
                padding: '7px 12px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                fontSize: 13,
                outline: 'none',
              }}
            >
              {['All Statuses', 'Submitted', 'Pending', 'Late'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
              {['Student Name', 'Roll No', 'Status', 'Submitted At', 'Action'].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: 'left',
                    padding: '10px 12px',
                    color: '#6b7280',
                    fontWeight: 600,
                    fontSize: 12,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
                  No submissions found
                </td>
              </tr>
            ) : (
              paginated.map((s, i) => {
                const ss = statusStyle[s.status] || { bg: '#f3f4f6', color: '#374151' }
                return (
                  <tr key={s.student_id || i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: '#e0e7ff',
                            color: '#4f46e5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 13,
                            flexShrink: 0,
                          }}
                        >
                          {(s.student_name || '?')[0]}
                        </div>
                        {s.student_name}
                      </div>
                    </td>
                    <td style={{ padding: '12px', color: '#374151' }}>{s.roll_no}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ background: ss.bg, color: ss.color, padding: '3px 12px', borderRadius: 20, fontWeight: 600, fontSize: 12 }}>
                        {s.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#6b7280' }}>
                      {s.submitted_at
                        ? new Date(s.submitted_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 16 }}
                        title="View submission"
                      >
                        👁️
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
            <div style={{ fontSize: 13, color: '#6b7280' }}>
              Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredSubmissions.length)}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredSubmissions.length)} of {filteredSubmissions.length} submissions
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
      </div>

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
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 380, width: '90%', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, color: '#1a1a2e' }}>Delete Homework?</h3>
            <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 24px' }}>
              This will permanently delete the homework and all student submissions.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => setDeleteConfirm(false)}
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