import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Edit, Trash2, X, Download, User, DollarSign,
  FileText, Users, Copy, CheckCircle
} from 'lucide-react'
import { studentService } from '../../services/studentService/studentService'
import ImageModal from '../../components/ImageModal'

function parseFeeHeadIds(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) {
    return raw.map(item =>
      typeof item === 'object' ? Number(item.fee_head_id || item.id || 0) : Number(item)
    ).filter(n => n > 0)
  }
  if (typeof raw === 'string') {
    const t = raw.trim()
    if (t.startsWith('[')) {
      try {
        const p = JSON.parse(t)
        return Array.isArray(p)
          ? p.map(item => typeof item === 'object' ? Number(item.fee_head_id || item.id) : Number(item)).filter(n => n > 0)
          : []
      } catch {}
    }
    const parts = t.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n) && n > 0)
    if (parts.length) return parts
  }
  const n = Number(raw)
  return n > 0 ? [n] : []
}

function StudentDetailsModal({ student: listStudent, onClose, onDelete }) {
  const navigate = useNavigate()
  const [student, setStudent] = useState(listStudent)
  const [extraLoading, setExtraLoading] = useState(true)
  const [allFeeHeads, setAllFeeHeads] = useState([])
  const [copied, setCopied] = useState(false)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState('')
  const [selectedImageTitle, setSelectedImageTitle] = useState('')

  useEffect(() => {
    if (!listStudent?.student_id) { setExtraLoading(false); return }
    const fetchExtra = async () => {
      try {
        const [detailData, feeHeadsData] = await Promise.all([
          studentService.getStudentById(listStudent.student_id).catch(() => null),
          studentService.getAllFeeHeads().catch(() => []),
        ])
        if (detailData) setStudent(prev => ({ ...prev, ...detailData }))
        setAllFeeHeads(Array.isArray(feeHeadsData) ? feeHeadsData : [])
      } catch (err) {
        console.error('Extra details error:', err)
      } finally {
        setExtraLoading(false)
      }
    }
    fetchExtra()
  }, [listStudent?.student_id])

  const feeHeadsList = (() => {
    const ids = parseFeeHeadIds(student?.selected_fee_heads)
    return ids.map(id => {
      const match = allFeeHeads.find(fh => Number(fh.fee_head_id) === id)
      return { id, name: match?.head_name || match?.fee_head_name || null }
    })
  })()

  const handleEdit = () => {
    if (onClose) onClose()
    navigate(`/admin/students/edit/${student.student_id}`)
  }

  const handleCopyEmail = () => {
    if (student?.user_email) {
      navigator.clipboard.writeText(student.user_email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const openImage = (url, title) => {
    setSelectedImage(url); setSelectedImageTitle(title); setImageModalOpen(true)
  }

  const classSection = [student?.class_name, student?.section_name].filter(Boolean).join(' - ')

  return (
    <>
      <div className="bg-white rounded-2xl overflow-hidden w-full">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Student Details</h2>
              <p className="text-xs text-gray-500">Manage and view complete profile information</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleEdit}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition">
              <Edit className="w-3.5 h-3.5" /> Edit
            </button>
            {onDelete && (
              <button onClick={() => onDelete(student)}
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

          {/* Profile Section */}
          <div className="flex items-start gap-5 pb-5 border-b border-gray-100">
            {/* Avatar */}
            <div className="flex-shrink-0 text-center">
              {student?.student_photo_url ? (
                <img src={student.student_photo_url} alt={student.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 shadow cursor-pointer hover:opacity-90 transition"
                  onClick={() => openImage(student.student_photo_url, 'Student Photo')} />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow">
                  <span className="text-white text-2xl font-bold">
                    {student?.name?.charAt(0)?.toUpperCase() || 'S'}
                  </span>
                </div>
              )}
              <div className="mt-1.5 flex justify-center">
                <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                  student?.status === 1 ? 'text-green-600' : 'text-red-500'}`}>
                  <span className={`w-2 h-2 rounded-full ${student?.status === 1 ? 'bg-green-500' : 'bg-red-400'}`}></span>
                </span>
              </div>
            </div>

            {/* Info Grid */}
            <div className="flex-1 grid grid-cols-3 gap-x-8 gap-y-4">
              <InfoCell label="Full Name" value={student?.name} />
              <InfoCell label="Admission No" value={student?.admission_no} />
              <InfoCell label="Email Address">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-gray-900 truncate">{student?.user_email || '—'}</span>
                  {student?.user_email && (
                    <button onClick={handleCopyEmail} className="flex-shrink-0 text-gray-400 hover:text-blue-500 transition">
                      {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </InfoCell>

              <InfoCell label="Gender" value={student?.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : null} />
              <InfoCell label="Class & Section" value={classSection} />
              <InfoCell label="Status">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  student?.status === 1 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'
                }`}>
                  {student?.status === 1 ? 'Active' : 'Inactive'}
                </span>
              </InfoCell>

              {/* Extra fields */}
              {!extraLoading && (
                <>
                  {student?.mobile_number && <InfoCell label="Mobile Number" value={student.mobile_number} />}
                  {student?.dob && <InfoCell label="Date of Birth" value={student.dob.split('T')[0]} />}
                  {student?.academic_year && <InfoCell label="Academic Year" value={student.academic_year} />}
                  {student?.roll_no && <InfoCell label="Roll Number" value={student.roll_no} />}
                  {student?.religion && <InfoCell label="Religion" value={student.religion} />}
                  {student?.father_name && <InfoCell label="Father's Name" value={student.father_name} />}
                  {student?.mother_name && <InfoCell label="Mother's Name" value={student.mother_name} />}
                  {student?.address && (
                    <div className="col-span-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Address</p>
                      <p className="text-sm font-semibold text-gray-900">{student.address}</p>
                    </div>
                  )}
                </>
              )}
              {extraLoading && (
                <div className="col-span-3 flex items-center gap-2 text-gray-400 text-xs">
                  <div className="animate-spin rounded-full h-3 w-3 border border-gray-300 border-t-gray-500"></div>
                  Loading more details...
                </div>
              )}
            </div>
          </div>

          {/* Fee Heads */}
          {feeHeadsList.length > 0 && (
            <div className="mt-4 mb-0 p-3 bg-yellow-50 border border-yellow-100 rounded-xl">
              <p className="text-xs font-bold text-yellow-700 uppercase tracking-wide mb-2">
                Fee Structure — {feeHeadsList.length} head{feeHeadsList.length > 1 ? 's' : ''}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {feeHeadsList.map(fee => (
                  <span key={fee.id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-yellow-200 text-yellow-800 rounded-full text-xs font-semibold">
                    <DollarSign className="w-3 h-3 text-yellow-500" />
                    {fee.name || `Fee Head #${fee.id}`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Parent & Document Information */}
          <div className="mt-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-orange-100 rounded-md flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-orange-500" />
              </div>
              <h3 className="text-sm font-bold text-gray-800">Parent & Document Information</h3>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <DocCard label="Father's Photo" url={student?.father_photo_url} onView={openImage} title="Father's Photo" />
              <DocCard label="Mother's Photo" url={student?.mother_photo_url} onView={openImage} title="Mother's Photo" />
              <DocCard label="Aadhaar Card (ID)" url={student?.aadhar_card_url} onView={openImage} title="Aadhaar Card" isAadhar />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={() => {
              [student?.father_photo_url, student?.mother_photo_url, student?.aadhar_card_url, student?.student_photo_url]
                .filter(Boolean).forEach(url => window.open(url, '_blank'))
            }}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-blue-600 transition">
            <Download className="w-4 h-4" /> Download All Docs
          </button>
          <button onClick={onClose}
            className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-bold transition">
            Close Profile
          </button>
        </div>
      </div>

      <ImageModal isOpen={imageModalOpen} onClose={() => setImageModalOpen(false)} imageUrl={selectedImage} title={selectedImageTitle} />
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
          url ? 'cursor-pointer border-gray-200 hover:border-blue-300 hover:shadow-md' : 'border-dashed border-gray-200 bg-gray-50/80'
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

export default StudentDetailsModal