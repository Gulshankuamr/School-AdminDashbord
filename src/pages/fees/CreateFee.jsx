// src/pages/CreateFee.jsx
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Copy, Calendar, Check, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { feecreateService } from '../../services/feeallService/feecreateService';

const CreateFee = () => {
  const navigate = useNavigate();
  const previewRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    academicYear: '2024-25',
    classId: '',
    feeHeadId: '',
    baseAmount: '',
    feeFrequency: 'monthly',
  });
  
  // Data from APIs
  const [classes, setClasses] = useState([]);
  const [feeHeads, setFeeHeads] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Installment state
  const [installments, setInstallments] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isGeneratingInstallments, setIsGeneratingInstallments] = useState(false);
  
  // UI state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [authError, setAuthError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Payment frequency options
  const frequencyOptions = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'half_yearly', label: 'Half-Yearly' },
    { value: 'yearly', label: 'Annually' },
    { value: 'one_time', label: 'One-Time' },
  ];
  
  // Academic year options
  const academicYears = [
    { value: '2024-25', label: '2024-25' },
    { value: '2025-26', label: '2025-26' },
    { value: '2026-27', label: '2026-27' },
  ];

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setAuthError('');
      
      // Fetch classes
      const classResponse = await feecreateService.getAllClasses();
      if (classResponse.data && Array.isArray(classResponse.data)) {
        setClasses(classResponse.data);
      } else {
        console.warn('Unexpected classes response structure:', classResponse);
      }
      
      // Fetch fee heads
      const feeHeadResponse = await feecreateService.getAllFeeHeads();
      if (feeHeadResponse.data?.fee_heads) {
        setFeeHeads(feeHeadResponse.data.fee_heads);
      } else if (feeHeadResponse.data?.data?.fee_heads) {
        setFeeHeads(feeHeadResponse.data.data.fee_heads);
      } else if (Array.isArray(feeHeadResponse.data)) {
        setFeeHeads(feeHeadResponse.data);
      } else {
        console.warn('Unexpected fee heads response structure:', feeHeadResponse);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.message.includes('Session expired') || error.message.includes('Authentication')) {
        setAuthError(error.message);
      } else {
        setError(`Failed to load data: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateInstallments = () => {
    const baseAmount = parseFloat(formData.baseAmount) || 0;
    if (!baseAmount || baseAmount <= 0) {
      setError('Please enter a valid base amount first');
      return;
    }

    if (!formData.feeFrequency) {
      setError('Please select payment frequency');
      return;
    }

    setIsGeneratingInstallments(true);
    setError('');
    
    let installmentCount = 0;
    let installmentName = '';
    
    // Determine number of installments based on frequency
    switch (formData.feeFrequency) {
      case 'monthly':
        installmentCount = 12;
        installmentName = 'Monthly Installment';
        break;
      case 'quarterly':
        installmentCount = 4;
        installmentName = 'Quarterly Installment';
        break;
      case 'half_yearly':
        installmentCount = 2;
        installmentName = 'Half-Yearly Installment';
        break;
      case 'yearly':
        installmentCount = 1;
        installmentName = 'Annual Fee';
        break;
      case 'one_time':
        installmentCount = 1;
        installmentName = 'One-Time Fee';
        break;
      default:
        installmentCount = 1;
        installmentName = 'Fee';
    }
    
    // Generate installments
    const newInstallments = [];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Start from current month
    const currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    
    for (let i = 0; i < installmentCount; i++) {
      const monthIndex = (currentMonth + i) % 12;
      const year = currentYear + Math.floor((currentMonth + i) / 12);
      
      // Calculate due date (10th of each month)
      const dueDate = new Date(year, monthIndex, 10);
      
      newInstallments.push({
        id: i + 1,
        name: `${installmentName} ${i + 1}`,
        month: months[monthIndex],
        year: year,
        amount: baseAmount.toFixed(2),
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'Draft',
        displayDate: `${months[monthIndex].substring(0, 3)} ${year}`
      });
    }
    
    setInstallments(newInstallments);
    setTotalAmount(baseAmount * installmentCount);
    setIsGeneratingInstallments(false);
    
    // Scroll to preview section
    setTimeout(() => {
      if (previewRef.current) {
        previewRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear installments if frequency or amount changes
    if (field === 'feeFrequency' || field === 'baseAmount') {
      setInstallments([]);
      setTotalAmount(0);
    }
    setError('');
    setSuccess('');
  };

  const handleInstallmentChange = (index, field, value) => {
    const newInstallments = [...installments];
    newInstallments[index] = {
      ...newInstallments[index],
      [field]: value
    };
    setInstallments(newInstallments);
    
    // Recalculate total
    const newTotal = newInstallments.reduce((sum, inst) => sum + parseFloat(inst.amount || 0), 0);
    setTotalAmount(newTotal);
  };

  const handlePreviewClick = () => {
    generateInstallments();
  };

  const handleConfirmCreate = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Prepare payload based on API example
      const payload = {
        class_id: parseInt(formData.classId),
        fee_head_id: parseInt(formData.feeHeadId),
        base_amount: formData.baseAmount,
        fee_frequency: formData.feeFrequency,
        academic_year: formData.academicYear
      };

      console.log('🚀 Creating fee with payload:', payload);

      const response = await feecreateService.createFee(payload);
      
      if (response.success) {
        setShowConfirmModal(false);
        setSuccess('✅ Fee structure created successfully!');
        
        // Clear form
        setFormData({
          academicYear: '2024-25',
          classId: '',
          feeHeadId: '',
          baseAmount: '',
          feeFrequency: 'monthly',
        });
        setInstallments([]);
        setTotalAmount(0);
        
        // Auto-scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Redirect after 3 seconds
        setTimeout(() => {
          navigate('/admin/fees/create');
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating fee:', error);
      setError(error.message || 'Failed to create fee structure. Please try again.');
      setShowConfirmModal(false);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleLoginRedirect = () => {
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Fee Structure</h1>
              <p className="text-gray-700 mt-1">
                Define how fees are collected for the upcoming academic session
              </p>
            </div>
            <button 
              onClick={() => navigate('/admin/fees/preview')}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 w-full md:w-auto"
            >
              View All Structures
              <span className="text-lg">→</span>
            </button>
          </div>
        </div>

        {/* Authentication Error */}
        {authError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800">Authentication Required</h3>
                <p className="text-red-700 mt-1">{authError}</p>
                <button
                  onClick={handleLoginRedirect}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Go to Login
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error/Success Messages */}
        {error && !authError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-green-800 font-medium">Success</p>
                <p className="text-green-700 text-sm mt-1">{success}</p>
                <p className="text-green-600 text-xs mt-2">Redirecting to fee list in 3 seconds...</p>
              </div>
            </div>
          </div>
        )}

        {!authError && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Main Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Fee Configuration Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                      <span className="font-medium">1</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Fee Configuration</h2>
                      <p className="text-gray-700 mt-1">Select academic year, class and fee head</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Academic Year */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Academic Year *
                      </label>
                      <div className="relative">
                        <select
                          value={formData.academicYear}
                          onChange={(e) => handleInputChange('academicYear', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-900"
                          disabled={loading}
                        >
                          {academicYears.map(year => (
                            <option key={year.value} value={year.value}>
                              {year.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                      </div>
                    </div>

                    {/* Class/Grade */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Class / Grade *
                      </label>
                      <div className="relative">
                        <select
                          value={formData.classId}
                          onChange={(e) => handleInputChange('classId', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-900"
                          disabled={loading}
                        >
                          <option value="">Select Class</option>
                          {classes.map(cls => (
                            <option key={cls.class_id} value={cls.class_id}>
                              {cls.class_name || `Class ${cls.class_id}`}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                      </div>
                    </div>

                    {/* Fee Head */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Fee Head *
                      </label>
                      <div className="relative">
                        <select
                          value={formData.feeHeadId}
                          onChange={(e) => handleInputChange('feeHeadId', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-900"
                          disabled={loading}
                        >
                          <option value="">Select Fee Head</option>
                          {feeHeads.map(head => (
                            <option key={head.fee_head_id} value={head.fee_head_id}>
                              {head.head_name || `Fee Head ${head.fee_head_id}`}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Details Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                      <span className="font-medium">2</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Financial Details</h2>
                      <p className="text-gray-700 mt-1">Set payment frequency and base amount</p>
                    </div>
                  </div>

                  {/* Payment Frequency */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      Payment Frequency *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {frequencyOptions.map(freq => (
                        <button
                          key={freq.value}
                          type="button"
                          onClick={() => handleInputChange('feeFrequency', freq.value)}
                          disabled={loading}
                          className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            formData.feeFrequency === freq.value
                              ? 'bg-blue-600 text-white border-2 border-blue-600'
                              : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {freq.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Base Amount */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Base Amount (₹) *
                    </label>
                    <div className="relative max-w-xs">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-900">₹</span>
                      </div>
                      <input
                        type="number"
                        value={formData.baseAmount}
                        onChange={(e) => handleInputChange('baseAmount', e.target.value)}
                        className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        disabled={loading}
                      />
                    </div>
                    <p className="text-gray-700 text-sm mt-2">
                      Amount per installment (Based on selected frequency)
                    </p>
                  </div>

                  {/* Total Amount Preview */}
                  <div className="mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 inline-block">
                      <p className="text-xs text-gray-700 mb-1">BASE AMOUNT PREVIEW</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formData.baseAmount ? `₹${parseFloat(formData.baseAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00'}
                      </p>
                    </div>
                  </div>

                  {/* Preview Button */}
                  <button
                    onClick={handlePreviewClick}
                    disabled={loading || !formData.baseAmount || isGeneratingInstallments}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isGeneratingInstallments ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        Preview Installments
                        <span className="text-lg">↓</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Installment Schedule Card */}
                {installments.length > 0 && (
                  <div ref={previewRef} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-900 font-medium">
                          <span>3</span>
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">Preview Installment Schedule</h2>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              {installments.length} Installments
                            </span>
                            <span className="text-gray-700 text-sm">
                              Total: {formatCurrency(totalAmount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Installments Table */}
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                              #
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                              Installment
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                              Month & Year
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                              Amount (₹)
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                              Due Date
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {installments.map((inst, index) => (
                            <tr key={inst.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                {String(inst.id).padStart(2, '0')}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {inst.name}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {inst.displayDate}
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  value={inst.amount}
                                  onChange={(e) => handleInstallmentChange(index, 'amount', e.target.value)}
                                  className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                  step="0.01"
                                  min="0"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-500" />
                                  <input
                                    type="date"
                                    value={inst.dueDate}
                                    onChange={(e) => handleInstallmentChange(index, 'dueDate', e.target.value)}
                                    className="px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                  />
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                                  {inst.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-4 text-sm text-gray-700">
                      <p>Note: Installment amounts and dates are editable. Changes only affect this preview.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Summary Card */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 sticky top-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Structure Summary</h3>
                  
                  <div className="space-y-6">
                    {/* Total Fee */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-900">Total Fee</span>
                        <button 
                          className="p-1 hover:bg-blue-100 rounded"
                          onClick={() => navigator.clipboard.writeText(totalAmount.toString())}
                          title="Copy amount"
                        >
                          <Copy className="w-4 h-4 text-blue-600" />
                        </button>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(totalAmount)}
                      </p>
                    </div>

                    {/* Installment Details */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-900">Installments</span>
                        <span className="font-semibold text-gray-900">{installments.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-900">Frequency</span>
                        <span className="font-semibold text-gray-900 capitalize">
                          {formData.feeFrequency.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-900">Base Amount</span>
                        <span className="font-semibold text-gray-900">
                          ₹{formData.baseAmount ? parseFloat(formData.baseAmount).toFixed(2) : '0.00'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-900">Academic Year</span>
                        <span className="font-semibold text-gray-900">{formData.academicYear}</span>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-900">Remaining Balance</span>
                        <span className="font-semibold text-green-600">₹0.00</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-4">
                      <button 
                        onClick={() => {
                          setInstallments([]);
                          setTotalAmount(0);
                          setFormData(prev => ({ ...prev, baseAmount: '' }));
                        }}
                        className="w-full px-4 py-2.5 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                      >
                        Edit Base Fee
                      </button>
                      <button 
                        onClick={() => setShowConfirmModal(true)}
                        disabled={loading || installments.length === 0}
                        className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            Confirm & Assign Fee
                            <span className="text-lg">→</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Help Text */}
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-700">
                        <span className="font-medium">Note:</span> After confirming, the fee structure will be created and you'll be redirected to the fee list.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirm Fee Creation</h3>
                <p className="text-gray-700 text-sm">Are you sure you want to create this fee structure?</p>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Class:</span>
                  <span className="font-semibold text-gray-900">
                    {classes.find(c => c.class_id == formData.classId)?.class_name || `Class ${formData.classId}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Fee Head:</span>
                  <span className="font-semibold text-gray-900">
                    {feeHeads.find(f => f.fee_head_id == formData.feeHeadId)?.head_name || `Fee Head ${formData.feeHeadId}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Total Amount:</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCreate}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateFee;