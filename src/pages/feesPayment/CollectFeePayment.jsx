import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  CreditCard, 
  Calendar, 
  Check, 
  Loader,
  FileText,
  AlertCircle,
  Info,
  CheckCircle,
  IndianRupee,
  Shield
} from 'lucide-react';
import feePaymentService from '../../services/feePaymentService';

const CollectFeePayment = () => {
  const navigate = useNavigate();
  const { studentId } = useParams();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [student, setStudent] = useState(null);
  const [feeDetails, setFeeDetails] = useState(null);
  const [availableInstallments, setAvailableInstallments] = useState([]);
  const [summary, setSummary] = useState({ total: 0, paid: 0, pending: 0, fine: 0 });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);
  
  const [paymentForm, setPaymentForm] = useState({
    student_id: parseInt(studentId),
    student_fee_installment_id: '',
    amount: '',
    fine_amount: '',
    payment_mode: 'cash',
    remarks: '',
    status: 'success',
    transaction_no: ''
  });

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  const fetchStudentData = async () => {
    try {
      setIsLoading(true);
      setError('');
      setInfo('');
      
      const studentsResponse = await feePaymentService.getAllStudents();
      
      if (studentsResponse.data && Array.isArray(studentsResponse.data)) {
        const foundStudent = studentsResponse.data.find(s => s.student_id === parseInt(studentId));
        
        if (!foundStudent) {
          setError('Student not found');
          return;
        }
        
        setStudent(foundStudent);
        
        try {
          const feesResponse = await feePaymentService.getStudentFeeDetails(studentId);
          
          if (feesResponse.data) {
            const apiData = feesResponse.data.data || feesResponse.data;
            setFeeDetails(apiData);
            
            let installments = [];
            let feeSummary = { total: 0, paid: 0, pending: 0, fine: 0 };
            
            if (apiData.data && Array.isArray(apiData.data)) {
              installments = apiData.data.map(inst => ({
                installment_id: inst.id,
                student_fee_id: inst.student_fee_id,
                installment_no: inst.installment_no,
                amount: parseFloat(inst.amount || 0),
                fine_amount: parseFloat(inst.fine_amount || 0),
                total_amount: parseFloat(inst.total_amount || 0),
                due_date: inst.due_date,
                status: inst.calculated_status || inst.status,
                paid_on: inst.paid_on,
                created_at: inst.created_at,
                fee_type: inst.fee_type || 'General Fee'
              }));
            }
            
            if (apiData.summary) {
              feeSummary = {
                total: apiData.summary.total || 0,
                paid: apiData.summary.paid || 0,
                pending: apiData.summary.pending || 0,
                fine: apiData.summary.fine || 0
              };
            }
            
            setAvailableInstallments(installments);
            setSummary(feeSummary);
            
            const pendingInstallments = installments.filter(i => 
              i.status === 'pending' || i.status === 'overdue'
            );
            
            if (pendingInstallments.length > 0) {
              const firstPending = pendingInstallments[0];
              setPaymentForm(prev => ({
                ...prev,
                student_fee_installment_id: firstPending.installment_id,
                amount: firstPending.amount,
                fine_amount: firstPending.fine_amount
              }));
            } else if (installments.length > 0) {
              const firstInstallment = installments[0];
              setPaymentForm(prev => ({
                ...prev,
                student_fee_installment_id: firstInstallment.installment_id,
                amount: firstInstallment.amount,
                fine_amount: firstInstallment.fine_amount
              }));
            }
            
            setInfo(`Total Pending: ₹${feeSummary.pending || 0} | Paid: ₹${feeSummary.paid || 0} | Fine: ₹${feeSummary.fine || 0}`);
          }
        } catch (feeError) {
          console.warn('Could not fetch fee details:', feeError);
          setInfo('Fee details not available. Please check fee structure.');
        }
      } else {
        setError('Failed to load student data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Failed to load student information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstallmentChange = (installmentId) => {
    const selectedInstallment = availableInstallments.find(
      i => i.installment_id === parseInt(installmentId)
    );
    
    if (selectedInstallment) {
      setPaymentForm(prev => ({
        ...prev,
        student_fee_installment_id: installmentId,
        amount: selectedInstallment.amount,
        fine_amount: selectedInstallment.fine_amount
      }));
    } else {
      setPaymentForm(prev => ({
        ...prev,
        student_fee_installment_id: installmentId,
        amount: '',
        fine_amount: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (!paymentForm.student_fee_installment_id) {
      setError('Please select an installment');
      return;
    }

    const paymentData = {
      student_id: parseInt(studentId),
      student_fee_installment_id: parseInt(paymentForm.student_fee_installment_id),
      amount: parseFloat(paymentForm.amount),
      fine_amount: paymentForm.fine_amount ? parseFloat(paymentForm.fine_amount) : 0,
      payment_mode: paymentForm.payment_mode,
      remarks: paymentForm.remarks || '',
      status: 'success',
      transaction_no: paymentForm.transaction_no || ''
    };

    try {
      setIsSubmitting(true);
      
      const response = await feePaymentService.recordOfflinePayment(paymentData);
      
      if (response.success) {
        const selectedInstallment = availableInstallments.find(
          i => i.installment_id === parseInt(paymentForm.student_fee_installment_id)
        );
        
        setSuccessData({
          student: student,
          installment: selectedInstallment,
          payment: {
            ...paymentForm,
            amount: parseFloat(paymentForm.amount),
            fine_amount: paymentForm.fine_amount ? parseFloat(paymentForm.fine_amount) : 0,
            totalPaid: parseFloat(paymentForm.amount) + (paymentForm.fine_amount ? parseFloat(paymentForm.fine_amount) : 0),
            date: new Date().toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }),
            time: new Date().toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit'
            })
          },
          apiResponse: response
        });
        
        setShowSuccess(true);
      }
    } catch (error) {
      console.error('Error submitting payment:', error);
      setError(error.message || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/admin/fees-payment/collect');
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleDone = () => {
    navigate('/admin/fees-payment/collect');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (showSuccess && successData) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-area, .print-area * {
              visibility: visible;
            }
            .print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden print-area">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
              <p className="text-green-100 text-lg">Fee payment has been recorded successfully</p>
            </div>

            <div className="p-8 space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Payment Receipt</h2>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Date & Time</p>
                    <p className="font-semibold text-gray-900">{successData.payment.date}</p>
                    <p className="text-sm text-gray-600">{successData.payment.time}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Student Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Student Name</p>
                    <p className="font-semibold text-gray-900 text-lg">{successData.student.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Admission Number</p>
                    <p className="font-semibold text-gray-900 text-lg">{successData.student.admission_no}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Class & Section</p>
                    <p className="font-semibold text-gray-900 text-lg">
                      {successData.student.class_name} - {successData.student.section_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gender</p>
                    <p className="font-semibold text-gray-900 text-lg">{successData.student.gender}</p>
                  </div>
                </div>
              </div>

              {successData.installment && (
                <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Installment Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Installment ID</p>
                      <p className="font-semibold text-gray-900 text-lg">ID-{successData.installment.installment_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Installment No</p>
                      <p className="font-semibold text-gray-900 text-lg">{successData.installment.installment_no}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fee Type</p>
                      <p className="font-semibold text-gray-900 text-lg">{successData.installment.fee_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Due Date</p>
                      <p className="font-semibold text-gray-900 text-lg">{formatDate(successData.installment.due_date)}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <IndianRupee className="w-5 h-5" />
                  Payment Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Amount Paid</span>
                    <span className="text-xl font-bold text-gray-900">{formatCurrency(successData.payment.amount)}</span>
                  </div>
                  {successData.payment.fine_amount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">Fine Amount</span>
                      <span className="text-xl font-bold text-red-600">{formatCurrency(successData.payment.fine_amount)}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-green-300 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900 font-bold text-lg">Total Amount Paid</span>
                      <span className="text-2xl font-bold text-green-600">{formatCurrency(successData.payment.totalPaid)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Payment Mode</p>
                  <p className="font-semibold text-gray-900 text-lg uppercase">{successData.payment.payment_mode}</p>
                </div>
                {successData.payment.transaction_no && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Transaction Number</p>
                    <p className="font-semibold text-gray-900 text-lg">{successData.payment.transaction_no}</p>
                  </div>
                )}
              </div>

              {successData.payment.remarks && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Remarks</p>
                  <p className="text-gray-900">{successData.payment.remarks}</p>
                </div>
              )}

              {successData.apiResponse && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <p className="text-sm text-blue-600 font-medium">System Response</p>
                  </div>
                  <p className="text-gray-900">{successData.apiResponse.message || 'Payment recorded successfully'}</p>
                </div>
              )}
            </div>

            <div className="p-8 bg-gray-50 border-t border-gray-200 space-y-3 no-print">
              <button
                onClick={handlePrintReceipt}
                className="w-full px-6 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Print Receipt
              </button>
              <button
                onClick={handleDone}
                className="w-full px-6 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg"
              >
                Done - Return to Student List
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading student details...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-gray-600 mb-4">{error || 'Student not found'}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Students
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Students List
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900">Collect Fee Payment</h1>
          <p className="text-gray-600 mt-1">Record offline payment for student</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {info && (
                <div className="p-4 bg-blue-50 border-b border-blue-200">
                  <div className="flex items-center">
                    <Info className="w-5 h-5 text-blue-600 mr-2" />
                    <p className="text-blue-700">{info}</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border-b border-red-200">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              )}
              
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Student Information
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Student Name</p>
                    <p className="font-bold text-gray-900 text-lg">{student.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Class & Section</p>
                    <p className="font-bold text-gray-900 text-lg">
                      {student.class_name} - {student.section_name}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Admission Number</p>
                    <p className="font-bold text-gray-900 text-lg">{student.admission_no}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-6">
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Select Installment
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    
                    {availableInstallments.length > 0 ? (
                      <div className="space-y-3">
                        {availableInstallments.map((installment) => (
                          <div
                            key={installment.installment_id}
                            onClick={() => handleInstallmentChange(installment.installment_id)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              parseInt(paymentForm.student_fee_installment_id) === installment.installment_id
                                ? 'border-blue-600 bg-blue-50 shadow-sm'
                                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <input
                                    type="radio"
                                    name="installment"
                                    value={installment.installment_id}
                                    checked={parseInt(paymentForm.student_fee_installment_id) === installment.installment_id}
                                    onChange={() => handleInstallmentChange(installment.installment_id)}
                                    className="w-4 h-4 text-blue-600"
                                  />
                                  <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                                    getStatusColor(installment.status)
                                  }`}>
                                    ID-{installment.installment_id}
                                  </span>
                                  <div>
                                    <p className="font-bold text-gray-900">
                                      Installment {installment.installment_no} - {installment.fee_type}
                                    </p>
                                    <div className="flex items-center gap-4 mt-1">
                                      <p className="text-sm text-gray-600">
                                        Due Date: {formatDate(installment.due_date)}
                                      </p>
                                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                        getStatusColor(installment.status)
                                      }`}>
                                        {installment.status?.toUpperCase()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-xl text-gray-900">
                                  {formatCurrency(installment.amount)}
                                </p>
                                {installment.fine_amount > 0 && (
                                  <p className="text-sm text-red-600 font-medium">
                                    + {formatCurrency(installment.fine_amount)} fine
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800 text-sm">
                          No installments available. Please contact administrator.
                        </p>
                      </div>
                    )}
                    
                    <div className="mt-3">
                      <details className="group">
                        <summary className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer font-medium">
                          Enter installment ID manually (if not listed above)
                        </summary>
                        <div className="mt-2">
                          <input
                            type="number"
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                            placeholder="Enter installment ID"
                            value={paymentForm.student_fee_installment_id}
                            onChange={(e) => handleInstallmentChange(e.target.value)}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            ⚠️ Manual entry may cause "Installment does not belong to this student" error
                          </p>
                        </div>
                      </details>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Amount Received (₹)
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        placeholder="0.00"
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Fine Amount (₹) - Optional
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        placeholder="0.00"
                        value={paymentForm.fine_amount}
                        onChange={(e) => setPaymentForm({...paymentForm, fine_amount: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Payment Mode
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {[
                        { value: 'cash', label: 'Cash' },
                        { value: 'cheque', label: 'Cheque' },
                        { value: 'dd', label: 'DD' },
                        { value: 'bank_transfer', label: 'Bank Transfer' },
                        { value: 'online', label: 'Online' }
                      ].map((mode) => (
                        <button
                          type="button"
                          key={mode.value}
                          onClick={() => setPaymentForm({...paymentForm, payment_mode: mode.value})}
                          className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                            paymentForm.payment_mode === mode.value
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {paymentForm.payment_mode !== 'cash' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Transaction / Cheque / DD Number
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        placeholder="Enter reference number"
                        value={paymentForm.transaction_no}
                        onChange={(e) => setPaymentForm({...paymentForm, transaction_no: e.target.value})}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Remarks (Optional)
                    </label>
                    <textarea
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white text-gray-900"
                      placeholder="Add any additional notes..."
                      value={paymentForm.remarks}
                      onChange={(e) => setPaymentForm({...paymentForm, remarks: e.target.value})}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 font-medium"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting || !paymentForm.amount || !paymentForm.student_fee_installment_id}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-bold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Submit Payment
                        </>
                      )}
                    </button>
                  </div>

                  {availableInstallments.length === 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
                          <Info className="w-4 h-4 mr-2" />
                          Important Instructions
                        </h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          <li>• No installments found for this student</li>
                          <li>• Fee structure may not be configured</li>
                          <li>• Contact school administrator to set up fees</li>
                          <li>• Manual entry may cause "Installment does not belong to this student" error</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <IndianRupee className="w-5 h-5 mr-2" />
                Fee Summary
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Fees</span>
                  <span className="font-bold text-gray-900">{formatCurrency(summary.total)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Paid Amount</span>
                  <span className="font-bold text-green-600">{formatCurrency(summary.paid)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending Amount</span>
                  <span className={`font-bold ${summary.pending > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {formatCurrency(summary.pending)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Fine</span>
                  <span className="font-bold text-orange-600">{formatCurrency(summary.fine)}</span>
                </div>
                
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Balance</span>
                    <span className={`text-xl font-bold ${summary.pending > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(summary.pending + summary.fine)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment Summary
              </h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Received:</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(paymentForm.amount || 0)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Fine Amount:</span>
                  <span className="font-medium text-red-600">
                    {formatCurrency(paymentForm.fine_amount || 0)}
                  </span>
                </div>
                
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900">Total to Pay:</span>
                    <span className="text-green-600">
                      {formatCurrency(
                        (parseFloat(paymentForm.amount || 0) + 
                         parseFloat(paymentForm.fine_amount || 0))
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <h4 className="font-medium text-blue-800 mb-3 flex items-center">
                <Info className="w-4 h-4 mr-2" />
                Important Notes
              </h4>
              <ul className="text-sm text-blue-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Select correct installment ID for payment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Verify amount matches installment amount</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Enter transaction number for non-cash payments</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Keep remarks for future reference</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectFeePayment;