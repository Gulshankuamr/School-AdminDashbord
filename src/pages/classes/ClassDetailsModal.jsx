// import React from 'react'
// import { Calendar, Hash, Info, CheckCircle, XCircle, Clock } from 'lucide-react'

// const ClassDetailsModal = ({ classItem, onClose }) => {
//   if (!classItem) return null

//   // Format date
//   const formatDate = (dateString) => {
//     const date = new Date(dateString)
//     return date.toLocaleDateString('en-IN', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     })
//   }

//   // Format time ago
//   const getTimeAgo = (dateString) => {
//     const date = new Date(dateString)
//     const now = new Date()
//     const diffInSeconds = Math.floor((now - date) / 1000)
    
//     if (diffInSeconds < 60) return 'Just now'
//     if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
//     if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
//     if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
//     return formatDate(dateString)
//   }

//   return (
//     <div className="max-w-2xl mx-auto">
//       {/* Header */}
//       <div className="mb-6">
//         <div className="flex items-start justify-between">
//           <div>
//             <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
//               <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
//                 <span className="text-white font-bold text-xl">{classItem.class_order}</span>
//               </div>
//               <div>
//                 <div className="text-2xl">{classItem.class_name}</div>
//                 <div className="text-sm text-gray-600 font-normal mt-1 flex items-center gap-1">
//                   <Calendar className="w-4 h-4" />
//                   Created {getTimeAgo(classItem.created_at)}
//                 </div>
//               </div>
//             </h2>
//           </div>
          
//           {/* Status Badge */}
//           <div className={`px-4 py-2 rounded-full font-medium flex items-center gap-2 ${
//             classItem.status === 1 
//               ? 'bg-green-100 text-green-800 border border-green-200' 
//               : 'bg-red-100 text-red-800 border border-red-200'
//           }`}>
//             {classItem.status === 1 ? (
//               <>
//                 <CheckCircle className="w-4 h-4" />
//                 Active
//               </>
//             ) : (
//               <>
//                 <XCircle className="w-4 h-4" />
//                 Inactive
//               </>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Details Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//         {/* Class Order Card */}
//         <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
//           <div className="flex items-center gap-3 mb-3">
//             <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
//               <Hash className="w-5 h-5 text-white" />
//             </div>
//             <div>
//               <h3 className="text-sm font-medium text-blue-800 uppercase">Class Order</h3>
//               <p className="text-xs text-blue-600">Sorting position</p>
//             </div>
//           </div>
//           <div className="text-3xl font-bold text-blue-900 text-center">
//             {classItem.class_order}
//           </div>
//         </div>

//         {/* Creation Date Card */}
//         <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
//           <div className="flex items-center gap-3 mb-3">
//             <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
//               <Clock className="w-5 h-5 text-white" />
//             </div>
//             <div>
//               <h3 className="text-sm font-medium text-purple-800 uppercase">Created On</h3>
//               <p className="text-xs text-purple-600">Date of creation</p>
//             </div>
//           </div>
//           <div className="text-sm font-medium text-purple-900 text-center">
//             {formatDate(classItem.created_at)}
//           </div>
//         </div>
//       </div>

//       {/* Class Details Section */}
//       <div className="mb-8">
//         <div className="flex items-center gap-2 mb-4">
//           <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
//             <Info className="w-4 h-4 text-white" />
//           </div>
//           <h3 className="text-lg font-semibold text-gray-900">Class Details</h3>
//         </div>
        
//         <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
//           <div className="prose prose-sm max-w-none">
//             <p className="text-gray-700 whitespace-pre-line">{classItem.class_details}</p>
//           </div>
//         </div>
//       </div>

//       {/* Additional Information */}
//       <div className="mb-8">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
        
//         <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//           <div className="grid grid-cols-2 divide-x divide-gray-200">
//             {/* Class ID */}
//             <div className="p-4">
//               <div className="text-xs text-gray-500 uppercase font-medium mb-1">Class ID</div>
//               <div className="text-sm font-medium text-gray-900">{classItem.class_id}</div>
//             </div>
            
//             {/* Created Date */}
//             <div className="p-4">
//               <div className="text-xs text-gray-500 uppercase font-medium mb-1">Created Date</div>
//               <div className="text-sm font-medium text-gray-900">
//                 {new Date(classItem.created_at).toLocaleDateString('en-IN')}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Action Buttons */}
//       <div className="pt-6 border-t border-gray-200 flex gap-3">
//         <button
//           onClick={onClose}
//           className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
//         >
//           Close
//         </button>
//         <button
//           onClick={() => {
//             onClose()
//             // Navigate to edit page - you'll need to handle this in parent component
//           }}
//           className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition font-medium"
//         >
//           Edit Class
//         </button>
//       </div>

//       {/* Metadata Footer */}
//       <div className="mt-6 pt-4 border-t border-gray-100">
//         <div className="text-xs text-gray-500 text-center">
//           <p>Class ID: {classItem.class_id} • Last Updated: {getTimeAgo(classItem.created_at)}</p>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default ClassDetailsModal


import React from 'react'
import { Hash, Info } from 'lucide-react'

const ClassDetailsModal = ({ classItem, onClose }) => {
  if (!classItem) return null

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Class Information</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Class ID: {classItem.class_id}</span>
          </div>
          <span className={`px-3 py-1 text-sm rounded-full ${
            classItem.status === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {classItem.status === 1 ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Class Name */}
      <div className="mb-6">
        <div className="text-sm font-medium text-gray-700 mb-2">Class Name *</div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="text-gray-900">{classItem.class_name}</div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          e.g., Class 10th, B.Com 1st Year
        </div>
      </div>

      {/* Class Order */}
      <div className="mb-8">
        <div className="text-sm font-medium text-gray-700 mb-2">Class Order *</div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-2">
          <Hash className="w-4 h-4 text-gray-500" />
          <span className="text-gray-900">{classItem.class_order}</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Numeric order for sorting classes
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-8"></div>

      {/* Additional Information Header */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900">Additional Information</h3>
      </div>

      {/* Description */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-gray-500" />
          <div className="text-sm font-medium text-gray-700">Description (Optional)</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 min-h-[100px]">
          <div className="text-gray-700 whitespace-pre-line">
            {classItem.class_details || 'No description provided'}
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Add any additional details about the class...
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-6 border-t border-gray-200 flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
        >
          Close
        </button>
        <button
          onClick={() => {
            onClose()
            // Navigate to edit page
          }}
          className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Edit Class
        </button>
      </div>
    </div>
  )
}

export default ClassDetailsModal