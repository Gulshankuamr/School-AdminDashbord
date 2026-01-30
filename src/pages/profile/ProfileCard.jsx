// src/pages/profile/ProfileCard.jsx
import { Edit2, Phone, Mail, Globe, MapPin, Target, Building2, Calendar } from 'lucide-react'

const ProfileCard = ({ profile, onEdit }) => {
  // Safety check
  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">No profile data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Institute Profile</h1>
          <p className="text-gray-500 mt-1">View your institute information</p>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-6 py-3 bg-[#13daec] text-white rounded-lg hover:bg-[#11c5d6] transition-colors shadow-sm"
        >
          <Edit2 className="w-4 h-4" />
          Update Profile
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Logo and Basic Info */}
        <div className="lg:col-span-1">
          {/* Logo Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <div className="text-center">
              <div className="inline-block mb-4">
                <div className="w-40 h-40 mx-auto  border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden   rounded-full">
                  {profile.logo ? (
                    <img 
                      src={profile.logo} 
                      alt="Institute Logo" 
                      className="w-full h-full object-contain p-4 rounded-full"
                    />
                  ) : (
                    <div className="text-gray-400">
                      <div className="text-sm font-medium mb-1">YOUR LOGO</div>
                      <div className="text-xs">No logo uploaded</div>
                    </div>
                  )}
                </div>
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {profile.instituteName || 'Your Institute Name'}
              </h2>
              {profile.targetLine && (
                <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
                  <Target className="w-4 h-4" />
                  <span className="text-sm">{profile.targetLine}</span>
                </div>
              )}
              
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Profile Active
              </div>
            </div>
          </div>

          {/* Quick Contact */}
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-[#13daec]/20 to-[#13daec]/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <Phone className="w-5 h-5 text-[#13daec]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-900">{profile.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <Mail className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900 break-all">{profile.email || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {/* Institute Details Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#13daec]/10 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#13daec]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Institute Information</h3>
                  <p className="text-sm text-gray-500">Complete details of your institute</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Institute Name</p>
                  <p className="font-medium text-gray-900 text-lg">{profile.instituteName}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Country</p>
                  <p className="font-medium text-gray-900 text-lg">{profile.country || 'Not specified'}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Website</p>
                  {profile.website ? (
                    <a 
                      href={profile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-[#13daec] hover:text-[#11c5d6] text-lg inline-flex items-center gap-2"
                    >
                      <Globe className="w-4 h-4" />
                      Visit Website
                    </a>
                  ) : (
                    <p className="font-medium text-gray-900 text-lg">Not provided</p>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Established</p>
                  <p className="font-medium text-gray-900 text-lg">
                    {new Date().getFullYear()}
                  </p>
                </div>
              </div>

              {/* Address Section */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-2">Address</p>
                    <p className="font-medium text-gray-900">
                      {profile.address || 'No address provided'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Target Line & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <Target className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Target Line</p>
                    <p className="font-semibold text-gray-900 text-lg">
                      {profile.targetLine || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <Calendar className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="font-semibold text-gray-900 text-lg">
                      {new Date().toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900">Need to make changes?</p>
                  <p className="text-sm text-gray-600">Update your institute information anytime</p>
                </div>
                <button
                  onClick={onEdit}
                  className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium shadow-sm"
                >
                  Edit Profile Information
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileCard