import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Edit2, Eye, Plus, CheckCircle, AlertCircle } from 'lucide-react'
import Modal from '../../components/Modal'
import SubjectDetailsModal from './SubjectDetailsModal'
import { subjectService } from '../../services/subjectService'

function SubjectList() {
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState(null)
  
  // Delete confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [subjectToDelete, setSubjectToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Success/Error messages
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [message, setMessage] = useState('')

  // Fetch subjects
  // const fetchSubjects = async () => {
  //   try {
  //     setLoading(true)
  //     setError(null)

  //     const res = await subjectService.getAllSubjects()
  //    setSubjects(res.data || [])
  //   } catch (err) {
  //     console.error('Error fetching subjects:', err)
  //     setError(err.message || 'Failed to load subjects')
  //   } finally {
  //     setLoading(false)
  //   }
  // }


  const fetchSubjects = async () => {
  try {
    setLoading(true)
    setError(null)

    const res = await subjectService.getAllSubjects()

    // 🛡️ Safety check
    if (!res || !Array.isArray(res.data)) {
      console.warn('Invalid subjects response:', res)
      setSubjects([])
      return
    }

    // 🔥 IMPORTANT FIX
    // Backend soft-delete karta hai,
    // isliye sirf ACTIVE subjects dikhane hain
    const activeSubjects = res.data.filter(
      (subject) =>
        subject.status === 1 || subject.status === '1'
    )

    setSubjects(activeSubjects)
  } catch (err) {
    console.error('Error fetching subjects:', err)
    setError(err.message || 'Failed to load subjects')
  } finally {
    setLoading(false)
  }
}


  // Fetch on component mount
  useEffect(() => {
    fetchSubjects()
  }, [])

  // Handle view subject
  const handleViewSubject = (subject) => {
    setSelectedSubject(subject)
    setIsModalOpen(true)
  }

  // Handle edit subject
  // const handleEditSubject = (subject) => {
  //   navigate(`/admin/subjects/edit/${subject.subject_id}`, {
  //     state: { subject }
  //   })
  // }

  const handleEditSubject = (subject) => {
  navigate(`/admin/subjects/edit/${subject.subject_id}`, {
    state: { subject }
  })
}


  // Handle delete subject - show confirmation
  const handleDeleteClick = (subject) => {
    setSubjectToDelete(subject)
    setShowDeleteConfirm(true)
  }

  // Confirm delete subject
  const confirmDelete = async () => {
    if (!subjectToDelete) return

    try {
      setDeleting(true)
      await subjectService.deleteSubject(subjectToDelete.subject_id)
      
      // Show success message
      setMessage(`Subject "${subjectToDelete.subject_name}" deleted successfully!`)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)

      // Close modal
      setShowDeleteConfirm(false)
      setSubjectToDelete(null)

      // Refresh subjects list
      await fetchSubjects()
    } catch (err) {
      console.error('Error deleting subject:', err)
      setMessage(err.message || 'Failed to delete subject')
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
    } finally {
      setDeleting(false)
    }
  }

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setSubjectToDelete(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-6">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-slide-in">
          <CheckCircle className="w-6 h-6" />
          <span className="font-medium">{message}</span>
        </div>
      )}

      {/* Error Message */}
      {showError && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-slide-in">
          <AlertCircle className="w-6 h-6" />
          <span className="font-medium">{message}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Subjects Management</h1>
              <p className="text-gray-600 mt-2">
                Manage all subjects in the system
                {!loading && subjects.length > 0 && (
                  <span className="ml-2 text-indigo-600 font-semibold">
                    ({subjects.length} subject{subjects.length !== 1 ? 's' : ''})
                  </span>
                )}
              </p>
            </div>
            
            <button
              onClick={() => navigate('/admin/subjects/add')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold">Add New Subject</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-700 text-lg">Loading subjects...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center shadow-lg">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-700 font-medium text-lg mb-4">{error}</p>
            <button
              onClick={fetchSubjects}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-md"
            >
              Retry Loading
            </button>
          </div>
        ) : (
          /* Subjects Table */
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-indigo-600 to-purple-700">
                  <tr>
                    <th className="px-8 py-5 text-left text-sm font-semibold text-white uppercase tracking-wider">
                      Subject ID
                    </th>
                    <th className="px-8 py-5 text-left text-sm font-semibold text-white uppercase tracking-wider">
                      Subject Name
                    </th>
                    <th className="px-8 py-5 text-left text-sm font-semibold text-white uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-8 py-5 text-left text-sm font-semibold text-white uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {subjects.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-12">
                        <div className="text-gray-500">
                          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                          <p className="text-xl font-medium mb-2">No subjects found</p>
                          <p className="text-sm">Add your first subject to get started</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    subjects.map((subject, index) => (
                      <tr 
                        key={subject.subject_id} 
                        className={`hover:bg-gray-50 transition ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="px-8 py-6">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            #{subject.subject_id}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">{subject.subject_name}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span
                            className={`px-4 py-2 rounded-full text-sm font-medium ${
                              subject.status === 1
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {subject.status === 1 ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewSubject(subject)}
                              className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition hover:scale-105"
                              title="View Details"
                            >
                              <Eye size={20} />
                            </button>
                            {/* <button
                              onClick={() => handleEditSubject(subject)}
                              className="p-3 text-green-600 hover:bg-green-50 rounded-xl transition hover:scale-105"
                              title="Edit Subject"
                            >
                              <Edit2 size={20} />
                            </button> */}
                            <button
  onClick={() => handleEditSubject(subject)}
  className="p-3 text-green-600 hover:bg-green-50 rounded-xl transition hover:scale-105"
  title="Edit Subject"
>
  <Edit2 size={20} />
</button>

                            <button
                              onClick={() => handleDeleteClick(subject)}
                              className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition hover:scale-105"
                              title="Delete Subject"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            {subjects.length > 0 && (
              <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    Total: <span className="font-semibold">{subjects.length}</span> subject{subjects.length !== 1 ? 's' : ''}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      Active: {subjects.filter(s => s.status === 1).length}
                    </span>
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      Inactive: {subjects.filter(s => s.status === 0).length}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* View Subject Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <SubjectDetailsModal 
          subject={selectedSubject} 
          onClose={() => setIsModalOpen(false)} 
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={cancelDelete}>
        <div className="max-w-md mx-auto p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Delete Subject?</h2>
            <p className="text-gray-600">This action cannot be undone. All related data will be removed.</p>
          </div>

          {subjectToDelete && (
            <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 mb-4">
                  <p className="text-sm text-gray-500 mb-1">Subject Name</p>
                  <p className="font-bold text-gray-900 text-xl">{subjectToDelete.subject_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Subject ID</p>
                  <p className="font-semibold text-gray-900">#{subjectToDelete.subject_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className={`font-semibold ${subjectToDelete.status === 1 ? 'text-green-600' : 'text-red-600'}`}>
                    {subjectToDelete.status === 1 ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={cancelDelete}
              disabled={deleting}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-medium shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleting}
              className={`flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium shadow-lg ${
                deleting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {deleting ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Deleting...
                </span>
              ) : (
                'Delete Subject'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
export default SubjectList