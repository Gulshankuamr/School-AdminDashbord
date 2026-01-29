import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Printer, Mail, Home, Download, Share2 } from 'lucide-react';

const FeeReceipt = () => {
  const navigate = useNavigate();
  const { receiptId } = useParams();
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    const receiptDataStr = localStorage.getItem('receiptData');
    if (receiptDataStr) {
      const receipt = JSON.parse(receiptDataStr);
      setReceiptData(receipt);
    } else {
      navigate('/admin/fees-payment/collect');
    }
  }, [receiptId]);

  const handleDone = () => {
    localStorage.removeItem('receiptData');
    navigate('/admin/fees-payment/collect');
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    alert('PDF download functionality will be integrated with your backend API');
  };

  const handleEmailReceipt = () => {
    alert('Email functionality will be integrated with your backend API');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Payment Receipt - ${receiptId}`,
        text: `Payment receipt for ${receiptData?.student?.name}`,
        url: window.location.href
      });
    } else {
      alert('Web Share API not supported in this browser');
    }
  };

  if (!receiptData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading receipt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
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
              background: white;
              padding: 0;
            }
            .no-print {
              display: none !important;
            }
          }
          
          @page {
            size: A4;
            margin: 20mm;
          }
        `}</style>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          
          <div className="print-area p-8 md:p-12">
            <div className="text-center mb-8 border-b-2 border-gray-200 pb-8">
              <h1 className="text-3xl font-bold text-gray-900">PAYMENT RECEIPT</h1>
              <p className="text-gray-600 mt-2">Official School Fee Payment Receipt</p>
              
              <div className="flex justify-between items-center mt-6">
                <div className="text-left">
                  <p className="text-sm text-gray-600">Receipt Number</p>
                  <p className="text-2xl font-bold text-gray-900">{receiptId}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Date().toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date().toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Student Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Student Name</p>
                    <p className="text-lg font-bold text-gray-900">{receiptData.student?.name}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Admission Number</p>
                    <p className="text-lg font-bold text-gray-900">{receiptData.student?.admission_no}</p>
                  </div>
                </div>
                <div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Class & Section</p>
                    <p className="text-lg font-bold text-gray-900">
                      {receiptData.student?.class_name} - {receiptData.student?.section_name}
                    </p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Gender</p>
                    <p className="text-lg font-bold text-gray-900">{receiptData.student?.gender}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Installment Details</h2>
              {receiptData.installment && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Installment ID</p>
                      <p className="font-bold text-gray-900">ID-{receiptData.installment.installment_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Installment No</p>
                      <p className="font-bold text-gray-900">{receiptData.installment.installment_no}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fee Type</p>
                      <p className="font-bold text-gray-900">{receiptData.installment.fee_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Due Date</p>
                      <p className="font-bold text-gray-900">
                        {receiptData.installment.due_date ? 
                          new Date(receiptData.installment.due_date).toLocaleDateString('en-IN') : 
                          'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Payment Details</h2>
              <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium text-lg">Amount Paid</span>
                    <span className="text-2xl font-bold text-gray-900">₹{receiptData.payment?.amount || 0}</span>
                  </div>
                  
                  {receiptData.payment?.fine_amount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium text-lg">Fine Amount</span>
                      <span className="text-2xl font-bold text-red-600">₹{receiptData.payment?.fine_amount || 0}</span>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t-2 border-green-300">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-900">Total Amount Paid</span>
                      <span className="text-3xl font-bold text-green-600">
                        ₹{(receiptData.payment?.amount || 0) + (receiptData.payment?.fine_amount || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Payment Method</h2>
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-bold">
                  {receiptData.payment?.payment_mode?.toUpperCase()}
                </div>
                {receiptData.payment?.transaction_no && (
                  <div>
                    <p className="text-sm text-gray-600">Transaction No</p>
                    <p className="font-bold text-gray-900">{receiptData.payment.transaction_no}</p>
                  </div>
                )}
              </div>
            </div>
            
            {receiptData.payment?.remarks && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Remarks</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">{receiptData.payment.remarks}</p>
                </div>
              </div>
            )}
            
            <div className="mt-12 pt-8 border-t-2 border-gray-300">
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">School Stamp</p>
                  <div className="h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                    <span className="text-gray-400">Stamp Area</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">Authorized Signature</p>
                  <div className="h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                    <span className="text-gray-400">Signature Area</span>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-8 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  This is a computer generated receipt. No signature required.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  For any queries, contact school office.
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 bg-gradient-to-br from-slate-50 to-gray-100 space-y-4 no-print">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handlePrintReceipt}
                className="px-6 py-4 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Printer className="w-5 h-5" />
                Print Receipt
              </button>
              <button
                onClick={handleDownloadPDF}
                className="px-6 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleEmailReceipt}
                className="px-6 py-4 border-2 border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
              >
                <Mail className="w-5 h-5" />
                Email Receipt
              </button>
              <button
                onClick={handleShare}
                className="px-6 py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>
            
            <button
              onClick={handleDone}
              className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Done - Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeReceipt;