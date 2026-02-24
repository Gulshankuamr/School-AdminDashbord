import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Edit, Trash2, X, Download, User, Briefcase,
  FileText, Users, Copy, CheckCircle, Mail, Phone,
  MapPin, GraduationCap, Calendar, Award
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
    navigate(`/admin/teachers/edit/${teacher.teacher_id}`)
  }

  const handleCopyEmail = () => {
    if (teacher?.user_email) {
      navigator.clipboard.writeText(teacher.user_email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const openImage = (url, title) => {
    setSelectedImage(url)
    setSelectedImageTitle(title)
    setImageModalOpen(true)
  }

  const joiningDate = teacher?.joining_date
    ? new Date(teacher.joining_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : null

  return (
    <>
      <div className="bg-white rounded-2xl overflow-hidden w-full">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Teacher Details</h2>
              <p className="text-xs text-gray-500">Manage and view complete profile information</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleEdit}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition">
              <Edit className="w-3.5 h-3.5" /> Edit
            </button>
            {onDelete && (
              <button onClick={() => onDelete(teacher)}
                className="flex items-center gap-1.5 px-4 py-2 border border-red-200 bg-white hover:bg-red-50 text-red-600 rounded-lg text-sm font-semibold transition">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5">

          {/* ── Profile Section ── */}
          <div className="flex items-start gap-5 pb-5 border-b border-gray-100">

            {/* Avatar */}
            <div className="flex-shrink-0 text-center">
              {teacher?.teacher_photo_url ? (
                <img src={teacher.teacher_photo_url} alt={teacher.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 shadow cursor-pointer hover:opacity-90 transition"
                  onClick={() => openImage(teacher.teacher_photo_url, 'Teacher Photo')} />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow">
                  <span className="text-white text-2xl font-bold">
                    {teacher?.name?.charAt(0)?.toUpperCase() || 'T'}
                  </span>
                </div>
              )}
              <div className="mt-1.5 flex justify-center">
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                  teacher?.status === 1 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${teacher?.status === 1 ? 'bg-emerald-500' : 'bg-red-400'}`}></span>
                  {teacher?.status === 1 ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Info Grid — 3 columns matching student modal */}
            <div className="flex-1 grid grid-cols-3 gap-x-8 gap-y-4">

              <InfoCell label="Full Name" value={teacher?.name} />

              <InfoCell label="Teacher ID">
                <span className="text-sm font-bold text-gray-900">#{teacher?.teacher_id || '—'}</span>
              </InfoCell>

              <InfoCell label="Email Address">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-gray-900 truncate">{teacher?.user_email || '—'}</span>
                  {teacher?.user_email && (
                    <button onClick={handleCopyEmail} className="flex-shrink-0 text-gray-400 hover:text-emerald-500 transition">
                      {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </InfoCell>

              <InfoCell label="Gender" value={teacher?.gender
                ? teacher.gender.charAt(0).toUpperCase() + teacher.gender.slice(1)
                : null} />

              <InfoCell label="Mobile Number" value={teacher?.mobile_number || teacher?.phone || null} />

              <InfoCell label="Status">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  teacher?.status === 1
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-red-50 text-red-600 border-red-200'
                }`}>
                  {teacher?.status === 1 ? 'Active' : 'Inactive'}
                </span>
              </InfoCell>

              {teacher?.qualification && (
                <InfoCell label="Qualification" value={teacher.qualification} />
              )}
              {teacher?.experience_years != null && (
                <InfoCell label="Experience" value={`${teacher.experience_years} year${teacher.experience_years !== 1 ? 's' : ''}`} />
              )}
              {joiningDate && (
                <InfoCell label="Joining Date" value={joiningDate} />
              )}

              {teacher?.address && (
                <div className="col-span-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Address</p>
                  <p className="text-sm font-semibold text-gray-900">{teacher.address}</p>
                </div>
              )}

            </div>
          </div>

          {/* ── Family Information ── */}
          {(teacher?.father_name || teacher?.mother_name) && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Family Information
              </p>
              <div className="grid grid-cols-2 gap-4">
                {teacher.father_name && (
                  <div>
                    <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-0.5">Father's Name</p>
                    <p className="text-sm font-bold text-gray-900">{teacher.father_name}</p>
                  </div>
                )}
                {teacher.mother_name && (
                  <div>
                    <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-0.5">Mother's Name</p>
                    <p className="text-sm font-bold text-gray-900">{teacher.mother_name}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Documents Section ── */}
          <div className="mt-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-emerald-100 rounded-md flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <h3 className="text-sm font-bold text-gray-800">Documents & Photos</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <DocCard
                label="Teacher Photo"
                url={teacher?.teacher_photo_url}
                onView={openImage}
                title="Teacher Photo"
              />
              <DocCard
                label="Aadhaar Card"
                url={teacher?.aadhar_card_url}
                onView={openImage}
                title="Aadhaar Card"
                isAadhar
              />
            </div>
          </div>

        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={() => {
              [teacher?.teacher_photo_url, teacher?.aadhar_card_url]
                .filter(Boolean)
                .forEach(url => window.open(url, '_blank'))
            }}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-emerald-600 transition">
            <Download className="w-4 h-4" /> Download All Docs
          </button>
          <button onClick={onClose}
            className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-bold transition">
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

function InfoCell({ label, value, children }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      {children || <p className="text-sm font-bold text-gray-900">{value || '—'}</p>}
    </div>
  )
}

function DocCard({ label, url, onView, title, isAadhar }) {
  const isImg = url && /\.(jpg|jpeg|png|gif|webp)/i.test(url)
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-1.5">{label}</p>
      <div
        onClick={() => url && onView(url, title)}
        className={`h-32 rounded-xl border overflow-hidden flex items-center justify-center transition ${
          url
            ? 'cursor-pointer border-gray-200 hover:border-emerald-300 hover:shadow-md'
            : 'border-dashed border-gray-200 bg-gray-50/80'
        }`}
      >
        {url ? (
          isImg ? (
            <img src={url} alt={label} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 w-full h-full bg-gray-50">
              {isAadhar ? (
                <>
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-red-500" />
                  </div>
                  <p className="text-xs text-gray-500 font-bold tracking-widest">**** **** 1234</p>
                </>
              ) : (
                <>
                  <FileText className="w-8 h-8 text-gray-300" />
                  <p className="text-xs text-gray-400">View File</p>
                </>
              )}
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