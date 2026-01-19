import { User, Mail, BookOpen, FileText, Edit } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import ImageModal from '../../components/ImageModal'

function StudentDetailsModal({ student, onClose, isModal = true }) {
  const navigate = useNavigate()
  
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState('')
  const [selectedImageTitle, setSelectedImageTitle] = useState('')

  const openImageModal = (imageUrl, title) => {
    setSelectedImage(imageUrl)
    setSelectedImageTitle(title)
    setImageModalOpen(true)
  }

  const handleEdit = () => {
    if (onClose) {
      onClose() // Close modal first
    }
    navigate(`/admin/students/edit/${student.admission_no}`)
  }

  return (
    <>
      <div className="bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-center">
                  {/* Photo */}
                  {student.student_photo_url ? (
                    <img
                      src={student.student_photo_url}
                      alt={student.name}
                      className="w-32 h-32 rounded-full mx-auto object-cover mb-4 border-4 border-blue-100"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full mx-auto bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-4 border-4 border-blue-100">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}

                  {/* Name */}
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{student.name}</h2>
                  <p className="text-gray-600 text-sm mb-3">
                    Admission No: <span className="font-semibold">{student.admission_no}</span>
                  </p>

                  {/* Status */}
                  <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold mb-4 ${
                    student.status === 1 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${student.status === 1 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {student.status === 1 ? 'Active' : 'Inactive'}
                  </span>

                  {/* Quick Info */}
                  <div className="bg-gray-50 rounded-lg p-4 text-left mt-4">
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 break-all">{student.user_email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 capitalize">{student.gender}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Info */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Name</label>
                    <p className="text-gray-900 font-semibold mt-1">{student.name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Gender</label>
                    <p className="text-gray-900 font-semibold mt-1 capitalize">{student.gender}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                    <p className="text-gray-900 font-semibold mt-1 break-all">{student.user_email}</p>
                  </div>
                </div>
              </div>

              {/* Academic Info */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  <h3 className="text-xl font-bold text-gray-900">Academic Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Class</label>
                    <p className="text-gray-900 font-semibold mt-1">{student.class_name || 'Not Assigned'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Section</label>
                    <p className="text-gray-900 font-semibold mt-1">{student.section_name || 'Not Assigned'}</p>
                  </div>
                </div>
              </div>

              {/* Documents - Updated Version */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-2 mb-6">
                  <FileText className="w-5 h-5 text-green-600" />
                  <h3 className="text-xl font-bold text-gray-900">Documents</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Father Document */}
                  <div className="border-2 border-gray-200 rounded-lg p-4">
                    <label className="text-sm font-semibold text-gray-700 mb-3 block">Father Document</label>
                    {student.father_photo_url ? (
                      <div className="flex flex-col items-center">
                        <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                          <FileText className="w-16 h-16 text-gray-400" />
                        </div>
                        <p className="text-gray-700 mb-3 text-center">Father's Document</p>
                        <button
                          onClick={() => openImageModal(student.father_photo_url, "Father's Document")}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition w-full justify-center"
                        >
                          <FileText className="w-4 h-4" />
                          View Document
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-40 bg-gray-50 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <FileText className="w-12 h-12 mx-auto mb-2" />
                          <span className="text-sm">No Document Available</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mother Document */}
                  <div className="border-2 border-gray-200 rounded-lg p-4">
                    <label className="text-sm font-semibold text-gray-700 mb-3 block">Mother Document</label>
                    {student.mother_photo_url ? (
                      <div className="flex flex-col items-center">
                        <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                          <FileText className="w-16 h-16 text-gray-400" />
                        </div>
                        <p className="text-gray-700 mb-3 text-center">Mother's Document</p>
                        <button
                          onClick={() => openImageModal(student.mother_photo_url, "Mother's Document")}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition w-full justify-center"
                        >
                          <FileText className="w-4 h-4" />
                          View Document
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-40 bg-gray-50 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <FileText className="w-12 h-12 mx-auto mb-2" />
                          <span className="text-sm">No Document Available</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Aadhar Card */}
                  <div className="border-2 border-gray-200 rounded-lg p-4">
                    <label className="text-sm font-semibold text-gray-700 mb-3 block">Aadhar Card</label>
                    {student.aadhar_card_url ? (
                      <div className="flex flex-col items-center">
                        <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                          <FileText className="w-16 h-16 text-gray-400" />
                        </div>
                        <p className="text-gray-700 mb-3 text-center">Aadhar Card Document</p>
                        <button
                          onClick={() => openImageModal(student.aadhar_card_url, "Aadhar Card")}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition w-full justify-center"
                        >
                          <FileText className="w-4 h-4" />
                          View Document
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-40 bg-gray-50 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <FileText className="w-12 h-12 mx-auto mb-2" />
                          <span className="text-sm">No Document Available</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-end">
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Student
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        imageUrl={selectedImage}
        title={selectedImageTitle}
      />
    </>
  )
}

export default StudentDetailsModal