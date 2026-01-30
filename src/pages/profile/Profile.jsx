// src/pages/profile/Profile.jsx
import { useEffect, useState } from 'react'
import ProfileForm from './ProfileForm'
import ProfileCard from './ProfileCard'

const Profile = () => {
  const [profileData, setProfileData] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load profile from localStorage on mount
    const loadProfile = () => {
      try {
        const savedProfile = localStorage.getItem('userProfile')
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile)
          setProfileData(parsed)
          setIsEditing(false)
        } else {
          setIsEditing(true)
        }
      } catch (error) {
        console.error('Error loading profile:', error)
        setIsEditing(true)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleSave = (data) => {
    // Save to localStorage
    localStorage.setItem('userProfile', JSON.stringify(data))
    setProfileData(data)
    setIsEditing(false)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    if (profileData) {
      setIsEditing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#13daec] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <span>General Settings</span>
            <span>|</span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Institute Profile
            </span>
          </div>
        </div>

        {/* Conditional Rendering: Form or Card */}
        {isEditing ? (
          <ProfileForm
            existingData={profileData}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <ProfileCard
            profile={profileData}
            onEdit={handleEdit}
          />
        )}
      </div>
    </div>
  )
}

export default Profile