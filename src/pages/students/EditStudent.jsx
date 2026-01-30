import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Upload, Save, User, Mail, Lock, IdCard, Users, BookOpen, Layers } from 'lucide-react'
import { studentService } from '../../services/studentService/studentService'



const EditStudent = () => {
  const navigate = useNavigate()
  const { id } = useParams()


  /* ========================= 
     State Management - Do NOT Modify Logic
  ========================= */

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const [formData, setFormData] = useState({
    student_id: '',
    name: '',
    user_email: '',
    password: '',
    admission_no: '',
    gender: '',
    class_id: '',
    section_id: '',
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
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [loadingSections, setLoadingSections] = useState(false)


  /* ========================= 
     Fetch Classes - Do NOT Modify
  ========================= */

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


  /* ========================= 
     Fetch Sections - Do NOT Modify
  ========================= */

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


  /* ========================= 
     Fetch Student Data - Do NOT Modify
  ========================= */

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setFetching(true)
        const student = await studentService.getStudentById(id)

        setFormData({
          student_id: student.student_id || '',
          name: student.name || '',
          user_email: student.user_email || '',
          password: '',
          admission_no: student.admission_no || '',
          gender: student.gender || '',
          class_id: student.class_id || '',
          section_id: student.section_id || '',
          student_photo: null,
          aadhar_card: null,
          father_photo: null,
          mother_photo: null,
        })

        if (student.student_photo_url) {
          setFilePreviews((prev) => ({ ...prev, student_photo: student.student_photo_url }))
        }
        if (student.father_photo_url) {
          setFilePreviews((prev) => ({ ...prev, father_photo: student.father_photo_url }))
        }
        if (student.mother_photo_url) {
          setFilePreviews((prev) => ({ ...prev, mother_photo: student.mother_photo_url }))
        }
        if (student.aadhar_card_url) {
          setFilePreviews((prev) => ({ ...prev, aadhar_card: student.aadhar_card_url }))
        }
      } catch (error) {
        console.error('Error fetching student:', error)
        alert('Failed to load student data')
        navigate('/admin/students')
      } finally {
        setFetching(false)
      }
    }

    if (id) {
      fetchStudent()
    }
  }, [id, navigate])


  /* ========================= 
     Form Handlers - Do NOT Modify Logic
  ========================= */

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'class_id') {
      setFormData({ 
        ...formData, 
        [name]: value,
        section_id: ''
      })
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value })
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.student_id) {
        throw new Error('Student ID missing')
      }

      await studentService.updateStudent(formData.student_id, formData)
      alert('Student updated successfully!')
      navigate(`/admin/students`)
    } catch (error) {
      console.error('Error updating student:', error)
      alert(error.message || 'Failed to update student')
    } finally {
      setLoading(false)
    }
  }


  /* ========================= 
     Loading State UI
  ========================= */

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
            <User className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-700 text-lg mt-6 font-medium">Loading student data...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait a moment</p>
        </div>
      </div>
    )
  }


  /* ========================= 
     Main UI Rendering
  ========================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      
      <div className="max-w-6xl mx-auto">
        
        {/* ========================= 
            Page Header with Breadcrumb
        ========================= */}
        
        <div className="mb-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span className="hover:text-blue-600 cursor-pointer transition">Dashboard</span>
            <span>/</span>
            <span className="hover:text-blue-600 cursor-pointer transition" onClick={() => navigate('/admin/students')}>Students</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">Edit Student</span>
          </div>

          {/* Header with Back Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/students')}
              className="p-3 bg-white hover:bg-gray-50 rounded-xl transition shadow-sm border border-gray-200 hover:border-blue-300 group"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700 group-hover:text-blue-600 transition" />
            </button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">Edit Student</h1>
              <p className="text-gray-600">Update student information and documents</p>
            </div>
          </div>
        </div>

            
        {/* ========================= 
            Main Form Card
        ========================= */}
        
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          
          {/* ========================= 
              Basic Information Section
          ========================= */}
          
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-500">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Full Name Input */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400"
                    required
                    placeholder="Enter student's full name"
                  />
                </div>
              </div>


              {/* Email Input */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition" />
                  </div>
                  <input
                    type="email"
                    name="user_email"
                    value={formData.user_email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400"
                    required
                    placeholder="student@example.com"
                  />
                </div>
              </div>


              {/* Password Input */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400"
                    placeholder="Leave blank to keep current password"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">Leave blank if you don't want to change the password</p>
              </div>


              {/* Admission Number Input */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Admission Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IdCard className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition" />
                  </div>
                  <input
                    type="text"
                    name="admission_no"
                    value={formData.admission_no}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400"
                    required
                    placeholder="e.g., 2024001"
                  />
                </div>
              </div>


              {/* Class Dropdown */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Class <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BookOpen className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition" />
                  </div>
                  <select
                    name="class_id"
                    value={formData.class_id}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 appearance-none cursor-pointer bg-white"
                    required
                    disabled={loadingClasses}
                  >
                    <option value="">Select Class</option>
                    {loadingClasses ? (
                      <option disabled>Loading classes...</option>
                    ) : (
                      classes.map((cls) => (
                        <option key={cls.class_id} value={cls.class_id}>
                          {cls.class_name || `Class ${cls.class_id}`}
                        </option>
                      ))
                    )}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>


              {/* Section Dropdown */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Section <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Layers className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition" />
                  </div>
                  <select
                    name="section_id"
                    value={formData.section_id}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 appearance-none cursor-pointer bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                    required
                    disabled={!formData.class_id || loadingSections}
                  >
                    <option value="">Select Section</option>
                    {!formData.class_id ? (
                      <option disabled>Please select a class first</option>
                    ) : loadingSections ? (
                      <option disabled>Loading sections...</option>
                    ) : sections.length === 0 ? (
                      <option disabled>No sections available</option>
                    ) : (
                      sections.map((section) => (
                        <option key={section.section_id} value={section.section_id}>
                          {section.section_name || `Section ${section.section_id}`}
                        </option>
                      ))
                    )}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>


              {/* Gender Dropdown */}
              <div className="group md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <div className="relative max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition" />
                  </div>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 appearance-none cursor-pointer bg-white"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

            </div>
          </div>


          {/* Divider */}
          <div className="border-t border-gray-100"></div>


          {/* ========================= 
              Documents & Photos Section
          ========================= */}
          
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-purple-500">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Upload className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Documents & Photos</h2>
                <p className="text-sm text-gray-600 mt-1">Upload new files to replace existing ones</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {[
                { label: 'Student Photo', name: 'student_photo', accept: 'image/*' },
                { label: 'Aadhar Card', name: 'aadhar_card', accept: 'image/*,.pdf' },
                { label: "Father's Photo", name: 'father_photo', accept: 'image/*' },
                { label: "Mother's Photo", name: 'mother_photo', accept: 'image/*' },
              ].map((file) => (
                <div key={file.name} className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    {file.label}
                  </label>
                  
                  <div className="relative border-2 border-dashed border-gray-300 rounded-2xl p-6 hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 bg-gray-50/50 cursor-pointer group-hover:shadow-md h-full min-h-[200px] flex flex-col justify-center">
                    <input
                      type="file"
                      name={file.name}
                      id={file.name}
                      onChange={handleFileChange}
                      accept={file.accept}
                      className="hidden"
                    />
                    
                    <label 
                      htmlFor={file.name} 
                      className="cursor-pointer flex flex-col items-center justify-center h-full"
                    >
                      {filePreviews[file.name] ? (
                        typeof filePreviews[file.name] === 'string' && 
                        (filePreviews[file.name].startsWith('data:') || filePreviews[file.name].startsWith('http')) ? (
                          <>
                            <img
                              src={filePreviews[file.name]}
                              alt="Preview"
                              className="w-28 h-28 object-cover rounded-xl mb-3 shadow-lg border-2 border-blue-200"
                            />
                            <span className="text-xs text-blue-600 font-semibold">
                              Click to replace
                            </span>
                          </>
                        ) : (
                          <div className="text-center">
                            <div className="bg-green-100 rounded-full p-3 mb-3 mx-auto w-fit">
                              <Upload className="w-8 h-8 text-green-600" />
                            </div>
                            <span className="text-sm text-green-600 font-semibold block mb-2">
                              {filePreviews[file.name]}
                            </span>
                            <span className="text-xs text-blue-600">
                              Click to replace
                            </span>
                          </div>
                        )
                      ) : (
                        <>
                          <div className="bg-blue-100 rounded-full p-4 mb-4 group-hover:bg-blue-200 transition">
                            <Upload className="w-10 h-10 text-blue-600" />
                          </div>
                          <span className="text-sm text-gray-700 font-medium mb-1 text-center">
                            Click to upload
                          </span>
                          <span className="text-xs text-gray-500 text-center">
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


          {/* Divider */}
          <div className="border-t border-gray-100"></div>


          {/* ========================= 
              Action Buttons Footer
          ========================= */}
          
          <div className="p-6 sm:p-8 bg-gray-50/50">
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                type="button"
                onClick={() => navigate('/admin/students')}
                className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition font-semibold shadow-sm order-2 sm:order-1"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className={`px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl transition font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 order-1 sm:order-2 ${
                  loading ? 'opacity-70 cursor-not-allowed' : 'hover:from-green-700 hover:to-green-800'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Update Student</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>


      </div>


    </div>
  )
}


export default EditStudent