// src/pages/admin/Homework/EditHomework.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { homeWorkService } from '../../services/homeWorkService/homeWorkService'
import Sidebar from '../../components/Sidebar'
import Navbar  from '../../components/Navbar'
import {
  ArrowLeft, Upload, Trash2, FileText,
  Calendar, CheckCircle2, AlertCircle, ChevronDown,
} from 'lucide-react'

const todayISO = () => new Date().toISOString().split('T')[0]

const fileIconColor = (name = '') => {
  const ext = (name.split('.').pop() || '').toLowerCase()
  if (['jpg','jpeg','png','svg','webp'].includes(ext)) return 'text-green-500 bg-green-50 border-green-200'
  if (ext === 'pdf') return 'text-red-500 bg-red-50 border-red-200'
  return 'text-blue-500 bg-blue-50 border-blue-200'
}

export default function EditHomework() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [classes,         setClasses]         = useState([])
  const [sections,        setSections]        = useState([])
  const [subjects,        setSubjects]        = useState([])
  const [selectedClass,   setSelectedClass]   = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [form, setForm] = useState({ subject_id: '', title: '', due_date: '', instructions: '' })
  const [existingFiles, setExistingFiles] = useState([])
  const [newFiles,      setNewFiles]      = useState([])
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState(null)
  const [success,  setSuccess]  = useState(false)
  const [dragOver, setDragOver] = useState(false)

  // load dropdowns
  useEffect(() => {
    homeWorkService.getAllClasses().then((d)  => setClasses(d.data  || [])).catch(() => {})
    homeWorkService.getAllSubjects().then((d) => setSubjects(d.data || [])).catch(() => {})
  }, [])

  // load homework
  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await homeWorkService.getHomeworkById(id)
        const hw   = Array.isArray(data.data) ? data.data[0] : (data.data || {})
        setSelectedClass(String(hw.class_id || ''))
        setSelectedSection(String(hw.section_id || ''))
        setForm({
          subject_id:   String(hw.subject_id || ''),
          title:        hw.title || hw.homework_title || '',
          due_date:     hw.due_date ? hw.due_date.split('T')[0] : '',
          instructions: hw.instructions || hw.description || '',
        })
        setExistingFiles(hw.attachments || [])
      } catch (err) {
        setError(err.message || 'Failed to load homework')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  useEffect(() => {
    setSections([])
    if (selectedClass) {
      homeWorkService.getAllSections(selectedClass)
        .then((d) => setSections(d.data || []))
        .catch(() => {})
    }
  }, [selectedClass])

  const addNewFiles = (incoming) => {
    setNewFiles((prev) => {
      const names = new Set(prev.map((f) => f.name))
      return [...prev, ...incoming.filter((f) => !names.has(f.name))]
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return setError('Please enter a homework title')
    if (!form.due_date)      return setError('Please select a due date')

    setSaving(true); setError(null)
    try {
      const formData = new FormData()
      formData.append('homework_id', id)
      formData.append('class_id',    selectedClass)
      if (selectedSection) formData.append('section_id', selectedSection)
      formData.append('subject_id',    form.subject_id)
      formData.append('title',         form.title)
      formData.append('due_date',      form.due_date)
      formData.append('instructions',  form.instructions)
      existingFiles.forEach((f) => formData.append('keep_attachments[]', f.id || f.file_id))
      newFiles.forEach((file)         => formData.append('attachments', file))

      await homeWorkService.updateHomework(formData)
      setSuccess(true)
      // ✅ Stay on page — no redirect to login
    } catch (err) {
      setError(err.message || 'Failed to update homework')
    } finally {
      setSaving(false)
    }
  }

  const selectedClassName = classes.find((c) => String(c.class_id) === String(selectedClass))

  if (loading) return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Loading homework…</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans','Nunito',sans-serif" }}>
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 overflow-y-auto" style={{ padding: '28px 32px' }}>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
            <button onClick={() => navigate('/admin/homework')}
              className="flex items-center gap-1 font-semibold text-violet-600 hover:text-violet-700">
              <ArrowLeft className="w-3.5 h-3.5" /> Homework
            </button>
            <span>›</span>
            <button onClick={() => navigate(`/admin/homework/${id}`)}
              className="font-medium text-violet-600 hover:text-violet-700 truncate max-w-[180px]">
              {form.title || 'Details'}
            </button>
            <span>›</span>
            <span className="text-gray-600 font-semibold">Edit</span>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Edit Homework</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Update assignment for{' '}
              <strong className="text-gray-600">
                {selectedClassName?.class_name || 'selected class'}
                {selectedSection ? ` - ${sections.find((s) => String(s.section_id) === String(selectedSection))?.section_name || ''}` : ''}
              </strong>
            </p>
          </div>

          {/* Success Banner */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-bold text-green-800 text-sm">Updated Successfully!</p>
                <p className="text-xs text-green-600 mt-0.5">Homework has been updated.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigate(`/admin/homework/${id}`)}
                  className="text-xs font-bold text-green-700 border border-green-300 bg-white px-3 py-1.5 rounded-lg hover:bg-green-50">
                  View Details
                </button>
                <button onClick={() => setSuccess(false)}
                  className="text-xs font-bold text-gray-500 border border-gray-200 bg-white px-3 py-1.5 rounded-lg hover:bg-gray-50">
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {error && !success && (
            <div className="mb-5 flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
              <button onClick={() => setError(null)} className="ml-auto"><AlertCircle className="w-4 h-4 rotate-45" /></button>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="max-w-2xl flex flex-col gap-5">

              {/* Card: Academic */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-5 pb-3 border-b border-gray-100">
                  Academic Details
                </h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Class */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Class</label>
                    <div className="relative">
                      <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full appearance-none px-3 py-3 pr-9 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400">
                        <option value="">Select Class</option>
                        {classes.map((c) => <option key={c.class_id} value={c.class_id}>{c.class_name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  {/* Section */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Section</label>
                    <div className="relative">
                      <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}
                        disabled={!selectedClass || sections.length === 0}
                        className="w-full appearance-none px-3 py-3 pr-9 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400">
                        <option value="">All Sections</option>
                        {sections.map((s) => <option key={s.section_id} value={s.section_id}>{s.section_name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
                {/* Subject */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject</label>
                  <div className="relative">
                    <select value={form.subject_id} onChange={(e) => setForm((f) => ({ ...f, subject_id: e.target.value }))}
                      className="w-full appearance-none px-3 py-3 pr-9 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400">
                      <option value="">Select Subject</option>
                      {subjects.map((s) => <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Card: Details */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-5 pb-3 border-b border-gray-100">
                  Homework Details
                </h2>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Homework title"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent placeholder-gray-300"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Due Date <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Instructions</label>
                  <textarea value={form.instructions} onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
                    rows={5} placeholder="Detailed instructions for students…"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent placeholder-gray-300 resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Card: Attachments */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-5 pb-3 border-b border-gray-100">
                  Attachments
                </h2>

                {/* Drop zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); addNewFiles(Array.from(e.dataTransfer.files||[])) }}
                  onClick={() => document.getElementById('hw-edit-file').click()}
                  className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all duration-200 mb-4
                    ${dragOver ? 'border-violet-400 bg-violet-50' : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/30'}`}
                >
                  <Upload className={`w-8 h-8 mx-auto mb-2 transition-colors ${dragOver ? 'text-violet-500' : 'text-gray-300'}`} />
                  <p className="text-sm font-semibold text-gray-700 mb-0.5">Click or drag to upload</p>
                  <p className="text-xs text-gray-400">PDF, DOC, PNG · Max 10MB</p>
                  <input id="hw-edit-file" type="file" multiple accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" className="hidden"
                    onChange={(e) => { addNewFiles(Array.from(e.target.files||[])); e.target.value = '' }}
                  />
                </div>

                {/* Existing files */}
                {existingFiles.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Existing Files</p>
                    <div className="flex flex-col gap-2">
                      {existingFiles.map((file, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-amber-600" />
                          </div>
                          <p className="flex-1 text-sm font-semibold text-gray-700 truncate">{file.file_name || file.name}</p>
                          <button type="button" onClick={() => setExistingFiles((prev) => prev.filter((_,j) => j !== i))}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-amber-100 transition-colors">
                            <Trash2 className="w-3.5 h-3.5 text-amber-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New files */}
                {newFiles.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">New Files</p>
                    <div className="flex flex-col gap-2">
                      {newFiles.map((file, i) => (
                        <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white`}>
                          <div className={`w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 ${fileIconColor(file.name)}`}>
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
                            <p className="text-xs text-gray-400">{(file.size/1024).toFixed(0)}KB</p>
                          </div>
                          <button type="button" onClick={() => setNewFiles((prev) => prev.filter((_,j) => j!==i))}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                            <Trash2 className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pb-6">
                <button type="button" onClick={() => navigate(`/admin/homework/${id}`)}
                  className="px-6 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-violet-200">
                  {saving ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" opacity="0.25"/>
                        <path fill="white" opacity="0.85" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                      Updating…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Update Homework
                    </>
                  )}
                </button>
              </div>

            </div>
          </form>
        </main>
      </div>
    </div>
  )
}