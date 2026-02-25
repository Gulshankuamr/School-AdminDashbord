import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Upload, CheckCircle, X, Eye, EyeOff,
  User, Mail, Lock, Phone, MapPin, GraduationCap,
  Briefcase, Calendar, Users
} from 'lucide-react'
import { teacherService } from '../../services/teacherService/teacherService'

const AddTeacher = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    user_email: '',
    password: '',
    gender: '',
    qualification: '',
    experience_years: '',
    joining_date: '',
    mobile_number: '',
    address: '',
    father_name: '',
    mother_name: '',
    teacher_photo: null,
    aadhar_card: null,
  })

  const [filePreviews, setFilePreviews] = useState({
    teacher_photo: null,
    aadhar_card: null,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [successInfo, setSuccessInfo] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    if (files && files[0]) {
      const file = files[0]
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should not exceed 5MB')
        setTimeout(() => setError(null), 3000)
        return
      }
      setFormData(prev => ({ ...prev, [name]: file }))
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => setFilePreviews(prev => ({ ...prev, [name]: reader.result }))
        reader.readAsDataURL(file)
      } else {
        setFilePreviews(prev => ({ ...prev, [name]: file.name }))
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '', user_email: '', password: '', gender: '',
      qualification: '', experience_years: '', joining_date: '',
      mobile_number: '', address: '', father_name: '', mother_name: '',
      teacher_photo: null, aadhar_card: null,
    })
    setFilePreviews({ teacher_photo: null, aadhar_card: null })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      // Validate required fields
      if (!formData.name || !formData.user_email || !formData.password || !formData.qualification) {
        throw new Error('Please fill all required fields')
      }

      await teacherService.addTeacher(formData)
      
      setSuccessInfo({ name: formData.name })
      resetForm()
      
      // Redirect after success
      setTimeout(() => {
        setSuccessInfo(null)
        navigate('/admin/teachers')
      }, 2000)
    } catch (err) {
      console.error('Error adding teacher:', err)
      setError(err?.message || 'Failed to add teacher. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white outline-none transition-all text-gray-900 placeholder-gray-400 text-sm"
  const selectClass = "w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white outline-none transition-all text-gray-900 text-sm appearance-none cursor-pointer"
  const iconClass = "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
  
  const ChevronDown = () => (
    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-3 sm:px-4 lg:px-6">

      {/* Error Toast */}
      {error && (
        <div className="fixed top-5 right-5 z-50 max-w-sm w-full animate-slideIn">
          <div className="bg-white border border-red-200 shadow-2xl rounded-xl overflow-hidden">
            <div className="bg-red-500 px-4 py-2 flex items-center justify-between">
              <span className="text-white font-semibold text-sm">Error</span>
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
      {successInfo && (
        <div className="fixed top-5 right-5 z-50 max-w-sm w-full animate-slideIn">
          <div className="bg-white border border-emerald-200 shadow-2xl rounded-xl overflow-hidden">
            <div className="bg-emerald-500 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-white" />
                <span className="text-white font-semibold text-sm">Teacher Added Successfully!</span>
              </div>
              <button onClick={() => setSuccessInfo(null)} className="text-white hover:text-emerald-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-700 text-sm">
                <span className="font-bold">{successInfo.name}</span> has been registered. Redirecting...
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
            <span className="hover:text-emerald-500 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>Dashboard</span>
            <span>/</span>
            <span className="hover:text-emerald-500 cursor-pointer" onClick={() => navigate('/admin/teachers')}>Teachers</span>
            <span>/</span>
            <span className="text-gray-600 font-medium">Add New Teacher</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/admin/teachers')}
              className="p-2 bg-white hover:bg-gray-100 rounded-lg transition border border-gray-200 group"
            >
              <ArrowLeft className="w-4 h-4 text-gray-500 group-hover:text-emerald-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Teacher</h1>
              <p className="text-gray-500 text-sm">Fill in teacher details to register</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Basic Information */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <div className="p-1.5 bg-emerald-50 rounded-lg"><User className="w-4 h-4 text-emerald-600" /></div>
              <h2 className="font-semibold text-gray-800 text-base">Basic Information</h2>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className={iconClass}><User className="h-4 w-4 text-gray-400" /></div>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    className={inputClass} 
                    required 
                    placeholder="Teacher's full name" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className={iconClass}><Mail className="h-4 w-4 text-gray-400" /></div>
                  <input 
                    type="email" 
                    name="user_email" 
                    value={formData.user_email} 
                    onChange={handleChange} 
                    className={inputClass} 
                    required 
                    placeholder="teacher@example.com" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className={iconClass}><Lock className="h-4 w-4 text-gray-400" /></div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white outline-none transition-all text-gray-900 placeholder-gray-400 text-sm"
                    required 
                    placeholder="Enter password"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Gender</label>
                <div className="relative">
                  <div className={iconClass}><Users className="h-4 w-4 text-gray-400" /></div>
                  <select 
                    name="gender" 
                    value={formData.gender} 
                    onChange={handleChange} 
                    className={selectClass}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Qualification <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className={iconClass}><GraduationCap className="h-4 w-4 text-gray-400" /></div>
                  <input 
                    type="text" 
                    name="qualification" 
                    value={formData.qualification} 
                    onChange={handleChange} 
                    className={inputClass} 
                    required 
                    placeholder="e.g., M.Ed, B.Sc" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Experience (Years)</label>
                <div className="relative">
                  <div className={iconClass}><Briefcase className="h-4 w-4 text-gray-400" /></div>
                  <input 
                    type="number" 
                    name="experience_years" 
                    value={formData.experience_years} 
                    onChange={handleChange} 
                    className={inputClass} 
                    placeholder="e.g., 5" 
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Joining Date</label>
                <div className="relative">
                  <div className={iconClass}><Calendar className="h-4 w-4 text-gray-400" /></div>
                  <input 
                    type="date" 
                    name="joining_date" 
                    value={formData.joining_date} 
                    onChange={handleChange} 
                    className={inputClass} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mobile Number</label>
                <div className="relative">
                  <div className={iconClass}><Phone className="h-4 w-4 text-gray-400" /></div>
                  <input 
                    type="tel" 
                    name="mobile_number" 
                    value={formData.mobile_number} 
                    onChange={handleChange} 
                    className={inputClass} 
                    placeholder="Enter mobile number" 
                  />
                </div>
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Address</label>
                <div className="relative">
                  <div className="absolute top-2.5 left-0 pl-3 flex items-start pointer-events-none">
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>
                  <textarea 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange} 
                    rows={2}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white outline-none transition-all text-gray-900 placeholder-gray-400 text-sm resize-none"
                    placeholder="Enter full address" 
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Family Information */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <div className="p-1.5 bg-blue-50 rounded-lg"><Users className="w-4 h-4 text-blue-600" /></div>
              <h2 className="font-semibold text-gray-800 text-base">Family Information</h2>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Father's Name</label>
                <div className="relative">
                  <div className={iconClass}><User className="h-4 w-4 text-gray-400" /></div>
                  <input 
                    type="text" 
                    name="father_name" 
                    value={formData.father_name} 
                    onChange={handleChange} 
                    className={inputClass} 
                    placeholder="Father's full name" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mother's Name</label>
                <div className="relative">
                  <div className={iconClass}><User className="h-4 w-4 text-gray-400" /></div>
                  <input 
                    type="text" 
                    name="mother_name" 
                    value={formData.mother_name} 
                    onChange={handleChange} 
                    className={inputClass} 
                    placeholder="Mother's full name" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <div className="p-1.5 bg-purple-50 rounded-lg"><Upload className="w-4 h-4 text-purple-600" /></div>
              <h2 className="font-semibold text-gray-800 text-base">Documents & Photos</h2>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Teacher Photo', name: 'teacher_photo', accept: 'image/*' },
                { label: 'Aadhar Card', name: 'aadhar_card', accept: 'image/*,.pdf' },
              ].map((file) => (
                <div key={file.name}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{file.label}</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50/20 transition-all bg-gray-50/50 min-h-[160px] flex flex-col justify-center">
                    <input 
                      type="file" 
                      name={file.name} 
                      id={file.name} 
                      onChange={handleFileChange} 
                      accept={file.accept} 
                      className="hidden" 
                    />
                    <label htmlFor={file.name} className="cursor-pointer flex flex-col items-center justify-center h-full p-4">
                      {filePreviews[file.name] ? (
                        filePreviews[file.name].startsWith('data:') ? (
                          <>
                            <img 
                              src={filePreviews[file.name]} 
                              alt="Preview" 
                              className="w-20 h-20 object-cover rounded-lg mb-2 shadow border border-emerald-200" 
                            />
                            <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                              ✓ Uploaded
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="bg-emerald-100 rounded-full p-2 mb-2">
                              <CheckCircle className="w-5 h-5 text-emerald-600" />
                            </div>
                            <span className="text-xs text-emerald-600 font-semibold text-center break-all">
                              {filePreviews[file.name]}
                            </span>
                          </>
                        )
                      ) : (
                        <>
                          <div className="bg-emerald-100 rounded-full p-3 mb-2">
                            <Upload className="w-6 h-6 text-emerald-500" />
                          </div>
                          <span className="text-xs text-gray-600 font-medium text-center">Click to upload</span>
                          <span className="text-xs text-gray-400 text-center mt-0.5">
                            JPG, PNG{file.accept.includes('pdf') ? ', PDF' : ''} (Max 5MB)
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
            <button 
              type="button" 
              onClick={resetForm} 
              disabled={loading}
              className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
            >
              Reset
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/admin/teachers')} 
              disabled={loading}
              className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className={`px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-emerald-700 transition ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Adding...</span>
                </>
              ) : (
                <><CheckCircle className="w-4 h-4" /><span>Add Teacher</span></>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default AddTeacher