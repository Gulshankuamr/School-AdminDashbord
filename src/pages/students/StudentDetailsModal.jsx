import { User, Mail, BookOpen, FileText, Edit, Phone, MapPin, Calendar, Heart, Users, Hash, GraduationCap, DollarSign } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import ImageModal from '../../components/ImageModal'
import { studentService } from '../../services/studentService/studentService'

// Inline Layers icon
function LayersIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  )
}

function StudentDetailsModal({ student: initialStudent, onClose }) {
  const navigate = useNavigate()

  // ✅ Full student data — fetched fresh from getStudentById API
  const [student, setStudent] = useState(initialStudent)
  const [loadingDetails, setLoadingDetails] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState('')
  const [selectedImageTitle, setSelectedImageTitle] = useState('')

  // ✅ Fetch FULL student data on modal open — fixes all N/A fields
  useEffect(() => {
    const fetchFullData = async () => {
      if (!initialStudent?.student_id) {
        setLoadingDetails(false)
        return
      }
      try {
        setLoadingDetails(true)
        setFetchError(null)
        const fullData = await studentService.getStudentById(initialStudent.student_id)
        // Merge: API full data takes priority, list data as fallback
        setStudent({ ...initialStudent, ...fullData })
      } catch (err) {
        console.error('Error loading full student details:', err)
        setFetchError('Could not load complete details')
        setStudent(initialStudent) // fallback to list data
      } finally {
        setLoadingDetails(false)
      }
    }
    fetchFullData()
  }, [initialStudent?.student_id])

  const openImageModal = (url, title) => {
    setSelectedImage(url)
    setSelectedImageTitle(title)
    setImageModalOpen(true)
  }

  const handleEdit = () => {
    if (onClose) onClose()
    navigate(`/admin/students/edit/${student.student_id}`)
  }

  const parseFeeHeads = () => {
    if (!student?.selected_fee_heads) return []
    if (Array.isArray(student.selected_fee_heads)) return student.selected_fee_heads
    try {
      const parsed = JSON.parse(student.selected_fee_heads)
      return Array.isArray(parsed) ? parsed : []
    } catch { return [] }
  }

  const feeHeadsList = parseFeeHeads()

  // ✅ Field component
  const InfoField = ({ icon: Icon, label, value, colSpan = false }) => (
    <div className={colSpan ? 'sm:col-span-2' : ''}>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{label}</p>
      <div className="flex items-start gap-2">
        <Icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
        <p className={`text-sm font-medium break-words ${value ? 'text-gray-800' : 'text-gray-400 italic'}`}>
          {value || 'N/A'}
        </p>
      </div>
    </div>
  )

  // Loading state
  if (loadingDetails) {
    return (
      <div className="bg-gray-50 flex items-center justify-center" style={{ minHeight: 400 }}>
        <div className="text-center">
          <div className="relative mx-auto w-12 h-12 mb-3">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <User className="w-5 h-5 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-500 text-sm">Loading full details...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-gray-50 p-4 sm:p-5">
        <div className="max-w-5xl mx-auto">

          {/* Non-blocking error banner */}
          {fetchError && (
            <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
              <span className="text-amber-600 text-xs">⚠ {fetchError} — showing partial data</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* ====== LEFT: Profile Card ====== */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="text-center">

                  {/* Avatar / Photo */}
                  {student?.student_photo_url ? (
                    <img
                      src={student.student_photo_url}
                      alt={student.name}
                      className="w-24 h-24 rounded-full mx-auto object-cover mb-3 border-2 border-gray-200 shadow cursor-pointer hover:opacity-90 transition"
                      onClick={() => openImageModal(student.student_photo_url, 'Student Photo')}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full mx-auto bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-3 border-2 border-blue-100 shadow">
                      <span className="text-white text-3xl font-bold">
                        {student?.name?.charAt(0)?.toUpperCase() || 'S'}
                      </span>
                    </div>
                  )}

                  <h2 className="text-lg font-bold text-gray-900 mb-1">{student?.name || 'N/A'}</h2>
                  <p className="text-xs text-gray-500 mb-0.5">
                    Adm: <span className="font-semibold text-gray-700">{student?.admission_no || 'N/A'}</span>
                  </p>
                  {student?.roll_no && (
                    <p className="text-xs text-gray-500 mb-2">
                      Roll: <span className="font-semibold text-gray-700">{student.roll_no}</span>
                    </p>
                  )}

                  {/* Status */}
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold mb-4 ${
                    student?.status === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${student?.status === 1 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {student?.status === 1 ? 'Active' : 'Inactive'}
                  </span>

                  {/* Quick info */}
                  <div className="bg-gray-50 rounded-lg p-3 text-left space-y-2 mb-4">
                    {[
                      { icon: Mail,          val: student?.user_email,      break: true },
                      { icon: User,          val: student?.gender,           cap: true },
                      { icon: Phone,         val: student?.mobile_number },
                      { icon: Calendar,      val: student?.dob },
                      { icon: GraduationCap, val: student?.academic_year },
                      { icon: BookOpen,      val: student?.class_name ? `${student.class_name}${student?.section_name ? ` — ${student.section_name}` : ''}` : null },
                    ].filter(r => r.val).map((row, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <row.icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className={`text-gray-600 ${row.break ? 'break-all' : ''} ${row.cap ? 'capitalize' : ''}`}>
                          {row.val}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleEdit}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit Student
                  </button>
                </div>
              </div>
            </div>

            {/* ====== RIGHT: Detail Cards ====== */}
            <div className="lg:col-span-2 space-y-4">

              {/* Personal Information */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <div className="p-1.5 bg-blue-50 rounded-lg"><User className="w-4 h-4 text-blue-600" /></div>
                  <h3 className="font-semibold text-gray-800">Personal Information</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoField icon={User}     label="Full Name"     value={student?.name} />
                  <InfoField icon={User}     label="Gender"        value={student?.gender} />
                  <InfoField icon={Calendar} label="Date of Birth" value={student?.dob} />
                  <InfoField icon={Phone}    label="Mobile Number" value={student?.mobile_number} />
                  <InfoField icon={Heart}    label="Religion"      value={student?.religion} />
                  <InfoField icon={Mail}     label="Email"         value={student?.user_email} />
                  {student?.address && (
                    <InfoField icon={MapPin} label="Address" value={student.address} colSpan />
                  )}
                </div>
              </div>

              {/* Academic Information */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <div className="p-1.5 bg-purple-50 rounded-lg"><BookOpen className="w-4 h-4 text-purple-600" /></div>
                  <h3 className="font-semibold text-gray-800">Academic Information</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoField icon={Hash}          label="Admission No"  value={student?.admission_no} />
                  <InfoField icon={Hash}          label="Roll No"       value={student?.roll_no} />
                  <InfoField icon={BookOpen}      label="Class"         value={student?.class_name} />
                  <InfoField icon={LayersIcon}    label="Section"       value={student?.section_name} />
                  <InfoField icon={GraduationCap} label="Academic Year" value={student?.academic_year} />
                </div>
              </div>

              {/* Family Information */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <div className="p-1.5 bg-green-50 rounded-lg"><Users className="w-4 h-4 text-green-600" /></div>
                  <h3 className="font-semibold text-gray-800">Family Information</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoField icon={User} label="Father's Name" value={student?.father_name} />
                  <InfoField icon={User} label="Mother's Name" value={student?.mother_name} />
                </div>
              </div>

              {/* Fee Structure */}
              {feeHeadsList.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                    <div className="p-1.5 bg-yellow-50 rounded-lg"><DollarSign className="w-4 h-4 text-yellow-600" /></div>
                    <h3 className="font-semibold text-gray-800">Fee Structure</h3>
                    <span className="ml-auto bg-yellow-100 text-yellow-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      {feeHeadsList.length} Selected
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {feeHeadsList.map((fee, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-full text-xs font-semibold">
                        <DollarSign className="w-3 h-3 text-yellow-600" />
                        {typeof fee === 'object'
                          ? (fee.fee_head_name || fee.head_name || fee.name || `Fee #${fee.fee_head_id || fee.id}`)
                          : `Fee Head #${fee}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <div className="p-1.5 bg-indigo-50 rounded-lg"><FileText className="w-4 h-4 text-indigo-600" /></div>
                  <h3 className="font-semibold text-gray-800">Documents & Photos</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Father's Photo", urlKey: 'father_photo_url', title: "Father's Photo" },
                    { label: "Mother's Photo", urlKey: 'mother_photo_url', title: "Mother's Photo" },
                    { label: "Aadhar Card",    urlKey: 'aadhar_card_url',  title: "Aadhar Card" },
                  ].map((doc) => {
                    const url = student?.[doc.urlKey]
                    const isImage = url && /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
                    return (
                      <div key={doc.label} className="border border-gray-200 rounded-xl p-3">
                        <p className="text-xs font-semibold text-gray-600 mb-2">{doc.label}</p>
                        {url ? (
                          <div className="flex flex-col gap-2">
                            {isImage ? (
                              <img
                                src={url} alt={doc.label}
                                className="w-full h-28 object-cover rounded-lg cursor-pointer hover:opacity-90 transition border border-gray-100"
                                onClick={() => openImageModal(url, doc.title)}
                              />
                            ) : (
                              <div className="w-full h-28 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                                <FileText className="w-10 h-10 text-gray-300" />
                              </div>
                            )}
                            <button
                              onClick={() => openImageModal(url, doc.title)}
                              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-xs font-medium"
                            >
                              <FileText className="w-3.5 h-3.5" /> View Document
                            </button>
                          </div>
                        ) : (
                          <div className="w-full h-28 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-200">
                            <div className="text-center text-gray-300">
                              <FileText className="w-8 h-8 mx-auto mb-1" />
                              <span className="text-xs">Not Uploaded</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

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