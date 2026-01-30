import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader, Filter } from 'lucide-react';
import feePaymentService from '../../services/feeallService/feePaymentService';

const CollectFee = () => {
  const navigate = useNavigate();
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [allStudents, setAllStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  
  // Filters
  const [filters, setFilters] = useState({
    className: '',
    sectionName: '',
    searchText: ''
  });

  // Fetch all students on mount
  useEffect(() => {
    fetchAllStudents();
  }, []);

  // Apply filters whenever filters change
  useEffect(() => {
    applyFilters();
  }, [filters, allStudents]);

  // Fetch all students from API
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
      alert(error.message || 'Failed to load students');
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters on frontend
  const applyFilters = () => {
    let filtered = [...allStudents];

    // Filter by class
    if (filters.className) {
      filtered = filtered.filter(student => 
        student.class_name === filters.className
      );
    }

    // Filter by section
    if (filters.sectionName) {
      filtered = filtered.filter(student => 
        student.section_name === filters.sectionName
      );
    }

    // Filter by search text (name or admission number)
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(searchLower) ||
        student.admission_no.toLowerCase().includes(searchLower)
      );
    }

    setFilteredStudents(filtered);
  };

  // Get unique classes for dropdown
  const getUniqueClasses = () => {
    const classes = allStudents
      .map(student => student.class_name)
      .filter((value, index, self) => value && self.indexOf(value) === index)
      .sort();
    
    return ['All Classes', ...classes];
  };

  // Get unique sections for dropdown (based on selected class)
  const getUniqueSections = () => {
    let filtered = allStudents;
    
    if (filters.className) {
      filtered = filtered.filter(student => 
        student.class_name === filters.className
      );
    }
    
    const sections = filtered
      .map(student => student.section_name)
      .filter((value, index, self) => value && self.indexOf(value) === index)
      .sort();
    
    return ['All Sections', ...sections];
  };

  // Handle collect button click
  const handleCollectClick = (student) => {
    navigate(`/admin/fees-payment/collect/${student.student_id}`);
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      className: '',
      sectionName: '',
      searchText: ''
    });
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Collect Fee</h1>
          <p className="text-gray-600 mt-2">Manage student fee payments</p>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Filter Students</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Class Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class
              </label>
              <select
                className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.className}
                onChange={(e) => handleFilterChange('className', e.target.value === 'All Classes' ? '' : e.target.value)}
              >
                <option>All Classes</option>
                {getUniqueClasses()
                  .filter(cls => cls !== 'All Classes')
                  .map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))
                }
              </select>
            </div>

            {/* Section Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section
              </label>
              <select
                className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.sectionName}
                onChange={(e) => handleFilterChange('sectionName', e.target.value === 'All Sections' ? '' : e.target.value)}
                disabled={!filters.className}
              >
                <option>All Sections</option>
                {getUniqueSections()
                  .filter(section => section !== 'All Sections')
                  .map(section => (
                    <option key={section} value={section}>{section}</option>
                  ))
                }
              </select>
            </div>

            {/* Search Input */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-black mb-2">
                Search by Name or Admission Number
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black" />
                <input
                  type="text"
                  placeholder="Enter student name or admission number..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 text-black focus:ring-blue-500 focus:border-blue-500"
                  value={filters.searchText}
                  onChange={(e) => handleFilterChange('searchText', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Filter Stats */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {filteredStudents.length} of {allStudents.length} students
            </div>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="col-span-4 font-semibold text-gray-700">Student Name</div>
            <div className="col-span-3 font-semibold text-gray-700">Class & Section</div>
            <div className="col-span-3 font-semibold text-gray-700">Admission Number</div>
            <div className="col-span-2 font-semibold text-gray-700">Action</div>
          </div>

          {/* Students List */}
          {filteredStudents.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <div 
                  key={student.student_id} 
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Student Name */}
                  <div className="col-span-4 flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-semibold">
                        {student.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.gender}</div>
                    </div>
                  </div>

                  {/* Class & Section */}
                  <div className="col-span-3 flex items-center">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {student.class_name} - {student.section_name}
                    </div>
                  </div>

                  {/* Admission Number */}
                  <div className="col-span-3 flex items-center">
                    <div className="font-mono text-gray-700">{student.admission_no}</div>
                  </div>

                  {/* Action Button */}
                  <div className="col-span-2 flex items-center">
                    <button
                      onClick={() => handleCollectClick(student)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                    >
                      Collect Fee
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // No Results Found
            <div className="py-16 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No students found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {allStudents.length === 0 
                  ? "No students available in the system"
                  : "Try adjusting your filters or search criteria"
                }
              </p>
              {allStudents.length > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* Summary Footer */}
          {filteredStudents.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
              Total: {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectFee;