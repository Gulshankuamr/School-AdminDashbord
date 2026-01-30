import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Upload } from 'lucide-react'
// import { accountantService } from '../../services/accountantService'
import { accountantService } from '../../services/accountendService/accountantService'


const EditAccountant = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const [formData, setFormData] = useState({
    accountant_id: '',
    name: '',
    user_email: '',
    password: '',
    qualification: '',
    accountant_photo: null,
    aadhar_card: null,
  })

  const [filePreviews, setFilePreviews] = useState({
    accountant_photo: null,
    aadhar_card: null,
  })

  // ✅ Fetch accountant data on mount
  useEffect(() => {
    const fetchAccountant = async () => {
      try {
        setFetching(true)
        
        // ✅ API returns data directly (based on your getAccountById service)
        const accountant = await accountantService.getAccountById(id)
        
        console.log('✅ Fetched Accountant:', accountant)

        // ✅ Set form data - API returns flat object with all fields
        setFormData({
          accountant_id: accountant.accountant_id || '',
          name: accountant.name || '',
          user_email: accountant.user_email || '',
          password: '', // Always empty for security
          qualification: accountant.qualification || '',
          accountant_photo: null,
          aadhar_card: null,
        })

        // ✅ Set file previews if URLs exist
        if (accountant.accountant_photo_url) {
          setFilePreviews(prev => ({
            ...prev,
            accountant_photo: accountant.accountant_photo_url
          }))
        }
        if (accountant.aadhar_card_url) {
          setFilePreviews(prev => ({
            ...prev,
            aadhar_card: accountant.aadhar_card_url
          }))
        }
      } catch (error) {
        console.error('❌ Error fetching accountant:', error)
        alert('Failed to load accountant data')
        navigate('/admin/accountants')
      } finally {
        setFetching(false)
      }
    }

    if (id) {
      fetchAccountant()
    }
  }, [id, navigate])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    if (files && files[0]) {
      const file = files[0]
      setFormData({ ...formData, [name]: file })

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setFilePreviews(prev => ({ ...prev, [name]: reader.result }))
        }
        reader.readAsDataURL(file)
      } else {
        setFilePreviews(prev => ({ ...prev, [name]: file.name }))
      }
    }
  }
const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)

  try {
    if (!formData.accountant_id) {
      throw new Error('Accountant ID missing')
    }

    const formDataToSend = new FormData()

    // REQUIRED
    formDataToSend.append('accountant_id', formData.accountant_id)
    formDataToSend.append('name', formData.name)
    formDataToSend.append('user_email', formData.user_email)

    // OPTIONAL
    if (formData.password && formData.password.trim() !== '') {
      formDataToSend.append('password', formData.password)
    }

    if (formData.qualification) {
      formDataToSend.append('qualification', formData.qualification)
    }

    if (formData.accountant_photo) {
      formDataToSend.append('accountant_photo', formData.accountant_photo)
    }

    if (formData.aadhar_card) {
      formDataToSend.append('aadhar_card', formData.aadhar_card)
    }

    // DEBUG
    console.log('📤 Accountant Update Payload:', {
      accountant_id: formData.accountant_id,
      name: formData.name,
      user_email: formData.user_email,
      qualification: formData.qualification,
      has_photo: !!formData.accountant_photo,
      has_aadhar: !!formData.aadhar_card,
    })

    await accountantService.updateAccountant(
      formData.accountant_id,
      formDataToSend
    )

    alert('✅ Accountant updated successfully!')
    navigate('/admin/accountants')
  } catch (error) {
    console.error('❌ Accountant update error:', error)
    alert(error.message || 'Failed to update accountant')
  } finally {
    setLoading(false)
  }
}


  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading accountant data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/admin/accountants')}
            className="p-2 hover:bg-white rounded-lg transition shadow-sm bg-white/50"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Edit Accountant</h1>
            <p className="text-gray-600 mt-1">Update accountant details</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
          {/* Basic Information */}
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-purple-500">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Name - Disabled/Read-only */}
           <input
  type="text"
  name="name"
  value={formData.name}
  onChange={handleChange}
  className="w-full px-4 py-3 border text-black rounded-lg"
  required
/>

<input
  type="email"
  name="user_email"
  value={formData.user_email}
  onChange={handleChange}
  className="w-full px-4 py-3 text-black border rounded-lg"
  required
/>


            {/* Password - Optional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                placeholder="Leave blank to keep current password"
              />
              <p className="text-xs text-gray-500 mt-1">Only fill if changing password</p>
            </div>

            {/* Qualification - Editable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qualification <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                className="w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                required
                placeholder="e.g., B.Com, CA"
              />
            </div>
          </div>

          {/* File Uploads */}
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-purple-500">
            Documents & Photos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'Accountant Photo', name: 'accountant_photo', accept: 'image/*' },
              { label: 'Aadhar Card', name: 'aadhar_card', accept: 'image/*,.pdf' },
            ].map((file) => (
              <div key={file.name}>
                <label className="block text-sm font-medium text-gray-700 mb-3">{file.label}</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-purple-500 transition bg-gray-50 hover:bg-purple-50">
                  <input
                    type="file"
                    name={file.name}
                    id={file.name}
                    onChange={handleFileChange}
                    accept={file.accept}
                    className="hidden"
                  />
                  <label htmlFor={file.name} className="cursor-pointer flex flex-col items-center">
                    {filePreviews[file.name] ? (
                      typeof filePreviews[file.name] === 'string' && 
                      (filePreviews[file.name].startsWith('data:') || filePreviews[file.name].startsWith('http')) ? (
                        <img
                          src={filePreviews[file.name]}
                          alt="Preview"
                          className="w-40 h-40 object-cover rounded-lg mb-3 shadow-md"
                        />
                      ) : (
                        <div className="text-sm text-green-600 font-medium mb-3 bg-green-50 px-4 py-2 rounded-lg">
                          ✓ {filePreviews[file.name]}
                        </div>
                      )
                    ) : (
                      <Upload className="w-16 h-16 text-gray-400 mb-3" />
                    )}
                    <span className="text-sm text-gray-700 font-medium">
                      Click to upload {file.label.toLowerCase()}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">JPG, PNG, PDF (Max 5MB)</span>
                  </label>
                </div>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-10 pt-6 border-t">
            <button
              type="submit"
              disabled={loading}
              className={`bg-purple-600 text-white px-10 py-3 rounded-lg transition font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700'
              }`}
            >
              {loading ? 'Updating...' : 'Update Accountant'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/accountants')}
              className="bg-gray-200 text-gray-700 px-10 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditAccountant