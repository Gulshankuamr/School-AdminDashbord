import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import { homeWorkService } from '../../services/homeWorkService/homeWorkService'

const MAX_FILES     = 10
const MAX_FILE_SIZE = 5 * 1024 * 1024   // 5 MB each
const MAX_TOTAL     = 50 * 1024 * 1024  // 50 MB total

const todayISO = () => new Date().toISOString().split('T')[0]

const fileIcon = (name = '') => {
  const ext = name.split('.').pop().toLowerCase()
  if (['jpg', 'jpeg', 'png', 'svg', 'webp'].includes(ext)) return '🖼️'
  if (ext === 'pdf') return '📕'
  return '📄'
}

export default function CreateHomework() {
  const navigate = useNavigate()

  // dropdowns
  const [classes,   setClasses]   = useState([])
  const [sections,  setSections]  = useState([])
  const [subjects,  setSubjects]  = useState([])

  // form state
  const [selectedClass,   setSelectedClass]   = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [title,           setTitle]           = useState('')
  const [description,     setDescription]     = useState('')
  const [dueDate,         setDueDate]         = useState('')
  const [files,           setFiles]           = useState([])   // File[]
  const [loading,         setLoading]         = useState(false)
  const [dragOver,        setDragOver]        = useState(false)

  // refs for async safety
  const classRef   = useRef('')
  const sectionRef = useRef('')
  const subjectRef = useRef('')
  const titleRef   = useRef('')
  const descRef    = useRef('')
  const dateRef    = useRef('')
  const filesRef   = useRef([])

  useEffect(() => { classRef.current   = selectedClass   }, [selectedClass])
  useEffect(() => { sectionRef.current = selectedSection }, [selectedSection])
  useEffect(() => { subjectRef.current = selectedSubject }, [selectedSubject])
  useEffect(() => { titleRef.current   = title           }, [title])
  useEffect(() => { descRef.current    = description     }, [description])
  useEffect(() => { dateRef.current    = dueDate         }, [dueDate])
  useEffect(() => { filesRef.current   = files           }, [files])

  // load dropdowns
  useEffect(() => {
    Promise.allSettled([homeWorkService.getAllClasses(), homeWorkService.getAllSubjects()])
      .then(([cls, sub]) => {
        if (cls.status === 'fulfilled') setClasses(cls.value?.data  || [])
        if (sub.status === 'fulfilled') setSubjects(sub.value?.data || [])
      })
  }, [])

  useEffect(() => {
    setSections([])
    setSelectedSection('')
    if (selectedClass) {
      homeWorkService.getAllSections(selectedClass)
        .then((d) => setSections(d.data || []))
        .catch(() => {})
    }
  }, [selectedClass])

  // ── file helpers ────────────────────────────────────────────────────────────
  const addFiles = (incoming) => {
    const current = filesRef.current
    const newList = [...current]
    let skipped   = 0
    for (const f of incoming) {
      if (newList.length >= MAX_FILES) { skipped++; continue }
      if (f.size > MAX_FILE_SIZE)      { toast.error(`${f.name} exceeds 5MB`); continue }
      if (newList.find((x) => x.name === f.name)) continue
      newList.push(f)
    }
    if (skipped) toast.error(`Max ${MAX_FILES} files allowed`)
    setFiles(newList)
  }

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx))

  const handleFileInput = (e) => {
    addFiles(Array.from(e.target.files || []))
    e.target.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    addFiles(Array.from(e.dataTransfer.files || []))
  }

  // ── stats ────────────────────────────────────────────────────────────────────
  const totalSize   = files.reduce((s, f) => s + f.size, 0)
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(1)
  const totalPct    = Math.round((totalSize / MAX_TOTAL) * 100)

  // ── submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    const classId = classRef.current
    const secId   = sectionRef.current
    const subjId  = subjectRef.current
    const titleV  = titleRef.current.trim()
    const dateV   = dateRef.current
    const descV   = descRef.current
    const filesV  = filesRef.current

    if (!classId)  return toast.error('Please select a class')
    if (!secId)    return toast.error('Please select a section')
    if (!subjId)   return toast.error('Please select a subject')
    if (!titleV)   return toast.error('Please enter a homework title')
    if (!dateV)    return toast.error('Please select a due date')

    setLoading(true)
    const toastId = toast.loading('Saving homework...')

    try {
      const formData = new FormData()
      formData.append('class_id',    classId)
      formData.append('section_id',  secId)
      formData.append('subject_id',  subjId)
      formData.append('title',       titleV)
      formData.append('description', descV || '')
      formData.append('due_date',    dateV)
      filesV.forEach((f) => formData.append('attachment', f))

      const result = await homeWorkService.createHomework(formData)
      const hwId   = result?.data?.homework_id

      toast.success('Homework assigned successfully!', { id: toastId })
      // Navigate to the newly created homework's detail/submissions page
      setTimeout(() => navigate(hwId ? `/homework/${hwId}` : '/homework'), 700)

    } catch (err) {
      toast.error(err.message, { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      {/* breadcrumb */}
      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>
        <span style={{ color: '#2563eb', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>Dashboard</span>
        {' › '}
        <span style={{ color: '#2563eb', cursor: 'pointer' }} onClick={() => navigate('/homework')}>Homework</span>
        {' › '}
        <span style={{ color: '#374151' }}>Assign New Homework</span>
      </div>

      <h1 style={{ margin: '0 0 20px', fontSize: 24, fontWeight: 700, color: '#111827' }}>Assign New Homework</h1>

      <div style={{ maxWidth: 700 }}>
        <form onSubmit={handleSubmit} noValidate>

          {/* ── CARD 1: Academic Details ── */}
          <div style={card}>
            <h2 style={cardTitle}>Academic Details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>

              {/* Class */}
              <div>
                <label style={lbl}>Class <req /></label>
                <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} style={inp}>
                  <option value="">Select Class</option>
                  {classes.map((c) => <option key={c.class_id} value={c.class_id}>{c.class_name}</option>)}
                </select>
              </div>

              {/* Section */}
              <div>
                <label style={lbl}>Section <req /></label>
                <select
                  value={selectedSection}
                  onChange={(e) => { setSelectedSection(e.target.value); sectionRef.current = e.target.value }}
                  disabled={!selectedClass || sections.length === 0}
                  style={{ ...inp, ...(!selectedClass ? { background: '#f9fafb', cursor: 'not-allowed' } : {}) }}
                >
                  <option value="">Select Section</option>
                  {sections.map((s) => <option key={s.section_id} value={s.section_id}>{s.section_name}</option>)}
                </select>
              </div>

              {/* Subject — full width */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={lbl}>Subject <req /></label>
                <select
                  value={selectedSubject}
                  onChange={(e) => { setSelectedSubject(e.target.value); subjectRef.current = e.target.value }}
                  style={inp}
                >
                  <option value="">Select Subject</option>
                  {subjects.map((s) => <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ── CARD 2: Homework Details ── */}
          <div style={{ ...card, marginTop: 16 }}>
            <h2 style={cardTitle}>Homework Details</h2>

            {/* Title */}
            <div style={{ marginBottom: 18 }}>
              <label style={lbl}>Title <req /></label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Chapter 5 – Algebra Practice"
                style={inp}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: 18 }}>
              <label style={lbl}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed instructions for students..."
                rows={4}
                style={{ ...inp, resize: 'vertical', lineHeight: 1.7 }}
              />
            </div>

            {/* Due Date – past dates disabled */}
            <div style={{ marginBottom: 18 }}>
              <label style={lbl}>Due Date <req /></label>
              <input
                type="date"
                value={dueDate}
                min={todayISO()}
                onChange={(e) => setDueDate(e.target.value)}
                style={inp}
              />
            </div>

            {/* ── Attachments ── */}
            <div style={{ marginBottom: 24 }}>
              <label style={lbl}>Attachments <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 400 }}>(Optional · max {MAX_FILES} files · 5MB each)</span></label>

              {/* drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('hw-file-input').click()}
                style={{
                  border: `2px dashed ${dragOver ? '#2563eb' : '#d1d5db'}`,
                  borderRadius: 12,
                  padding: '28px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: dragOver ? '#eff6ff' : '#fafafa',
                  transition: 'all 0.2s',
                  marginBottom: 12,
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 6 }}>📁</div>
                <p style={{ margin: 0, fontSize: 14 }}>
                  <span style={{ color: '#2563eb', fontWeight: 600 }}>Drag & Drop Here</span>
                  {'  or  '}
                  <span style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'underline' }}>Browse Files</span>
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9ca3af' }}>JPG, PNG, PDF  |  Max 5MB each  |  Max 10 files</p>
                <input
                  id="hw-file-input"
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.svg"
                  multiple
                  onChange={handleFileInput}
                  style={{ display: 'none' }}
                />
              </div>

              {/* file list */}
              {files.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                  {files.map((f, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      background: '#f9fafb', border: '1px solid #e5e7eb',
                      borderRadius: 8, padding: '9px 14px',
                    }}>
                      <span style={{ fontSize: 20 }}>{fileIcon(f.name)}</span>
                      <span style={{ flex: 1, fontSize: 13, color: '#111827', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {f.name}
                      </span>
                      <span style={{ fontSize: 12, color: '#9ca3af', flexShrink: 0 }}>
                        {(f.size / (1024 * 1024)).toFixed(1)}MB
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 20, lineHeight: 1, padding: 0, flexShrink: 0 }}
                      >×</button>
                    </div>
                  ))}
                </div>
              )}

              {/* total usage bar */}
              {files.length > 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                    <span>{files.length} file{files.length > 1 ? 's' : ''}  |  {totalSizeMB}MB / 50MB</span>
                    <span>{totalPct}%</span>
                  </div>
                  <div style={{ background: '#f3f4f6', borderRadius: 99, height: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(totalPct, 100)}%`, height: '100%', background: '#2563eb', borderRadius: 99 }} />
                  </div>
                </div>
              )}
            </div>

            {/* actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 4 }}>
              <button
                type="button"
                onClick={() => navigate('/homework')}
                style={{ padding: '10px 24px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', color: '#374151', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '10px 28px', borderRadius: 8, border: 'none',
                  background: loading ? '#93c5fd' : '#2563eb',
                  color: '#fff', fontWeight: 600, fontSize: 14,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                {loading ? (
                  <>
                    <svg style={{ animation: 'spin 1s linear infinite', width: 16, height: 16 }} fill="none" viewBox="0 0 24 24">
                      <circle style={{ opacity: .25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path style={{ opacity: .75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Saving...
                  </>
                ) : 'Assign Homework'}
              </button>
            </div>

          </div>
        </form>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// tiny inline helpers
const req = () => <span style={{ color: '#ef4444' }}>*</span>

const card = {
  background: '#fff', borderRadius: 12,
  padding: '22px 26px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
}

const cardTitle = {
  margin: '0 0 18px', fontSize: 15, fontWeight: 700,
  color: '#111827', paddingBottom: 12, borderBottom: '1px solid #f3f4f6',
}

const lbl = {
  display: 'block', fontSize: 13, fontWeight: 600,
  color: '#374151', marginBottom: 6,
}

const inp = {
  width: '100%', padding: '10px 12px', borderRadius: 8,
  border: '1px solid #e5e7eb', fontSize: 14, color: '#111827',
  background: '#fff', outline: 'none', boxSizing: 'border-box',
}