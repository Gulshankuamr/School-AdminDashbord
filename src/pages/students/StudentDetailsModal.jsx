import { User, Mail, BookOpen, FileText, Edit, Phone, MapPin, Calendar, Heart, Users, Hash, GraduationCap, DollarSign } from 'lucide-react'
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
      onClose()
    }
    navigate(`/admin/students/edit/${student.student_id}`)
  }

  // ✅ Parse selected_fee_heads — can be array or JSON string
  const parseFeeHeads = () => {
    if (!student.selected_fee_heads) return []
    if (Array.isArray(student.selected_fee_heads)) return student.selected_fee_heads
    try {
      const parsed = JSON.parse(student.selected_fee_heads)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  const feeHeadsList = parseFeeHeads()

  return (
    <>
      <div className="bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ========================= 
                Profile Card
            ========================= */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-center">

                  {/* Photo */}
                  {student.student_photo_url ? (
                    <img
                      src={student.student_photo_url} alt={student.name}
                      className="w-32 h-32 rounded-full mx-auto object-cover mb-4 border-4 border-blue-100 cursor-pointer hover:opacity-90 transition"
                      onClick={() => openImageModal(student.student_photo_url, 'Student Photo')}
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full mx-auto bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-4 border-4 border-blue-100">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}

                  {/* Name */}
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{student.name}</h2>
                  <p className="text-gray-600 text-sm mb-1">
                    Admission No: <span className="font-semibold">{student.admission_no || 'N/A'}</span>
                  </p>
                  {/* ✅ Roll No in sidebar */}
                  {student.roll_no && (
                    <p className="text-gray-500 text-sm mb-3">
                      Roll No: <span className="font-semibold">{student.roll_no}</span>
                    </p>
                  )}

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
                  <div className="bg-gray-50 rounded-lg p-4 text-left mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600 break-all">{student.user_email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600 capitalize">{student.gender || 'N/A'}</span>
                    </div>
                    {student.mobile_number && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600">{student.mobile_number}</span>
                      </div>
                    )}
                    {student.dob && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600">{student.dob}</span>
                      </div>
                    )}
                    {/* ✅ Academic Year in sidebar */}
                    {student.academic_year && (
                      <div className="flex items-center gap-2 text-sm">
                        <GraduationCap className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600">{student.academic_year}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ========================= 
                Details Section
            ========================= */}
            <div className="lg:col-span-2 space-y-6">

              {/* Personal Info */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Full Name</label>
                    <p className="text-gray-900 font-semibold mt-1">{student.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Gender</label>
                    <p className="text-gray-900 font-semibold mt-1 capitalize">{student.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Date of Birth</label>
                    <p className="text-gray-900 font-semibold mt-1">{student.dob || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Mobile Number</label>
                    <p className="text-gray-900 font-semibold mt-1">{student.mobile_number || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Religion</label>
                    <p className="text-gray-900 font-semibold mt-1">{student.religion || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                    <p className="text-gray-900 font-semibold mt-1 break-all">{student.user_email || 'N/A'}</p>
                  </div>
                  {student.address && (
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Address</label>
                      <p className="text-gray-900 font-semibold mt-1">{student.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Academic Info */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  <h3 className="text-xl font-bold text-gray-900">Academic Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Admission No</label>
                    <p className="text-gray-900 font-semibold mt-1">{student.admission_no || 'N/A'}</p>
                  </div>
                  {/* ✅ Roll No */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Roll No</label>
                    <p className="text-gray-900 font-semibold mt-1">{student.roll_no || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Class</label>
                    <p className="text-gray-900 font-semibold mt-1">{student.class_name || 'Not Assigned'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Section</label>
                    <p className="text-gray-900 font-semibold mt-1">{student.section_name || 'Not Assigned'}</p>
                  </div>
                  {/* ✅ Academic Year */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Academic Year</label>
                    <p className="text-gray-900 font-semibold mt-1">{student.academic_year || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Family Info */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-green-600" />
                  <h3 className="text-xl font-bold text-gray-900">Family Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Father's Name</label>
                    <p className="text-gray-900 font-semibold mt-1">{student.father_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Mother's Name</label>
                    <p className="text-gray-900 font-semibold mt-1">{student.mother_name || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* ✅ NEW - Fee Heads Card */}
              {feeHeadsList.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="w-5 h-5 text-yellow-600" />
                    <h3 className="text-xl font-bold text-gray-900">Fee Structure</h3>
                    <span className="ml-auto bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded-full">
                      {feeHeadsList.length} Selected
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {feeHeadsList.map((fee, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-full text-sm font-semibold"
                      >
                        <DollarSign className="w-3.5 h-3.5 text-yellow-600" />
                        {typeof fee === 'object'
                          ? (fee.fee_head_name || fee.name || `Fee #${fee.fee_head_id || fee.id}`)
                          : `Fee Head #${fee}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-2 mb-6">
                  <FileText className="w-5 h-5 text-green-600" />
                  <h3 className="text-xl font-bold text-gray-900">Documents</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                  {/* Father Document */}
                  <div className="border-2 border-gray-200 rounded-lg p-4">
                    <label className="text-sm font-semibold text-gray-700 mb-3 block">Father's Photo</label>
                    {student.father_photo_url ? (
                      <div className="flex flex-col items-center">
                        <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                          <FileText className="w-16 h-16 text-gray-400" />
                        </div>
                        <button
                          onClick={() => openImageModal(student.father_photo_url, "Father's Photo")}
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
                          <span className="text-sm">Not Available</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mother Document */}
                  <div className="border-2 border-gray-200 rounded-lg p-4">
                    <label className="text-sm font-semibold text-gray-700 mb-3 block">Mother's Photo</label>
                    {student.mother_photo_url ? (
                      <div className="flex flex-col items-center">
                        <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                          <FileText className="w-16 h-16 text-gray-400" />
                        </div>
                        <button
                          onClick={() => openImageModal(student.mother_photo_url, "Mother's Photo")}
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
                          <span className="text-sm">Not Available</span>
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
                          <span className="text-sm">Not Available</span>
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
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
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