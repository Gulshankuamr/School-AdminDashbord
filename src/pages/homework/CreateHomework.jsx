import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import { homeWorkService } from '../../services/homeWorkService/homeWorkService'
import { API_BASE_URL, getAuthToken } from '../../services/api'

export default function CreateHomework() {
  const navigate = useNavigate()

  const [classes,         setClasses]         = useState([])
  const [sections,        setSections]        = useState([])
  const [subjects,        setSubjects]        = useState([])
  const [selectedClass,   setSelectedClass]   = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [title,           setTitle]           = useState('')
  const [dueDate,         setDueDate]         = useState('')
  const [description,     setDescription]     = useState('')
  const [file,            setFile]            = useState(null)
  const [loading,         setLoading]         = useState(false)

  // Refs — always fresh in async
  const classRef   = useRef('')
  const sectionRef = useRef('')
  const subjectRef = useRef('')
  const titleRef   = useRef('')
  const dateRef    = useRef('')
  const descRef    = useRef('')
  const fileRef    = useRef(null)

  useEffect(() => { classRef.current   = selectedClass   }, [selectedClass])
  useEffect(() => { sectionRef.current = selectedSection }, [selectedSection])
  useEffect(() => { subjectRef.current = selectedSubject }, [selectedSubject])
  useEffect(() => { titleRef.current   = title           }, [title])
  useEffect(() => { dateRef.current    = dueDate         }, [dueDate])
  useEffect(() => { descRef.current    = description     }, [description])
  useEffect(() => { fileRef.current    = file            }, [file])

  // ✅ Load all dropdowns in parallel — faster
  useEffect(() => {
    Promise.allSettled([
      homeWorkService.getAllClasses(),
      homeWorkService.getAllSubjects(),
    ]).then(([cls, sub]) => {
      if (cls.status === 'fulfilled') setClasses(cls.value?.data  || [])
      if (sub.status === 'fulfilled') setSubjects(sub.value?.data || [])
    })
  }, [])

  useEffect(() => {
    setSections([])
    setSelectedSection('')
    sectionRef.current = ''
    if (selectedClass) {
      homeWorkService.getAllSections(selectedClass)
        .then((d) => setSections(d.data || []))
        .catch(() => {})
    }
  }, [selectedClass])

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (f) { setFile(f); fileRef.current = f }
    e.target.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const classId = classRef.current
    const secId   = sectionRef.current
    const subjId  = subjectRef.current
    const titleV  = titleRef.current
    const dateV   = dateRef.current
    const descV   = descRef.current
    const fileV   = fileRef.current

    if (!classId)       return toast.error('Please select a class')
    if (!secId)         return toast.error('Please select a section')
    if (!subjId)        return toast.error('Please select a subject')
    if (!titleV.trim()) return toast.error('Please enter a homework title')
    if (!dateV)         return toast.error('Please select a due date')

    setLoading(true)
    const toastId = toast.loading('Saving...')

    try {
      const token = getAuthToken()
      if (!token) throw new Error('Session expired. Please login again.')

      const formData = new FormData()
      formData.append('class_id',    classId)
      formData.append('section_id',  secId)
      formData.append('subject_id',  subjId)
      formData.append('title',       titleV)
      formData.append('description', descV || '')
      formData.append('due_date',    dateV)
      if (fileV) formData.append('attachment', fileV)

      // ✅ Log exact data being sent
      console.group('📤 CREATE HOMEWORK REQUEST')
      console.log('URL:', `${API_BASE_URL}/schooladmin/createTeacherHomework`)
      for (let [k, v] of formData.entries()) {
        console.log(k, '→', typeof v === 'object' ? `File: ${v.name}` : v)
      }
      console.groupEnd()

      const response = await fetch(`${API_BASE_URL}/schooladmin/createTeacherHomework`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      // ✅ Read raw text — never crashes
      const rawText = await response.text()

      console.group('📥 SERVER RESPONSE')
      console.log('Status:', response.status, response.statusText)
      console.log('Raw text:', rawText)
      console.groupEnd()

      // ✅ Parse JSON safely
      let data = null
      try {
        data = JSON.parse(rawText)
      } catch {
        // Server returned non-JSON (HTML error page, etc.)
        console.error('❌ Response is not JSON:', rawText)
        throw new Error(
          response.status === 401 ? 'Unauthorized. Please login again.' :
          response.status === 403 ? 'Access denied.' :
          response.status === 404 ? 'API endpoint not found (404).' :
          response.status === 500 ? `Server error (500). Raw: ${rawText.slice(0, 150)}` :
          `Unexpected response (${response.status}): ${rawText.slice(0, 150)}`
        )
      }

      // ✅ Check success flag
      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message ||
          data?.error   ||
          data?.msg     ||
          `Request failed with status ${response.status}`
        )
      }

      // ✅ SUCCESS
      toast.success('Homework created successfully!', { id: toastId })
      const hwId = data?.data?.homework_id
      setTimeout(() => navigate(hwId ? `/homework/${hwId}` : '/homework'), 800)

    } catch (err) {
      console.error('❌ FINAL ERROR:', err.message)
      toast.error(err.message, { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          success: { style: { background: '#f0fdf4', border: '1px solid #86efac', color: '#166534' } },
          error:   { style: { background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626' } },
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500 mb-1">
            <span className="text-indigo-600 hover:underline cursor-pointer" onClick={() => navigate('/homework')}>
              Dashboard
            </span>
            {' › '}
            <span className="text-indigo-600 hover:underline cursor-pointer" onClick={() => navigate('/homework')}>
              Homework
            </span>
            {' › '}
            <span className="text-gray-700">Create Homework</span>
          </p>
          <h1 className="text-2xl font-bold text-gray-900">Create Homework</h1>
          <p className="text-sm text-gray-500 mt-0.5">Fill in the details to assign homework to students.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/homework')}
          className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ✕ Cancel
        </button>
      </div>

      {/* Card */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-5">

              {/* Class + Section */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                    Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  >
                    <option value="">Select Class</option>
                    {classes.map((c) => (
                      <option key={c.class_id} value={String(c.class_id)}>{c.class_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                    Section <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedSection}
                    onChange={(e) => { setSelectedSection(e.target.value); sectionRef.current = e.target.value }}
                    disabled={!selectedClass || sections.length === 0}
                    className="w-full px-3 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Section</option>
                    {sections.map((s) => (
                      <option key={s.section_id} value={String(s.section_id)}>{s.section_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                  Subject <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => { setSelectedSubject(e.target.value); subjectRef.current = e.target.value }}
                  className="w-full px-3 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                >
                  <option value="">Select Subject</option>
                  {subjects.map((s) => (
                    <option key={s.subject_id} value={String(s.subject_id)}>{s.subject_name}</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                  Homework Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Trigonometry – Advanced Identities Practice"
                  className="w-full px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                  Description
                  <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write detailed instructions for the students..."
                  rows={4}
                  className="w-full px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-y"
                />
              </div>

              {/* Attachment */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                  Attachment
                  <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>
                </label>
                <div
                  onClick={() => document.getElementById('hw-file-input').click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all group"
                >
                  <div className="text-2xl mb-1">📁</div>
                  <p className="text-sm font-semibold text-indigo-600">Click to upload</p>
                  <p className="text-xs text-gray-400 mt-0.5">PDF, DOC, PNG, JPG — max 10MB</p>
                  <input
                    id="hw-file-input"
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                {file && (
                  <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <span>📄</span>
                    <span className="flex-1 text-sm text-green-800 font-medium truncate">{file.name}</span>
                    <span className="text-xs text-gray-400 shrink-0">{(file.size / 1024).toFixed(0)} KB</span>
                    <button
                      type="button"
                      onClick={() => { setFile(null); fileRef.current = null }}
                      className="text-red-400 hover:text-red-600 text-xl font-bold leading-none"
                    >×</button>
                  </div>
                )}
              </div>

              {/* Save */}
              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:bg-indigo-400 text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all disabled:cursor-not-allowed select-none"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <><span>💾</span> Save Homework</>
                  )}
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  )
}