import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, SlidersHorizontal, X, ChevronRight, GraduationCap, Users } from 'lucide-react';
import feePaymentService from '../../services/feeallService/feePaymentService';

const CollectFee = () => {
  const navigate = useNavigate();

  const [isLoading,        setIsLoading]        = useState(true);
  const [allStudents,      setAllStudents]       = useState([]);
  const [filteredStudents, setFilteredStudents]  = useState([]);
  const [filters,          setFilters]           = useState({ className: '', sectionName: '', searchText: '' });

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
    if (filters.className)   filtered = filtered.filter(s => s.class_name   === filters.className);
    if (filters.sectionName) filtered = filtered.filter(s => s.section_name === filters.sectionName);
    if (filters.searchText) {
      const q = filters.searchText.toLowerCase();
      filtered = filtered.filter(s =>
        s.name?.toLowerCase().includes(q) || s.admission_no?.toLowerCase().includes(q)
      );
    }
    setFilteredStudents(filtered);
  };

  /* Unique class list from student data */
  const getUniqueClasses = () =>
    [...new Set(allStudents.map(s => s.class_name).filter(Boolean))].sort();

  /* Unique section_name list — optionally scoped to selected class */
  const getUniqueSections = () => {
    const src = filters.className
      ? allStudents.filter(s => s.class_name === filters.className)
      : allStudents;
    return [...new Set(src.map(s => s.section_name).filter(Boolean))].sort();
  };

  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const handleReset        = ()            => setFilters({ className: '', sectionName: '', searchText: '' });
  const handleCollect      = (student)     => navigate(`/admin/fees-payment/collect/${student.student_id}`);

  const avatarColor = (name) => {
    const colors = [
      ['#1E3A8A', '#DBEAFE'], ['#065F46', '#D1FAE5'], ['#7C2D12', '#FEE2E2'],
      ['#5B21B6', '#EDE9FE'], ['#92400E', '#FEF3C7'], ['#0F766E', '#CCFBF1'],
    ];
    const i = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[i];
  };

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #F0FDF4 100%)' }}>
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          <p className="text-indigo-800 font-semibold text-lg">Loading Students...</p>
          <p className="text-indigo-400 text-sm mt-1">Please wait</p>
        </div>
      </div>
    );
  }

  /* ── Main ── */
  return (
    <div className="min-h-screen"
      style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #F0FDF4 100%)', fontFamily: "'Poppins', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Top Header */}
      <div style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 50%, #2563EB 100%)' }}
        className="px-6 py-8 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Collect Fee</h1>
              </div>
              <p className="text-blue-200 text-sm ml-13 mt-1">Select a student to collect their fee payment</p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/20 text-center">
                <div className="text-2xl font-bold text-white">{allStudents.length}</div>
                <div className="text-blue-200 text-xs font-medium">Total Students</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/20 text-center">
                <div className="text-2xl font-bold text-white">{filteredStudents.length}</div>
                <div className="text-blue-200 text-xs font-medium">Showing</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Filter Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            </div>
            <h2 className="font-semibold text-slate-800 text-base">Filter Students</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

            {/* Class */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Class</label>
              <select
                value={filters.className}
                onChange={(e) => {
                  handleFilterChange('className', e.target.value);
                  handleFilterChange('sectionName', ''); // reset section when class changes
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Classes</option>
                {getUniqueClasses().map(cls => <option key={cls} value={cls}>{cls}</option>)}
              </select>
            </div>

            {/* Section — only section_name used */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Section</label>
              <select
                value={filters.sectionName}
                onChange={(e) => handleFilterChange('sectionName', e.target.value)}
                disabled={!filters.className}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <option value="">All Sections</option>
                {getUniqueSections().map(sec => <option key={sec} value={sec}>{sec}</option>)}
              </select>
            </div>

            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Student name or admission number..."
                  value={filters.searchText}
                  onChange={(e) => handleFilterChange('searchText', e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                {filters.searchText && (
                  <button onClick={() => handleFilterChange('searchText', '')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {(filters.className || filters.sectionName || filters.searchText) && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
              <span className="text-sm text-slate-500">
                Showing <span className="font-semibold text-indigo-600">{filteredStudents.length}</span> of{' '}
                <span className="font-semibold">{allStudents.length}</span> students
              </span>
              <button onClick={handleReset}
                className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium transition-colors">
                <X className="w-3.5 h-3.5" /> Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200">
            <div className="col-span-1 text-xs font-bold text-slate-400 uppercase tracking-wider">#</div>
            <div className="col-span-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Student</div>
            <div className="col-span-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Class / Section</div>
            <div className="col-span-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Admission No.</div>
            <div className="col-span-2 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action</div>
          </div>

          {filteredStudents.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredStudents.map((student, idx) => {
                const [fg, bg] = avatarColor(student.name);
                return (
                  <div
                    key={student.student_id}
                    className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-indigo-50/30 transition-all duration-150 group"
                  >
                    <div className="col-span-1 flex items-center">
                      <span className="text-slate-400 text-sm font-medium">{idx + 1}</span>
                    </div>

                    <div className="col-span-4 flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm shadow-sm"
                        style={{ background: bg, color: fg }}
                      >
                        {student.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 text-sm group-hover:text-indigo-700 transition-colors">
                          {student.name}
                        </div>
                        <div className="text-xs text-slate-400 capitalize">{student.gender?.toLowerCase()}</div>
                      </div>
                    </div>

                    {/* Class + section_name only */}
                    <div className="col-span-3 flex items-center">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ background: '#DBEAFE', color: '#1E3A8A' }}
                      >
                        Class {student.class_name} – {student.section_name}
                      </span>
                    </div>

                    <div className="col-span-2 flex items-center">
                      <span className="font-mono text-slate-600 text-sm">{student.admission_no}</span>
                    </div>

                    <div className="col-span-2 flex items-center justify-end">
                      <button
                        onClick={() => handleCollect(student)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-150"
                        style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
                      >
                        Collect <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-600 mb-1">No students found</h3>
              <p className="text-slate-400 text-sm">
                {allStudents.length === 0 ? 'No students in the system' : 'Try adjusting your filters'}
              </p>
              {allStudents.length > 0 && (
                <button onClick={handleReset}
                  className="mt-4 px-5 py-2 rounded-xl bg-indigo-50 text-indigo-600 font-semibold text-sm hover:bg-indigo-100 transition-colors">
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {filteredStudents.length > 0 && (
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} listed
              </span>
              <span className="text-xs text-slate-400">Click "Collect" to process fee payment</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectFee;