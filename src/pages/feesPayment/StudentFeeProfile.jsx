import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Eye, AlertTriangle, CheckCircle, Clock, Ban,
  ChevronDown, Calendar, FileText, GraduationCap, Loader2,
  XCircle, X, Edit, Printer
} from 'lucide-react';
import feePaymentService from '../../services/feeallService/feePaymentService';

/* ─── helpers ─── */
const fmt = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: 0,
  }).format(Number(n) || 0);

const fmtDate = (d) => {
  if (!d) return 'N/A';
  try {
    return new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch { return String(d); }
};

const DISCONTINUE_REASONS = [
  'Student left school',
  'Service/facility stopped',
  'Scholarship granted',
  'Fee waiver approved',
  'Relocation / Moving',
  'Other',
];

const avatarColors = [
  { bg: '#FFF3E0', text: '#E65100' },
  { bg: '#E8F5E9', text: '#2E7D32' },
  { bg: '#E3F2FD', text: '#1565C0' },
  { bg: '#FCE4EC', text: '#880E4F' },
  { bg: '#EDE7F6', text: '#4527A0' },
  { bg: '#E0F2F1', text: '#00695C' },
];
const getAvatar = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];

/* ── Toast ── */
const Toast = ({ message, type, onClose }) => (
  <div className="fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl"
    style={{
      background: type === 'success' ? '#15803D' : '#B91C1C',
      animation: 'slideIn 0.3s ease',
      minWidth: 280,
    }}>
    {type === 'success'
      ? <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
      : <AlertTriangle className="w-5 h-5 text-white flex-shrink-0" />}
    <span className="text-white font-semibold text-sm flex-1">{message}</span>
    <button onClick={onClose} className="text-white/70 hover:text-white"><X className="w-4 h-4" /></button>
  </div>
);

