import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, Loader2, AlertTriangle, Info,
  IndianRupee, Calendar, CreditCard, FileText, X,
  Banknote, Smartphone, BookCheck, Landmark, ChevronDown,
  ChevronUp, BookOpen
} from 'lucide-react';
import feePaymentService from '../../services/feeallService/feePaymentService';

/* ─── helpers ─── */
const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n || 0);

const fmtDate = (d) => {
  if (!d) return 'N/A';
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return d; }
};

const statusStyle = (s) => {
  switch (s?.toLowerCase()) {
    case 'paid':    return { bg: '#D1FAE5', color: '#065F46', label: 'PAID' };
    case 'overdue': return { bg: '#FEE2E2', color: '#991B1B', label: 'OVERDUE' };
    case 'pending': return { bg: '#FEF3C7', color: '#92400E', label: 'PENDING' };
    default:        return { bg: '#F1F5F9', color: '#475569', label: (s || '—').toUpperCase() };
  }
};

const PAYMENT_MODES = [
  { value: 'cash',          label: 'Cash',         Icon: Banknote   },
  { value: 'online',        label: 'Online',        Icon: Smartphone },
  { value: 'cheque',        label: 'Cheque',        Icon: BookCheck  },
  { value: 'dd',            label: 'DD',            Icon: FileText   },
  { value: 'bank_transfer', label: 'Bank Transfer', Icon: Landmark   },
];

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />
);

