import { User, Mail, Phone, BookOpen, Award, Calendar, Briefcase, FileText, Edit } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import ImageModal from '../../components/ImageModal'

function TeacherDetailsModal({ teacher, onClose, isModal = true }) {
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
    navigate(`/admin/teachers/edit/${teacher.teacher_id}`)
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
                  {teacher.teacher_photo_url ? (
                    <img
                      src={teacher.teacher_photo_url}
                      alt={teacher.name}
                      className="w-32 h-32 rounded-full mx-auto object-cover mb-4 border-4 border-green-100"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full mx-auto bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center mb-4 border-4 border-green-100">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}

                  {/* Name */}
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{teacher.name}</h2>
                  <p className="text-gray-600 text-sm mb-3">
                    Teacher ID: <span className="font-semibold">{teacher.teacher_id}</span>
                  </p>

                  {/* Status */}
                  <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold mb-4 ${
                    teacher.status === 1 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${teacher.status === 1 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {teacher.status === 1 ? 'Active' : 'Inactive'}
                  </span>

                  {/* Quick Info */}
                  <div className="bg-gray-50 rounded-lg p-4 text-left mt-4">
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 break-all">{teacher.user_email}</span>
                    </div>
                    {teacher.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{teacher.phone}</span>
                      </div>
                    )}
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
                    <label className="text-xs font-semibold text-gray-500 uppercase">Full Name</label>
                    <p className="text-gray-900 font-semibold mt-1">{teacher.name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                    <p className="text-gray-900 font-semibold mt-1 break-all">{teacher.user_email}</p>
                  </div>
                  {teacher.phone && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Phone</label>
                      <p className="text-gray-900 font-semibold mt-1">{teacher.phone}</p>
                    </div>
                  )}
                  {teacher.address && (
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Address</label>
                      <p className="text-gray-900 font-semibold mt-1">{teacher.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Info */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                  <h3 className="text-xl font-bold text-gray-900">Professional Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Qualification</label>
                    <p className="text-gray-900 font-semibold mt-1">{teacher.qualification || 'Not Specified'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Experience</label>
                    <p className="text-gray-900 font-semibold mt-1">
                      {teacher.experience_years ? `${teacher.experience_years} years` : 'Not Specified'}
                    </p>
                  </div>
                  {teacher.subject_specialization && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Subject Specialization</label>
                      <p className="text-gray-900 font-semibold mt-1">{teacher.subject_specialization}</p>
                    </div>
                  )}
                  {teacher.joining_date && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Joining Date</label>
                      <p className="text-gray-900 font-semibold mt-1">
                        {new Date(teacher.joining_date).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents Section (if available) */}
              {(teacher.teacher_document_url || teacher.aadhar_card_url) && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <FileText className="w-5 h-5 text-green-600" />
                    <h3 className="text-xl font-bold text-gray-900">Documents</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Teacher Document */}
                    {teacher.teacher_document_url && (
                      <div className="border-2 border-gray-200 rounded-lg p-4">
                        <label className="text-sm font-semibold text-gray-700 mb-3 block">Teacher Document</label>
                        <div className="flex flex-col items-center">
                          <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                            <FileText className="w-16 h-16 text-gray-400" />
                          </div>
                          <p className="text-gray-700 mb-3 text-center">Teacher's Document</p>
                          <button
                            onClick={() => openImageModal(teacher.teacher_document_url, "Teacher's Document")}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition w-full justify-center"
                          >
                            <FileText className="w-4 h-4" />
                            View Document
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Aadhar Card */}
                    {teacher.aadhar_card_url && (
                      <div className="border-2 border-gray-200 rounded-lg p-4">
                        <label className="text-sm font-semibold text-gray-700 mb-3 block">Aadhar Card</label>
                        <div className="flex flex-col items-center">
                          <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                            <FileText className="w-16 h-16 text-gray-400" />
                          </div>
                          <p className="text-gray-700 mb-3 text-center">Aadhar Card Document</p>
                          <button
                            onClick={() => openImageModal(teacher.aadhar_card_url, "Aadhar Card")}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition w-full justify-center"
                          >
                            <FileText className="w-4 h-4" />
                            View Document
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Edit Button */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-end">
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Teacher
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

export default TeacherDetailsModal