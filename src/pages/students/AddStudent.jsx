import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, CheckCircle } from 'lucide-react'
import { studentService } from '../../services/studentService'

const AddStudent = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
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

  const [showSuccess, setShowSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // New states for dropdowns
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [loadingSections, setLoadingSections] = useState(false)

  // Fetch classes on component mount
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

  // Fetch sections when class_id changes
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
    
    // If class is changed, clear section
    if (name === 'class_id') {
      setFormData({ 
        ...formData, 
        [name]: value,
        section_id: '' // Clear section when class changes
      })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    if (files && files[0]) {
      const file = files[0]
      setFormData({ ...formData, [name]: file })

      // Create preview for images
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
    setFilePreviews({
      student_photo: null,
      aadhar_card: null,
      father_photo: null,
      mother_photo: null,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await studentService.addStudent(formData)

      // Show success message
      setShowSuccess(true)

      // Reset form immediately
      resetForm()

      // Hide success message after 0.5 seconds
      setTimeout(() => {
        setShowSuccess(false)
      }, 500)

    } catch (error) {
      console.error('Error adding student:', error)
      const message = error?.message || 'Failed to add student. Please try again.'
      // Simple duplicate check
      if (message.toLowerCase().includes('duplicate')) {
        alert('Admission number already exists. Please use a unique one.')
      } else {
        alert(message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 z-50 transform transition-all duration-300 ease-in-out animate-slide-in">
          <CheckCircle className="w-6 h-6" />
          <span className="font-medium">Student added successfully!</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-white rounded-lg transition shadow-sm bg-white/50"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Add New Student</h1>
            <p className="text-gray-600 mt-1">Fill in the student details and upload documents</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
          {/* Basic Information */}
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-blue-500">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[
              { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Enter full name' },
              { label: 'Email', name: 'user_email', type: 'email', placeholder: 'student@example.com' },
              { label: 'Password', name: 'password', type: 'password', placeholder: 'Enter password' },
              { label: 'Admission No', name: 'admission_no', type: 'text', placeholder: 'e.g., 2024001' },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-black mb-2">
                  {field.label} <span className="text-black">*</span>
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                  placeholder={field.placeholder}
                />
              </div>
            ))}

            {/* Class Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class <span className="text-black">*</span>
              </label>
              <select
                name="class_id"
                value={formData.class_id}
                onChange={handleChange}
                className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
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
            </div>

            {/* Section Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section <span className="text-black">*</span>
              </label>
              <select
                name="section_id"
                value={formData.section_id}
                onChange={handleChange}
                className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
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
            </div>

            {/* Gender Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender <span className="text-black">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* File Uploads */}
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-blue-500">
            Documents & Photos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'Student Photo', name: 'student_photo', accept: 'image/*' },
              { label: 'Aadhar Card', name: 'aadhar_card', accept: 'image/*,.pdf' },
              { label: "Father's Photo", name: 'father_photo', accept: 'image/*' },
              { label: "Mother's Photo", name: 'mother_photo', accept: 'image/*' },
            ].map((file) => (
              <div key={file.name}>
                <label className="block text-sm font-medium text-gray-700 mb-3">{file.label}</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-500 transition bg-gray-50 hover:bg-blue-50">
                  <input
                    type="file"
                    name={file.name}
                    id={file.name}
                    onChange={handleFileChange}
                    accept={file.accept}
                    className="hidden"
                  />
                  <label htmlFor={file.name} className="cursor-pointer flex flex-col items-center">
                    {filePreviews[file.name] ? (
                      typeof filePreviews[file.name] === 'string' && filePreviews[file.name].startsWith('data:') ? (
                        <img
                          src={filePreviews[file.name]}
                          alt="Preview"
                          className="w-40 h-40 object-cover rounded-lg mb-3 shadow-md"
                        />
                      ) : (
                        <div className="text-sm text-green-600 font-medium mb-3 bg-green-50 px-4 py-2 rounded-lg">
                          ✓ {filePreviews[file.name]}
                        </div>
                      )
                    ) : (
                      <Upload className="w-16 h-16 text-gray-400 mb-3" />
                    )}
                    <span className="text-sm text-gray-700 font-medium">Click to upload {file.label.toLowerCase()}</span>
                    <span className="text-xs text-gray-500 mt-1">JPG, PNG, PDF (Max 5MB)</span>
                  </label>
                </div>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-10 pt-6 border-t">
            <button
              type="submit"
              disabled={loading}
              className={`bg-blue-600 text-white px-10 py-3 rounded-lg transition font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              {loading ? 'Adding...' : 'Add Student'}
            </button>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="bg-gray-200 text-gray-700 px-10 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddStudent