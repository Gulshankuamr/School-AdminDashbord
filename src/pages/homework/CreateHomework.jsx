// src/pages/admin/Homework/CreateHomework.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import { homeWorkService } from '../../services/homeWorkService/homeWorkService'
import Sidebar from '../../components/Sidebar'
import Navbar  from '../../components/Navbar'
import {
  Upload, X, BookOpen, Calendar, CheckCircle2, AlertCircle,
  ChevronDown, FileText, Trash2, Plus,
} from 'lucide-react'

const MAX_FILES     = 10
const MAX_FILE_SIZE = 5  * 1024 * 1024
const MAX_TOTAL     = 50 * 1024 * 1024
const todayISO      = () => new Date().toISOString().split('T')[0]

const fileIconColor = (name = '') => {
  const ext = (name.split('.').pop() || '').toLowerCase()
  if (['jpg','jpeg','png','svg','webp'].includes(ext)) return 'text-green-500 bg-green-50 border-green-200'
  if (ext === 'pdf') return 'text-red-500 bg-red-50 border-red-200'
  return 'text-blue-500 bg-blue-50 border-blue-200'
}

export default function CreateHomework() {
  const navigate = useNavigate()

  const [classes,   setClasses]   = useState([])
  const [sections,  setSections]  = useState([])
  const [subjects,  setSubjects]  = useState([])

  const [selectedClass,   setSelectedClass]   = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [description,     setDescription]     = useState('')
  const [dueDate,         setDueDate]         = useState('')
  const [files,           setFiles]           = useState([])
  const [loading,         setLoading]         = useState(false)
  const [dragOver,        setDragOver]        = useState(false)
  const [successData,     setSuccessData]     = useState(null) // ← stays on page after success

  // refs for async safety
  const refs = {
    classId: useRef(''), sectionId: useRef(''), subjectId: useRef(''),
    desc:      useRef(''), dueDate:   useRef(''),
    files:   useRef([]),
  }
  useEffect(() => { refs.classId.current   = selectedClass   }, [selectedClass])
  useEffect(() => { refs.sectionId.current = selectedSection }, [selectedSection])
  useEffect(() => { refs.subjectId.current = selectedSubject }, [selectedSubject])
  useEffect(() => { refs.desc.current      = description     }, [description])
  useEffect(() => { refs.dueDate.current   = dueDate         }, [dueDate])
  useEffect(() => { refs.files.current     = files           }, [files])

  // load dropdowns
  useEffect(() => {
    Promise.allSettled([homeWorkService.getAllClasses(), homeWorkService.getAllSubjects()])
      .then(([cls, sub]) => {
        if (cls.status === 'fulfilled') setClasses(cls.value?.data  || [])
        if (sub.status === 'fulfilled') setSubjects(sub.value?.data || [])
      })
  }, [])

  useEffect(() => {
    setSections([]); setSelectedSection('')
    if (selectedClass) {
      homeWorkService.getAllSections(selectedClass)
        .then((d) => setSections(d.data || []))
        .catch(() => {})
    }
  }, [selectedClass])

  // file helpers
  const addFiles = (incoming) => {
    const current = refs.files.current
    const list    = [...current]
    let skipped   = 0
    for (const f of incoming) {
      if (list.length >= MAX_FILES)   { skipped++; continue }
      if (f.size > MAX_FILE_SIZE)     { toast.error(`${f.name} exceeds 5MB`); continue }
      if (list.find((x) => x.name === f.name)) continue
      list.push(f)
    }
    if (skipped) toast.error(`Max ${MAX_FILES} files allowed`)
    setFiles(list)
  }

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx))

  const totalSize = files.reduce((s, f) => s + f.size, 0)
  const totalPct  = Math.min(Math.round((totalSize / MAX_TOTAL) * 100), 100)

  const resetForm = () => {
    setSelectedClass(''); setSelectedSection(''); setSelectedSubject('')
    setDescription(''); setDueDate(''); setFiles([])
  }

  // ── submit ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    const classId = refs.classId.current
    const secId   = refs.sectionId.current
    const subjId  = refs.subjectId.current
    const dateV   = refs.dueDate.current
    const descV   = refs.desc.current
    const filesV  = refs.files.current

    if (!classId)  return toast.error('Please select a class')
    if (!secId)    return toast.error('Please select a section')
    if (!subjId)   return toast.error('Please select a subject')
    if (!descV)    return toast.error('Please enter homework description')
    if (!dateV)    return toast.error('Please select a due date')

    setLoading(true)
    const tid = toast.loading('Saving homework…')
    try {
      const formData = new FormData()
      formData.append('class_id',    classId)
      formData.append('section_id',  secId)
      formData.append('subject_id',  subjId)
      formData.append('description', descV || '')
      formData.append('due_date',    dateV)
      filesV.forEach((f) => formData.append('attachment', f))

      const result = await homeWorkService.createHomework(formData)
      toast.success('Homework assigned successfully!', { id: tid })

      // ✅ Stay on page — show success state, DO NOT navigate away
      setSuccessData({
        hw_id:   result?.data?.homework_id,
        title:   refs.desc.current.trim() || 'Homework',
        subject: subjects.find((s) => String(s.subject_id) === String(subjId))?.subject_name || '',
        dueDate: dateV,
      })
      resetForm()
    } catch (err) {
      toast.error(err.message, { id: tid })
    } finally {
      setLoading(false)
    }
  }

  // ── UI ────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans','Nunito',sans-serif" }}>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 overflow-y-auto" style={{ padding: '28px 32px' }}>

          {/* Breadcrumb */}
          <p className="text-xs text-gray-400 mb-5">
            <span className="cursor-pointer hover:text-violet-600" onClick={() => navigate('/admin/dashboard')}>Dashboard</span>
            {' › '}
            <span className="cursor-pointer hover:text-violet-600" onClick={() => navigate('/admin/homework')}>Homework</span>
            {' › '}
            <span className="text-gray-700 font-semibold">Assign New</span>
          </p>

          {/* Page title */}
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Assign New Homework</h1>
            <p className="text-sm text-gray-400 mt-0.5">Fill in the details to assign homework to a class.</p>
          </div>

          {/* ── Success Banner (stays on page) ── */}
          {successData && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-green-800 text-sm">Homework Assigned Successfully!</p>
                <p className="text-xs text-green-600 mt-0.5">
                  <strong>{successData.title}</strong> · {successData.subject} · Due {successData.dueDate}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {successData.hw_id && (
                  <button
                    onClick={() => navigate(`/admin/homework/${successData.hw_id}`)}
                    className="text-xs font-bold text-green-700 border border-green-300 bg-white px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    View Submissions
                  </button>
                )}
                <button
                  onClick={() => setSuccessData(null)}
                  className="text-xs font-bold text-gray-500 border border-gray-200 bg-white px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="flex gap-6 items-start">

              {/* ── LEFT: Main Form ── */}
              <div className="flex-1 min-w-0 flex flex-col gap-5">

                {/* Card 1: Academic Details */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-5 pb-3 border-b border-gray-100">
                    Academic Details
                  </h2>
                  <div className="grid grid-cols-2 gap-4">

                    {/* Class */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Class <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
                          className="w-full appearance-none px-3 py-3 pr-9 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent">
                          <option value="">Select Class</option>
                          {classes.map((c) => <option key={c.class_id} value={c.class_id}>{c.class_name}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Section */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Section <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <select value={selectedSection}
                          onChange={(e) => setSelectedSection(e.target.value)}
                          disabled={!selectedClass || sections.length === 0}
                          className="w-full appearance-none px-3 py-3 pr-9 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400">
                          <option value="">Select Section</option>
                          {sections.map((s) => <option key={s.section_id} value={s.section_id}>{s.section_name}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Subject — full width */}
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Subject <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}
                          className="w-full appearance-none px-3 py-3 pr-9 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent">
                          <option value="">Select Subject</option>
                          {subjects.map((s) => <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2: Homework Details */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-5 pb-3 border-b border-gray-100">
                    Homework Details
                  </h2>

                  {/* Description */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description <span className="text-red-400">*</span></label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                      placeholder="Detailed instructions for students…"
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent placeholder-gray-300 resize-none leading-relaxed"
                    />
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Due Date <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input type="date" value={dueDate} min={todayISO()} onChange={(e) => setDueDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Card 3: Attachments */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
                    <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Attachments</h2>
                    <span className="text-[11px] text-gray-400 font-medium">Optional · max {MAX_FILES} files · 5MB each</span>
                  </div>

                  {/* Drop Zone */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(Array.from(e.dataTransfer.files || [])) }}
                    onClick={() => document.getElementById('hw-file-input').click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200
                      ${dragOver ? 'border-violet-400 bg-violet-50 scale-[1.01]' : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/30'}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-violet-50 border border-violet-100 flex items-center justify-center mx-auto mb-3">
                      <Upload className={`w-5 h-5 transition-colors ${dragOver ? 'text-violet-600' : 'text-violet-400'}`} />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Click or drag files to upload</p>
                    <p className="text-xs text-gray-400">JPG, PNG, PDF, DOCX · Max 5MB each · Max 10 files</p>
                    <input id="hw-file-input" type="file" className="hidden"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.svg" multiple
                      onChange={(e) => { addFiles(Array.from(e.target.files || [])); e.target.value = '' }}
                    />
                  </div>

                  {/* File List */}
                  {files.length > 0 && (
                    <div className="mt-4 flex flex-col gap-2">
                      {files.map((f, i) => (
                        <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white`}>
                          <div className={`w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 ${fileIconColor(f.name)}`}>
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{f.name}</p>
                            <p className="text-xs text-gray-400">{(f.size / (1024*1024)).toFixed(1)}MB</p>
                          </div>
                          <button type="button" onClick={() => removeFile(i)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                            <Trash2 className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      ))}

                      {/* Usage bar */}
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                          <span>{files.length} file{files.length > 1 ? 's' : ''} · {(totalSize/(1024*1024)).toFixed(1)}MB / 50MB</span>
                          <span>{totalPct}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500 rounded-full transition-all duration-300" style={{ width: `${totalPct}%` }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pb-6">
                  <button type="button" onClick={() => navigate('/admin/homework')}
                    className="px-6 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-violet-200">
                    {loading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" opacity="0.25"/>
                          <path fill="white" opacity="0.85" d="M4 12a8 8 0 018-8v8H4z"/>
                        </svg>
                        Saving…
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Assign Homework
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* ── RIGHT: Info Panel ── */}
              <div className="w-56 flex-shrink-0 flex flex-col gap-4 sticky top-6">
                <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4">
                  <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-2">💡 Tips</p>
                  <ul className="text-xs text-violet-700 leading-relaxed space-y-1.5 list-disc list-inside">
                    <li>Select class before section</li>
                    <li>Past dates are disabled</li>
                    <li>Only One Pdf 5MB Limit</li>
                    <li>PDF format preferred</li>
                  </ul>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Required Fields</p>
                  {[
                    { label: 'Class',    done: !!selectedClass   },
                    { label: 'Section',  done: !!selectedSection },
                    { label: 'Subject',     done: !!selectedSubject },
                    { label: 'Description', done: !!description.trim() },
                    { label: 'Due Date',    done: !!dueDate         },
                  ].map(({ label, done }) => (
                    <div key={label} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-green-500' : 'bg-gray-200'}`}>
                        {done && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                      </div>
                      <span className={`text-xs font-medium ${done ? 'text-green-700' : 'text-gray-400'}`}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </form>
        </main>
      </div>
    </div>
  )
}