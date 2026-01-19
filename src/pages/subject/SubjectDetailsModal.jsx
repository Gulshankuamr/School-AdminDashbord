import React from 'react'
import { X, Calendar, Hash, Activity } from 'lucide-react'

function SubjectDetailsModal({ subject, onClose }) {
  if (!subject) return null

  return (
    <div className="relative max-w-lg w-full mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Subject Details</h2>
            <p className="text-indigo-100 mt-1">Complete information about the subject</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-white/20 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-8">
        {/* Subject ID */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <Hash className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Subject ID</p>
              <p className="text-2xl font-bold text-gray-900">#{subject.subject_id}</p>
            </div>
          </div>
        </div>

        {/* Subject Name */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Subject Name
          </label>
          <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-lg font-medium text-gray-900">{subject.subject_name}</p>
          </div>
        </div>

        {/* Status */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Status</p>
              <div className="flex items-center gap-3">
                <span
                  className={`px-4 py-2 rounded-full font-medium ${
                    subject.status === 1
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {subject.status === 1 ? 'Active' : 'Inactive'}
                </span>
                <span className="text-sm text-gray-500">
                  {subject.status === 1 
                    ? 'Subject is available for use' 
                    : 'Subject is currently hidden'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info (if available) */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-4">Quick Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Status Code</span>
              <span className="font-medium text-gray-900">{subject.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Created</span>
              <span className="font-medium text-gray-900">System Record</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Updated</span>
              <span className="font-medium text-gray-900">Recently</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center mb-4">
            Need to make changes to this subject?
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-medium"
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubjectDetailsModal