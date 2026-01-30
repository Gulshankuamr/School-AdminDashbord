import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, CheckCircle, AlertCircle } from 'lucide-react'
// import { accountantService } from '../../services/accountantService'
import { accountantService } from '../../services/accountendService/accountantService'


const AddAccountant = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    user_email: '',
    password: '',
    qualification: '',
    accountant_photo: null,
    aadhar_card: null,
  })

  const [filePreviews, setFilePreviews] = useState({
    accountant_photo: null,
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

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should not exceed 5MB')
        return
      }

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
    if (!formData.qualification.trim()) {
      setErrorMessage('Qualification is required')
      return false
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.user_email)) {
      setErrorMessage('Please enter a valid email')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form
    if (!validateForm()) {
      setShowError(true)
      setTimeout(() => setShowError(false), 3000)
      return
    }

    setLoading(true)
    setShowError(false)

    try {
      await accountantService.addAccountant(formData)

      // Success
      setShowSuccess(true)

      // Redirect after 2 seconds
      setTimeout(() => {
        setShowSuccess(false)
        navigate('/admin/accountants')
      }, 2000)
    } catch (error) {
      console.error('Error adding accountant:', error)
      setErrorMessage(error.message || 'Failed to add accountant. Please try again.')
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
      qualification: '',
      accountant_photo: null,
      aadhar_card: null,
    })
    setFilePreviews({
      accountant_photo: null,
      aadhar_card: null,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-slide-in">
          <CheckCircle className="w-6 h-6" />
          <span className="font-medium">Accountant added successfully!</span>
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
            onClick={() => navigate('/admin/accountants')}
            className="p-2 hover:bg-white rounded-lg transition shadow-sm bg-white/50"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Add New Accountant</h1>
            <p className="text-gray-600 mt-1">Fill in the accountant details and upload documents</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Basic Information */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-purple-500">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {[
                { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Enter full name', required: true },
                { label: 'Email', name: 'user_email', type: 'email', placeholder: 'accountant@example.com', required: true },
                { label: 'Password', name: 'password', type: 'password', placeholder: 'Enter password', required: true },
                { label: 'Qualification', name: 'qualification', type: 'text', placeholder: 'e.g., CA, MBA Finance', required: true },
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
                    className="w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                    required={field.required}
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
            </div>

            {/* File Uploads */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-purple-500">
              Documents & Photos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Accountant Photo', name: 'accountant_photo', accept: 'image/*' },
                { label: 'Aadhar Card', name: 'aadhar_card', accept: 'image/*,.pdf' },
              ].map((file) => (
                <div key={file.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-3">{file.label}</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-purple-500 transition bg-gray-50 hover:bg-purple-50">
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
                className={`bg-purple-600 text-white px-10 py-3 rounded-lg transition font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700'
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
                  'Add Accountant'
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
                onClick={() => navigate('/admin/accountants')}
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

export default AddAccountant