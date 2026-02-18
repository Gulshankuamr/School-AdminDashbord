import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Printer, Mail, Home, Download, Share2, CheckCircle,
  IndianRupee, Calendar, User, BookOpen, BadgeCheck,
  CreditCard, Hash, FileText, Landmark, Banknote,
  Smartphone, BookCheck, ChevronRight, Shield, Sparkles
} from 'lucide-react';

/* ─── helpers ─── */
const fmt = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: 0,
  }).format(Number(n) || 0);

const fmtDate = (d) => {
  if (!d) return 'N/A';
  try {
    return new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch { return String(d); }
};

const PAYMENT_MODE_ICONS = {
  cash:          Banknote,
  online:        Smartphone,
  cheque:        BookCheck,
  dd:            FileText,
  bank_transfer: Landmark,
};

/* ══════════════════════════════════════════════════
   RECEIPT COMPONENT
   ══════════════════════════════════════════════════ */
const FeeReceipt = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { receiptId } = useParams();

  /* ── Try to get receipt data from:
       1. React Router location.state (passed from CollectFeePayment)
       2. sessionStorage fallback (if page is refreshed)
       3. Redirect if nothing found
  ── */
  const [receiptData, setReceiptData] = useState(null);
  const [visible,     setVisible]     = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    let data = location.state?.receiptData ?? null;

    if (!data) {
      try {
        const stored = sessionStorage.getItem('feeReceiptData');
        if (stored) data = JSON.parse(stored);
      } catch { /* ignore */ }
    }

    if (data) {
      setReceiptData(data);
      // Cache in session so browser refresh doesn't lose it
      try { sessionStorage.setItem('feeReceiptData', JSON.stringify(data)); } catch { /* ignore */ }
      // Animate in
      setTimeout(() => setVisible(true), 80);
    } else {
      navigate('/admin/fees-payment/collect', { replace: true });
    }
  }, []);

  /* ── Actions ── */
  const handleDone = () => {
    sessionStorage.removeItem('feeReceiptData');
    navigate('/admin/fees-payment/collect');
  };

  const handlePrint = () => window.print();

  const handleDownloadPDF = () =>
    alert('PDF download will be integrated with your backend API');

  const handleEmail = () =>
    alert('Email receipt will be integrated with your backend API');

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Payment Receipt – ${receiptData?.receipt_id}`,
        text:  `Fee payment receipt for ${receiptData?.student?.name}`,
        url:   window.location.href,
      });
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert('Receipt link copied to clipboard!');
    }
  };

  /* ── Loading / redirect ── */
  if (!receiptData) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg,#0F172A,#1E3A5F)', fontFamily: "'DM Sans',sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet" />
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/70 font-medium">Loading receipt…</p>
        </div>
      </div>
    );
  }

  /* ── Derived values ── */
  const {
    receipt_id, date, time,
    student, fee_head,
    installments = [],
    amount = 0, fine = 0, grand = 0,
    payment_mode = 'cash', transaction_ref,
    remarks, api_message,
    academic_year,
  } = receiptData;

  const PayModeIcon = PAYMENT_MODE_ICONS[payment_mode?.toLowerCase()] || CreditCard;
  const totalInstallments = installments.length;

  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{ background: 'linear-gradient(160deg,#0F172A 0%,#1a2d5a 50%,#0d3320 100%)', fontFamily: "'DM Sans',sans-serif" }}
    >
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Serif+Display&display=swap" rel="stylesheet" />

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.7) rotate(-8deg); }
          70%  { transform: scale(1.08) rotate(2deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0;  }
        }
        .slide-up { animation: slideUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        .pop-in   { animation: popIn 0.6s cubic-bezier(0.22,1,0.36,1) both; }
        .card-1 { animation-delay: 0.05s; }
        .card-2 { animation-delay: 0.12s; }
        .card-3 { animation-delay: 0.19s; }
        .card-4 { animation-delay: 0.26s; }
        .card-5 { animation-delay: 0.33s; }
        .shimmer-line {
          background: linear-gradient(90deg,#ffffff10 25%,#ffffff30 50%,#ffffff10 75%);
          background-size: 400px 100%;
          animation: shimmer 2s infinite linear;
        }
        @media print {
          body, html { background: white !important; }
          .no-print  { display: none !important; }
          .print-area { box-shadow: none !important; border: none !important; }
          .print-bg { background: white !important; }
        }
        @page { size: A4; margin: 15mm 20mm; }
      `}</style>

      <div className="max-w-2xl mx-auto">

        {/* ══ SUCCESS HEADER (no-print glow effect) ══ */}
        <div
          className={`no-print text-center mb-8 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <div className="pop-in inline-flex items-center justify-center w-24 h-24 rounded-full mb-5 shadow-2xl"
            style={{ background: 'linear-gradient(135deg,#059669,#10B981,#6EE7B7)', boxShadow: '0 0 60px #10B98155' }}>
            <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "'DM Serif Display',serif" }}>
            Payment Successful!
          </h1>
          <p className="text-white/60 text-base">Fee has been recorded and receipt generated</p>
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-white/80 text-sm font-medium">{receipt_id}</span>
          </div>
        </div>

        {/* ══ RECEIPT CARD ══ */}
        <div
          ref={printRef}
          className={`print-area bg-white rounded-3xl overflow-hidden shadow-2xl transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)' }}
        >

          {/* ── Gradient top strip ── */}
          <div style={{ background: 'linear-gradient(135deg,#059669 0%,#10B981 50%,#34D399 100%)' }} className="px-8 py-8 print-bg">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-white/25 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white/90 text-sm font-semibold uppercase tracking-widest">Official Receipt</span>
                </div>
                <h2 className="text-2xl font-bold text-white mt-3" style={{ fontFamily: "'DM Serif Display',serif" }}>
                  Payment Receipt
                </h2>
                <p className="text-emerald-100 text-sm mt-0.5">School Fee Management System</p>
              </div>
              <div className="text-right">
                <div className="bg-white/20 backdrop-blur rounded-2xl px-5 py-3 border border-white/30">
                  <p className="text-emerald-100 text-xs font-medium mb-0.5">Receipt No.</p>
                  <p className="text-white font-bold text-lg">{receipt_id}</p>
                </div>
              </div>
            </div>

            {/* Date/time row */}
            <div className="flex items-center gap-4 mt-5 pt-5 border-t border-white/20">
              <div className="flex items-center gap-2 text-emerald-100 text-sm">
                <Calendar className="w-4 h-4" />
                <span>{date}</span>
              </div>
              <span className="text-white/30">·</span>
              <span className="text-emerald-100 text-sm">{time}</span>
              {academic_year && (
                <>
                  <span className="text-white/30">·</span>
                  <span className="text-emerald-100 text-sm">AY {academic_year}</span>
                </>
              )}
            </div>
          </div>

          {/* ── Body ── */}
          <div className="p-8 space-y-6">

            {/* Student Details */}
            <div className="slide-up card-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#DBEAFE' }}>
                  <User className="w-3.5 h-3.5" style={{ color: '#1E3A8A' }} />
                </div>
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Student Details</h3>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 bg-slate-50 rounded-2xl p-5 border border-slate-100">
                {[
                  ['Student Name',   student?.name],
                  ['Admission No.',  student?.admission_no],
                  ['Class & Section', `Class ${student?.class_name || '–'} – ${student?.section_name || '–'}`],
                  ['Academic Year',  academic_year || '—'],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-xs text-slate-400 font-medium mb-0.5">{label}</p>
                    <p className="font-semibold text-slate-800 text-sm">{val || '—'}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Fee Head */}
            {fee_head && (
              <div className="slide-up card-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#EDE9FE' }}>
                    <BookOpen className="w-3.5 h-3.5" style={{ color: '#5B21B6' }} />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Fee Head</h3>
                </div>
                <div className="bg-purple-50 rounded-2xl px-5 py-4 border border-purple-100 flex items-center justify-between">
                  <span className="font-semibold text-purple-800">{fee_head}</span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: '#EDE9FE', color: '#5B21B6' }}>
                    {totalInstallments} installment{totalInstallments !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}

            {/* Installments Table */}
            {installments.length > 0 && (
              <div className="slide-up card-3">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#FEF3C7' }}>
                    <Hash className="w-3.5 h-3.5" style={{ color: '#92400E' }} />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Installments Paid</h3>
                </div>

                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                  {/* Table head */}
                  <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <div className="col-span-2">Inst. #</div>
                    <div className="col-span-4">Due Date</div>
                    <div className="col-span-3 text-right">Amount</div>
                    <div className="col-span-3 text-right">Fine</div>
                  </div>

                  {installments.map((inst, i) => (
                    <div
                      key={i}
                      className={`grid grid-cols-12 gap-2 px-5 py-3.5 items-center text-sm border-t border-slate-100 ${i % 2 === 1 ? 'bg-slate-50' : 'bg-white'}`}
                    >
                      <div className="col-span-2">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold"
                          style={{ background: '#D1FAE5', color: '#065F46' }}>
                          {inst.installment_no || (i + 1)}
                        </span>
                      </div>
                      <div className="col-span-4 text-slate-600">{fmtDate(inst.due_date)}</div>
                      <div className="col-span-3 text-right font-semibold text-slate-800">{fmt(inst.amount)}</div>
                      <div className="col-span-3 text-right">
                        {parseFloat(inst.fine_amount) > 0
                          ? <span className="text-red-500 font-semibold">{fmt(inst.fine_amount)}</span>
                          : <span className="text-slate-300">—</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Summary */}
            <div className="slide-up card-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#D1FAE5' }}>
                  <IndianRupee className="w-3.5 h-3.5" style={{ color: '#065F46' }} />
                </div>
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Payment Summary</h3>
              </div>

              <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 overflow-hidden">
                <div className="px-6 py-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 text-sm">Subtotal (Installments)</span>
                    <span className="font-semibold text-slate-800">{fmt(amount)}</span>
                  </div>
                  {Number(fine) > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-red-500 text-sm">Late Fine</span>
                      <span className="font-semibold text-red-600">{fmt(fine)}</span>
                    </div>
                  )}
                </div>
                {/* Grand Total */}
                <div
                  className="flex justify-between items-center px-6 py-5"
                  style={{ background: 'linear-gradient(135deg,#059669,#10B981)' }}
                >
                  <div>
                    <p className="text-emerald-100 text-xs font-medium mb-0.5">Grand Total Paid</p>
                    <p className="text-white text-xs opacity-70">Inclusive of all charges</p>
                  </div>
                  <span className="text-3xl font-bold text-white">{fmt(grand)}</span>
                </div>
              </div>
            </div>

            {/* Payment Mode */}
            <div className="slide-up card-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#DBEAFE' }}>
                  <CreditCard className="w-3.5 h-3.5" style={{ color: '#1E3A8A' }} />
                </div>
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Payment Method</h3>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-3 bg-slate-800 text-white rounded-2xl px-5 py-3">
                  <PayModeIcon className="w-5 h-5 opacity-80" />
                  <span className="font-bold uppercase tracking-wide">{payment_mode}</span>
                </div>
                {transaction_ref && (
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 px-5 py-3">
                    <p className="text-xs text-slate-400 mb-0.5">Transaction / Ref No.</p>
                    <p className="font-mono font-semibold text-slate-800 text-sm">{transaction_ref}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Remarks */}
            {remarks && (
              <div className="bg-amber-50 rounded-2xl border border-amber-200 px-5 py-4">
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Remarks</p>
                <p className="text-slate-700 text-sm">{remarks}</p>
              </div>
            )}

            {/* System confirmation */}
            {api_message && (
              <div className="flex items-start gap-3 bg-blue-50 rounded-2xl border border-blue-200 px-5 py-4">
                <BadgeCheck className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-0.5">System Confirmation</p>
                  <p className="text-blue-800 text-sm">{api_message}</p>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="border-t-2 border-dashed border-slate-200 my-2" />

            {/* Stamp & Signature */}
            <div className="grid grid-cols-2 gap-6">
              {['School Stamp', 'Authorized Signature'].map((label) => (
                <div key={label} className="text-center">
                  <p className="text-xs text-slate-400 font-medium mb-3">{label}</p>
                  <div className="h-20 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50">
                    <span className="text-slate-300 text-xs">{label.split(' ')[1] === 'Stamp' ? 'Stamp' : 'Signature'} Area</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-400">This is a computer-generated receipt. No physical signature required.</p>
              <p className="text-xs text-slate-300 mt-1">For queries, please contact the school office.</p>
            </div>
          </div>
        </div>

        {/* ══ ACTION BUTTONS (no-print) ══ */}
        <div className={`no-print mt-6 space-y-3 transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-sm text-white shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all"
              style={{ background: 'linear-gradient(135deg,#1E3A8A,#2563EB)' }}
            >
              <Printer className="w-4 h-4" /> Print Receipt
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-sm text-white shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all"
              style={{ background: 'linear-gradient(135deg,#5B21B6,#7C3AED)' }}
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleEmail}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-sm border-2 border-white/20 text-white/80 hover:bg-white/10 hover:-translate-y-0.5 transition-all backdrop-blur-sm"
            >
              <Mail className="w-4 h-4" /> Email Receipt
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-sm text-white shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all"
              style={{ background: 'linear-gradient(135deg,#0F766E,#14B8A6)' }}
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
          <button
            onClick={handleDone}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white shadow-xl hover:-translate-y-0.5 hover:shadow-2xl transition-all text-base"
            style={{ background: 'linear-gradient(135deg,#059669,#10B981)', boxShadow: '0 8px 32px rgba(16,185,129,0.35)' }}
          >
            <Home className="w-5 h-5" />
            Done — Return to Student List
            <ChevronRight className="w-4 h-4 opacity-70" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default FeeReceipt;