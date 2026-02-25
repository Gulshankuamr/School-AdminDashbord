import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Edit, Trash2, X, Download, User, 
  FileText, Users, Copy, CheckCircle, 
  Phone, MapPin, GraduationCap, Calendar
} from 'lucide-react'
import ImageModal from '../../components/ImageModal'

function TeacherDetailsModal({ teacher, onClose, onDelete }) {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState('')
  const [selectedImageTitle, setSelectedImageTitle] = useState('')

  const handleEdit = () => {
    if (onClose) onClose()
    navigate(`/admin/teachers/edit/${teacher?.teacher_id || teacher?.id}`)
  }

  const handleCopyEmail = () => {
    const email = getEmail()
    if (email) {
      navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const openImage = (url, title) => {
    if (url) {
      setSelectedImage(url)
      setSelectedImageTitle(title)
      setImageModalOpen(true)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return null
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return dateString
      
      return date.toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      })
    } catch {
      return dateString
    }
  }

  const formatGender = (gender) => {
    if (!gender) return '—'
    return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase()
  }

  // 🔥 UNIVERSAL VALUE EXTRACTOR - Handles all possible structures
  const getValue = (key) => {
    if (!teacher) return null

    // Helper to check all possible paths
    const paths = [
      // Direct access
      () => teacher[key],
      
      // teacher.data structure
      () => teacher.data?.[key],
      
      // teacher.data.teacher structure
      () => teacher.data?.teacher?.[key],
      
      // teacher.teacher structure
      () => teacher.teacher?.[key],
      
      // teacher.data.data structure
      () => teacher.data?.data?.[key],
      
      // teacher.original?.data structure (if we normalized)
      () => teacher.original?.data?.[key],
      
      // teacher.original?.data?.teacher structure
      () => teacher.original?.data?.teacher?.[key]
    ]

    for (const path of paths) {
      const value = path()
      if (value !== undefined && value !== null) {
        return value
      }
    }

    return null
  }

  // Extract all values using the universal getter
  const getTeacherId = () => {
    return teacher?.teacher_id || 
           teacher?.id || 
           teacher?.data?.teacher_id || 
           teacher?.data?.id || 
           teacher?.data?.teacher?.teacher_id
  }

  const getName = () => {
    return teacher?.name || 
           teacher?.data?.name || 
           teacher?.data?.teacher?.name || 
           teacher?.teacher?.name || 
           '—'
  }

  const getEmail = () => {
    return teacher?.user_email || 
           teacher?.email || 
           teacher?.data?.user_email || 
           teacher?.data?.email || 
           teacher?.data?.teacher?.user_email
  }

  // Get all fields
  const teacherName = getName()
  const teacherEmail = getEmail()
  const teacherId = getTeacherId()
  
  // Fields that should be in data object
  const teacherGender = getValue('gender')
  const teacherMobile = getValue('mobile_number')
  const teacherQualification = getValue('qualification')
  const teacherExperience = getValue('experience_years')
  const teacherJoiningDate = getValue('joining_date')
  const teacherFatherName = getValue('father_name')
  const teacherMotherName = getValue('mother_name')
  const teacherAddress = getValue('address')
  const teacherStatus = getValue('status')
  
  // Photos
  const teacherPhotoUrl = teacher?.teacher_photo_url || 
                          teacher?.photo_url || 
                          getValue('teacher_photo_url')
  
  const aadharCardUrl = teacher?.aadhar_card_url || 
                        teacher?.aadhar_url || 
                        getValue('aadhar_card_url')

  const joiningDate = formatDate(teacherJoiningDate)

  // Debug log to see what's coming from API
  console.log('📋 Raw teacher data:', teacher)
  console.log('📋 Extracted values:', {
    name: teacherName,
    email: teacherEmail,
    gender: teacherGender,
    mobile: teacherMobile,
    qualification: teacherQualification,
    experience: teacherExperience,
    father: teacherFatherName,
    mother: teacherMotherName,
    address: teacherAddress,
    status: teacherStatus,
    joiningDate: teacherJoiningDate
  })

  return (
    <>
      <div className="bg-white rounded-2xl overflow-hidden w-full">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Teacher Details</h2>
              <p className="text-xs text-gray-500">Complete profile information</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleEdit}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition"
            >
              <Edit className="w-3.5 h-3.5" /> Edit
            </button>
            {onDelete && (
              <button 
                onClick={() => onDelete(teacher)}
                className="flex items-center gap-1.5 px-4 py-2 border border-red-200 bg-white hover:bg-red-50 text-red-600 rounded-lg text-sm font-semibold transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            )}
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5">

          {/* Profile Section */}
          <div className="flex flex-col sm:flex-row items-start gap-5 pb-5 border-b border-gray-100">

            {/* Avatar */}
            <div className="flex-shrink-0 text-center sm:text-left">
              {teacherPhotoUrl ? (
                <img 
                  src={teacherPhotoUrl} 
                  alt={teacherName}
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 shadow cursor-pointer hover:opacity-90 transition mx-auto sm:mx-0"
                  onClick={() => openImage(teacherPhotoUrl, 'Teacher Photo')} 
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow mx-auto sm:mx-0">
                  <span className="text-white text-3xl font-bold">
                    {teacherName?.charAt(0)?.toUpperCase() || 'T'}
                  </span>
                </div>
              )}
              <div className="mt-2 flex justify-center sm:justify-start">
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  teacherStatus === 1 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${teacherStatus === 1 ? 'bg-emerald-500' : 'bg-red-400'}`}></span>
                  {teacherStatus === 1 ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Info Grid */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 w-full">

              {/* Row 1 */}
              <InfoCell label="Full Name" value={teacherName} />
              
              <InfoCell label="Email Address">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-gray-900 break-all">{teacherEmail || '—'}</span>
                  {teacherEmail && (
                    <button onClick={handleCopyEmail} className="flex-shrink-0 text-gray-400 hover:text-emerald-500 transition">
                      {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </InfoCell>

              {/* Row 2 */}
              <InfoCell label="Gender" value={formatGender(teacherGender)} />
              
              <InfoCell label="Mobile Number" value={teacherMobile || '—'} />

              {/* Row 3 */}
              <InfoCell label="Qualification" value={teacherQualification || '—'} />
              
              <InfoCell label="Experience" value={
                teacherExperience ? `${teacherExperience} year${teacherExperience !== 1 ? 's' : ''}` : '—'
              } />

              {/* Row 4 */}
              {joiningDate && (
                <InfoCell label="Joining Date" value={joiningDate} />
              )}
              
              <InfoCell label="Father's Name" value={teacherFatherName || '—'} />
              
              <InfoCell label="Mother's Name" value={teacherMotherName || '—'} />

              {/* Address - Full Width */}
              {teacherAddress && (
                <div className="sm:col-span-2 mt-2">
                  <InfoCell label="Address" value={teacherAddress} />
                </div>
              )}
            </div>
          </div>

          {/* Documents Section */}
          <div className="mt-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-emerald-100 rounded-md flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <h3 className="text-sm font-bold text-gray-800">Documents & Photos</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DocCard
                label="Teacher Photo"
                url={teacherPhotoUrl}
                onView={openImage}
                title="Teacher Photo"
              />
              <DocCard
                label="Aadhaar Card"
                url={aadharCardUrl}
                onView={openImage}
                title="Aadhaar Card"
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={() => {
              const urls = [teacherPhotoUrl, aadharCardUrl].filter(Boolean)
              urls.forEach(url => window.open(url, '_blank'))
            }}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-emerald-600 transition"
          >
            <Download className="w-4 h-4" /> Download All Docs
          </button>
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-bold transition"
          >
            Close Profile
          </button>
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

// Reusable InfoCell component
function InfoCell({ label, value, children }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      {children || <p className="text-sm font-medium text-gray-900">{value || '—'}</p>}
    </div>
  )
}

function DocCard({ label, url, onView, title }) {
  const isImage = url && /\.(jpg|jpeg|png|gif|webp|bmp)/i.test(url)
  
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-1.5">{label}</p>
      <div
        onClick={() => url && onView(url, title)}
        className={`h-32 rounded-xl border-2 overflow-hidden flex items-center justify-center transition ${
          url
            ? 'cursor-pointer border-gray-200 hover:border-emerald-300 hover:shadow-md'
            : 'border-dashed border-gray-200 bg-gray-50/80'
        }`}
      >
        {url ? (
          isImage ? (
            <img src={url} alt={label} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 w-full h-full bg-gray-50">
              <FileText className="w-8 h-8 text-gray-400" />
              <p className="text-xs text-gray-500 font-medium">PDF Document</p>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5">
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-300" />
            </div>
            <p className="text-xs text-gray-400 font-medium">Not Uploaded</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TeacherDetailsModal