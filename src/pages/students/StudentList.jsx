import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Eye, Edit, Plus, ChevronLeft, ChevronRight, Users } from 'lucide-react'
import { studentService } from '../../services/studentService/studentService'
import StudentDetailsModal from './StudentDetailsModal'

function StudentList() {
  const navigate = useNavigate()

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

  const fetchStudents = async (pageNumber) => {
    try {
      setLoading(true)
      setError(null)
      const res = await studentService.getAllStudents(pageNumber)

      // ✅ FIX: Safely extract students array and pagination
      const studentList = Array.isArray(res.data) ? res.data : []
      const pagination = res.pagination || {}

      setStudents(studentList)
      setPage(pagination.page || pageNumber)
      setTotalPages(pagination.totalPages || 1)
      setTotalStudents(pagination.total || studentList.length)
    } catch (err) {
      console.error('Error fetching students:', err)
      setError(err.message || 'Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStudents(page) }, [page])

  const handleViewStudent = (student) => {
    setSelectedStudent(student)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedStudent(null)
  }

  const handleDeleteFromModal = (student) => {
    closeModal()
    setStudentToDelete(student)
    setShowDeleteConfirm(true)
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
      setShowDeleteConfirm(false)
      setStudentToDelete(null)
      // ✅ FIX: If last item on page, go back a page
      const newPage = students.length === 1 && page > 1 ? page - 1 : page
      fetchStudents(newPage)
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

  if (loading && students.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative mx-auto w-14 h-14 mb-4">
            <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <Users className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-600 font-medium">Loading students...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-sm w-full bg-white rounded-xl shadow-md p-8 text-center border border-red-100">
          <div className="mx-auto h-14 w-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-500 text-sm mb-5">{error}</p>
          <button onClick={() => fetchStudents(page)}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!loading && students.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Students</h1>
              <p className="text-gray-500 text-sm">Manage all registered students</p>
            </div>
            <button onClick={() => navigate('/admin/students/add')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium text-sm shadow-sm">
              <Plus className="w-4 h-4" /> Add Student
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
            <div className="mx-auto h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">No Students Found</h2>
            <p className="text-gray-500 text-sm mb-5">Start by adding your first student</p>
            <button onClick={() => navigate('/admin/students/add')}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add First Student
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
            <span className="hover:text-blue-500 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>Dashboard</span>
            <span>/</span>
            <span className="hover:text-blue-500 cursor-pointer">Students</span>
            <span>/</span>
            <span className="text-gray-600 font-medium">Registered Students</span>
          </div>

          {/* Header */}
          <div className="mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Students</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                  <Users className="w-3 h-3" /> {totalStudents} Total
                </span>
              </div>
            </div>
            <button onClick={() => navigate('/admin/students/add')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium text-sm shadow-sm">
              <Plus className="w-4 h-4" /> Add New Student
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Admission No</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Class</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Section</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Gender</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map((student) => (
                    <tr key={student.student_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          {student.student_photo_url ? (
                            <img src={student.student_photo_url} alt={student.name}
                              className="w-9 h-9 rounded-full object-cover border border-gray-200 flex-shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-xs">
                                {student.name?.charAt(0)?.toUpperCase() || 'S'}
                              </span>
                            </div>
                          )}
                          <span className="text-sm font-semibold text-gray-900">{student.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{student.user_email || 'N/A'}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-semibold bg-purple-50 text-purple-700">
                          {student.admission_no || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700">
                          {student.class_name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-semibold bg-green-50 text-green-700">
                          {student.section_name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-600 capitalize">{student.gender || 'N/A'}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => handleViewStudent(student)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition" title="View Details">
                            <Eye className="w-3.5 h-3.5 text-blue-600" />
                          </button>
                          <button onClick={() => navigate(`/admin/students/edit/${student.student_id}`)}
                            className="p-1.5 bg-green-50 hover:bg-green-100 rounded-lg transition" title="Edit">
                            <Edit className="w-3.5 h-3.5 text-green-600" />
                          </button>
                          <button onClick={() => handleDeleteClick(student)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition" title="Delete">
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 gap-3 bg-gray-50/80">
              <p className="text-xs text-gray-500">
                Page <span className="font-semibold text-gray-700">{page}</span> of{' '}
                <span className="font-semibold text-gray-700">{totalPages}</span>
                <span className="text-gray-400 ml-2">({totalStudents} total)</span>
              </p>
              <div className="flex gap-2">
                <button disabled={page === 1 || loading} onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm flex items-center gap-1 font-medium shadow-sm">
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </button>
                <button disabled={page === totalPages || loading} onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm flex items-center gap-1 font-medium shadow-sm">
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
            <StudentDetailsModal
              student={selectedStudent}
              onClose={closeModal}
              onDelete={handleDeleteFromModal}
            />
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Delete Student?</h3>
            <p className="text-gray-500 text-sm text-center mb-0.5">Are you sure you want to delete</p>
            <p className="text-center font-bold text-gray-900 mb-1">{studentToDelete?.name}</p>
            <p className="text-xs text-gray-400 text-center mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={cancelDelete} disabled={deleting}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm disabled:opacity-50">
                Cancel
              </button>
              <button onClick={confirmDelete} disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                {deleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <><Trash2 className="w-4 h-4" /> Delete</>
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