/* ══════════════════════════════════════════════════════════ */
const CollectFeePayment = () => {
  const navigate      = useNavigate();
  const { studentId } = useParams();

  const [loading,       setLoading]       = useState(true);
  const [apiData,       setApiData]       = useState(null);
  const [studentInfo,   setStudentInfo]   = useState(null);
  const [feeBreakdown,  setFeeBreakdown]  = useState([]);
  const [summary,       setSummary]       = useState({});
  const [error,         setError]         = useState('');
  const [expandedHeads, setExpandedHeads] = useState({});

  /* Modal state */
  const [showModal,     setShowModal]     = useState(false);
  const [activeFeeHead, setActiveFeeHead] = useState(null);
  const [selectedIds,   setSelectedIds]   = useState([]);
  const [paymentMode,   setPaymentMode]   = useState('cash');
  const [txRef,         setTxRef]         = useState('');
  const [remarks,       setRemarks]       = useState('');
  const [submitting,    setSubmitting]    = useState(false);
  const [modalError,    setModalError]    = useState('');

  /* ── fetch ── */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true); setError('');
      // Uses current academic year from API (2025-26)
      const res = await feePaymentService.getStudentFees(studentId);
      if (res?.success && res?.data) {
        setApiData(res.data);
        setStudentInfo(res.data.student_info || null);
        setFeeBreakdown(res.data.fee_breakdown || []);
        setSummary(res.data.summary || {});
      } else {
        setError(res?.error || 'Failed to load fee data');
      }
    } catch (e) {
      setError(e.message || 'Failed to load data');
    } finally { setLoading(false); }
  }, [studentId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── modal helpers ── */
  const openModal = (feeHead) => {
    setActiveFeeHead(feeHead);
    setSelectedIds([]); setPaymentMode('cash');
    setTxRef(''); setRemarks(''); setModalError('');
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setActiveFeeHead(null); };

  /**
   * Installment id field: API returns `id` (not installment_id)
   * e.g. { "id": 227, "installment_no": 1, ... }
   */
  const getInstId = (inst) => inst.id ?? inst.installment_id;

  const toggleInstallment = (id, status) => {
    if (status?.toLowerCase() === 'paid') return;
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  /* ── live totals ── */
  const calcTotals = () => {
    if (!activeFeeHead) return { amount: 0, fine: 0, grand: 0, count: 0 };
    let amount = 0, fine = 0;
    selectedIds.forEach(id => {
      const inst = activeFeeHead.installments?.find(i => getInstId(i) === id);
      if (inst) {
        amount += parseFloat(inst.amount  || 0);
        fine   += parseFloat(inst.fine_amount || 0);
      }
    });
    return { amount, fine, grand: amount + fine, count: selectedIds.length };
  };
  const totals = calcTotals();

  /* ── submit payment ── */
  const handleSubmit = async () => {
    setModalError('');
    if (selectedIds.length === 0) {
      setModalError('Please select at least one installment'); return;
    }
    if (paymentMode !== 'cash' && !txRef.trim()) {
      setModalError('Transaction reference is required for non-cash payments'); return;
    }

    try {
      setSubmitting(true);
      const payload = {
        student_id:      parseInt(studentId),
        installment_ids: selectedIds,   // array of `id` values from installments
        payment_mode:    paymentMode,
        transaction_ref: txRef || null,
        payment_gateway: 'offline',
        remarks,
      };
      const res = await feePaymentService.collectFeePayment(payload);

      const paidInsts  = (activeFeeHead?.installments || [])
        .filter(i => selectedIds.includes(getInstId(i)));
      const receipt_id = res?.data?.receipt_id || res?.receipt_id || `RCP-${Date.now()}`;

      const receiptPayload = {
        receipt_id,
        date:            new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
        time:            new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        student:         studentInfo,
        fee_head:        activeFeeHead?.fee_head_name,
        installments:    paidInsts,
        amount:          totals.amount,
        fine:            totals.fine,
        grand:           totals.grand,
        payment_mode:    paymentMode,
        transaction_ref: txRef,
        remarks,
        api_message:     res?.message || 'Payment recorded successfully',
        academic_year:   apiData?.current_academic_year,
      };

      closeModal();
      fetchData(); // refresh in background

      navigate(`/admin/fees-payment/receipt/${receipt_id}`, {
        state: { receiptData: receiptPayload },
      });
    } catch (e) {
      setModalError(e.message || 'Payment failed');
    } finally { setSubmitting(false); }
  };

  /* ── loading skeleton ── */
  if (loading) {
    return (
      <div className="min-h-screen p-6"
        style={{ background: 'linear-gradient(135deg,#EEF2FF,#F0FDF4)', fontFamily: "'Poppins',sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <div className="max-w-5xl mx-auto space-y-6 pt-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-28 w-full" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  /* ── error ── */
  if (error && !studentInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6"
        style={{ background: 'linear-gradient(135deg,#EEF2FF,#F0FDF4)' }}>
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Failed to load data</h3>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <button onClick={() => navigate('/admin/fees-payment/collect')}
            className="px-6 py-3 rounded-xl text-white font-semibold" style={{ background: '#1E3A8A' }}>
            Back to Students
          </button>
        </div>
      </div>
    );
  }

  /**
   * Grand total = pending + fine
   * Using summary.current_year which has { total, paid, pending, fine }
   */
  const grandTotal = (summary.current_year?.pending || 0) + (summary.current_year?.fine || 0);

  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen"
      style={{ background: 'linear-gradient(135deg,#EEF2FF,#F0FDF4)', fontFamily: "'Poppins',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* ── Top Bar ── */}
      <div style={{ background: 'linear-gradient(135deg,#1E3A8A,#1D4ED8,#2563EB)' }} className="px-6 py-6 shadow-xl">
        <div className="max-w-5xl mx-auto">
          <button onClick={() => navigate('/admin/fees-payment/collect')}
            className="flex items-center gap-2 text-blue-200 hover:text-white mb-4 text-sm font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Students
          </button>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{studentInfo?.name || 'Student'}</h1>
              {/* section_name used directly from student_info */}
              <p className="text-blue-200 text-sm mt-0.5">
                {studentInfo?.admission_no} · Class {studentInfo?.class_name} – {studentInfo?.section_name}
                {apiData?.current_academic_year ? ` · AY ${apiData.current_academic_year}` : ''}
              </p>
            </div>
            {grandTotal > 0 ? (
              <div className="bg-red-500 text-white rounded-2xl px-5 py-3 text-right shadow-lg">
                <div className="text-xs font-medium mb-0.5 opacity-90">Total Pending</div>
                <div className="text-xl font-bold">{fmt(grandTotal)}</div>
              </div>
            ) : (
              <div className="bg-emerald-500 text-white rounded-2xl px-5 py-3 text-right shadow-lg">
                <div className="text-xs font-medium mb-0.5 opacity-90">Status</div>
                <div className="text-lg font-bold flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> All Paid
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* ── Summary Cards ── */}
        {summary.current_year && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Fees', val: summary.current_year.total,   color: '#1E3A8A' },
              { label: 'Paid',       val: summary.current_year.paid,    color: '#065F46' },
              { label: 'Pending',    val: summary.current_year.pending, color: '#92400E' },
              { label: 'Fine',       val: summary.current_year.fine,    color: '#991B1B' },
            ].map(({ label, val, color }) => (
              <div key={label} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{label}</div>
                <div className="text-2xl font-bold" style={{ color }}>{fmt(val)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Previous year dues (if any) */}
        {(summary.previous_pending > 0 || summary.previous_fine > 0) && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-orange-700">Previous Year Dues</p>
              <p className="text-xs text-orange-500 mt-0.5">Outstanding from earlier sessions</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-orange-700">{fmt(summary.previous_pending)}</p>
              {summary.previous_fine > 0 && (
                <p className="text-xs text-red-500">+{fmt(summary.previous_fine)} fine</p>
              )}
            </div>
          </div>
        )}

        {/* Grand Total Banner */}
        {grandTotal > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-red-200 p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Grand Total to Collect</p>
              <p className="text-xs text-slate-400 mt-0.5">Pending Amount + Fine</p>
            </div>
            <div className="text-4xl font-bold text-red-600">{fmt(grandTotal)}</div>
          </div>
        )}

        {/* ── Fee Breakdown ── */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">Fee Breakdown</h2>

          {feeBreakdown.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 py-16 text-center">
              <Info className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No fee structure found</p>
              <p className="text-slate-400 text-sm mt-1">Contact school administrator</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feeBreakdown.map((fh, idx) => {
                const fhPending  = parseFloat(fh.pending_amount || 0);
                const fhPaid     = parseFloat(fh.paid_amount    || 0);
                const fhTotal    = parseFloat(fh.total_amount   || 0);
                const isPaid     = fhPending === 0 && fhTotal > 0;
                const isExpanded = expandedHeads[idx];

                return (
                  <div key={fh.student_fee_id ?? idx}
                    className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3 flex-wrap">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ background: '#EDE9FE' }}>
                              <BookOpen className="w-4 h-4" style={{ color: '#5B21B6' }} />
                            </div>
                            <h3 className="font-bold text-slate-800">{fh.fee_head_name}</h3>
                            {isPaid
                              ? <span className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                                  style={{ background: '#D1FAE5', color: '#065F46' }}>✓ PAID</span>
                              : <span className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                                  style={{ background: '#FEF3C7', color: '#92400E' }}>PENDING</span>}
                            {fh.fee_frequency && (
                              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full capitalize">
                                {fh.fee_frequency}
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-slate-400">Total</p>
                              <p className="font-semibold text-slate-700">{fmt(fhTotal)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Paid</p>
                              <p className="font-semibold text-emerald-600">{fmt(fhPaid)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Pending</p>
                              <p className={`font-semibold ${fhPending > 0 ? 'text-red-600' : 'text-slate-700'}`}>
                                {fmt(fhPending)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          {!isPaid && (
                            <button
                              onClick={() => openModal(fh)}
                              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all whitespace-nowrap"
                              style={{ background: 'linear-gradient(135deg,#10B981,#059669)' }}
                            >
                              Collect Payment
                            </button>
                          )}
                          {fh.installments?.length > 0 && (
                            <button
                              onClick={() => setExpandedHeads(prev => ({ ...prev, [idx]: !prev[idx] }))}
                              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                            >
                              {isExpanded
                                ? <><ChevronUp className="w-3.5 h-3.5" />Hide</>
                                : <><ChevronDown className="w-3.5 h-3.5" />Installments</>}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Installments */}
                    {isExpanded && fh.installments?.length > 0 && (
                      <div className="border-t border-slate-100 bg-slate-50 p-5">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Installments</p>
                        <div className="space-y-2">
                          {fh.installments.map((inst, ii) => {
                            /* Use calculated_status first, fallback to status */
                            const { bg, color, label } = statusStyle(inst.calculated_status || inst.status);
                            return (
                              <div key={getInstId(inst) ?? ii}
                                className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-slate-100">
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-bold text-slate-400">#{inst.installment_no}</span>
                                  <div>
                                    {/* Use end_due_date as the primary due date shown to user */}
                                    <p className="text-sm font-medium text-slate-700">
                                      Due {fmtDate(inst.end_due_date || inst.start_due_date)}
                                    </p>
                                    {inst.paid_on && (
                                      <p className="text-xs text-emerald-500">Paid {fmtDate(inst.paid_on)}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="text-sm font-bold text-slate-800">{fmt(inst.amount)}</span>
                                  {parseFloat(inst.fine_amount) > 0 && (
                                    <span className="text-xs text-red-500">+{fmt(inst.fine_amount)}</span>
                                  )}
                                  <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                                    style={{ background: bg, color }}>{label}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Payment History ── */}
        {apiData?.payment_history?.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Payment History</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="divide-y divide-slate-100">
                {apiData.payment_history.map((ph, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{ph.fee_head_name || 'Payment'}</p>
                      <p className="text-xs text-slate-400">
                        {fmtDate(ph.payment_date)} · {ph.payment_mode?.toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">{fmt(ph.amount)}</p>
                      {ph.receipt_no && <p className="text-xs text-slate-400">{ph.receipt_no}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════ PAYMENT MODAL ═══════════════ */}
      {showModal && activeFeeHead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white rounded-t-3xl z-10">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Collect Payment</h2>
                <p className="text-sm text-slate-500 mt-0.5">{activeFeeHead.fee_head_name}</p>
              </div>
              <button onClick={closeModal}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">

              {/* Error */}
              {modalError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{modalError}</p>
                </div>
              )}

              {/* Installment Selection */}
              <div>
                <p className="text-sm font-bold text-slate-700 mb-3">
                  Select Installments <span className="text-red-500">*</span>
                  <span className="ml-2 text-slate-400 font-normal text-xs">(click to toggle)</span>
                </p>
                {!activeFeeHead.installments?.length ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700 text-sm">
                    No installments available for this fee head
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeFeeHead.installments.map((inst) => {
                      const id     = getInstId(inst);
                      const status = (inst.calculated_status || inst.status || '').toLowerCase();
                      const isPaid = status === 'paid';
                      const isOver = status === 'overdue';
                      const isSel  = selectedIds.includes(id);
                      const { bg, color, label } = statusStyle(status);

                      return (
                        <div
                          key={id}
                          onClick={() => toggleInstallment(id, status)}
                          className={`flex items-center justify-between rounded-xl px-4 py-3.5 border-2 transition-all
                            ${isPaid ? 'opacity-50 cursor-not-allowed border-slate-100 bg-slate-50'
                              : isSel  ? 'border-indigo-500 bg-indigo-50 cursor-pointer shadow-sm'
                              : isOver ? 'border-red-300 bg-red-50 cursor-pointer hover:border-red-400'
                              :          'border-slate-200 bg-white cursor-pointer hover:border-indigo-300'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all
                              ${isSel ? 'border-indigo-500 bg-indigo-500' : isPaid ? 'border-slate-300 bg-slate-200' : 'border-slate-300'}`}>
                              {isSel && <CheckCircle className="w-3 h-3 text-white" />}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 text-sm">Installment #{inst.installment_no}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                {/* Show end_due_date as the deadline */}
                                <p className="text-xs text-slate-400">
                                  Due {fmtDate(inst.end_due_date || inst.start_due_date)}
                                </p>
                                {inst.paid_on && (
                                  <p className="text-xs text-emerald-500">· Paid {fmtDate(inst.paid_on)}</p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-bold text-slate-800">{fmt(inst.amount)}</p>
                              {parseFloat(inst.fine_amount) > 0 && (
                                <p className="text-xs text-red-500">+{fmt(inst.fine_amount)} fine</p>
                              )}
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                              style={{ background: bg, color }}>{label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Live Calculation */}
              {selectedIds.length > 0 && (
                <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-5">
                  <p className="text-sm font-bold text-indigo-700 mb-3 flex items-center gap-2">
                    <IndianRupee className="w-4 h-4" /> Live Calculation
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Selected Installments</span>
                      <span className="font-semibold text-indigo-800">{totals.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Amount</span>
                      <span className="font-semibold">{fmt(totals.amount)}</span>
                    </div>
                    {totals.fine > 0 && (
                      <div className="flex justify-between">
                        <span className="text-red-500">Fine</span>
                        <span className="font-semibold text-red-600">{fmt(totals.fine)}</span>
                      </div>
                    )}
                    <div className="border-t border-indigo-200 pt-2 flex justify-between items-center">
                      <span className="font-bold text-slate-800">Grand Total</span>
                      <span className="font-bold text-2xl text-indigo-700">{fmt(totals.grand)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Mode */}
              <div>
                <p className="text-sm font-bold text-slate-700 mb-3">Payment Mode</p>
                <div className="grid grid-cols-5 gap-2">
                  {PAYMENT_MODES.map(({ value, label, Icon }) => (
                    <button key={value} type="button"
                      onClick={() => { setPaymentMode(value); if (value === 'cash') setTxRef(''); }}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-semibold transition-all
                        ${paymentMode === value
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                          : 'border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                    >
                      <Icon className="w-5 h-5" /> {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transaction Ref (conditional) */}
              {paymentMode !== 'cash' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Transaction / Cheque / DD Reference <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter reference number"
                    value={txRef}
                    onChange={e => setTxRef(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              {/* Remarks */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Remarks (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Add notes or remarks..."
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button onClick={closeModal}
                  className="py-3 rounded-xl border-2 border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || selectedIds.length === 0}
                  className="py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
                  style={{ background: submitting || selectedIds.length === 0 ? '#94A3B8' : 'linear-gradient(135deg,#10B981,#059669)' }}
                >
                  {submitting
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Processing...</>
                    : <><CheckCircle className="w-4 h-4" />Submit Payment</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectFeePayment;