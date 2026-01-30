import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Edit2, Eye } from 'lucide-react'
import Modal from '../../components/Modal'
import ClassDetailsModal from './ClassDetailsModal'
// import { classService } from '../../services/classService'
import { classService } from '../../services/classService/classService'
import { toast } from 'sonner'

function ClassList() {
  const navigate = useNavigate()
  
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState(null)
  
  // Delete confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [classToDelete, setClassToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Fetch classes
  const fetchClasses = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await classService.getAllClasses()
      console.log('Fetched classes:', res.data)
      setClasses(res.data || [])
    } catch (err) {
      console.error('Error fetching classes:', err)
      setError(err.message || 'Failed to load classes')
      toast.error(err.message || 'Failed to load classes')
    } finally {
      setLoading(false)
    }
  }

  // Fetch classes on component mount
  useEffect(() => {
    fetchClasses()
  }, [])

  // Function to open modal with class data
  const handleViewClass = (classItem) => {
    console.log('Viewing class:', classItem)
    setSelectedClass(classItem)
    setIsModalOpen(true)
  }

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedClass(null)
  }

  // Handle delete confirmation
  const handleDeleteClick = (classItem) => {
    console.log('Delete clicked for class:', classItem)
    setClassToDelete(classItem)
    setShowDeleteConfirm(true)
  }

  // Confirm delete - FIXED VERSION
   // Confirm delete - FIXED VERSION WITHOUT REFRESH
const confirmDelete = async () => {
  if (!classToDelete || !classToDelete.class_id) {
    toast.error('Invalid class ID')
    return
  }

  try {
    setDeleting(true)
    console.log('🗑️ Attempting to delete class ID:', classToDelete.class_id)
    
    // Call delete API
    const response = await classService.deleteClass(classToDelete.class_id)
    console.log('✅ Delete API success:', response)
    
    // 1. Update local state - DON'T call fetchClasses immediately
    setClasses(prevClasses => {
      const updatedClasses = prevClasses.filter(c => c.class_id !== classToDelete.class_id)
      console.log('🔄 Local state updated:', {
        before: prevClasses.length,
        after: updatedClasses.length
      })
      return updatedClasses
    })
    
    // 2. Close modal
    setShowDeleteConfirm(false)
    setClassToDelete(null)
    
    // 3. Show success
    toast.success('Class deleted successfully!')
    
    // 4. DO NOT automatically refresh - wait for user action
    // Remove the setTimeout with fetchClasses()
    
  } catch (error) {
    console.error('❌ Delete failed:', error)
    toast.error(error.message || 'Failed to delete class')
    
    // If error, refresh to sync
    await fetchClasses()
  } finally {
    setDeleting(false)
  }
}

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setClassToDelete(null)
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  // Show loading spinner while fetching
  if (loading && classes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Loading classes...</p>
        </div>
      </div>
    )
  }

  // Show error message if API fails
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-100 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchClasses}
            className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Show message if no classes found
  if (classes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Classes List</h1>
              <p className="text-gray-600 mt-1">View all registered classes</p>
            </div>
            <button
              onClick={() => navigate('/admin/classes/add')}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Add Class
            </button>
          </div>

          {/* Empty State */}
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="mb-4">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-gray-600 text-lg mb-2">No classes found</p>
            <p className="text-gray-500 text-sm mb-6">Get started by adding your first class</p>
            <button
              onClick={() => navigate('/admin/classes/add')}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition"
            >
              Add First Class
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Classes List</h1>
              <p className="text-gray-600 mt-1">
                Total {classes.length} class{classes.length !== 1 ? 'es' : ''}
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/classes/add')}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Add Class
            </button>
          </div>

          {/* List Container */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium">
              <div className="col-span-3">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Class Name
                </span>
              </div>
              <div className="col-span-2">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Order
                </span>
              </div>
              <div className="col-span-3">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Status
                </span>
              </div>
              <div className="col-span-2">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Created On
                </span>
              </div>
              <div className="col-span-2 text-center">
                <span className="flex items-center gap-2 justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Actions
                </span>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
              {classes.map((classItem) => (
                <div 
                  key={classItem.class_id} 
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors duration-200"
                >
                  {/* Class Name */}
                  <div className="col-span-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                        <span className="text-green-700 font-bold">{classItem.class_order}</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{classItem.class_name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-1">{classItem.class_details}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order */}
                  <div className="col-span-2 flex items-center">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg font-medium">
                      {classItem.class_order}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="col-span-3 flex items-center">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        classItem.status === 1 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          classItem.status === 1 ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></span>
                        {classItem.status === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Created On */}
                  <div className="col-span-2 flex items-center">
                    <div className="text-gray-700">
                      {formatDate(classItem.created_at)}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="col-span-2 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleViewClass(classItem)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-2"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="sr-only md:not-sr-only md:text-sm">View</span>
                    </button>
                    <button
                      onClick={() => navigate(`/admin/classes/edit/${classItem.class_id}`)}
                      className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition flex items-center justify-center gap-2"
                      title="Edit Class"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="sr-only md:not-sr-only md:text-sm">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(classItem)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition flex items-center justify-center gap-2"
                      title="Delete Class"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="sr-only md:not-sr-only md:text-sm">Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Class Details Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal}
        title="Class Details"
      >
        {selectedClass && (
          <ClassDetailsModal 
            classItem={selectedClass} 
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
              Delete Class
            </h3>
            
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete <strong>{classToDelete?.class_name}</strong>? This action cannot be undone.
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
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ClassList