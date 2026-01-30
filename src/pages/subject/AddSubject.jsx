// src/pages/AddSubject.js
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, BookOpen, Loader } from 'lucide-react'
import { subjectService } from '../../services/subjectService/subjectService'

const AddSubject = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    subject_name: '',
  })

  const [showSuccess, setShowSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!formData.subject_name.trim()) {
        throw new Error('Subject name is required')
      }

      if (formData.subject_name.length < 2) {
        throw new Error('Subject name must be at least 2 characters')
      }

      const result = await subjectService.addSubject(formData)
      console.log('Add subject result:', result)

      if (result.success) {
        setShowSuccess(true)
        setTimeout(() => {
          setShowSuccess(false)
          navigate('/admin/subjects')
        }, 1500)
      } else {
        throw new Error(result.message || 'Failed to add subject')
      }
    } catch (err) {
      console.error('Error adding subject:', err)
      setError(err.message)
      
      const errMsg = err.message.toLowerCase()
      if (errMsg.includes('duplicate') || errMsg.includes('already exists')) {
        alert('Subject name already exists. Please use a unique name.')
      } else {
        alert(`Error: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-bounce z-50">
          <CheckCircle className="w-6 h-6" />
          <span className="font-medium">Subject added successfully!</span>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/admin/subjects')}
            className="p-2 hover:bg-white rounded-lg transition shadow-sm bg-white/50"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Add New Subject</h1>
            <p className="text-gray-600 mt-1">Fill in the subject details</p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-purple-500 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-600" />
            Subject Information
          </h2>
          
          {/* Subject Name */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Subject Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="subject_name"
              value={formData.subject_name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition text-gray-900"
              required
              placeholder="e.g., Mathematics, English, Science"
              minLength={2}
              maxLength={100}
            />
            <p className="text-gray-500 text-xs mt-2">
              Enter a unique subject name (2-100 characters)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-10 pt-6 border-t">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg transition font-semibold shadow-lg hover:shadow-xl ${
                loading 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-purple-700 hover:-translate-y-0.5'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="animate-spin h-5 w-5" />
                  Adding...
                </span>
              ) : 'Add Subject'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/subject')}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddSubject