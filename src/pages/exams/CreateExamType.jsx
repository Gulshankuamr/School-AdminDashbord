import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as createExamService from '../../services/examService/createExamService'; // ✅ Fixed import
import * as examTypesService from '../../services/examService/examTypesService';
import { toast } from 'react-hot-toast';

const CreateExamType = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    type_name: '',
    description: '',
    weightage_percentage: '',
    display_order: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.type_name.trim()) {
      newErrors.type_name = 'Exam type name is required';
    }

    if (!formData.weightage_percentage) {
      newErrors.weightage_percentage = 'Weightage percentage is required';
    } else if (formData.weightage_percentage < 0 || formData.weightage_percentage > 100) {
      newErrors.weightage_percentage = 'Weightage must be between 0 and 100';
    }

    if (!formData.display_order) {
      newErrors.display_order = 'Display order is required';
    } else if (formData.display_order < 1) {
      newErrors.display_order = 'Display order must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        type_name: formData.type_name.trim(),
        description: formData.description.trim(),
        weightage_percentage: parseFloat(formData.weightage_percentage),
        display_order: parseInt(formData.display_order, 10)
      };

      const response = await examTypesService.createExamType(payload);
      
      if (response && response.success) {
        toast.success('Exam type created successfully!');
        navigate('/admin/exams/types');
      } else {
        toast.error('Failed to create exam type');
      }
    } catch (error) {
      toast.error('Failed to create exam type');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="text-sm text-gray-500">
          Dashboard / Exams / Exam Types / Create
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-orange-50 to-white px-6 py-5 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-800">Create Exam Type</h1>
            <p className="text-sm text-gray-500 mt-1">
              Define new examination categories and weightage for the academic year
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Exam Type Name - Full Width */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Exam Type Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="type_name"
                  placeholder="e.g., Midterm Examination, Final Assessment"
                  value={formData.type_name}
                  onChange={handleChange}
                  className={`w-full border rounded-xl p-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                    errors.type_name ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                />
                {errors.type_name && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.type_name}
                  </p>
                )}
              </div>

              {/* Description - Full Width */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="Describe the purpose, scope, or any additional details about this exam type..."
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full border border-gray-200 rounded-xl p-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none hover:border-gray-300"
                />
              </div>

              {/* Two Column Grid for Weightage and Display Order */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Weightage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Weightage (%) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="weightage_percentage"
                      placeholder="0-100"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.weightage_percentage}
                      onChange={handleChange}
                      className={`w-full border rounded-xl p-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all pr-12 ${
                        errors.weightage_percentage ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    />
                    <span className="absolute right-4 top-3.5 text-gray-400 font-medium">%</span>
                  </div>
                  {errors.weightage_percentage && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.weightage_percentage}
                    </p>
                  )}
                  <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Determines the impact on final grade
                  </p>
                </div>

                {/* Display Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Display Order <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="display_order"
                    placeholder="1, 2, 3..."
                    min="1"
                    value={formData.display_order}
                    onChange={handleChange}
                    className={`w-full border rounded-xl p-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                      errors.display_order ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  />
                  {errors.display_order && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.display_order}
                    </p>
                  )}
                  <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-5-5A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Sort order in lists and reports
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 my-2"></div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/admin/exams/types')}
                  disabled={loading}
                  className="px-8 py-3.5 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-8 py-3.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2 shadow-sm hover:shadow flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      <span>Save Exam Type</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Helper Text - Full Width */}
        <div className="mt-4 text-xs text-gray-400 text-center">
          <span className="text-red-500">*</span> Required fields
        </div>
      </div>
    </div>
  );
};

export default CreateExamType;