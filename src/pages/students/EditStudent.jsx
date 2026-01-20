import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Upload } from 'lucide-react'
import { studentService } from '../../services/studentService'

const EditStudent = () => {
  const navigate = useNavigate()
  const { id } = useParams() // student_id from URL
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

  // Fetch student data on mount
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setFetching(true)
        const student = await studentService.getStudentById(id)

        setFormData({
          student_id: student.student_id || '',
          name: student.name || '',
          user_email: student.user_email || '',
          password: '', // Don't prefill password
          admission_no: student.admission_no || '',
          gender: student.gender || '',
          class_id: student.class_id || '',
          section_id: student.section_id || '',
          student_photo: null,
          aadhar_card: null,
          father_photo: null,
          mother_photo: null,
        })

        // Set previews for existing images
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
      setFormData({ ...formData, [e.target.name]: e.target.value })
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

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading student data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/admin/students')}
            className="p-2 hover:bg-white rounded-lg transition shadow-sm bg-white/50"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Edit Student</h1>
            <p className="text-gray-600 mt-1">Update student details</p>
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
              { label: 'Password', name: 'password', type: 'password', placeholder: 'Leave blank to keep current' },
              { label: 'Admission No', name: 'admission_no', type: 'text', placeholder: 'e.g., 2024001' },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-black mb-2">
                  {field.label} {field.name !== 'password' && <span className="text-black">*</span>}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required={field.name !== 'password'}
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
                      ) : typeof filePreviews[file.name] === 'string' && filePreviews[file.name].startsWith('http') ? (
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
              {loading ? 'Updating...' : 'Update Student'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/students')}
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

export default EditStudent