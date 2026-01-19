import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Upload } from 'lucide-react'
import { teacherService } from '../../services/teacherService'

const EditTeacher = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  
  const [formData, setFormData] = useState({
    name: '',
    user_email: '',
    qualification: '',
    experience_years: '',
    joining_date: '',
    teacher_photo: null,
  })

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [aadharPreview, setAadharPreview] = useState(null)
  const [aadharFile, setAadharFile] = useState(null)

  // Fetch teacher data
  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Fetching teacher with ID:', id)
        const data = await teacherService.getTeacherById(id)
        
        console.log('Teacher data received:', data)
        
        // Populate form with existing data
        setFormData({
          name: data.name || '',
          user_email: data.user_email || '',
          qualification: data.qualification || '',
          experience_years: data.experience_years?.toString() || '',
          joining_date: data.joining_date
            ? data.joining_date.split('T')[0]
            : '',
          teacher_photo: null,
        })
        
        // Set photo preview if exists
        if (data.teacher_photo_url) {
          setPhotoPreview(data.teacher_photo_url)
        }
        
        if (data.aadhar_card_url) {
          setAadharPreview(data.aadhar_card_url)
        }
        
      } catch (err) {
        console.error('Error fetching teacher:', err)
        setError(err.message || 'Failed to load teacher data')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchTeacherData()
    }
  }, [id])

  // Handle file upload
  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0]
    if (file) {
      if (fieldName === 'teacher_photo') {
        setFormData({ ...formData, teacher_photo: file })
        
        // Create preview
        const reader = new FileReader()
        reader.onloadend = () => {
          setPhotoPreview(reader.result)
        }
        reader.readAsDataURL(file)
      }
      
      if (fieldName === 'aadhar_card') {
        setAadharFile(file)
        
        // Create preview for images
        if (file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onloadend = () => {
            setAadharPreview(reader.result)
          }
          reader.readAsDataURL(file)
        }
      }
    }
  }

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setSubmitting(true)
      setError(null)

      // Prepare form data according to API requirements
      const formDataToSend = new FormData()
      
      // Required fields
      formDataToSend.append('teacher_id', id)
      formDataToSend.append('name', formData.name)
      formDataToSend.append('user_email', formData.user_email)
      
      // Optional fields (only if they have value)
      if (formData.qualification) {
        formDataToSend.append('qualification', formData.qualification)
      }
      
      if (formData.experience_years) {
        formDataToSend.append('experince_years', formData.experience_years) // Note: API uses 'experince_years' not 'experience_years'
      }
      
      if (formData.joining_date) {
        formDataToSend.append('joining_date', formData.joining_date)
      }
      
      if (formData.teacher_photo) {
        formDataToSend.append('teacher_photo', formData.teacher_photo)
      }
      
      if (aadharFile) {
        formDataToSend.append('aadhar_card', aadharFile)
      }
      
      // Debug: Log what we're sending
      console.log('📤 Sending update request with:', {
        teacher_id: id,
        name: formData.name,
        user_email: formData.user_email,
        qualification: formData.qualification,
        experience_years: formData.experience_years,
        joining_date: formData.joining_date,
        has_teacher_photo: !!formData.teacher_photo,
        has_aadhar_card: !!aadharFile
      })

      // Send update request using service
      const result = await teacherService.updateTeacher(id, formData)
      
      console.log('✅ Teacher updated:', result)
      
      alert('Teacher updated successfully!')
      navigate('/admin/teachers')
      
    } catch (err) {
      console.error('❌ Error updating teacher:', err)
      // Check for specific error message about 'email' column
      const errorMsg = err.message.includes("'email'") 
        ? 'API Error: Please check backend expects "user_email" not "email"'
        : err.message || 'Failed to update teacher'
      
      setError(errorMsg)
      alert('Error: ' + errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg font-medium">Loading teacher data...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !formData.name) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-100 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-6">
            Note: API expects 'user_email' field, not 'email'
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/admin/teachers')}
              className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate('/admin/teachers')} 
            className="p-3 hover:bg-white rounded-xl transition shadow-sm bg-white/50"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Teacher</h1>
            <p className="text-gray-600 mt-1">Update teacher information</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">
                <span className="font-bold">Error:</span> {error}
              </p>
              <p className="text-red-500 text-xs mt-1">
                Note: Ensure 'user_email' field is being sent correctly to API
              </p>
            </div>
          )}

          {/* Basic Information */}
          <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-green-500">
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                required
                placeholder="Enter full name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="user_email"
                value={formData.user_email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                required
                placeholder="teacher@example.com"
              />
              <p className="text-xs text-gray-500 mt-1">Note: API expects 'user_email' field</p>
            </div>

            {/* Qualification */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qualification
              </label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                placeholder="M.Tech, B.Ed, etc."
              />
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience (Years)
              </label>
              <input
                type="number"
                name="experience_years"
                value={formData.experience_years}
                onChange={handleChange}
                min="0"
                max="50"
                className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">Will be sent as 'experince_years' to API</p>
            </div>

            {/* Joining Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Joining Date
              </label>
              <input
                type="date"
                name="joining_date"
                value={formData.joining_date}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
              />
            </div>
          </div>

          {/* File Uploads */}
          <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-green-500">
            Documents & Photos
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Teacher Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Teacher Photo
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-green-500 transition bg-gray-50">
                <input
                  type="file"
                  id="teacher_photo"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'teacher_photo')}
                  className="hidden"
                />
                <label htmlFor="teacher_photo" className="cursor-pointer flex flex-col items-center">
                  {photoPreview ? (
                    <div className="relative">
                      <img
                        src={photoPreview}
                        alt="Teacher Preview"
                        className="w-32 h-32 rounded-full object-cover mb-3 shadow-md"
                      />
                      <div className="absolute bottom-1 right-1 bg-green-500 text-white p-1 rounded-full">
                        <Upload className="w-4 h-4" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <span className="text-sm text-gray-700 font-medium">Upload Profile Photo</span>
                  <span className="text-xs text-gray-500">JPG, PNG (Max 5MB)</span>
                </label>
              </div>
            </div>

            {/* Aadhar Card */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Aadhar Card
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-green-500 transition bg-gray-50">
                <input
                  type="file"
                  id="aadhar_card"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(e, 'aadhar_card')}
                  className="hidden"
                />
                <label htmlFor="aadhar_card" className="cursor-pointer flex flex-col items-center">
                  {aadharPreview ? (
                    typeof aadharPreview === 'string' && aadharPreview.startsWith('data:') ? (
                      <div className="relative">
                        <img
                          src={aadharPreview}
                          alt="Aadhar Preview"
                          className="w-32 h-32 object-cover rounded-lg mb-3"
                        />
                        <div className="absolute bottom-1 right-1 bg-green-500 text-white p-1 rounded-full">
                          <Upload className="w-4 h-4" />
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-green-600 font-medium mb-3 bg-green-50 px-4 py-2 rounded-lg">
                        ✓ File Selected
                      </div>
                    )
                  ) : (
                    <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <span className="text-sm text-gray-700 font-medium">Upload Aadhar Card</span>
                  <span className="text-xs text-gray-500">JPG, PNG, PDF (Max 5MB)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Info Box */}
        

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <button 
              type="submit" 
              disabled={submitting}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white border-solid mr-2"></div>
                  Updating...
                </>
              ) : 'Update Teacher'}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/admin/teachers')}
              className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditTeacher