import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, SlidersHorizontal, X, ChevronRight,
  GraduationCap, Users, Plus, Download
} from 'lucide-react';
import feePaymentService from '../../services/feeallService/feePaymentService';

const CollectFee = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [allStudents, setAllStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [filters, setFilters] = useState({ className: '', sectionName: '', searchText: '' });

  useEffect(() => { fetchAllStudents(); }, []);
  useEffect(() => { applyFilters(); }, [filters, allStudents]);

  const fetchAllStudents = async () => {
    try {
      setIsLoading(true);
      const response = await feePaymentService.getAllStudents();
      if (response.data && Array.isArray(response.data)) {
        setAllStudents(response.data);
        setFilteredStudents(response.data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allStudents];
    if (filters.className) filtered = filtered.filter(s => s.class_name === filters.className);
    if (filters.sectionName) filtered = filtered.filter(s => s.section_name === filters.sectionName);
    if (filters.searchText) {
      const q = filters.searchText.toLowerCase();
      filtered = filtered.filter(s =>
        s.name?.toLowerCase().includes(q) || s.admission_no?.toLowerCase().includes(q)
      );
    }
    setFilteredStudents(filtered);
  };

  const getUniqueClasses = () =>
    [...new Set(allStudents.map(s => s.class_name).filter(Boolean))].sort();

  const getUniqueSections = () => {
    const src = filters.className
      ? allStudents.filter(s => s.class_name === filters.className)
      : allStudents;
    return [...new Set(src.map(s => s.section_name).filter(Boolean))].sort();
  };

  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const handleReset = () => setFilters({ className: '', sectionName: '', searchText: '' });
  const handleCollect = (student) => navigate(`/admin/fees-payment/student/${student.student_id}`);

  const avatarColors = [
    { bg: '#FFF3E0', text: '#E65100' },
    { bg: '#E8F5E9', text: '#2E7D32' },
    { bg: '#E3F2FD', text: '#1565C0' },
    { bg: '#FCE4EC', text: '#880E4F' },
    { bg: '#EDE7F6', text: '#4527A0' },
    { bg: '#E0F2F1', text: '#00695C' },
  ];
  const getAvatar = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];

  /* ── Stat counts ── */
  const paidCount    = allStudents.filter(s => s.fee_status === 'paid').length;
  const partialCount = allStudents.filter(s => s.fee_status === 'partial').length;
  const pendingCount = allStudents.filter(s => s.fee_status === 'pending').length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-orange-100" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 animate-spin" />
          </div>
          <p className="text-gray-700 font-semibold">Loading Students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* ── Page Header ── */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fee Collection Dashboard</h1>
            <p className="text-gray-500 text-sm mt-0.5">Manage student payments and financial records</p>
          </div>
          <button
            onClick={() => navigate('/admin/fees-payment/collect')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
            style={{ background: '#EA580C' }}
          >
            <Plus className="w-4 h-4" />
            Add New Record
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Students', value: allStudents.length, icon: '👥', sub: '+2.5%',  subColor: '#16A34A' },
          { label: 'Paid Full',      value: paidCount,          icon: '✅', sub: '85% total', subColor: '#16A34A' },
          { label: 'Partial Payment',value: partialCount,       icon: '📋', sub: 'Due soon',  subColor: '#D97706' },
          { label: 'Pending',        value: pendingCount,       icon: '⚠️', sub: 'Overdue',   subColor: '#DC2626' },
        ].map(({ label, value, icon, sub, subColor }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{icon}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-50" style={{ color: subColor }}>
                {sub}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">

          {/* Academic Year */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Academic Year</label>
            <select
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:border-orange-500 bg-white"
              style={{ '--tw-ring-color': '#EA580C' }}
            >
              <option>2025-26</option>
              <option>2024-25</option>
              <option>2023-24</option>
            </select>
          </div>

          {/* Class */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Class</label>
            <select
              value={filters.className}
              onChange={(e) => { handleFilterChange('className', e.target.value); handleFilterChange('sectionName', ''); }}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:border-orange-500 bg-white"
            >
              <option value="">All Classes</option>
              {getUniqueClasses().map(cls => <option key={cls} value={cls}>{cls}</option>)}
            </select>
          </div>

          {/* Section */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Section</label>
            <select
              value={filters.sectionName}
              onChange={(e) => handleFilterChange('sectionName', e.target.value)}
              disabled={!filters.className}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:border-orange-500 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">All Sections</option>
              {getUniqueSections().map(sec => <option key={sec} value={sec}>{sec}</option>)}
            </select>
          </div>

          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Search Student</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Name or Admission ID..."
                value={filters.searchText}
                onChange={(e) => handleFilterChange('searchText', e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 rounded-lg border border-gray-300 text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:border-orange-500 bg-white placeholder-gray-400"
              />
              {filters.searchText && (
                <button onClick={() => handleFilterChange('searchText', '')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {(filters.className || filters.sectionName || filters.searchText) && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-900">{filteredStudents.length}</span> of <span className="font-semibold text-gray-900">{allStudents.length}</span> students
            </span>
            <button onClick={handleReset} className="text-sm font-semibold flex items-center gap-1.5 hover:opacity-80 transition-opacity" style={{ color: '#EA580C' }}>
              <X className="w-3.5 h-3.5" /> Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* ── Students Table ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Table Title */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-base">Recent Fee Transactions</h2>
          <button className="flex items-center gap-2 text-sm font-semibold hover:opacity-80 transition-opacity" style={{ color: '#EA580C' }}>
            <Download className="w-4 h-4" /> Download Report
          </button>
        </div>

        {/* Header Row */}
        <div className="grid grid-cols-12 gap-3 px-6 py-3 bg-gray-50 border-b border-gray-100">
          {['Student', 'Admission No', 'Class', 'Total Fee', 'Paid', 'Pending', 'Status', 'Action'].map((h, i) => (
            <div key={h}
              className={`text-xs font-bold text-gray-500 uppercase tracking-wider ${
                i === 0 ? 'col-span-3' :
                i === 7 ? 'col-span-2 text-right' :
                'col-span-1'
              }`}>
              {h}
            </div>
          ))}
        </div>

        {filteredStudents.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {filteredStudents.map((student, idx) => {
              const av = getAvatar(student.name);
              const status = student.fee_status || 'pending';

              const statusBadge = {
                paid:    { label: 'PAID',    bg: '#DCFCE7', color: '#15803D' },
                partial: { label: 'PARTIAL', bg: '#FEF9C3', color: '#A16207' },
                pending: { label: 'PENDING', bg: '#FEE2E2', color: '#B91C1C' },
              }[status] || { label: 'N/A', bg: '#F1F5F9', color: '#475569' };

              return (
                <div key={student.student_id}
                  className="grid grid-cols-12 gap-3 px-6 py-4 items-center hover:bg-orange-50/30 transition-colors group">

                  {/* Student */}
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{ background: av.bg, color: av.text }}>
                      {student.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <span className="font-semibold text-gray-900 text-sm">{student.name}</span>
                  </div>

                  {/* Admission No */}
                  <div className="col-span-1">
                    <span className="text-sm text-gray-700 font-medium">{student.admission_no}</span>
                  </div>

                  {/* Class */}
                  <div className="col-span-1">
                    <span className="text-sm text-gray-700 font-medium">
                      {student.class_name}{student.section_name ? `-${student.section_name}` : ''}
                    </span>
                  </div>

                  {/* Total Fee */}
                  <div className="col-span-1">
                    <span className="text-sm font-semibold text-gray-900">
                      {student.total_fee ? `₹${Number(student.total_fee).toLocaleString()}` : '—'}
                    </span>
                  </div>

                  {/* Paid */}
                  <div className="col-span-1">
                    <span className="text-sm font-semibold" style={{ color: '#16A34A' }}>
                      {student.paid_amount ? `₹${Number(student.paid_amount).toLocaleString()}` : '—'}
                    </span>
                  </div>

                  {/* Pending */}
                  <div className="col-span-1">
                    <span className="text-sm font-semibold" style={{ color: student.pending_amount > 0 ? '#DC2626' : '#6B7280' }}>
                      {student.pending_amount ? `₹${Number(student.pending_amount).toLocaleString()}` : '₹0'}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="col-span-1">
                    <span className="px-2.5 py-1 rounded text-xs font-bold"
                      style={{ background: statusBadge.bg, color: statusBadge.color }}>
                      {statusBadge.label}
                    </span>
                  </div>

                  {/* Action */}
                  <div className="col-span-2 text-right">
                    <button
                      onClick={() => handleCollect(student)}
                      className="px-4 py-2 rounded-lg text-white text-xs font-bold transition-all hover:opacity-90 active:scale-95 shadow-sm"
                      style={{ background: '#EA580C' }}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">No students found</p>
            <p className="text-gray-400 text-sm mt-1">
              {allStudents.length === 0 ? 'No students in the system' : 'Try adjusting your filters'}
            </p>
            {allStudents.length > 0 && (
              <button onClick={handleReset}
                className="mt-4 px-5 py-2 rounded-lg text-white font-semibold text-sm"
                style={{ background: '#EA580C' }}>
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        {filteredStudents.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Showing 1 to {Math.min(filteredStudents.length, 10)} of {filteredStudents.length} entries
            </span>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:border-orange-400 hover:text-orange-500 text-sm transition-colors">‹</button>
              <button className="w-8 h-8 flex items-center justify-center rounded text-white text-sm font-bold" style={{ background: '#EA580C' }}>1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-700 hover:border-orange-400 hover:text-orange-500 text-sm transition-colors">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-700 hover:border-orange-400 hover:text-orange-500 text-sm transition-colors">3</button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:border-orange-400 hover:text-orange-500 text-sm transition-colors">›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectFee;