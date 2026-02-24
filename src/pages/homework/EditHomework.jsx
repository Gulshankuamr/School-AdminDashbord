import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { homeWorkService } from '../../services/homeWorkService/homeWorkService'
import { postFormData } from '../../services/api'

export default function EditHomework() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [subjects, setSubjects] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [form, setForm] = useState({
    subject_id: '',
    title: '',
    due_date: '',
    instructions: '',
  })
  const [existingFiles, setExistingFiles] = useState([])
  const [newFiles, setNewFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // Load dropdowns
  useEffect(() => {
    homeWorkService.getAllClasses().then((d) => setClasses(d.data || [])).catch(() => {})
    homeWorkService.getAllSubjects().then((d) => setSubjects(d.data || [])).catch(() => {})
  }, [])

  // Load homework details
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await homeWorkService.getStudentHomeworkSubjectWise(id)
        const hw = data.data?.[0] || data.data || {}

        setSelectedClass(String(hw.class_id || ''))
        setSelectedSection(String(hw.section_id || ''))
        setForm({
          subject_id: String(hw.subject_id || ''),
          title: hw.title || hw.homework_title || '',
          due_date: hw.due_date ? hw.due_date.split('T')[0] : '',
          instructions: hw.instructions || hw.description || '',
        })
        setExistingFiles(hw.attachments || [])
      } catch (err) {
        setError(err.message || 'Failed to load homework')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  // Load sections when class changes
  useEffect(() => {
    if (selectedClass) {
      homeWorkService.getAllSections(selectedClass).then((d) => setSections(d.data || [])).catch(() => {})
    } else {
      setSections([])
    }
  }, [selectedClass])

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setNewFiles((prev) => [...prev, ...files])
    e.target.value = ''
  }

  const removeExistingFile = (index) => {
    setExistingFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const removeNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return setError('Please enter a homework title')
    if (!form.due_date) return setError('Please select a due date')

    setSaving(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('homework_id', id)
      formData.append('class_id', selectedClass)
      if (selectedSection) formData.append('section_id', selectedSection)
      formData.append('subject_id', form.subject_id)
      formData.append('title', form.title)
      formData.append('due_date', form.due_date)
      formData.append('instructions', form.instructions)

      // Send existing file ids to keep
      existingFiles.forEach((f) => formData.append('keep_attachments[]', f.id || f.file_id))

      // New files
      newFiles.forEach((file) => formData.append('attachments', file))

      await postFormData('/schooladmin/updateHomework', formData)
      setSuccess(true)
      setTimeout(() => navigate(`/homework/${id}`), 1500)
    } catch (err) {
      setError(err.message || 'Failed to update homework')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: '#6b7280' }}>Loading...</div>

  const selectedClassName = classes.find((c) => String(c.class_id) === String(selectedClass))
  const displayLabel = selectedClassName
    ? `${selectedClassName.class_name}${selectedSection ? ` - ${sections.find((s) => String(s.section_id) === String(selectedSection))?.section_name || ''}` : ''}`
    : 'Select Class'

  return (
    <div style={{ padding: 24, background: '#f8f9fb', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
        <span style={{ cursor: 'pointer', color: '#4f46e5' }} onClick={() => navigate('/homework')}>Dashboard</span>
        {' › '}
        <span style={{ cursor: 'pointer', color: '#4f46e5' }} onClick={() => navigate('/homework')}>Homework</span>
        {' › '}
        <span style={{ color: '#4f46e5' }}>Edit Assignment</span>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 36, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#1a1a2e' }}>Edit Homework</h2>
          <p style={{ margin: '0 0 28px', color: '#6b7280', fontSize: 14 }}>
            Update the assignment details and attachments for{' '}
            <strong>{displayLabel}</strong>.
          </p>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 16px', color: '#dc2626', fontSize: 13, marginBottom: 20 }}>
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '10px 16px', color: '#16a34a', fontSize: 13, marginBottom: 20 }}>
              ✅ Homework updated successfully! Redirecting...
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Class & Section */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Class & Section</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                >
                  <option value="">Select Class</option>
                  {classes.map((c) => (
                    <option key={c.class_id} value={c.class_id}>{c.class_name}</option>
                  ))}
                </select>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                  disabled={!selectedClass || sections.length === 0}
                >
                  <option value="">All Sections</option>
                  {sections.map((s) => (
                    <option key={s.section_id} value={s.section_id}>{s.section_name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subject */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Subject</label>
              <select
                value={form.subject_id}
                onChange={(e) => setForm((f) => ({ ...f, subject_id: e.target.value }))}
                style={inputStyle}
              >
                <option value="">Select Subject</option>
                {subjects.map((s) => (
                  <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Homework Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                style={inputStyle}
              />
            </div>

            {/* Due Date */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Due Date</label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                style={inputStyle}
              />
            </div>

            {/* Instructions */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Instructions</label>
              <textarea
                value={form.instructions}
                onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
                rows={5}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
              />
            </div>

            {/* Attachments */}
            <div style={{ marginBottom: 28 }}>
              <label style={labelStyle}>Attachments</label>
              <div
                style={{
                  border: '2px dashed #e5e7eb',
                  borderRadius: 10,
                  padding: 24,
                  textAlign: 'center',
                  background: '#fafafa',
                  cursor: 'pointer',
                }}
                onClick={() => document.getElementById('hw-edit-file-input').click()}
              >
                <div style={{ fontSize: 28, marginBottom: 6 }}>📁</div>
                <div style={{ color: '#4f46e5', fontWeight: 600, fontSize: 14 }}>Upload a file</div>
                <div style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>or drag and drop</div>
                <div style={{ color: '#9ca3af', fontSize: 11, marginTop: 4 }}>PDF, DOC, PNG up to 10MB</div>
                <input
                  id="hw-edit-file-input"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>

              {/* Existing files */}
              {existingFiles.length > 0 && (
                <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {existingFiles.map((file, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: '#fef3c7',
                        border: '1px solid #fcd34d',
                        borderRadius: 8,
                        padding: '6px 12px',
                        fontSize: 13,
                      }}
                    >
                      <span>📄</span>
                      <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {file.file_name || file.name}
                      </span>
                      {file.size && <span style={{ color: '#9ca3af', fontSize: 11 }}>{file.size}</span>}
                      <button
                        type="button"
                        onClick={() => removeExistingFile(i)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 0, fontSize: 14 }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* New files */}
              {newFiles.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {newFiles.map((file, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: '#f3f4f6',
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        padding: '6px 12px',
                        fontSize: 13,
                      }}
                    >
                      <span>📄</span>
                      <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {file.name}
                      </span>
                      <span style={{ color: '#9ca3af', fontSize: 11 }}>{(file.size / 1024).toFixed(0)}KB</span>
                      <button
                        type="button"
                        onClick={() => removeNewFile(i)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 0, fontSize: 14 }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                type="button"
                onClick={() => navigate(`/homework/${id}`)}
                style={{
                  padding: '10px 24px',
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                  background: '#fff',
                  color: '#374151',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '10px 24px',
                  borderRadius: 8,
                  border: 'none',
                  background: saving ? '#a5b4fc' : '#4f46e5',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                {saving ? 'Updating...' : '✅ Update Homework'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  marginBottom: 6,
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
}

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 8,
  border: '1px solid #e5e7eb',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  background: '#fff',
  color: '#1a1a2e',
}