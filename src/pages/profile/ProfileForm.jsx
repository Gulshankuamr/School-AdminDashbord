// src/pages/profile/ProfileForm.jsx
import { useState, useEffect } from 'react'
import { Camera, RefreshCw } from 'lucide-react'

const ProfileForm = ({ existingData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    logo: '',
    instituteName: '',
    targetLine: '',
    phone: '',
    website: '',
    address: '',
    country: '',
    email: '',
    instituteId: '',
    mainCampus: ''
  })

  const [logoPreview, setLogoPreview] = useState('')
  const [errors, setErrors] = useState({})

  // Pre-fill form when editing
  useEffect(() => {
    if (existingData) {
      setFormData(existingData)
      if (existingData.logo) {
        setLogoPreview(existingData.logo)
      }
    }
  }, [existingData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, logo: 'Please select an image file' }))
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, logo: 'Image size should be less than 5MB' }))
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
        setFormData(prev => ({
          ...prev,
          logo: reader.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.instituteName.trim()) {
      newErrors.instituteName = 'Institute name is required'
    }
    if (!formData.targetLine.trim()) {
      newErrors.targetLine = 'Target line is required'
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validate()) {
      onSave(formData)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Form (2 columns) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
              {/* Header */}
              <div className="mb-8">
                <h2 className="text-4xl font-bold text-gray-900 mb-3">Update Profile</h2>
                <div className="flex items-center gap-6 text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-[#13daec] rounded-full"></span>
                    <span className="text-[#13daec] font-semibold">Required*</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                    <span className="text-gray-500 font-medium">Optional</span>
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Logo Upload Section */}
                <div className="bg-gray-50 rounded-3xl border-2 border-gray-200 p-8">
                  <div className="flex items-center gap-6">
                    {/* Logo Preview */}
                    <div className="relative flex-shrink-0">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#13daec] to-[#11c5d6] flex items-center justify-center shadow-xl overflow-hidden ring-4 ring-white">
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-white text-center p-3">
                            <div className="text-2xl font-bold leading-tight">YOUR</div>
                            <div className="text-xl font-bold leading-tight">LOGO</div>
                            <div className="text-lg font-bold leading-tight">HERE</div>
                          </div>
                        )}
                      </div>
                      <label 
                        htmlFor="logo-upload" 
                        className="absolute bottom-0 right-0 w-10 h-10 bg-[#13daec] rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-[#11c5d6] transition-all hover:scale-110"
                      >
                        <Camera className="w-5 h-5 text-white" />
                      </label>
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                    </div>

                    {/* Upload Info */}
                    <div className="flex-1">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#13daec] text-white rounded-full text-xs font-bold mb-3">
                        Institute Logo*
                      </div>
                      {/* <button
                        type="button"
                        onClick={() => document.getElementById('logo-upload').click()}
                        className="flex items-center gap-2 px-6 py-3 bg-[#13daec] hover:bg-[#11c5d6] text-white rounded-full font-semibold shadow-md hover:shadow-lg transition-all"
                      >
                        <Camera className="w-4 h-4" />
                        Change Logo
                      </button> */}
                      {/* {errors.logo && (
                        <p className="text-red-500 text-xs mt-2">{errors.logo}</p>
                      )} */}
                    </div>
                  </div>
                </div>

                {/* Institute Name */}
                <div>
                  <label className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#13daec] text-white rounded-full text-xs font-bold mb-3">
                    Name of Institute*
                  </label>
                  <input
                    type="text"
                    name="instituteName"
                    value={formData.instituteName}
                    onChange={handleChange}
                    placeholder="Institute Name"
                    className={`w-full px-5 py-4 bg-white border-2 rounded-3xl text-black placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#13daec]/20 focus:border-[#13daec] transition-all ${
                      errors.instituteName ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.instituteName && (
                    <p className="text-red-500 text-xs mt-1 ml-2">{errors.instituteName}</p>
                  )}
                </div>

                {/* Target Line */}
                <div>
                  <label className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#13daec] text-white rounded-full text-xs font-bold mb-3">
                    Target Line*
                  </label>
                  <input
                    type="text"
                    name="targetLine"
                    value={formData.targetLine}
                    onChange={handleChange}
                    placeholder="Target Line"
                    className={`w-full px-5 py-4 bg-white border-2 rounded-3xl text-black placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#13daec]/20 focus:border-[#13daec] transition-all ${
                      errors.targetLine ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.targetLine && (
                    <p className="text-red-500 text-xs mt-1 ml-2">{errors.targetLine}</p>
                  )}
                </div>

                {/* Two Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone Number */}
                  <div>
                    <label className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#13daec] text-white rounded-full text-xs font-bold mb-3">
                      Phone Number*
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Phone No"
                      className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-3xl text-black placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#13daec]/20 focus:border-[#13daec] transition-all"
                    />
                  </div>

                  {/* Website */}
                  <div>
                    <label className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-400 text-white rounded-full text-xs font-bold mb-3">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="Website URL"
                      className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-3xl text-black placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-100 focus:border-gray-400 transition-all"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#13daec] text-white rounded-full text-xs font-bold mb-3">
                    Address*
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Address"
                    className={`w-full px-5 py-4 bg-white border-2 rounded-3xl text-black placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#13daec]/20 focus:border-[#13daec] transition-all ${
                      errors.address ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1 ml-2">{errors.address}</p>
                  )}
                </div>

                {/* Country */}
                <div>
                  <label className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#13daec] text-white rounded-full text-xs font-bold mb-3">
                    Country*
                  </label>
                  <div className="relative">
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className={`w-full px-5 py-4 bg-white border-2 rounded-3xl text-black appearance-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#13daec]/20 focus:border-[#13daec] transition-all ${
                        errors.country ? 'border-red-300' : 'border-gray-200'
                      }`}
                    >
                      <option value="">Select Country</option>
                      <option value="United States">United States</option>
                      <option value="India">India</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="Japan">Japan</option>
                      <option value="China">China</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {errors.country && (
                    <p className="text-red-500 text-xs mt-1 ml-2">{errors.country}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-400 text-white rounded-full text-xs font-bold mb-3">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-3xl text-black placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-100 focus:border-gray-400 transition-all"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-4 pt-6">
                  {existingData && (
                    <button
                      type="button"
                      onClick={onCancel}
                      className="px-8 py-3.5 border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-10 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  >
                    <RefreshCw className="w-5 h-5" />
                    {existingData ? 'Update Profile' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Side - Preview Card (1 column) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sticky top-6">
              {/* Profile View Button */}
              <button className="w-full mb-6 px-5 py-2.5 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-full text-sm font-bold shadow-md transition-all">
                Profile View
              </button>

              {/* Preview Content */}
              <div className="text-center">
                {/* Logo Preview */}
                <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-[#13daec] to-[#11c5d6] flex items-center justify-center shadow-xl mb-5 overflow-hidden ring-4 ring-gray-100">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-white p-2">
                      <div className="text-xl font-bold leading-tight">YOUR</div>
                      <div className="text-lg font-bold leading-tight">LOGO</div>
                      <div className="text-base font-bold leading-tight">HERE</div>
                    </div>
                  )}
                </div>

                {/* Institute Info */}
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {formData.instituteName || 'Your Institute Name'}
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  {formData.targetLine || 'Institute Target Line'}
                </p>

                {/* Contact Details */}
                <div className="space-y-4 text-left">
                  {/* Phone */}
                  <div className="flex items-start gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-0.5">Phone No</p>
                      <p className="text-sm text-black font-medium">
                        {formData.phone || 'XXXXXXXXXXX'}
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-0.5">Email</p>
                      <p className="text-sm text-[#13daec] font-medium break-all">
                        {formData.email || 'your-email@example.com'}
                      </p>
                    </div>
                  </div>

                  {/* Website */}
                  <div className="flex items-start gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-0.5">Website</p>
                      <p className="text-sm text-black font-medium break-all">
                        {formData.website || '--------- ------- ------'}
                      </p>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-0.5">Address</p>
                      <p className="text-sm text-black font-medium">
                        {formData.address || '--------- ------- ------'}
                      </p>
                    </div>
                  </div>

                  {/* Country */}
                  <div className="flex items-start gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-0.5">Country</p>
                      <p className="text-sm text-black font-medium">
                        {formData.country || '--------'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileForm