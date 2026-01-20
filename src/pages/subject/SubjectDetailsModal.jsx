import { BookOpen, Edit } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function SubjectDetailsModal({ subject, onClose }) {
  const navigate = useNavigate()

  const handleEdit = () => {
    if (onClose) {
      onClose() // Close modal first
    }
    navigate(`/admin/subjects/edit/${subject.subject_id}`)
  }

  return (
    <div className="bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 gap-6">
          {/* Main Info Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{subject.subject_name}</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Subject ID: <span className="font-semibold">{subject.subject_id}</span>
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold ${
                subject.status === 1 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                <span className={`w-2 h-2 rounded-full ${subject.status === 1 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {subject.status === 1 ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Details Grid */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Subject ID</label>
                  <p className="text-gray-900 font-semibold mt-1">{subject.subject_id}</p>
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Subject Name</label>
                  <p className="text-gray-900 font-semibold mt-1">{subject.subject_name}</p>
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Status</label>
                  <p className="text-gray-900 font-semibold mt-1 capitalize">
                    {subject.status === 1 ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Close
              </button>
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
              >
                <Edit className="w-4 h-4" />
                Edit Subject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubjectDetailsModal