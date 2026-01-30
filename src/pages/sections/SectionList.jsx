import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Edit2, Eye, Filter, CheckCircle, AlertCircle } from 'lucide-react'
import Modal from '../../components/Modal'
import SectionDetailsModal from './SectionDetailsModal'
// import { sectionService } from '../../services/sectionService'
import { sectionService } from '../../services/sectionService/sectionService'
import { useLocation } from 'react-router-dom'

function SectionList() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedClass, setSelectedClass] = useState('')

  
  // Filter state - initially empty to show ALL sections
  const [selectedClassId, setSelectedClassId] = useState('')
  const [classes, setClasses] = useState([])
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSection, setSelectedSection] = useState(null)
  
  // Delete confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [sectionToDelete, setSectionToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Success/Error messages
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
  if (location.state?.selectedClassId) {
    setSelectedClass(location.state.selectedClassId)
  }
}, [location.state])

  // Fetch classes for dropdown
  const fetchClasses = async () => {
    try {
      const res = await sectionService.getAllClasses()
      setClasses(res.data || [])
    } catch (err) {
      console.error('Error fetching classes:', err)
    }
  }

  // Fetch sections with optional class filter
  const fetchSections = async () => {
    try {
      setLoading(true)
      setError(null)

      // Call API - if selectedClassId is empty, it will fetch ALL sections
      const res = await sectionService.getAllSections(selectedClassId || undefined)
      setSections(res.data || [])
    } catch (err) {
      console.error('Error fetching sections:', err)
      setError(err.message || 'Failed to load sections')
    } finally {
      setLoading(false)
    }
  }

  // Fetch on component mount - shows ALL sections initially
  useEffect(() => {
    fetchClasses()
    fetchSections()
  }, [])

  // Fetch when filter changes
  useEffect(() => {
    fetchSections()
  }, [selectedClassId])

  // Handle filter change
  const handleClassFilterChange = (e) => {
    const value = e.target.value
    setSelectedClassId(value === 'all' ? '' : value)
  }

  // Handle view section
  const handleViewSection = (section) => {
    setSelectedSection(section)
    setIsModalOpen(true)
  }

  // Handle edit section - PASS SECTION DATA
  const handleEditSection = (section) => {
    navigate(`/admin/sections/edit/${section.section_id}`, {
      state: { section } // Pass section data to avoid extra API call
    })
  }

  // Handle delete section - show confirmation
  const handleDeleteClick = (section) => {
    setSectionToDelete(section)
    setShowDeleteConfirm(true)
  }

  // Confirm delete section
  const confirmDelete = async () => {
    if (!sectionToDelete) return

    try {
      setDeleting(true)
      await sectionService.deleteSection(sectionToDelete.section_id)
      
      // Show success message
      setMessage(`Section "${sectionToDelete.section_name}" deleted successfully!`)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)

      // Close modal
      setShowDeleteConfirm(false)
      setSectionToDelete(null)

      // Refresh sections list
      await fetchSections()
    } catch (err) {
      console.error('Error deleting section:', err)
      setMessage(err.message || 'Failed to delete section')
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
    } finally {
      setDeleting(false)
    }
  }

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setSectionToDelete(null)
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
        {/* Header with Filter */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sections List</h1>
            <p className="text-gray-600 mt-1">
              Manage all class sections
              {!loading && sections.length > 0 && (
                <span className="ml-2 text-indigo-600 font-semibold">
                  ({sections.length} section{sections.length !== 1 ? 's' : ''} 
                  {selectedClassId && selectedClassId !== 'all' ? ' in selected class' : ' total'})
                </span>
              )}
            </p>
          </div>
          
          <div className="flex gap-3">
            {/* Class Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={selectedClassId || 'all'}
                onChange={handleClassFilterChange}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls.class_id} value={cls.class_id}>
                    {cls.class_name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => navigate('/admin/sections/add')}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <span className="text-xl">+</span>
              Add Section
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-700 text-lg">Loading sections...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-700 font-medium">{error}</p>
            <button
              onClick={fetchSections}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        ) : (
          /* Sections Table */
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
                <tr>
                  {/* <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Section ID
                  </th> */}
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Class Nmae
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Section Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-white">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {sections.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12">
                      <div className="text-gray-500">
                        <p className="text-lg font-medium">No sections found</p>
                        <p className="text-sm mt-2">Add a new section to get started</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sections.map((section, index) => (
                    <tr 
                      key={section.section_id} 
                      className={`hover:bg-blue-50 transition ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      
                      <td className="px-6 py-4 text-gray-900 font-medium">
                        {section.class_name}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900 text-lg">
                        {section.section_name}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            section.status === 1
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {section.status === 1 ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleViewSection(section)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                            title="View Details"
                          >
                            <Eye size={20} />
                          </button>
                          <button
                            onClick={() => handleEditSection(section)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition"
                            title="Edit Section"
                          >
                            <Edit2 size={20} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(section)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                            title="Delete Section"
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
        )}
      </div>

      {/* View Section Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <SectionDetailsModal 
          section={selectedSection} 
          onClose={() => setIsModalOpen(false)} 
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={cancelDelete}>
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Delete Section?</h2>
            <p className="text-gray-600">This action cannot be undone.</p>
          </div>

          {sectionToDelete && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Section ID</p>
                  <p className="font-semibold text-gray-900">{sectionToDelete.section_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Section Name</p>
                  <p className="font-semibold text-gray-900">{sectionToDelete.section_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Class ID</p>
                  <p className="font-semibold text-gray-900">{sectionToDelete.class_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className={`font-semibold ${sectionToDelete.status === 1 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {sectionToDelete.status === 1 ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={cancelDelete}
              disabled={deleting}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleting}
              className={`flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium ${
                deleting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {deleting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Deleting...
                </span>
              ) : (
                'Delete Section'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default SectionList