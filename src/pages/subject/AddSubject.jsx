import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, AlertCircle, CheckCircle } from 'lucide-react'
import { subjectService } from '../../services/subjectService'

function AddSubject() {
  const navigate = useNavigate()
  
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [formData, setFormData] = useState({
    subject_name: ''
  })

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
      
      // Prepare data for API
      const subjectData = {
        subject_name: formData.subject_name.trim()
      }
      
      console.log('Creating subject with data:', subjectData)
      
      // Call API
      const response = await subjectService.createSubject(subjectData)
      console.log('Create response:', response)
      
      // Show success message
      setSuccessMessage('Subject created successfully!')
      
      // Reset form
      setFormData({ subject_name: '' })
      
      // Navigate back to list after 2 seconds
      setTimeout(() => {
        navigate('/admin/subjects')
      }, 2000)
      
    } catch (error) {
      console.error('Error creating subject:', error)
      setServerError(error.message || 'Failed to create subject. Please try again.')
    } finally {
      setSaving(false)
    }
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
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Subject</h1>
            <p className="text-gray-600 mt-2">
              Create a new subject for your school
            </p>
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
                placeholder="Enter subject name (e.g., Mathematics, Science, English)"
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
              <p className="mt-2 text-sm text-gray-500">
                Enter the full name of the subject. This will be displayed to students and teachers.
              </p>
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
                    Creating Subject...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Create Subject
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

export default AddSubject