/* ══════════════════════════════════════════════════════════ */
const StudentFeeProfile = () => {
  const navigate = useNavigate();
  const { studentId } = useParams();

  const [loading, setLoading] = useState(true);
  const [apiData, setApiData] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [assignedFees, setAssignedFees] = useState([]);
  const [summary, setSummary] = useState({});
  const [error, setError] = useState('');
  const [academicYear, setAcademicYear] = useState('2025-26');

  /* Discontinue modal */
  const [modal, setModal] = useState(false);
  const [activeFee, setActiveFee] = useState(null);
  const [discDate, setDiscDate] = useState(new Date().toISOString().split('T')[0]);
  const [discReason, setDiscReason] = useState('');
  const [discNotes, setDiscNotes] = useState('');
  const [discLoading, setDiscLoading] = useState(false);
  const [discError, setDiscError] = useState('');

  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  /* ── fetch ── */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const res = await feePaymentService.getStudentFees(studentId, academicYear);
      if (res?.success && res?.data) {
        setApiData(res.data);
        setStudentInfo(res.data.student_info || null);
        setAssignedFees(res.data.fee_breakdown || []);
        setSummary(res.data.summary || {});
      } else {
        setError(res?.error || 'Failed to load fee data');
      }
    } catch (e) {
      setError(e.message || 'Failed to load data');
    } finally { setLoading(false); }
  }, [studentId, academicYear]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openDiscontinue = (fee) => {
    setActiveFee(fee);
    setDiscDate(new Date().toISOString().split('T')[0]);
    setDiscReason(''); setDiscNotes(''); setDiscError('');
    setModal(true);
  };
  const closeModal = () => { setModal(false); setActiveFee(null); };

  const handleDiscontinue = async () => {
    if (!discReason) { setDiscError('Please select a reason'); return; }
    if (!discDate)   { setDiscError('Please select a date'); return; }
    try {
      setDiscLoading(true); setDiscError('');
      await feePaymentService.discontinueFee({
        student_id:         parseInt(studentId),
        student_fee_id:     activeFee.student_fee_id,
        discontinued_on:    discDate,
        discontinue_reason: discNotes ? `${discReason} - ${discNotes}` : discReason,
      });
      closeModal();
      showToast(`${activeFee.fee_head_name} discontinued successfully`);
      fetchData();
    } catch (e) {
      setDiscError(e.message || 'Failed to discontinue fee');
    } finally { setDiscLoading(false); }
  };

  const handlePay = (fee) => {
    navigate(`/admin/fees-payment/collect/${studentId}`, {
      state: { preselectedFeeId: fee.student_fee_id }
    });
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
          <p className="text-gray-700 font-semibold">Loading Fee Profile...</p>
        </div>
      </div>
    );
  }

  if (error && !studentInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md w-full border border-gray-200">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to load</h3>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button onClick={() => navigate('/admin/fees-payment/collect')}
            className="px-6 py-2.5 rounded-lg text-white font-semibold text-sm"
            style={{ background: '#EA580C' }}>
            Back to Students
          </button>
        </div>
      </div>
    );
  }

  const cy = summary.current_year || {};
  const av = getAvatar(studentInfo?.name || '');

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes modalIn { from { opacity:0; transform:translateY(16px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
        .modal-enter { animation: modalIn 0.25s ease both; }
        input:focus, select:focus, textarea:focus { outline: none; border-color: #EA580C !important; box-shadow: 0 0 0 3px rgba(234,88,12,0.12); }
      `}</style>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={() => navigate('/admin/fees-payment/collect')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-2 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Fee Collection
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Student Fee Profile</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage and view detailed fee information</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={academicYear}
            onChange={e => setAcademicYear(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-gray-900 text-sm font-semibold bg-white focus:outline-none"
            style={{ minWidth: 160 }}
          >
            <option value="2025-26">Academic Year 2025-26</option>
            <option value="2024-25">Academic Year 2024-25</option>
            <option value="2023-24">Academic Year 2023-24</option>
          </select>
        </div>
      </div>

      {/* ── Student Info Card ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold"
              style={{ background: av.bg, color: av.text }}>
              {studentInfo?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{studentInfo?.name}</h2>
              <div className="flex items-center gap-4 mt-1 flex-wrap">
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <span className="w-4 h-4 text-gray-400">🪪</span>
                  {studentInfo?.admission_no}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <span>📚</span>
                  Class {studentInfo?.class_name} - {studentInfo?.section_name}
                </span>
                {studentInfo?.joined_on && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <span>📅</span>
                    Joined {fmtDate(studentInfo.joined_on)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors">
              <Edit className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors">
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total Fee', value: cy.total || 0, sub: 'Standard annual curriculum', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
          { label: 'Paid Amount', value: cy.paid || 0, sub: `${cy.total ? Math.round((cy.paid / cy.total) * 100) : 0}% of total collected`, color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0' },
          { label: 'Pending', value: cy.pending || 0, sub: cy.pending > 0 ? 'Next due: Soon' : 'No pending dues', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
          { label: 'Late Fine', value: cy.fine || 0, sub: cy.fine > 0 ? 'Applied for overdue fees' : 'No fines', color: '#DC2626', bg: '#FFF5F5', border: '#FECACA' },
        ].map(({ label, value, sub, color, bg, border }) => (
          <div key={label} className="rounded-xl border p-5" style={{ background: bg, borderColor: border }}>
            <p className="text-sm font-semibold mb-1" style={{ color }}>{label}</p>
            <p className="text-2xl font-bold mb-1" style={{ color }}>{fmt(value)}</p>
            <p className="text-xs" style={{ color, opacity: 0.7 }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Assigned Fee Breakdown ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Table Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-base">Assigned Fee Breakdown</h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-600">
            {assignedFees.length} items listed
          </span>
        </div>

        {/* Column Headers */}
        <div className="grid grid-cols-12 gap-2 px-6 py-3 bg-gray-50 border-b border-gray-100">
          {[
            { h: 'Fee Head', s: 'col-span-3' },
            { h: 'Total',    s: 'col-span-1' },
            { h: 'Paid',     s: 'col-span-1' },
            { h: 'Pending',  s: 'col-span-2' },
            { h: 'Fine',     s: 'col-span-1' },
            { h: 'Status',   s: 'col-span-2' },
            { h: 'Action',   s: 'col-span-2 text-right' },
          ].map(({ h, s }) => (
            <div key={h} className={`text-xs font-bold text-gray-500 uppercase tracking-wider ${s}`}>{h}</div>
          ))}
        </div>

        {/* Rows */}
        {assignedFees.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">No fees assigned</p>
            <p className="text-gray-400 text-sm mt-1">No fee records found for {academicYear}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {assignedFees.map((fee, idx) => {
              const isDisc = !!fee.discontinued_on;
              const isPaid = fee.status?.toLowerCase() === 'paid';
              const isPartial = fee.status?.toLowerCase() === 'partial';
              const isPending = fee.status?.toLowerCase() === 'pending';

              const statusBadge = isDisc
                ? { label: `Discontinued (Since ${fmtDate(fee.discontinued_on)})`, bg: '#F3F4F6', color: '#6B7280' }
                : isPaid    ? { label: 'Paid',    bg: '#DCFCE7', color: '#15803D' }
                : isPartial ? { label: 'Partial', bg: '#FEF9C3', color: '#A16207' }
                : isPending ? { label: 'Pending', bg: '#FEE2E2', color: '#B91C1C' }
                :             { label: fee.status || '—', bg: '#F1F5F9', color: '#475569' };

              return (
                <div key={fee.student_fee_id ?? idx}
                  className={`grid grid-cols-12 gap-2 px-6 py-4 items-center hover:bg-gray-50/60 transition-colors ${isDisc ? 'opacity-60' : ''}`}>

                  {/* Fee Head */}
                  <div className="col-span-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-orange-50">
                      <FileText className="w-3.5 h-3.5 text-orange-500" />
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${isDisc ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                        {fee.fee_head_name}
                      </p>
                      {fee.fee_frequency && (
                        <p className="text-xs text-gray-400 capitalize">{fee.fee_frequency}</p>
                      )}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="col-span-1">
                    <span className="text-sm font-semibold text-gray-900">{fmt(fee.total_amount)}</span>
                  </div>

                  {/* Paid */}
                  <div className="col-span-1">
                    <span className="text-sm font-semibold" style={{ color: '#15803D' }}>{fmt(fee.paid_amount)}</span>
                  </div>

                  {/* Pending */}
                  <div className="col-span-2">
                    <span className="text-sm font-semibold"
                      style={{ color: parseFloat(fee.pending_amount) > 0 && !isDisc ? '#DC2626' : '#6B7280' }}>
                      {isDisc ? '$0' : fmt(fee.pending_amount)}
                    </span>
                  </div>

                  {/* Fine */}
                  <div className="col-span-1">
                    <span className="text-sm font-semibold"
                      style={{ color: parseFloat(fee.fine_amount) > 0 ? '#DC2626' : '#6B7280' }}>
                      {fmt(fee.fine_amount || 0)}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <span className="inline-block px-2.5 py-1 rounded text-xs font-bold"
                      style={{ background: statusBadge.bg, color: statusBadge.color }}>
                      {statusBadge.label}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    {/* View / Receipt icon */}
                    <button
                      onClick={() => navigate(`/admin/fees-payment/collect/${studentId}`)}
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-orange-50 hover:text-orange-500 hover:border-orange-200 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {/* Pay Now */}
                    {!isDisc && !isPaid && (
                      <button
                        onClick={() => handlePay(fee)}
                        className="px-3 py-1.5 rounded-lg text-white text-xs font-bold transition-all hover:opacity-90 active:scale-95"
                        style={{ background: '#EA580C' }}
                      >
                        Pay Now
                      </button>
                    )}

                    {/* Discontinue */}
                    {!isDisc && !isPaid && (
                      <button
                        onClick={() => openDiscontinue(fee)}
                        className="px-3 py-1.5 rounded-lg text-white text-xs font-bold transition-all hover:opacity-90 active:scale-95"
                        style={{ background: '#DC2626' }}
                      >
                        Discontinue
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Previous Year Dues ── */}
      {(summary.previous_pending > 0 || summary.previous_fine > 0) && (
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-amber-800 text-sm">Previous Year Dues</p>
            <p className="text-xs text-amber-600 mt-0.5">Outstanding from earlier academic sessions</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-amber-800 text-lg">{fmt(summary.previous_pending)}</p>
            {summary.previous_fine > 0 && (
              <p className="text-xs text-red-600">+{fmt(summary.previous_fine)} fine</p>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ DISCONTINUE MODAL ══════════════ */}
      {modal && activeFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-enter bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: '#FFF3E0' }}>
                  <Ban className="w-4 h-4" style={{ color: '#EA580C' }} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Discontinue Fee Service</h3>
                </div>
              </div>
              <button onClick={closeModal}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">

              {/* Error */}
              {discError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 text-sm font-medium">{discError}</p>
                </div>
              )}

              {/* Fee Head + Financial Balance */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Fee Head</label>
                  <input
                    type="text"
                    readOnly
                    value={activeFee.fee_head_name}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 text-sm font-semibold cursor-default"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Financial Balance</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50">
                    <span className="text-sm font-semibold" style={{ color: '#15803D' }}>
                      Paid {fmt(activeFee.paid_amount)}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="text-sm font-semibold" style={{ color: '#DC2626' }}>
                      Pending: {fmt(activeFee.pending_amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Date + Reason */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Discontinue Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={discDate}
                      onChange={e => setDiscDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-gray-900 text-sm font-medium bg-white transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Reason for Discontinuation <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={discReason}
                      onChange={e => setDiscReason(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-gray-900 text-sm font-medium bg-white appearance-none cursor-pointer transition-all"
                    >
                      <option value="">Select reason...</option>
                      {DISCONTINUE_REASONS.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Additional Notes <span className="text-gray-400 font-normal normal-case">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide detailed explanation for records..."
                  value={discNotes}
                  onChange={e => setDiscNotes(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-gray-900 text-sm resize-none bg-white transition-all placeholder-gray-400"
                  maxLength={300}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 pb-5 flex items-center justify-end gap-3">
              <button onClick={closeModal}
                disabled={discLoading}
                className="px-5 py-2.5 rounded-lg border border-gray-200 font-semibold text-gray-700 text-sm hover:bg-gray-50 transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button
                onClick={handleDiscontinue}
                disabled={discLoading}
                className="px-5 py-2.5 rounded-lg text-white font-bold text-sm flex items-center gap-2 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                style={{ background: discLoading ? '#9CA3AF' : '#EA580C' }}
              >
                {discLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Processing...</>
                  : 'Confirm Discontinuation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFeeProfile;