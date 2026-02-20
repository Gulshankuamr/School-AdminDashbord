import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, CheckCircle, AlertCircle, Phone, MapPin, User, Users } from 'lucide-react'
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

  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    if (files && files[0]) {
      const file = files[0]

      if (file.size > 5 * 1024 * 1024) {
        alert('File size should not exceed 5MB')
        return
      }

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

  const validateForm = () => {
    if (!formData.name.trim()) {
      setErrorMessage('Name is required')
      return false
    }
    if (!formData.user_email.trim()) {
      setErrorMessage('Email is required')
      return false
    }
    if (!formData.password.trim()) {
      setErrorMessage('Password is required')
      return false
    }
    if (!formData.gender) {
      setErrorMessage('Gender is required')
      return false
    }
    if (!formData.qualification.trim()) {
      setErrorMessage('Qualification is required')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.user_email)) {
      setErrorMessage('Please enter a valid email')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      setShowError(true)
      setTimeout(() => setShowError(false), 3000)
      return
    }

    setLoading(true)
    setShowError(false)

    try {
      await teacherService.addTeacher(formData)

      setShowSuccess(true)
      
      setTimeout(() => {
        setShowSuccess(false)
        navigate('/admin/teachers')
      }, 2000)
    } catch (error) {
      console.error('Error adding teacher:', error)
      setErrorMessage(error.message || 'Failed to add teacher. Please try again.')
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
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
    setFilePreviews({
      teacher_photo: null,
      aadhar_card: null,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-slide-in">
          <CheckCircle className="w-6 h-6" />
          <span className="font-medium">Teacher added successfully!</span>
        </div>
      )}

      {/* Error Message */}
      {showError && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-slide-in">
          <AlertCircle className="w-6 h-6" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/admin/teachers')}
            className="p-2 hover:bg-white rounded-lg transition shadow-sm bg-white/50"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Add New Teacher</h1>
            <p className="text-gray-600 mt-1">Fill in the teacher details and upload documents</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-xl p-8">

            {/* ========================= 
                Basic Information
            ========================= */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-green-500">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {[
                { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Enter full name', required: true },
                { label: 'Email', name: 'user_email', type: 'email', placeholder: 'teacher@example.com', required: true },
                { label: 'Password', name: 'password', type: 'password', placeholder: 'Enter password', required: true },
                { label: 'Qualification', name: 'qualification', type: 'text', placeholder: 'e.g., M.Ed, B.Sc', required: true },
                { label: 'Experience (Years)', name: 'experience_years', type: 'text', placeholder: 'e.g., 5', required: false },
                { label: 'Joining Date', name: 'joining_date', type: 'date', placeholder: '', required: false },
                { label: 'Mobile Number', name: 'mobile_number', type: 'tel', placeholder: 'Enter mobile number', required: false },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label} {field.required && <span className="text-red-600">*</span>}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                    required={field.required}
                    placeholder={field.placeholder}
                  />
                </div>
              ))}

              {/* Gender Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender <span className="text-red-600">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Address - full width */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition resize-none"
                  placeholder="Enter full address"
                />
              </div>
            </div>


            {/* ========================= 
                Family Information
            ========================= */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-green-500">
              Family Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Father's Name
                </label>
                <input
                  type="text"
                  name="father_name"
                  value={formData.father_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                  placeholder="Enter father's full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mother's Name
                </label>
                <input
                  type="text"
                  name="mother_name"
                  value={formData.mother_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                  placeholder="Enter mother's full name"
                />
              </div>
            </div>


            {/* ========================= 
                Documents & Photos
            ========================= */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-green-500">
              Documents & Photos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Teacher Photo', name: 'teacher_photo', accept: 'image/*' },
                { label: 'Aadhar Card', name: 'aadhar_card', accept: 'image/*,.pdf' },
              ].map((file) => (
                <div key={file.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-3">{file.label}</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-green-500 transition bg-gray-50 hover:bg-green-50">
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
                className={`bg-green-600 text-white px-10 py-3 rounded-lg transition font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Adding...
                  </span>
                ) : (
                  'Add Teacher'
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 text-gray-700 px-10 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
                disabled={loading}
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/teachers')}
                className="bg-gray-200 text-gray-700 px-10 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddTeacher