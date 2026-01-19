import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { classService } from '../../services/classService'

const EditClass = () => {
  const navigate = useNavigate()
  const { id } = useParams() // Get class_id from URL

  const [formData, setFormData] = useState({
    class_name: '',
    class_order: '',
    class_details: '',
    status: '1' // Default to active (1)
  })

  const [originalData, setOriginalData] = useState(null) // Store original data for reset
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  // Fetch class data on component mount
  // useEffect(() => {
  //   const fetchClassData = async () => {
  //     if (!id) {
  //       setErrorMessage('No class ID provided')
  //       setShowError(true)
  //       setFetching(false)
  //       return
  //     }

  //     try {
  //       setFetching(true)
  //       console.log('Fetching class data for ID:', id)
        
  //       const classData = await classService.getClassById(id)
  //       console.log('Fetched class data:', classData)
        
  //       const data = {
  //         class_name: classData.class_name || '',
  //         class_order: classData.class_order?.toString() || '',
  //         class_details: classData.class_details || '',
  //         status: classData.status?.toString() || '1'
  //       }
        
  //       setFormData(data)
  //       setOriginalData(data) // Store original data
  //     } catch (error) {
  //       console.error('Error fetching class:', error)
  //       setErrorMessage(error.message || 'Failed to load class data')
  //       setShowError(true)
  //       setTimeout(() => setShowError(false), 5000)
  //     } finally {
  //       setFetching(false)
  //     }
  //   }

  //   fetchClassData()
  // }, [id])

  useEffect(() => {
  const fetchClassData = async () => {
    try {
      setFetching(true)

      const res = await classService.getAllClasses()

      const foundClass = res.data.find(
        (c) => c.class_id === Number(id)
      )

      if (!foundClass) {
        throw new Error('Class not found')
      }

      const data = {
        class_name: foundClass.class_name || '',
        class_order: foundClass.class_order?.toString() || '',
        class_details: foundClass.class_details || '',
        status: foundClass.status?.toString() || '1',
      }

      setFormData(data)
      setOriginalData(data)
    } catch (error) {
      console.error(error)
      setErrorMessage(error.message || 'Failed to load class data')
      setShowError(true)
    } finally {
      setFetching(false)
    }
  }

  fetchClassData()
}, [id])


  const handleChange = (e) => {
    const { name, value } = e.target
    
    // For class_order, only allow numbers
    if (name === 'class_order') {
      if (value === '' || /^\d+$/.test(value)) {
        setFormData({ ...formData, [name]: value })
      }
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const validateForm = () => {
    if (!formData.class_name.trim()) {
      setErrorMessage('Class name is required')
      return false
    }
    if (!formData.class_order.trim()) {
      setErrorMessage('Class order is required')
      return false
    }
    if (!formData.class_details.trim()) {
      setErrorMessage('Class details are required')
      return false
    }

    // Validate class_order is a number
    if (isNaN(formData.class_order) || parseInt(formData.class_order) <= 0) {
      setErrorMessage('Class order must be a positive number')
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
      // Prepare data for API - MUST include class_id
      const classData = {
        class_id: parseInt(id), // Use the ID from URL params
        class_name: formData.class_name.trim(),
        class_order: parseInt(formData.class_order),
        class_details: formData.class_details.trim(),
        status: parseInt(formData.status)
      }

      console.log('Updating class with data:', classData)
      
      const response = await classService.updateClass(classData)
      console.log('Update response:', response)

      // Success
      setShowSuccess(true)

      // Redirect after 2 seconds
      setTimeout(() => {
        setShowSuccess(false)
        navigate('/admin/classes')
      }, 2000)
    } catch (error) {
      console.error('Error updating class:', error)
      setErrorMessage(error.message || 'Failed to update class. Please try again.')
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    // Reset to original values
    if (originalData) {
      setFormData({ ...originalData })
    }
  }

  // Show loading while fetching data
  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Loading class data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 p-6">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-slide-in">
          <CheckCircle className="w-6 h-6" />
          <span className="font-medium">Class updated successfully!</span>
        </div>
      )}

      {/* Error Message */}
      {showError && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-slide-in">
          <AlertCircle className="w-6 h-6" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/admin/classes')}
            className="p-2 hover:bg-white rounded-lg transition shadow-sm bg-white/50"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Edit Class</h1>
            <p className="text-gray-600 mt-1">Update class information and details</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Class Information */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-orange-500">
              Class Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Class Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="class_name"
                  value={formData.class_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                  required
                  placeholder="e.g., Class 10th, B.Com 1st Year"
                />
              </div>

              {/* Class Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Order <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="class_order"
                  value={formData.class_order}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                  required
                  placeholder="e.g., 1, 2, 3"
                  inputMode="numeric"
                  pattern="\d*"
                />
                <p className="text-xs text-gray-500 mt-1">Numeric order for sorting classes</p>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status <span className="text-red-600">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                  required
                >
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Set class status</p>
              </div>

              {/* Class Details */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Details <span className="text-red-600">*</span>
                </label>
                <textarea
                  name="class_details"
                  value={formData.class_details}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition resize-none"
                  rows="4"
                  required
                  placeholder="e.g., Science Stream, Commerce Section, Details about class curriculum, subjects, etc."
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-10 pt-6 border-t">
              <button
                type="submit"
                disabled={loading}
                className={`bg-gradient-to-r from-orange-600 to-orange-700 text-white px-10 py-3 rounded-lg transition font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:from-orange-700 hover:to-orange-800'
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Updating...
                  </span>
                ) : (
                  'Update Class'
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
                onClick={() => navigate('/admin/classes')}
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

export default EditClass