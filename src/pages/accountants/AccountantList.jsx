import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { accountantService } from '../../services/accountendService/accountantService'
import Modal from '../../components/Modal'
import AccountantDetailsModal from './AccountantDetailsModal'

function AccountantList() {
  const navigate = useNavigate()
  
  // Pagination states
  const [accountants, setAccountants] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalAccountants, setTotalAccountants] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAccountant, setSelectedAccountant] = useState(null)
  
  // Delete confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [accountantToDelete, setAccountantToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Fetch accountants with pagination
  const fetchAccountants = async (pageNumber) => {
    try {
      setLoading(true)
      setError(null)

      const res = await accountantService.getAllAccountants(pageNumber)
      
      // Handle response structure
      if (res && res.data) {
        setAccountants(res.data || [])
        setPage(res.pagination?.page || pageNumber)
        setTotalPages(res.pagination?.totalPages || 1)
        setTotalAccountants(res.pagination?.total || 0)
      } else {
        setAccountants([])
        setTotalPages(1)
        setTotalAccountants(0)
      }
    } catch (err) {
      console.error('Error fetching accountants:', err)
      setError(err.message || 'Failed to load accountants')
      setAccountants([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch accountants on page change
  useEffect(() => {
    fetchAccountants(page)
  }, [page])

  // Function to open modal with accountant data
  const handleViewAccountant = (accountant) => {
    setSelectedAccountant(accountant)
    setIsModalOpen(true)
  }

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedAccountant(null)
  }

  // Handle delete confirmation
  const handleDeleteClick = (accountant) => {
    setAccountantToDelete(accountant)
    setShowDeleteConfirm(true)
  }

  // Confirm delete
  const confirmDelete = async () => {
    if (!accountantToDelete) return

    try {
      setDeleting(true)
      
      // Call delete API
      const result = await accountantService.deleteAccountant(accountantToDelete.accountant_id)
      
      console.log('Delete result:', result)
      
      alert('Accountant deleted successfully!')
      
      // Close modal first
      setShowDeleteConfirm(false)
      setAccountantToDelete(null)
      
      // Check if we need to go to previous page
      if (accountants.length === 1 && page > 1) {
        // If this was the last item on the page and we're not on page 1
        setPage(page - 1)
      } else {
        // Refresh current page
        await fetchAccountants(page)
      }
      
    } catch (error) {
      console.error('Error deleting accountant:', error)
      
      // Check if it's a permission error
      if (error.message.includes('permission') || error.message.includes('403')) {
        alert('⚠️ Permission Denied\n\nYou do not have permission to delete accountants. Please contact your administrator or login with an account that has delete permissions.')
      } else {
        alert(error.message || 'Failed to delete accountant')
      }
    } finally {
      setDeleting(false)
    }
  }

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setAccountantToDelete(null)
  }

  // Show loading spinner while fetching
  if (loading && accountants.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading accountants...</p>
        </div>
      </div>
    )
  }

  // Show error message if API fails
  if (error && accountants.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => fetchAccountants(page)}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Show message if no accountants found
  if (accountants.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Accountants List</h1>
              <p className="text-gray-600 mt-1">View all registered accountants</p>
            </div>
            <button
              onClick={() => navigate('/admin/accountants/add')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Add Accountant
            </button>
          </div>

          {/* Empty State */}
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="mb-4">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-600 text-lg mb-2">No accountants found</p>
            <p className="text-gray-500 text-sm mb-6">Get started by adding your first accountant</p>
            <button
              onClick={() => navigate('/admin/accountants/add')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Add First Accountant
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show accountants table with pagination
  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Accountants List</h1>
              <p className="text-gray-600 mt-1">
                Total {totalAccountants} accountant{totalAccountants !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/accountants/add')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Add Accountant
            </button>
          </div>

          {/* Accountants Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Photo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qualification
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {accountants.map((accountant) => (
                    <tr key={accountant.accountant_id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {accountant.accountant_photo_url ? (
                          <img
                            src={accountant.accountant_photo_url}
                            alt={accountant.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-purple-600 font-semibold text-sm">
                              {accountant.name?.charAt(0)?.toUpperCase() || 'A'}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {accountant.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {accountant.user_email || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {accountant.qualification || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          accountant.status === 1 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {accountant.status === 1 ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewAccountant(accountant)}
                          className="text-blue-600 hover:text-blue-900 mr-4 transition"
                        >
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/admin/accountants/edit/${accountant.accountant_id}`)}
                          className="text-purple-600 hover:text-purple-900 mr-4 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(accountant)}
                          className="text-red-600 hover:text-red-900 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing page <span className="font-medium">{page}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </div>
              
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accountant Details Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal}
        title="Accountant Details"
      >
        {selectedAccountant && (
          <AccountantDetailsModal 
            accountant={selectedAccountant} 
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
              Delete Accountant
            </h3>
            
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete <strong>{accountantToDelete?.name}</strong>? This action cannot be undone.
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
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 flex items-center justify-center"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
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

export default AccountantList