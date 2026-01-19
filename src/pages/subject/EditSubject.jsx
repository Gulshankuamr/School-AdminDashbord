import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { ArrowLeft, Save, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { subjectService } from '../../services/subjectService'

function EditSubject() {
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [formData, setFormData] = useState({
    subject_id: id,
    subject_name: ''
  })

  // Fetch subject data on mount
//  useEffect(() => {
//   const fetchSubject = async () => {
//     try {
//       setLoading(true)

//       // ✅ CASE 1: Data aaya hai SubjectList se (FAST)
//       if (location.state?.subject) {
//         const { subject } = location.state

//         setFormData({
//           subject_id: subject.subject_id,
//           subject_name: subject.subject_name || ''
//         })
//       } 
//       // ✅ CASE 2: Page refresh / direct URL hit
//       else {
//         const response = await subjectService.getAllSubjects()

//         const subject = response.data.find(
//           (s) => String(s.subject_id) === String(id)
//         )

//         if (subject) {
//           setFormData({
//             subject_id: subject.subject_id,
//             subject_name: subject.subject_name || ''
//           })
//         } else {
//           setServerError('Subject not found')
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching subject:', error)
//       setServerError(error.message || 'Failed to load subject details')
//     } finally {
//       setLoading(false)
//     }
//   }

//   fetchSubject()
// }, [id, location.state])


useEffect(() => {
  const fetchSubject = async () => {
    try {
      setLoading(true)

      if (location.state?.subject) {
        // Case 1: Fast load from list
        const { subject } = location.state
        setFormData({
          subject_id: subject.subject_id,
          subject_name: subject.subject_name || ''
        })
      } else {
        // Case 2: Page refresh / direct URL hit
        const response = await subjectService.getAllSubjects()
        const subject = response.data.find(s => String(s.subject_id) === String(id))

        if (subject) {
          setFormData({
            subject_id: subject.subject_id,
            subject_name: subject.subject_name || ''
          })
        } else {
          setServerError('Subject not found')
        }
      }
    } catch (error) {
      setServerError(error.message || 'Failed to fetch subject')
    } finally {
      setLoading(false)
    }
  }

  fetchSubject()
}, [id, location.state])


  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
    
    // Clear server error
    if (serverError) {
      setServerError('')
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.subject_name.trim()) {
      newErrors.subject_name = 'Subject name is required'
    } else if (formData.subject_name.trim().length < 2) {
      newErrors.subject_name = 'Subject name must be at least 2 characters'
    } else if (formData.subject_name.trim().length > 100) {
      newErrors.subject_name = 'Subject name is too long (max 100 characters)'
    }
    
    return newErrors
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    
    try {
      setSaving(true)
      setServerError('')
      
      // Prepare data for API - matching the API structure
      const subjectData = {
        subject_id: parseInt(formData.subject_id),
        subject_name: formData.subject_name.trim()
      }
      
      // Call API
      const response = await subjectService.updateSubject(subjectData)
      
      // Show success message
      setSuccessMessage('Subject updated successfully!')
      
      // Navigate back to list after 2 seconds
      setTimeout(() => {
        navigate('/admin/subjects')
      }, 2000)
      
    } catch (error) {
      console.error('Error updating subject:', error)
      setServerError(error.message || 'Failed to update subject')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-700 text-lg">Loading subject details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/subjects')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Subjects</span>
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Subject</h1>
              <p className="text-gray-600 mt-2">
                Update subject details for ID: <span className="font-semibold">#{formData.subject_id}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">{successMessage}</p>
                <p className="text-green-700 text-sm mt-1">Redirecting to subjects list...</p>
              </div>
            </div>
          </div>
        )}

        {/* Server Error */}
        {serverError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <p className="font-semibold text-red-800">Error</p>
                <p className="text-red-700">{serverError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <form onSubmit={handleSubmit}>
            {/* Subject ID (Read-only) */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Subject ID
              </label>
              <div className="px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-700">
                #{formData.subject_id}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Subject ID cannot be changed. It is a unique identifier.
              </p>
            </div>

            {/* Subject Name */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Subject Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="subject_name"
                value={formData.subject_name}
                onChange={handleChange}
                placeholder="Enter subject name"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.subject_name ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500`}
                disabled={saving || successMessage}
              />
              {errors.subject_name && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.subject_name}
                </p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/admin/subjects')}
                disabled={saving}
                className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-medium shadow-sm disabled:opacity-50"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={saving || successMessage}
                className="flex-1 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition font-medium shadow-lg hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Updating Subject...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Update Subject
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditSubject