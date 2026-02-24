import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Upload, Save, User, Mail, Lock, Users, BookOpen, Layers,
  Eye, EyeOff, Phone, MapPin, Calendar, Heart, GraduationCap, Hash,
  DollarSign, IdCard, CheckCircle, X
} from 'lucide-react'
import { studentService } from '../../services/studentService/studentService'

// ── Parse fee head IDs from any backend format ────────────────────────────────
function parseFeeHeadIds(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) {
    return raw.map(item =>
      typeof item === 'object' ? Number(item.fee_head_id || item.id || 0) : Number(item)
    ).filter(n => n > 0)
  }
  if (typeof raw === 'string') {
    const t = raw.trim()
    if (t.startsWith('[')) {
      try {
        const p = JSON.parse(t)
        return Array.isArray(p)
          ? p.map(item => typeof item === 'object' ? Number(item.fee_head_id || item.id) : Number(item)).filter(n => n > 0)
          : []
      } catch {}
    }
    const parts = t.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n) && n > 0)
    if (parts.length) return parts
    const n = Number(t)
    if (n > 0) return [n]
  }
  const n = Number(raw)
  return n > 0 ? [n] : []
}

const EditStudent = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState(null)

  // ✅ KEY FIX: section_id saved in ref to survive sections-fetch reset
  const pendingSectionId = useRef('')

  const [formData, setFormData] = useState({
    student_id: '',
    admission_no: '',
    name: '',
    user_email: '',
    password: '',
    roll_no: '',
    gender: '',
    class_id: '',
    section_id: '',
    academic_year: '',
    dob: '',
    mobile_number: '',
    father_name: '',
    mother_name: '',
    address: '',
    religion: '',
    selected_fee_heads: [],
    student_photo: null,
    aadhar_card: null,
    father_photo: null,
    mother_photo: null,
  })

  const [filePreviews, setFilePreviews] = useState({
    student_photo: null,
    aadhar_card: null,
    father_photo: null,
    mother_photo: null,
  })

  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [feeHeads, setFeeHeads] = useState([])
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [loadingSections, setLoadingSections] = useState(false)
  const [loadingFeeHeads, setLoadingFeeHeads] = useState(false)

  // Fetch classes
  useEffect(() => {
    const run = async () => {
      try {
        setLoadingClasses(true)
        const data = await studentService.getAllClasses()
        setClasses(Array.isArray(data) ? data : [])
      } catch (e) { console.error('Classes error:', e); setClasses([]) }
      finally { setLoadingClasses(false) }
    }
    run()
  }, [])

  // Fetch fee heads
  useEffect(() => {
    const run = async () => {
      try {
        setLoadingFeeHeads(true)
        const data = await studentService.getAllFeeHeads()
        setFeeHeads(Array.isArray(data) ? data : [])
      } catch (e) { console.error('Fee heads error:', e); setFeeHeads([]) }
      finally { setLoadingFeeHeads(false) }
    }
    run()
  }, [])

  // ✅ FIXED: Fetch sections, then restore pending section_id
  useEffect(() => {
    const run = async () => {
      if (!formData.class_id) { setSections([]); return }
      try {
        setLoadingSections(true)
        const data = await studentService.getSectionsByClassId(formData.class_id)
        const list = Array.isArray(data) ? data : []
        setSections(list)

        // Restore section_id after sections load
        if (pendingSectionId.current) {
          const saved = pendingSectionId.current
          const exists = list.some(s => String(s.section_id) === String(saved))
          if (exists) {
            setFormData(prev => ({ ...prev, section_id: saved }))
          }
          pendingSectionId.current = ''
        }
      } catch (e) { console.error('Sections error:', e); setSections([]) }
      finally { setLoadingSections(false) }
    }
    run()
  }, [formData.class_id])

  // ✅ FIXED: Fetch student — maps ALL fields from API
  useEffect(() => {
    const run = async () => {
      if (!id) return
      try {
        setFetching(true)
        const student = await studentService.getStudentById(id)

        if (!student) throw new Error('Student data is empty')

        console.log('📋 Edit - student data:', student)

        const parsedFeeHeads = parseFeeHeadIds(student.selected_fee_heads)
        console.log('💰 Parsed fee heads:', parsedFeeHeads)

        // Save section_id in ref for sections-fetch to restore
        pendingSectionId.current = student.section_id ? String(student.section_id) : ''

        setFormData({
          student_id:         String(student.student_id    || ''),
          admission_no:       student.admission_no         || '',
          name:               student.name                 || '',
          user_email:         student.user_email           || '',
          password:           '',
          roll_no:            student.roll_no              || '',
          gender:             student.gender               || '',
          class_id:           student.class_id             ? String(student.class_id) : '',
          section_id:         student.section_id           ? String(student.section_id) : '',
          academic_year:      student.academic_year        || '',
          // ✅ Handle ISO date "2000-10-10T00:00:00.000Z" → "2000-10-10"
          dob:                student.dob                  ? student.dob.split('T')[0] : '',
          mobile_number:      student.mobile_number        || '',
          father_name:        student.father_name          || '',
          mother_name:        student.mother_name          || '',
          address:            student.address              || '',
          religion:           student.religion             || '',
          selected_fee_heads: parsedFeeHeads,
          student_photo:      null,
          aadhar_card:        null,
          father_photo:       null,
          mother_photo:       null,
        })

        // Pre-populate existing file previews from backend URLs
        setFilePreviews({
          student_photo: student.student_photo_url || null,
          aadhar_card:   student.aadhar_card_url   || null,
          father_photo:  student.father_photo_url  || null,
          mother_photo:  student.mother_photo_url  || null,
        })
      } catch (err) {
        console.error('Error fetching student:', err)
        setError('Failed to load student data: ' + (err.message || 'Unknown error'))
      } finally {
        setFetching(false)
      }
    }
    run()
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'class_id') {
      pendingSectionId.current = '' // user manually changed class
      setFormData(prev => ({ ...prev, class_id: value, section_id: '' }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleFeeHeadToggle = (feeHeadId) => {
    const numId = Number(feeHeadId)
    setFormData(prev => {
      const cur = prev.selected_fee_heads
      return cur.includes(numId)
        ? { ...prev, selected_fee_heads: cur.filter(x => x !== numId) }
        : { ...prev, selected_fee_heads: [...cur, numId] }
    })
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    if (files && files[0]) {
      const file = files[0]
      setFormData(prev => ({ ...prev, [name]: file }))
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => setFilePreviews(prev => ({ ...prev, [name]: reader.result }))
        reader.readAsDataURL(file)
      } else {
        setFilePreviews(prev => ({ ...prev, [name]: file.name }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (!formData.student_id) throw new Error('Student ID missing')

      const submitData = {
        ...formData,
        selected_fee_heads: JSON.stringify(formData.selected_fee_heads),
      }

      await studentService.updateStudent(formData.student_id, submitData)
      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
        navigate('/admin/students')
      }, 1500)
    } catch (err) {
      console.error('Error updating student:', err)
      setError(err.message || 'Failed to update student')
    } finally {
      setLoading(false)
    }
  }

  // ── Styles ──────────────────────────────────────────────────────────────────
  const inputClass = "w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-900 placeholder-gray-400 text-sm"
  const selectClass = "w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-900 text-sm appearance-none cursor-pointer"
  const iconClass = "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
  const CDN = () => (
    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative mx-auto w-14 h-14 mb-4">
            <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-blue-500"></div>
            <User className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-600 font-medium">Loading student data...</p>
        </div>
      </div>
    )
  }

  // ✅ Show error screen if fetch failed
  if (error && !formData.student_id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-sm w-full bg-white rounded-xl shadow-md p-8 text-center border border-red-100">
          <div className="mx-auto h-14 w-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <X className="h-7 w-7 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Failed to Load</h2>
          <p className="text-gray-500 text-sm mb-5">{error}</p>
          <button onClick={() => navigate('/admin/students')}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-3 sm:px-4 lg:px-6">

      {/* Error Toast */}
      {error && formData.student_id && (
        <div className="fixed top-5 right-5 z-50 max-w-sm w-full">
          <div className="bg-white border border-red-200 shadow-2xl rounded-xl overflow-hidden">
            <div className="bg-red-500 px-4 py-2 flex items-center justify-between">
              <span className="text-white font-semibold text-sm">Update Failed</span>
              <button onClick={() => setError(null)} className="text-white hover:text-red-200 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {saveSuccess && (
        <div className="fixed top-5 right-5 z-50 bg-white border border-green-200 shadow-xl px-5 py-3.5 rounded-xl flex items-center gap-3">
          <div className="bg-green-100 rounded-full p-1.5">
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <p className="font-semibold text-gray-900 text-sm">Student updated successfully!</p>
        </div>
      )}

      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
            <span className="hover:text-blue-500 cursor-pointer" onClick={() => navigate('/admin/students')}>Students</span>
            <span>/</span>
            <span className="text-gray-600 font-medium">Edit Student</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin/students')}
              className="p-2 bg-white hover:bg-gray-100 rounded-lg transition border border-gray-200 group">
              <ArrowLeft className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Student</h1>
              <p className="text-gray-500 text-sm">Update student information and documents</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Basic Information */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <div className="p-1.5 bg-blue-50 rounded-lg"><User className="w-4 h-4 text-blue-600" /></div>
              <h2 className="font-semibold text-gray-800">Basic Information</h2>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* Admission No — read only */}
              {formData.admission_no && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Admission Number</label>
                  <div className="relative">
                    <div className={iconClass}><IdCard className="h-4 w-4 text-gray-400" /></div>
                    <input type="text" value={formData.admission_no} readOnly
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 text-sm cursor-not-allowed" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Auto-generated — cannot be changed</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name <span className="text-red-400">*</span></label>
                <div className="relative">
                  <div className={iconClass}><User className="h-4 w-4 text-gray-400" /></div>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} required placeholder="Student's full name" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address <span className="text-red-400">*</span></label>
                <div className="relative">
                  <div className={iconClass}><Mail className="h-4 w-4 text-gray-400" /></div>
                  <input type="email" name="user_email" value={formData.user_email} onChange={handleChange} className={inputClass} required placeholder="student@example.com" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">New Password</label>
                <div className="relative">
                  <div className={iconClass}><Lock className="h-4 w-4 text-gray-400" /></div>
                  <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-900 placeholder-gray-400 text-sm"
                    placeholder="Leave blank to keep current" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Leave blank to keep current</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Roll Number</label>
                <div className="relative">
                  <div className={iconClass}><Hash className="h-4 w-4 text-gray-400" /></div>
                  <input type="text" name="roll_no" value={formData.roll_no} onChange={handleChange} className={inputClass} placeholder="e.g., 01" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Academic Year</label>
                <div className="relative">
                  <div className={iconClass}><GraduationCap className="h-4 w-4 text-gray-400" /></div>
                  <input type="text" name="academic_year" value={formData.academic_year} onChange={handleChange} className={inputClass} placeholder="2024-25" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date of Birth</label>
                <div className="relative">
                  <div className={iconClass}><Calendar className="h-4 w-4 text-gray-400" /></div>
                  <input type="date" name="dob" value={formData.dob} onChange={handleChange} className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mobile Number</label>
                <div className="relative">
                  <div className={iconClass}><Phone className="h-4 w-4 text-gray-400" /></div>
                  <input type="tel" name="mobile_number" value={formData.mobile_number} onChange={handleChange} className={inputClass} placeholder="Enter mobile number" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Class <span className="text-red-400">*</span></label>
                <div className="relative">
                  <div className={iconClass}><BookOpen className="h-4 w-4 text-gray-400" /></div>
                  <select name="class_id" value={formData.class_id} onChange={handleChange} className={selectClass} required disabled={loadingClasses}>
                    <option value="">{loadingClasses ? 'Loading...' : 'Select Class'}</option>
                    {classes.map(cls => (
                      <option key={cls.class_id} value={String(cls.class_id)}>
                        {cls.class_name || `Class ${cls.class_id}`}
                      </option>
                    ))}
                  </select>
                  <CDN />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Section <span className="text-red-400">*</span></label>
                <div className="relative">
                  <div className={iconClass}><Layers className="h-4 w-4 text-gray-400" /></div>
                  <select name="section_id" value={formData.section_id} onChange={handleChange}
                    className={`${selectClass} disabled:opacity-60 disabled:cursor-not-allowed`}
                    required disabled={!formData.class_id || loadingSections}>
                    <option value="">
                      {!formData.class_id ? 'Select class first' : loadingSections ? 'Loading...' : 'Select Section'}
                    </option>
                    {sections.map(s => (
                      <option key={s.section_id} value={String(s.section_id)}>
                        {s.section_name || `Section ${s.section_id}`}
                      </option>
                    ))}
                  </select>
                  <CDN />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Gender <span className="text-red-400">*</span></label>
                <div className="relative">
                  <div className={iconClass}><Users className="h-4 w-4 text-gray-400" /></div>
                  <select name="gender" value={formData.gender} onChange={handleChange} className={selectClass} required>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <CDN />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Religion</label>
                <div className="relative">
                  <div className={iconClass}><Heart className="h-4 w-4 text-gray-400" /></div>
                  <input type="text" name="religion" value={formData.religion} onChange={handleChange} className={inputClass} placeholder="e.g., Hindu" />
                </div>
              </div>

            </div>
          </div>

          {/* Family & Contact */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <div className="p-1.5 bg-green-50 rounded-lg"><Users className="w-4 h-4 text-green-600" /></div>
              <h2 className="font-semibold text-gray-800">Family & Contact Information</h2>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Father's Name</label>
                <div className="relative">
                  <div className={iconClass}><User className="h-4 w-4 text-gray-400" /></div>
                  <input type="text" name="father_name" value={formData.father_name} onChange={handleChange} className={inputClass} placeholder="Father's full name" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mother's Name</label>
                <div className="relative">
                  <div className={iconClass}><User className="h-4 w-4 text-gray-400" /></div>
                  <input type="text" name="mother_name" value={formData.mother_name} onChange={handleChange} className={inputClass} placeholder="Mother's full name" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Address</label>
                <div className="relative">
                  <div className="absolute top-2.5 left-0 pl-3 flex items-start pointer-events-none"><MapPin className="h-4 w-4 text-gray-400" /></div>
                  <textarea name="address" value={formData.address} onChange={handleChange} rows={3}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-900 placeholder-gray-400 text-sm resize-none"
                    placeholder="Enter complete address" />
                </div>
              </div>
            </div>
          </div>

          {/* Fee Heads */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <div className="p-1.5 bg-yellow-50 rounded-lg"><DollarSign className="w-4 h-4 text-yellow-600" /></div>
              <h2 className="font-semibold text-gray-800">Fee Heads</h2>
              {formData.selected_fee_heads.length > 0 && (
                <span className="ml-auto bg-yellow-100 text-yellow-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {formData.selected_fee_heads.length} Selected
                </span>
              )}
            </div>
            <div className="p-5">
              {loadingFeeHeads ? (
                <p className="text-sm text-gray-400">Loading fee heads...</p>
              ) : feeHeads.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No fee heads available</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {feeHeads.map(fh => {
                    const isChecked = formData.selected_fee_heads.includes(Number(fh.fee_head_id))
                    return (
                      <label key={fh.fee_head_id}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all select-none text-sm font-medium ${
                          isChecked
                            ? 'border-yellow-400 bg-yellow-50 text-yellow-800'
                            : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-yellow-300 hover:bg-yellow-50/50'
                        }`}>
                        <input type="checkbox" className="hidden" checked={isChecked}
                          onChange={() => handleFeeHeadToggle(fh.fee_head_id)} />
                        <span className={`w-4 h-4 rounded flex items-center justify-center border-2 flex-shrink-0 ${
                          isChecked ? 'bg-yellow-500 border-yellow-500' : 'border-gray-300 bg-white'
                        }`}>
                          {isChecked && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        <DollarSign className="w-3.5 h-3.5 text-yellow-600" />
                        {fh.head_name || `Fee Head #${fh.fee_head_id}`}
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <div className="p-1.5 bg-purple-50 rounded-lg"><Upload className="w-4 h-4 text-purple-600" /></div>
              <div>
                <h2 className="font-semibold text-gray-800">Documents & Photos</h2>
                <p className="text-xs text-gray-400 mt-0.5">Upload new files to replace existing ones</p>
              </div>
            </div>
            <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Student Photo',  name: 'student_photo', accept: 'image/*' },
                { label: 'Aadhar Card',    name: 'aadhar_card',   accept: 'image/*,.pdf' },
                { label: "Father's Photo", name: 'father_photo',  accept: 'image/*' },
                { label: "Mother's Photo", name: 'mother_photo',  accept: 'image/*' },
              ].map(file => (
                <div key={file.name}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{file.label}</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/20 transition-all bg-gray-50/50 min-h-[140px] sm:min-h-[160px] flex flex-col justify-center">
                    <input type="file" name={file.name} id={`edit-${file.name}`} onChange={handleFileChange} accept={file.accept} className="hidden" />
                    <label htmlFor={`edit-${file.name}`} className="cursor-pointer flex flex-col items-center justify-center h-full p-3">
                      {filePreviews[file.name] ? (
                        typeof filePreviews[file.name] === 'string' &&
                        (filePreviews[file.name].startsWith('data:') || filePreviews[file.name].startsWith('http')) ? (
                          <>
                            <img src={filePreviews[file.name]} alt="Preview"
                              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg mb-2 shadow border border-blue-200" />
                            <span className="text-xs text-blue-500 font-medium">Click to replace</span>
                          </>
                        ) : (
                          <>
                            <div className="bg-green-100 rounded-full p-2 mb-2"><Upload className="w-5 h-5 text-green-600" /></div>
                            <span className="text-xs text-green-600 font-semibold text-center break-all">{filePreviews[file.name]}</span>
                            <span className="text-xs text-blue-500 mt-1">Click to replace</span>
                          </>
                        )
                      ) : (
                        <>
                          <div className="bg-blue-100 rounded-full p-3 mb-2"><Upload className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" /></div>
                          <span className="text-xs text-gray-600 font-medium text-center">Click to upload</span>
                          <span className="text-xs text-gray-400 text-center mt-0.5">
                            JPG, PNG{file.accept.includes('pdf') ? ', PDF' : ''}
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pb-6">
            <button type="button" onClick={() => navigate('/admin/students')}
              className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition font-medium text-sm order-2 sm:order-1">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className={`px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 order-1 sm:order-2 shadow-sm hover:bg-green-700 transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Updating...
                </>
              ) : (
                <><Save className="w-4 h-4" /> Update Student</>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default EditStudent