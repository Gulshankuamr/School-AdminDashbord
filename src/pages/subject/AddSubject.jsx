// src/pages/AddSubject.js
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, BookOpen, Loader, ChevronDown } from 'lucide-react'
import { subjectService } from '../../services/subjectService/subjectService'

// API POST expects: 'scholastic' | 'co_scholastic' (lowercase)
const ASSESSMENT_MODEL_OPTIONS = [
  { value: 'scholastic',    label: 'Scholastic',    description: 'Academic subjects with graded assessments' },
  { value: 'co_scholastic', label: 'Co-Scholastic', description: 'Co-curricular & activity-based subjects' },
]

const AddSubject = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    subject_name:     '',
    assessment_model: '',
  })

  const [showSuccess, setShowSuccess] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const handleAssessmentSelect = (value) => {
    setFormData(prev => ({ ...prev, assessment_model: value }))
    setDropdownOpen(false)
    if (error) setError('')
  }

  const selectedOption = ASSESSMENT_MODEL_OPTIONS.find(o => o.value === formData.assessment_model)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Frontend validation
    if (!formData.subject_name.trim()) {
      setError('Subject name is required')
      return
    }
    if (formData.subject_name.trim().length < 2) {
      setError('Subject name must be at least 2 characters')
      return
    }
    if (!formData.assessment_model) {
      setError('Please select an assessment model')
      return
    }

    setLoading(true)

    try {
      // POST /createSubject → { success: true, message: "...", data: { subject_id: 99 } }
      // Note: API only returns subject_id, NOT the full subject object
      // So we navigate back to the list which will re-fetch all subjects
      const result = await subjectService.addSubject({
        subject_name:     formData.subject_name.trim(),
        // ✅ Send exactly 'scholastic' or 'co_scholastic' — matches POST API expectation
        assessment_model: formData.assessment_model,
      })

      console.log('POST /createSubject response:', result)

      if (result.success) {
        setShowSuccess(true)
        // Navigate to list after short delay — list will re-fetch and show new subject
        setTimeout(() => {
          navigate('/admin/subject/add')
        }, 500)
      } else {
        throw new Error(result.message || 'Failed to add subject')
      }
    } catch (err) {
      console.error('Error adding subject:', err)
      const errMsg = (err.message || '').toLowerCase()
      if (errMsg.includes('duplicate') || errMsg.includes('already exists')) {
        setError('Subject name already exists. Please use a unique name.')
      } else {
        setError(err.message || 'Failed to add subject')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">

      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">Subject added successfully!</span>
        </div>
      )}

      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/admin/subject')}
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

        {/* Error */}
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
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Subject Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="subject_name"
              value={formData.subject_name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition text-gray-900"
              placeholder="e.g., Mathematics, English, Science"
              maxLength={100}
            />
            <p className="text-gray-500 text-xs mt-2">Enter a unique subject name (2–100 characters)</p>
          </div>

          {/* Assessment Model Dropdown */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Assessment Model <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(prev => !prev)}
                className={`w-full px-4 py-3 border rounded-lg flex items-center justify-between transition outline-none text-left bg-white
                  ${dropdownOpen
                    ? 'border-purple-500 ring-2 ring-purple-500'
                    : 'border-gray-300 hover:border-purple-400'}
                  ${selectedOption ? 'text-gray-900' : 'text-gray-400'}`}
              >
                <span>
                  {selectedOption ? (
                    <span className="flex items-center gap-2">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                        selectedOption.value === 'scholastic' ? 'bg-blue-500' : 'bg-emerald-500'
                      }`} />
                      <span className="font-medium text-gray-900">{selectedOption.label}</span>
                      <span className="text-gray-400 text-sm">— {selectedOption.description}</span>
                    </span>
                  ) : (
                    'Select assessment model'
                  )}
                </span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                  {ASSESSMENT_MODEL_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleAssessmentSelect(option.value)}
                      className={`w-full px-4 py-3.5 flex items-start gap-3 hover:bg-purple-50 transition text-left ${
                        formData.assessment_model === option.value ? 'bg-purple-50' : ''
                      }`}
                    >
                      <span className={`mt-1 inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        option.value === 'scholastic' ? 'bg-blue-500' : 'bg-emerald-500'
                      }`} />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{option.label}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{option.description}</p>
                      </div>
                      {formData.assessment_model === option.value && (
                        <span className="ml-auto text-purple-600">
                          <CheckCircle className="w-4 h-4" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-gray-500 text-xs mt-2">Choose how this subject will be assessed</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-10 pt-6 border-t">
            <button
              type="submit"
              disabled={loading || showSuccess}
              className={`flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg transition font-semibold shadow-lg hover:shadow-xl ${
                loading || showSuccess
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-purple-700 hover:-translate-y-0.5'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="animate-spin h-5 w-5" />
                  Adding...
                </span>
              ) : showSuccess ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Added!
                </span>
              ) : 'Add Subject'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/subject')}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold disabled:opacity-50"
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