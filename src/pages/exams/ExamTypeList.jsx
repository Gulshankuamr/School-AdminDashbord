import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as examTypesService from '../../services/examService/examTypesService';
import { toast } from 'react-hot-toast';

const ExamTypeList = () => {
  const navigate = useNavigate();
  const [examTypes, setExamTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    type_name: '',
    description: '',
    weightage_percentage: '',
    display_order: ''
  });

  useEffect(() => {
    fetchExamTypes();
  }, []);

  const fetchExamTypes = async () => {
    try {
      setLoading(true);
      const response = await examTypesService.getAllExamTypes();
      setExamTypes(response.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load exam types');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (exam) => {
    setEditingId(exam.exam_type_id);
    setEditFormData({
      type_name: exam.type_name,
      description: exam.description || '',
      weightage_percentage: exam.weightage_percentage,
      display_order: exam.display_order
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleSave = async (examTypeId) => {
    try {
      // Validation
      if (!editFormData.type_name.trim()) {
        toast.error('Exam type name is required');
        return;
      }

      if (!editFormData.weightage_percentage || editFormData.weightage_percentage < 0 || editFormData.weightage_percentage > 100) {
        toast.error('Weightage must be between 0 and 100');
        return;
      }

      if (!editFormData.display_order || editFormData.display_order < 1) {
        toast.error('Display order must be at least 1');
        return;
      }

      const payload = {
        exam_type_id: examTypeId,
        type_name: editFormData.type_name.trim(),
        description: editFormData.description.trim(),
        weightage_percentage: parseFloat(editFormData.weightage_percentage),
        display_order: parseInt(editFormData.display_order, 10)
      };

      const response = await examTypesService.updateExamType(payload);
      
      // Update local state
      setExamTypes(prevExamTypes => 
        prevExamTypes.map(exam => 
          exam.exam_type_id === examTypeId 
            ? { 
                ...exam, 
                type_name: payload.type_name,
                description: payload.description,
                weightage_percentage: payload.weightage_percentage,
                display_order: payload.display_order
              }
            : exam
        )
      );
      
      setEditingId(null);
      
      if (response && response.success) {
        toast.success('Exam type updated successfully!');
      }
      
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Failed to update exam type');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleDelete = async (examTypeId) => {
    if (!window.confirm('Are you sure you want to delete this exam type?')) {
      return;
    }

    try {
      const response = await examTypesService.deleteExamType(examTypeId);
      
      setExamTypes(examTypes.filter(exam => exam.exam_type_id !== examTypeId));
      
      if (response && response.success) {
        toast.success('Exam type deleted successfully!');
      }
    } catch (err) {
      toast.error('Failed to delete exam type');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading exam types...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-4">
        Dashboard / Exams / Exam Types
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header with Title and Add Button */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Exam Types</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage different examination categories for your academic year
            </p>
          </div>
          
          {/* Add New Exam Type Button */}
          <button
            onClick={() => navigate('/admin/exams/types/add')}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Exam Type
          </button>
        </div>

        {/* Search Bar */}
      

        {examTypes.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg mb-2">No exam types found</p>
            <button
              onClick={() => navigate('/admin/exams/types/create')}
              className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Create Your First Exam Type
            </button>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">SR NO</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">EXAM TYPE NAME</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">DESCRIPTION</th>
                    <th className="p-4 text-center text-sm font-semibold text-gray-700">WEIGHTAGE (%)</th>
                    <th className="p-4 text-center text-sm font-semibold text-gray-700">DISPLAY ORDER</th>
                    <th className="p-4 text-center text-sm font-semibold text-gray-700">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {examTypes.map((exam, index) => (
                    <tr key={exam.exam_type_id} className="hover:bg-gray-50 transition-colors">
                      {editingId === exam.exam_type_id ? (
                        // Edit Mode
                        <>
                          <td className="p-4 text-gray-700">{String(index + 1).padStart(2, '0')}</td>
                          <td className="p-4">
                            <input
                              type="text"
                              name="type_name"
                              value={editFormData.type_name}
                              onChange={handleEditChange}
                              className="w-full border border-gray-300 rounded-lg p-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="Exam Type Name"
                            />
                          </td>
                          <td className="p-4">
                            <input
                              type="text"
                              name="description"
                              value={editFormData.description}
                              onChange={handleEditChange}
                              className="w-full border border-gray-300 rounded-lg p-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="Description"
                            />
                          </td>
                          <td className="p-4 text-center">
                            <input
                              type="number"
                              name="weightage_percentage"
                              value={editFormData.weightage_percentage}
                              onChange={handleEditChange}
                              min="0"
                              max="100"
                              step="0.01"
                              className="w-24 border border-gray-300 rounded-lg p-2 text-gray-900 text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                          </td>
                          <td className="p-4 text-center">
                            <input
                              type="number"
                              name="display_order"
                              value={editFormData.display_order}
                              onChange={handleEditChange}
                              min="1"
                              className="w-20 border border-gray-300 rounded-lg p-2 text-gray-900 text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleSave(exam.exam_type_id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Save"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              <button
                                onClick={handleCancel}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Cancel"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        // View Mode
                        <>
                          <td className="p-4 text-gray-700">{String(index + 1).padStart(2, '0')}</td>
                          <td className="p-4">
                            <div className="font-medium text-gray-900">{exam.type_name}</div>
                          </td>
                          <td className="p-4 text-gray-600 max-w-xs">
                            {exam.description || '-'}
                          </td>
                          <td className="p-4 text-center">
                            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                              {exam.weightage_percentage}%
                            </span>
                          </td>
                          <td className="p-4 text-center text-gray-700">
                            {exam.display_order}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEdit(exam)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(exam.exam_type_id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-600">
                  Showing 1 to {examTypes.length} of {examTypes.length} entries
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-gray-600">Total Categories: {examTypes.length}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExamTypeList;