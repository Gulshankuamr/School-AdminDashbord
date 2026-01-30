import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Trash2, 
  Eye, 
  Edit, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Users,
  Filter,
  X,
  ArrowLeft
} from 'lucide-react'
import { studentService } from '../../services/studentService/studentService'
import Modal from '../../components/Modal'
import StudentDetailsModal from './StudentDetailsModal'


function StudentList() {
  const navigate = useNavigate()
  

  /* ========================= 
     State Management - Do NOT Modify Logic
  ========================= */
  
  const [students, setStudents] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalStudents, setTotalStudents] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)


  /* ========================= 
     Fetch Students with Pagination - Do NOT Modify
  ========================= */

  const fetchStudents = async (pageNumber) => {
    try {
      setLoading(true)
      setError(null)

      const res = await studentService.getAllStudents(pageNumber)
      setStudents(res.data || [])
      setPage(res.pagination.page)
      setTotalPages(res.pagination.totalPages)
      setTotalStudents(res.pagination.total)
    } catch (err) {
      console.error('Error fetching students:', err)
      setError(err.message || 'Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents(page)
  }, [page])


  /* ========================= 
     Modal Handlers - Do NOT Modify Logic
  ========================= */

  const handleViewStudent = (student) => {
    setSelectedStudent(student)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedStudent(null)
  }

  const handleDeleteClick = (student) => {
    setStudentToDelete(student)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!studentToDelete) return

    try {
      setDeleting(true)
      await studentService.deleteStudent(studentToDelete.student_id)
      
      alert('Student deleted successfully!')
      setShowDeleteConfirm(false)
      setStudentToDelete(null)
      
      fetchStudents(page)
    } catch (error) {
      console.error('Error deleting student:', error)
      alert(error.message || 'Failed to delete student')
    } finally {
      setDeleting(false)
    }
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setStudentToDelete(null)
  }


  /* ========================= 
     Loading State UI
  ========================= */

  if (loading && students.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
            <Users className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-700 text-lg mt-6 font-medium">Loading students...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait a moment</p>
        </div>
      </div>
    )
  }


  /* ========================= 
     Error State UI
  ========================= */

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center border border-red-100">
          <div className="mb-6">
            <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }


  /* ========================= 
     Empty State UI
  ========================= */

  if (students.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Students List</h1>
              <p className="text-gray-600">Manage and view all registered students</p>
            </div>
            <button
              onClick={() => navigate('/admin/students/add')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              Add Student
            </button>
          </div>

          {/* Empty State Card */}
          <div className="bg-white rounded-2xl shadow-xl p-12 sm:p-16 text-center border border-gray-100">
            <div className="mb-6">
              <div className="mx-auto h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-12 w-12 text-blue-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No Students Found</h2>
            <p className="text-gray-600 mb-2">You haven't added any students yet</p>
            <p className="text-gray-500 text-sm mb-8">Get started by adding your first student to the system</p>
            <button
              onClick={() => navigate('/admin/students/add')}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add First Student
            </button>
          </div>
        </div>
      </div>
    )
  }


  /* ========================= 
     Main Students List UI
  ========================= */

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
               <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span className="hover:text-blue-600 cursor-pointer transition">Dashboard</span>
            <span>/</span>
            <span className="hover:text-blue-600 cursor-pointer transition">Students</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">Registered Students</span>
          </div>
          {/* ========================= 
              Page Header
          ========================= */}
          
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Students List</h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                    <Users className="w-4 h-4" />
                    {totalStudents} Total Student{totalStudents !== 1 ? 's' : ''}
                  </span>
                </p>
              </div>
              
              <button
                onClick={() => navigate('/admin/students/add')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5" />
                Add New Student
              </button>
            </div>

            {/* Filter Chips - Optional */}
            {/* <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-gray-600 font-medium">Quick Filters:</span>
              <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Class
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Section
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Status
              </button>
            </div> */}
          </div>


          {/* ========================= 
              Students Table Card
          ========================= */}
          
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            
            {/* Table Container with Horizontal Scroll */}
            <div className="overflow-x-auto">
              <table className="w-full">
                
                {/* Table Header */}
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Admission No
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Class
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Section
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Gender
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="bg-white divide-y divide-gray-100">
                  {students.map((student, index) => (
                    <tr 
                      key={student.student_id} 
                      className="hover:bg-blue-50/50 transition-colors duration-150"
                    >
                      
                      {/* Student Name with Avatar */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {student.student_photo_url ? (
                            <img
                              src={student.student_photo_url}
                              alt={student.name}
                              className="w-11 h-11 rounded-full object-cover border-2 border-blue-200 shadow-sm"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm border-2 border-blue-200">
                              <span className="text-white font-bold text-sm">
                                {student.name?.charAt(0)?.toUpperCase() || 'S'}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {student.name || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {student.user_email || 'N/A'}
                        </div>
                      </td>

                      {/* Admission Number */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                          {student.admission_no || 'N/A'}
                        </span>
                      </td>

                      {/* Class */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                          {student.class_name || 'N/A'}
                        </span>
                      </td>

                      {/* Section */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          {student.section_name || 'N/A'}
                        </span>
                      </td>

                      {/* Gender */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700 capitalize font-medium">
                          {student.gender || 'N/A'}
                        </div>
                      </td>

                      {/* Actions Column with Icon Buttons */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          
                          {/* View Button with Tooltip */}
                          <button
                            onClick={() => handleViewStudent(student)}
                            className="group relative p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-all duration-200"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-blue-600" />
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              View Details
                            </span>
                          </button>

                          {/* Edit Button with Tooltip */}
                          <button
                            onClick={() => navigate(`/admin/students/edit/${student.student_id}`)}
                            className="group relative p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-all duration-200"
                            title="Edit Student"
                          >
                            <Edit className="w-4 h-4 text-green-600" />
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              Edit Student
                            </span>
                          </button>

                          {/* Delete Button with Tooltip */}
                          <button
                            onClick={() => handleDeleteClick(student)}
                            className="group relative p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-all duration-200"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              Delete Student
                            </span>
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>


            {/* ========================= 
                Pagination Controls
            ========================= */}
            
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 gap-4">
              
              {/* Page Info */}
              <div className="text-sm text-gray-700 font-medium">
                Showing page <span className="font-bold text-blue-600">{page}</span> of{' '}
                <span className="font-bold text-blue-600">{totalPages}</span>
              </div>
              
              {/* Pagination Buttons */}
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-blue-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all font-medium flex items-center gap-2 shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-blue-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all font-medium flex items-center gap-2 shadow-sm"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>


        </div>
      </div>


      {/* ========================= 
          View Student Details Modal
      ========================= */}
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal}
        title="Student Details"
      >
        {selectedStudent && (
          <StudentDetailsModal 
            student={selectedStudent} 
            onClose={closeModal}
          />
        )}
      </Modal>


      {/* ========================= 
          Delete Confirmation Modal
      ========================= */}
      
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 transform transition-all animate-scale-in">
            
            {/* Icon */}
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-6">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            
            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">
              Delete Student?
            </h3>
            
            {/* Message */}
            <p className="text-gray-600 text-center mb-2">
              Are you sure you want to delete
            </p>
            <p className="text-center mb-6">
              <strong className="text-gray-900 text-lg">{studentToDelete?.name}</strong>
            </p>
            <p className="text-sm text-gray-500 text-center mb-8">
              This action cannot be undone and will permanently remove all student data.
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={cancelDelete}
                disabled={deleting}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed border-2 border-transparent hover:border-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    <span>Delete Student</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}


    </>
  )
}


export default StudentList