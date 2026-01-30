// src/pages/SubjectList.js
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, BookOpen, Edit, Eye, Plus, Search, Loader } from 'lucide-react'
// import { subjectService } from '../../services/subjectService'
import { subjectService } from '../../services/subjectService/subjectService'
import Modal from '../../components/Modal'
import SubjectDetailsModal from './SubjectDetailsModal'

function SubjectList() {
  const navigate = useNavigate()
  
  const [subjects, setSubjects] = useState([])
  const [filteredSubjects, setFilteredSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState(null)
  
  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [subjectToDelete, setSubjectToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Fetch all subjects
  const fetchSubjects = async () => {
    try {
      setLoading(true)
      const data = await subjectService.getAllSubjects()
      setSubjects(data)
      setFilteredSubjects(data)
    } catch (err) {
      console.error('Error fetching subjects:', err)
      alert(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubjects()
  }, [])

  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSubjects(subjects)
    } else {
      const filtered = subjects.filter(subject =>
        subject.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(subject.subject_id).includes(searchTerm)
      )
      setFilteredSubjects(filtered)
    }
  }, [searchTerm, subjects])

  // Open subject details modal
  const handleViewSubject = (subject) => {
    setSelectedSubject(subject)
    setIsModalOpen(true)
  }

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedSubject(null)
  }

  // Handle delete click
  const handleDeleteClick = (subject) => {
    setSubjectToDelete(subject)
    setShowDeleteConfirm(true)
  }

  // Confirm delete
  const confirmDelete = async () => {
    if (!subjectToDelete) return

    try {
      setDeleting(true)
      await subjectService.deleteSubject(subjectToDelete.subject_id)
      
      alert('Subject deleted successfully!')
      setShowDeleteConfirm(false)
      setSubjectToDelete(null)
      
      // Refresh the list
      await fetchSubjects()
    } catch (err) {
      console.error('Error deleting subject:', err)
      alert(`Error: ${err.message}`)
    } finally {
      setDeleting(false)
    }
  }

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setSubjectToDelete(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="animate-spin h-16 w-16 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading subjects...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Subjects List</h1>
                <p className="text-gray-600 mt-1">
                  Total {subjects.length} subject{subjects.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => navigate('/admin/subject/add')}
                className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium"
              >
                <Plus className="w-5 h-5" />
                Add Subject
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search subjects by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Subjects Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {filteredSubjects.length === 0 ? (
              <div className="p-12 text-center">
                <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg mb-2">
                  {searchTerm ? 'No subjects found matching your search' : 'No subjects found'}
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  {searchTerm ? 'Try a different search term' : 'Get started by adding your first subject'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => navigate('/admin/subject/add')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Add First Subject
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject Name
                      </th>
                      {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th> */}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSubjects.map((subject) => (
                      <tr key={subject.subject_id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-purple-100 mr-3 flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {subject.subject_id}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-semibold">
                            {subject.subject_name}
                          </div>
                        </td>
                        {/* <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            subject.status === 1 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${subject.status === 1 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            {subject.status === 1 ? 'Active' : 'Inactive'}
                          </span>
                        </td> */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handleViewSubject(subject)}
                              className="text-blue-600 hover:text-blue-900 transition flex items-center gap-1"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                            <button
                              onClick={() => navigate(`/admin/subject/edit/${subject.subject_id}`)}
                              className="text-green-600 hover:text-green-900 transition flex items-center gap-1"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(subject)}
                              className="text-red-600 hover:text-red-900 transition flex items-center gap-1"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subject Details Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal}
        title="Subject Details"
      >
        {selectedSubject && (
          <SubjectDetailsModal 
            subject={selectedSubject} 
            onClose={closeModal}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Delete Subject
            </h3>
            
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete <strong>{subjectToDelete?.subject_name}</strong>? 
              This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default SubjectList