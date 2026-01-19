import { User, Mail, Phone, Award, FileText, Edit } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import ImageModal from '../../components/ImageModal'

function AccountantDetailsModal({ accountant, onClose }) {
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
    navigate(`/admin/accountants/edit/${accountant.accountant_id}`)
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
                  {accountant.accountant_photo_url ? (
                    <img
                      src={accountant.accountant_photo_url}
                      alt={accountant.name}
                      className="w-32 h-32 rounded-full mx-auto object-cover mb-4 border-4 border-purple-100"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full mx-auto bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mb-4 border-4 border-purple-100">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}

                  {/* Name */}
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{accountant.name}</h2>
                  <p className="text-gray-600 text-sm mb-3">
                    ID: <span className="font-semibold">{accountant.accountant_id}</span>
                  </p>

                  {/* Status */}
                  <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold mb-4 ${
                    accountant.status === 1 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${accountant.status === 1 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {accountant.status === 1 ? 'Active' : 'Inactive'}
                  </span>

                  {/* Quick Info */}
                  <div className="bg-gray-50 rounded-lg p-4 text-left mt-4">
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 break-all">{accountant.user_email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{accountant.phone || 'N/A'}</span>
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
                    <label className="text-xs font-semibold text-gray-500 uppercase">Full Name</label>
                    <p className="text-gray-900 font-semibold mt-1">{accountant.name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Phone Number</label>
                    <p className="text-gray-900 font-semibold mt-1">{accountant.phone || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Email Address</label>
                    <p className="text-gray-900 font-semibold mt-1 break-all">{accountant.user_email}</p>
                  </div>
                </div>
              </div>

              {/* Professional Info */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-purple-600" />
                  <h3 className="text-xl font-bold text-gray-900">Professional Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Qualification</label>
                    <p className="text-gray-900 font-semibold mt-1">{accountant.qualification || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Experience</label>
                    <p className="text-gray-900 font-semibold mt-1">{accountant.experience || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Documents Section (अगर accountant में documents हैं तो) */}
              {accountant.documents && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <FileText className="w-5 h-5 text-green-600" />
                    <h3 className="text-xl font-bold text-gray-900">Documents</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Add document sections as needed */}
                  </div>
                </div>
              )}

              {/* Edit Button */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-end">
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Accountant
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

export default AccountantDetailsModal