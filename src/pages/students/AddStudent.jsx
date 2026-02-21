import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, CheckCircle, User, Mail, Lock, IdCard, Users, BookOpen, Layers, Phone, MapPin, Calendar, Heart, GraduationCap, Hash, DollarSign, Eye, EyeOff } from 'lucide-react'
import { studentService } from '../../services/studentService/studentService'


const AddStudent = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    user_email: '',
    password: '',
    admission_no: '',
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
    selected_fee_heads: '',
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

  const [showSuccess, setShowSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [feeHeads, setFeeHeads] = useState([])
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [loadingSections, setLoadingSections] = useState(false)
  const [loadingFeeHeads, setLoadingFeeHeads] = useState(false)

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoadingClasses(true)
        const data = await studentService.getAllClasses()
        setClasses(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error fetching classes:', error)
        setClasses([])
      } finally {
        setLoadingClasses(false)
      }
    }
    fetchClasses()
  }, [])

  useEffect(() => {
    const fetchFeeHeads = async () => {
      try {
        setLoadingFeeHeads(true)
        const data = await studentService.getAllFeeHeads()
        setFeeHeads(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error fetching fee heads:', error)
        setFeeHeads([])
      } finally {
        setLoadingFeeHeads(false)
      }
    }
    fetchFeeHeads()
  }, [])

  useEffect(() => {
    const fetchSections = async () => {
      if (!formData.class_id) {
        setSections([])
        return
      }
      try {
        setLoadingSections(true)
        const data = await studentService.getSectionsByClassId(formData.class_id)
        setSections(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error fetching sections:', error)
        setSections([])
      } finally {
        setLoadingSections(false)
      }
    }
    fetchSections()
  }, [formData.class_id])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'class_id') {
      setFormData({ ...formData, [name]: value, section_id: '' })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    if (files && files[0]) {
      const file = files[0]
      setFormData({ ...formData, [name]: file })
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setFilePreviews((prev) => ({ ...prev, [name]: reader.result }))
        }
        reader.readAsDataURL(file)
      } else {
        setFilePreviews((prev) => ({ ...prev, [name]: file.name }))
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '', user_email: '', password: '', admission_no: '', roll_no: '',
      gender: '', class_id: '', section_id: '', academic_year: '', dob: '',
      mobile_number: '', father_name: '', mother_name: '', address: '',
      religion: '', selected_fee_heads: '', student_photo: null,
      aadhar_card: null, father_photo: null, mother_photo: null,
    })
    setFilePreviews({ student_photo: null, aadhar_card: null, father_photo: null, mother_photo: null })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const submitData = {
        ...formData,
        selected_fee_heads: formData.selected_fee_heads
          ? JSON.stringify([Number(formData.selected_fee_heads)])
          : JSON.stringify([]),
      }
      await studentService.addStudent(submitData)
      setShowSuccess(true)
      resetForm()
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error('Error adding student:', error)
      const message = error?.message || 'Failed to add student. Please try again.'
      if (message.toLowerCase().includes('duplicate')) {
        alert('Admission number already exists. Please use a unique one.')
      } else {
        alert(message)
      }
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-900 placeholder-gray-400 text-sm"
  const selectClass = "w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-900 text-sm appearance-none cursor-pointer"
  const iconClass = "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-3 sm:px-4 lg:px-6">

      {showSuccess && (
        <div className="fixed top-5 right-5 bg-white border border-green-200 shadow-xl px-5 py-3.5 rounded-xl flex items-center gap-3 z-50">
          <div className="bg-green-100 rounded-full p-1.5">
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Student Added!</p>
            <p className="text-xs text-gray-500">Record saved successfully</p>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
            <span className="hover:text-blue-500 cursor-pointer">Dashboard</span>
            <span>/</span>
            <span className="hover:text-blue-500 cursor-pointer">Students</span>
            <span>/</span>
            <span className="text-gray-600 font-medium">Enroll New Student</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="p-2 bg-white hover:bg-gray-100 rounded-lg transition border border-gray-200 group"
            >
              <ArrowLeft className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Enroll New Student</h1>
              <p className="text-gray-500 text-sm">Fill in details to register a new student</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Basic Information */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <div className="p-1.5 bg-blue-50 rounded-lg">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="font-semibold text-gray-800 text-base">Basic Information</h2>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name <span className="text-red-400">*</span></label>
                <div className="relative">
                  <div className={iconClass}><User className="h-4 w-4 text-gray-400" /></div>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} required placeholder="Student's full name" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address <span className="text-red-400">*</span></label>
                <div className="relative">
                  <div className={iconClass}><Mail className="h-4 w-4 text-gray-400" /></div>
                  <input type="email" name="user_email" value={formData.user_email} onChange={handleChange} className={inputClass} required placeholder="student@example.com" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password <span className="text-red-400">*</span></label>
                <div className="relative">
                  <div className={iconClass}><Lock className="h-4 w-4 text-gray-400" /></div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password" value={formData.password} onChange={handleChange}
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-900 placeholder-gray-400 text-sm"
                    required placeholder="Enter password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Admission No */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Admission Number <span className="text-red-400">*</span></label>
                <div className="relative">
                  <div className={iconClass}><IdCard className="h-4 w-4 text-gray-400" /></div>
                  <input type="text" name="admission_no" value={formData.admission_no} onChange={handleChange} className={inputClass} required placeholder="ADM-2026-001" />
                </div>
              </div>

              {/* Roll No */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Roll Number</label>
                <div className="relative">
                  <div className={iconClass}><Hash className="h-4 w-4 text-gray-400" /></div>
                  <input type="text" name="roll_no" value={formData.roll_no} onChange={handleChange} className={inputClass} placeholder="e.g., 01" />
                </div>
              </div>

              {/* Academic Year */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Academic Year <span className="text-red-400">*</span></label>
                <div className="relative">
                  <div className={iconClass}><GraduationCap className="h-4 w-4 text-gray-400" /></div>
                  <input type="text" name="academic_year" value={formData.academic_year} onChange={handleChange} className={inputClass} required placeholder="2024-25" />
                </div>
              </div>

              {/* DOB */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date of Birth <span className="text-red-400">*</span></label>
                <div className="relative">
                  <div className={iconClass}><Calendar className="h-4 w-4 text-gray-400" /></div>
                  <input type="date" name="dob" value={formData.dob} onChange={handleChange} className={inputClass} required />
                </div>
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mobile Number <span className="text-red-400">*</span></label>
                <div className="relative">
                  <div className={iconClass}><Phone className="h-4 w-4 text-gray-400" /></div>
                  <input type="tel" name="mobile_number" value={formData.mobile_number} onChange={handleChange} className={inputClass} required placeholder="Enter mobile number" />
                </div>
              </div>

              {/* Class */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Class <span className="text-red-400">*</span></label>
                <div className="relative">
                  <div className={iconClass}><BookOpen className="h-4 w-4 text-gray-400" /></div>
                  <select name="class_id" value={formData.class_id} onChange={handleChange} className={selectClass} required disabled={loadingClasses}>
                    <option value="">Select Class</option>
                    {loadingClasses ? <option disabled>Loading...</option> : classes.map((cls) => (
                      <option key={cls.class_id} value={cls.class_id}>{cls.class_name || `Class ${cls.class_id}`}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              {/* Section */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Section <span className="text-red-400">*</span></label>
                <div className="relative">
                  <div className={iconClass}><Layers className="h-4 w-4 text-gray-400" /></div>
                  <select name="section_id" value={formData.section_id} onChange={handleChange}
                    className={`${selectClass} disabled:opacity-60 disabled:cursor-not-allowed`}
                    required disabled={!formData.class_id || loadingSections}>
                    <option value="">{!formData.class_id ? 'Select class first' : 'Select Section'}</option>
                    {loadingSections ? <option disabled>Loading...</option> : sections.length === 0 ? <option disabled>No sections</option> : sections.map((s) => (
                      <option key={s.section_id} value={s.section_id}>{s.section_name || `Section ${s.section_id}`}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              {/* Fee Head */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Fee Head <span className="text-red-400">*</span></label>
                <div className="relative">
                  <div className={iconClass}><DollarSign className="h-4 w-4 text-gray-400" /></div>
                  <select name="selected_fee_heads" value={formData.selected_fee_heads} onChange={handleChange}
                    className={`${selectClass} disabled:opacity-60 disabled:cursor-not-allowed`}
                    required disabled={loadingFeeHeads}>
                    <option value="">Select Fee Head</option>
                    {loadingFeeHeads ? <option disabled>Loading...</option> : feeHeads.length === 0 ? <option disabled>No fee heads</option> : feeHeads.map((fh) => (
                      <option key={fh.fee_head_id} value={fh.fee_head_id}>{fh.head_name || `Fee Head ${fh.fee_head_id}`}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              {/* Gender */}
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
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              {/* Religion */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Religion</label>
                <div className="relative">
                  <div className={iconClass}><Heart className="h-4 w-4 text-gray-400" /></div>
                  <input type="text" name="religion" value={formData.religion} onChange={handleChange} className={inputClass} placeholder="e.g., Hindu, Muslim" />
                </div>
              </div>

            </div>
          </div>

          {/* Family & Contact */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <div className="p-1.5 bg-green-50 rounded-lg">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <h2 className="font-semibold text-gray-800 text-base">Family & Contact Information</h2>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Father's Name <span className="text-red-400">*</span></label>
                <div className="relative">
                  <div className={iconClass}><User className="h-4 w-4 text-gray-400" /></div>
                  <input type="text" name="father_name" value={formData.father_name} onChange={handleChange} className={inputClass} required placeholder="Father's full name" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mother's Name <span className="text-red-400">*</span></label>
                <div className="relative">
                  <div className={iconClass}><User className="h-4 w-4 text-gray-400" /></div>
                  <input type="text" name="mother_name" value={formData.mother_name} onChange={handleChange} className={inputClass} required placeholder="Mother's full name" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Address <span className="text-red-400">*</span></label>
                <div className="relative">
                  <div className="absolute top-2.5 left-0 pl-3 flex items-start pointer-events-none"><MapPin className="h-4 w-4 text-gray-400" /></div>
                  <textarea name="address" value={formData.address} onChange={handleChange} rows={3}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-900 placeholder-gray-400 text-sm resize-none"
                    required placeholder="Enter complete address" />
                </div>
              </div>

            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <div className="p-1.5 bg-purple-50 rounded-lg">
                <Upload className="w-4 h-4 text-purple-600" />
              </div>
              <h2 className="font-semibold text-gray-800 text-base">Documents & Photos</h2>
            </div>

            <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Student Photo', name: 'student_photo', accept: 'image/*' },
                { label: 'Aadhar Card', name: 'aadhar_card', accept: 'image/*,.pdf' },
                { label: "Father's Photo", name: 'father_photo', accept: 'image/*' },
                { label: "Mother's Photo", name: 'mother_photo', accept: 'image/*' },
              ].map((file) => (
                <div key={file.name}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{file.label}</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/20 transition-all bg-gray-50/50 min-h-[140px] sm:min-h-[160px] flex flex-col justify-center">
                    <input type="file" name={file.name} id={file.name} onChange={handleFileChange} accept={file.accept} className="hidden" />
                    <label htmlFor={file.name} className="cursor-pointer flex flex-col items-center justify-center h-full p-3">
                      {filePreviews[file.name] ? (
                        typeof filePreviews[file.name] === 'string' && filePreviews[file.name].startsWith('data:') ? (
                          <>
                            <img src={filePreviews[file.name]} alt="Preview" className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg mb-2 shadow border border-blue-200" />
                            <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">✓ Uploaded</span>
                          </>
                        ) : (
                          <>
                            <div className="bg-green-100 rounded-full p-2 mb-2"><CheckCircle className="w-5 h-5 text-green-600" /></div>
                            <span className="text-xs text-green-600 font-semibold text-center break-all">{filePreviews[file.name]}</span>
                          </>
                        )
                      ) : (
                        <>
                          <div className="bg-blue-100 rounded-full p-3 mb-2"><Upload className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" /></div>
                          <span className="text-xs text-gray-600 font-medium text-center">Click to upload</span>
                          <span className="text-xs text-gray-400 text-center mt-0.5">JPG, PNG{file.accept.includes('pdf') ? ', PDF' : ''}</span>
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
            <button type="button" onClick={() => window.history.back()}
              className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition font-medium text-sm order-2 sm:order-1">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className={`px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 order-1 sm:order-2 shadow-sm hover:bg-blue-700 transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Add Student</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default AddStudent