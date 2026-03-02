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
  try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return d; }
};

const statusStyle = (s) => {
  switch (s?.toLowerCase()) {
    case 'paid':    return { bg: '#DCFCE7', color: '#15803D', label: 'PAID' };
    case 'overdue': return { bg: '#FEE2E2', color: '#B91C1C', label: 'OVERDUE' };
    case 'pending': return { bg: '#FEF9C3', color: '#A16207', label: 'PENDING' };
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

/* ══════════════════════════════════════════════════════════ */
const CollectFeePayment = () => {
  const navigate = useNavigate();
  const { studentId } = useParams();

  const [loading,       setLoading]       = useState(true);
  const [apiData,       setApiData]       = useState(null);
  const [studentInfo,   setStudentInfo]   = useState(null);
  const [feeBreakdown,  setFeeBreakdown]  = useState([]);
  const [summary,       setSummary]       = useState({});
  const [error,         setError]         = useState('');
  const [expandedHeads, setExpandedHeads] = useState({});

  const [showModal,     setShowModal]     = useState(false);
  const [activeFeeHead, setActiveFeeHead] = useState(null);
  const [selectedIds,   setSelectedIds]   = useState([]);
  const [paymentMode,   setPaymentMode]   = useState('cash');
  const [txRef,         setTxRef]         = useState('');
  const [remarks,       setRemarks]       = useState('');
  const [submitting,    setSubmitting]    = useState(false);
  const [modalError,    setModalError]    = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const res = await feePaymentService.getStudentFees(studentId);
      if (res?.success && res?.data) {
        setApiData(res.data);
        setStudentInfo(res.data.student_info || null);
        setFeeBreakdown(res.data.fee_breakdown || []);
        setSummary(res.data.summary || {});
      } else { setError(res?.error || 'Failed to load fee data'); }
    } catch (e) { setError(e.message || 'Failed to load data'); }
    finally { setLoading(false); }
  }, [studentId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openModal = (feeHead) => {
    setActiveFeeHead(feeHead);
    setSelectedIds([]); setPaymentMode('cash');
    setTxRef(''); setRemarks(''); setModalError('');
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setActiveFeeHead(null); };

  const getInstId = (inst) => inst.id ?? inst.installment_id;

  const toggleInstallment = (id, status) => {
    if (status?.toLowerCase() === 'paid') return;
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const calcTotals = () => {
    if (!activeFeeHead) return { amount: 0, fine: 0, grand: 0, count: 0 };
    let amount = 0, fine = 0;
    selectedIds.forEach(id => {
      const inst = activeFeeHead.installments?.find(i => getInstId(i) === id);
      if (inst) { amount += parseFloat(inst.amount || 0); fine += parseFloat(inst.fine_amount || 0); }
    });
    return { amount, fine, grand: amount + fine, count: selectedIds.length };
  };
  const totals = calcTotals();

  const handleSubmit = async () => {
    setModalError('');
    if (selectedIds.length === 0) { setModalError('Please select at least one installment'); return; }
    if (paymentMode !== 'cash' && !txRef.trim()) { setModalError('Transaction reference is required'); return; }
    try {
      setSubmitting(true);
      const payload = {
        student_id: parseInt(studentId), installment_ids: selectedIds,
        payment_mode: paymentMode, transaction_ref: txRef || null,
        payment_gateway: 'offline', remarks,
      };
      const res = await feePaymentService.collectFeePayment(payload);
      const paidInsts = (activeFeeHead?.installments || []).filter(i => selectedIds.includes(getInstId(i)));
      const receipt_id = res?.data?.receipt_id || res?.receipt_id || `RCP-${Date.now()}`;
      const receiptPayload = {
        receipt_id,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        student: studentInfo, fee_head: activeFeeHead?.fee_head_name,
        installments: paidInsts, amount: totals.amount, fine: totals.fine, grand: totals.grand,
        payment_mode: paymentMode, transaction_ref: txRef, remarks,
        api_message: res?.message || 'Payment recorded successfully',
        academic_year: apiData?.current_academic_year,
      };
      closeModal(); fetchData();
      navigate(`/admin/fees-payment/receipt/${receipt_id}`, { state: { receiptData: receiptPayload } });
    } catch (e) { setModalError(e.message || 'Payment failed'); }
    finally { setSubmitting(false); }
  };

  /* ── loading ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-orange-100" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 animate-spin" />
          </div>
          <p className="text-gray-700 font-semibold">Loading Fee Data...</p>
        </div>
      </div>
    );
  }

  if (error && !studentInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl p-10 text-center max-w-md border border-gray-200 shadow-sm">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-gray-700 font-semibold mb-4">{error}</p>
          <button onClick={() => navigate('/admin/fees-payment/collect')}
            className="px-6 py-2.5 rounded-lg text-white font-semibold text-sm"
            style={{ background: '#EA580C' }}>Back to Students</button>
        </div>
      </div>
    );
  }

  const grandTotal = (summary.current_year?.pending || 0) + (summary.current_year?.fine || 0);

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        input:focus, select:focus, textarea:focus { outline: none; border-color: #EA580C !important; box-shadow: 0 0 0 3px rgba(234,88,12,0.12); }
        @keyframes modalIn { from { opacity:0; transform:translateY(16px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
        .modal-enter { animation: modalIn 0.25s ease both; }
      `}</style>

      {/* ── Page Header ── */}
      <div className="mb-6">
        <button onClick={() => navigate('/admin/fees-payment/collect')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-2 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Students
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{studentInfo?.name || 'Student'}</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {studentInfo?.admission_no} · Class {studentInfo?.class_name} – {studentInfo?.section_name}
              {apiData?.current_academic_year ? ` · AY ${apiData.current_academic_year}` : ''}
            </p>
          </div>
          {grandTotal > 0 ? (
            <div className="px-4 py-3 rounded-xl text-right" style={{ background: '#FEE2E2' }}>
              <p className="text-xs font-semibold text-red-600 mb-0.5">Total Pending</p>
              <p className="font-bold text-red-700 text-xl">{fmt(grandTotal)}</p>
            </div>
          ) : (
            <div className="px-4 py-3 rounded-xl text-right" style={{ background: '#DCFCE7' }}>
              <p className="text-xs font-semibold text-green-700 mb-0.5">Status</p>
              <p className="font-bold text-green-700 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> All Paid</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Summary Cards ── */}
      {summary.current_year && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          {[
            { label: 'Total Fees', val: summary.current_year.total,   color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
            { label: 'Paid',       val: summary.current_year.paid,    color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0' },
            { label: 'Pending',    val: summary.current_year.pending, color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
            { label: 'Fine',       val: summary.current_year.fine,    color: '#DC2626', bg: '#FFF5F5', border: '#FECACA' },
          ].map(({ label, val, color, bg, border }) => (
            <div key={label} className="rounded-xl border p-5" style={{ background: bg, borderColor: border }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color }}>{label}</p>
              <p className="text-2xl font-bold" style={{ color }}>{fmt(val)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Previous year dues */}
      {(summary.previous_pending > 0 || summary.previous_fine > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between mb-5">
          <div>
            <p className="text-sm font-semibold text-amber-800">Previous Year Dues</p>
            <p className="text-xs text-amber-600 mt-0.5">Outstanding from earlier sessions</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-amber-800">{fmt(summary.previous_pending)}</p>
            {summary.previous_fine > 0 && <p className="text-xs text-red-600">+{fmt(summary.previous_fine)} fine</p>}
          </div>
        </div>
      )}

      {/* ── Fee Breakdown ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Fee Breakdown</h2>
        </div>

        {feeBreakdown.length === 0 ? (
          <div className="py-16 text-center">
            <Info className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">No fee structure found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {feeBreakdown.map((fh, idx) => {
              const fhPending = parseFloat(fh.pending_amount || 0);
              const fhPaid    = parseFloat(fh.paid_amount    || 0);
              const fhTotal   = parseFloat(fh.total_amount   || 0);
              const isPaid    = fhPending === 0 && fhTotal > 0;
              const isExpanded = expandedHeads[idx];

              return (
                <div key={fh.student_fee_id ?? idx}>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-50">
                            <BookOpen className="w-4 h-4 text-orange-500" />
                          </div>
                          <h3 className="font-bold text-gray-900">{fh.fee_head_name}</h3>
                          {isPaid
                            ? <span className="px-2.5 py-0.5 rounded text-xs font-bold" style={{ background: '#DCFCE7', color: '#15803D' }}>✓ PAID</span>
                            : <span className="px-2.5 py-0.5 rounded text-xs font-bold" style={{ background: '#FEF9C3', color: '#A16207' }}>PENDING</span>}
                          {fh.fee_frequency && (
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded capitalize">{fh.fee_frequency}</span>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-gray-400 mb-0.5">Total</p>
                            <p className="font-semibold text-gray-900">{fmt(fhTotal)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-0.5">Paid</p>
                            <p className="font-semibold" style={{ color: '#15803D' }}>{fmt(fhPaid)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-0.5">Pending</p>
                            <p className="font-semibold" style={{ color: fhPending > 0 ? '#DC2626' : '#6B7280' }}>{fmt(fhPending)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {!isPaid && (
                          <button
                            onClick={() => openModal(fh)}
                            className="px-4 py-2 rounded-lg text-white text-sm font-bold transition-all hover:opacity-90 active:scale-95"
                            style={{ background: '#EA580C' }}
                          >
                            Collect Payment
                          </button>
                        )}
                        {fh.installments?.length > 0 && (
                          <button
                            onClick={() => setExpandedHeads(prev => ({ ...prev, [idx]: !prev[idx] }))}
                            className="flex items-center gap-1 text-xs font-semibold transition-colors hover:opacity-70"
                            style={{ color: '#EA580C' }}
                          >
                            {isExpanded ? <><ChevronUp className="w-3.5 h-3.5" />Hide</> : <><ChevronDown className="w-3.5 h-3.5" />Installments</>}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && fh.installments?.length > 0 && (
                    <div className="border-t border-gray-100 bg-gray-50 p-5">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Installments</p>
                      <div className="space-y-2">
                        {fh.installments.map((inst, ii) => {
                          const { bg, color, label } = statusStyle(inst.calculated_status || inst.status);
                          return (
                            <div key={(inst.id ?? ii)}
                              className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-gray-100">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-gray-400">#{inst.installment_no}</span>
                                <div>
                                  <p className="text-sm font-medium text-gray-800">Due {fmtDate(inst.end_due_date || inst.start_due_date)}</p>
                                  {inst.paid_on && <p className="text-xs text-green-600">Paid {fmtDate(inst.paid_on)}</p>}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-gray-900">{fmt(inst.amount)}</span>
                                {parseFloat(inst.fine_amount) > 0 && <span className="text-xs text-red-500">+{fmt(inst.fine_amount)}</span>}
                                <span className="px-2.5 py-1 rounded text-xs font-bold" style={{ background: bg, color }}>{label}</span>
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
        <div className="mt-5">
          <h2 className="font-bold text-gray-900 text-base mb-3">Payment History</h2>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-50">
              {apiData.payment_history.map((ph, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{ph.fee_head_name || 'Payment'}</p>
                    <p className="text-xs text-gray-400">{fmtDate(ph.payment_date)} · {ph.payment_mode?.toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{fmt(ph.amount)}</p>
                    {ph.receipt_no && <p className="text-xs text-gray-400">{ph.receipt_no}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ PAYMENT MODAL ═══════════════ */}
      {showModal && activeFeeHead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-enter bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100">

            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Collect Payment</h2>
                <p className="text-sm text-gray-500 mt-0.5">{activeFeeHead.fee_head_name}</p>
              </div>
              <button onClick={closeModal}
                className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-5">

              {/* Error */}
              {modalError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 text-sm font-medium">{modalError}</p>
                </div>
              )}

              {/* Installment Selection */}
              <div>
                <p className="text-sm font-bold text-gray-800 mb-3">
                  Select Installments <span className="text-red-500">*</span>
                  <span className="ml-2 text-gray-400 font-normal text-xs">(click to select)</span>
                </p>
                {!activeFeeHead.installments?.length ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-700 text-sm">
                    No installments available
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeFeeHead.installments.map((inst) => {
                      const id     = getInstId(inst);
                      const status = (inst.calculated_status || inst.status || '').toLowerCase();
                      const isPaid = status === 'paid';
                      const isSel  = selectedIds.includes(id);
                      const { bg, color, label } = statusStyle(status);

                      return (
                        <div key={id}
                          onClick={() => toggleInstallment(id, status)}
                          className={`flex items-center justify-between rounded-lg px-4 py-3.5 border-2 transition-all
                            ${isPaid ? 'opacity-50 cursor-not-allowed border-gray-100 bg-gray-50'
                              : isSel  ? 'cursor-pointer shadow-sm'
                              :          'border-gray-200 bg-white cursor-pointer hover:border-orange-300'}`}
                          style={isSel ? { borderColor: '#EA580C', background: '#FFF7ED' } : {}}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all
                              ${isSel ? 'border-orange-500 bg-orange-500' : isPaid ? 'border-gray-300 bg-gray-200' : 'border-gray-300'}`}>
                              {isSel && <CheckCircle className="w-3 h-3 text-white" />}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">Installment #{inst.installment_no}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                <p className="text-xs text-gray-500">Due {fmtDate(inst.end_due_date || inst.start_due_date)}</p>
                                {inst.paid_on && <p className="text-xs text-green-600">· Paid {fmtDate(inst.paid_on)}</p>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-bold text-gray-900">{fmt(inst.amount)}</p>
                              {parseFloat(inst.fine_amount) > 0 && <p className="text-xs text-red-500">+{fmt(inst.fine_amount)} fine</p>}
                            </div>
                            <span className="px-2.5 py-1 rounded text-xs font-bold" style={{ background: bg, color }}>{label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Live Calculation */}
              {selectedIds.length > 0 && (
                <div className="rounded-xl border-2 p-5" style={{ borderColor: '#FED7AA', background: '#FFF7ED' }}>
                  <p className="text-sm font-bold text-orange-700 mb-3 flex items-center gap-2">
                    <IndianRupee className="w-4 h-4" /> Payment Summary
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Selected Installments</span>
                      <span className="font-semibold text-gray-900">{totals.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount</span>
                      <span className="font-semibold text-gray-900">{fmt(totals.amount)}</span>
                    </div>
                    {totals.fine > 0 && (
                      <div className="flex justify-between">
                        <span className="text-red-600">Fine</span>
                        <span className="font-semibold text-red-600">{fmt(totals.fine)}</span>
                      </div>
                    )}
                    <div className="border-t border-orange-200 pt-2 flex justify-between items-center">
                      <span className="font-bold text-gray-900">Grand Total</span>
                      <span className="font-bold text-2xl" style={{ color: '#EA580C' }}>{fmt(totals.grand)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Mode */}
              <div>
                <p className="text-sm font-bold text-gray-800 mb-3">Payment Mode</p>
                <div className="grid grid-cols-5 gap-2">
                  {PAYMENT_MODES.map(({ value, label, Icon }) => (
                    <button key={value} type="button"
                      onClick={() => { setPaymentMode(value); if (value === 'cash') setTxRef(''); }}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-lg border-2 text-xs font-semibold transition-all
                        ${paymentMode === value
                          ? 'text-white'
                          : 'border-gray-200 text-gray-600 hover:border-orange-300 bg-white'}`}
                      style={paymentMode === value ? { background: '#EA580C', borderColor: '#EA580C' } : {}}
                    >
                      <Icon className="w-5 h-5" /> {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transaction Ref */}
              {paymentMode !== 'cash' && (
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Transaction / Cheque / DD Reference <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter reference number"
                    value={txRef}
                    onChange={e => setTxRef(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 font-medium bg-white placeholder-gray-400 transition-all"
                  />
                </div>
              )}

              {/* Remarks */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Remarks (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Add notes or remarks..."
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 resize-none bg-white placeholder-gray-400 transition-all"
                />
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button onClick={closeModal}
                  className="py-3 rounded-lg border-2 border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-sm">
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || selectedIds.length === 0}
                  className="py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  style={{ background: submitting || selectedIds.length === 0 ? '#9CA3AF' : '#EA580C' }}
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