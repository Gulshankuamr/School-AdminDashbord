import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, Trash2, Edit2, Save, X, Clock, Filter, RefreshCw,
  Eye, EyeOff, BookOpen, User, AlertCircle, Download, Printer
} from 'lucide-react';
// import timetableService from '../../services/timetableService';
import timetableService from '../../services/timetableService/timetableService';
import { useToast } from '../../components/ui/toast';


const ViewAllTimetable = () => {
  const printRef = useRef();
  const { ToastContainer, success, error } = useToast();
  
  // State Management
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [timetableData, setTimetableData] = useState([]);
  
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  
  const [loading, setLoading] = useState({
    initial: false,
    sections: false,
    timetable: false,
    saving: false,
    deleting: false
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Load Initial Data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(prev => ({ ...prev, initial: true }));
      
      const [classesRes, subjectsRes, teachersRes] = await Promise.all([
        timetableService.getAllClasses(),
        timetableService.getAllSubjects(),
        timetableService.getAllTeachers()
      ]);

      if (classesRes.success) setClasses(classesRes.data || []);
      if (subjectsRes.success) setSubjects(subjectsRes.data || []);
      if (teachersRes.success) setTeachers(teachersRes.data || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(prev => ({ ...prev, initial: false }));
    }
  };

  // Load Sections when Class changes
  useEffect(() => {
    if (selectedClass) {
      loadSections(selectedClass);
    } else {
      setSections([]);
      setSelectedSection('');
      setTimetableData([]);
    }
  }, [selectedClass]);

  const loadSections = async (classId) => {
    try {
      setLoading(prev => ({ ...prev, sections: true }));
      const response = await timetableService.getSectionsByClass(classId);
      if (response.success) {
        setSections(response.data || []);
      }
    } catch (err) {
      console.error('Failed to load sections:', err);
    } finally {
      setLoading(prev => ({ ...prev, sections: false }));
    }
  };

  // Load Timetable when Class & Section are selected
  useEffect(() => {
    if (selectedClass && selectedSection) {
      fetchTimetable();
    } else {
      setTimetableData([]);
    }
  }, [selectedClass, selectedSection]);

  const fetchTimetable = async () => {
    setLoading(prev => ({ ...prev, timetable: true }));
    try {
      const response = await timetableService.getTimetable(selectedClass, selectedSection);
      if (response.success) {
        setTimetableData(response.data || []);
      } else {
        setTimetableData([]);
        error('Failed to load timetable');
      }
    } catch (err) {
      console.error('Failed to load timetable:', err);
      setTimetableData([]);
      error('Failed to load timetable');
    } finally {
      setLoading(prev => ({ ...prev, timetable: false }));
    }
  };

  // Check for duplicate/conflict during edit
  const checkEditConflict = async (editData) => {
    try {
      const conflictCheck = await timetableService.checkTimetableConflict({
        class_id: parseInt(selectedClass),
        section_id: parseInt(selectedSection),
        day_of_week: editData.day_of_week,
        start_time: editData.start_time + ':00',
        end_time: editData.end_time + ':00'
      });

      if (conflictCheck.exists) {
        return {
          hasConflict: true,
          message: `Time slot conflicts with existing timetable for ${conflictCheck.data.subject_name} with ${conflictCheck.data.teacher_name}`
        };
      }
      return { hasConflict: false, message: '' };
    } catch (err) {
      console.error('Error checking conflict:', err);
      return { hasConflict: false, message: 'Error checking conflict' };
    }
  };

  // Edit Handlers
  const handleEdit = (period) => {
    setEditingId(period.timetable_id);
    setEditData({
      subject_id: period.subject_id.toString(),
      teacher_id: period.teacher_id.toString(),
      day_of_week: period.day_of_week,
      start_time: period.start_time ? period.start_time.substring(0, 5) : '',
      end_time: period.end_time ? period.end_time.substring(0, 5) : ''
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSaveEdit = async (timetableId) => {
    if (!editData.subject_id || !editData.teacher_id || !editData.start_time || !editData.end_time) {
      error('Please fill all fields');
      return;
    }

    if (editData.start_time >= editData.end_time) {
      error('End time must be after start time');
      return;
    }

    // Check for time conflict
    const conflictResult = await checkEditConflict(editData);
    if (conflictResult.hasConflict) {
      error(conflictResult.message);
      return;
    }

    try {
      setLoading(prev => ({ ...prev, saving: true }));
      
      const updateData = {
        class_id: parseInt(selectedClass),
        section_id: parseInt(selectedSection),
        subject_id: parseInt(editData.subject_id),
        teacher_id: parseInt(editData.teacher_id),
        day_of_week: editData.day_of_week,
        start_time: editData.start_time + ':00',
        end_time: editData.end_time + ':00'
      };

      const response = await timetableService.updateTimetable(timetableId, updateData);
      
      if (response.success) {
        success('✅ Period updated successfully');
        setEditingId(null);
        setEditData({});
        fetchTimetable(); // Auto-reload after update
      } else {
        error('❌ ' + (response.message || 'Failed to update'));
      }
    } catch (err) {
      error('❌ Error: ' + err.message);
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  const handleDelete = async (timetableId) => {
    if (!window.confirm('Are you sure you want to delete this period?')) return;
    
    try {
      setLoading(prev => ({ ...prev, deleting: true }));
      const response = await timetableService.deleteTimetable(timetableId);
      
      if (response.success) {
        success('✅ Period deleted successfully');
        fetchTimetable(); // Auto-reload after delete
      } else {
        error('❌ ' + (response.message || 'Failed to delete'));
      }
    } catch (err) {
      error('❌ Error: ' + err.message);
    } finally {
      setLoading(prev => ({ ...prev, deleting: false }));
    }
  };

  // Download CSV Function
  const handleDownloadCSV = () => {
    if (!timetableData.length) {
      error('No timetable data to download');
      return;
    }

    const className = getClassName(selectedClass);
    const sectionName = getSectionName(selectedSection);
    
    // Prepare CSV headers
    const headers = ['Day', 'Start Time', 'End Time', 'Subject', 'Teacher'];
    
    // Prepare CSV rows
    const rows = timetableData.map(period => [
      period.day_of_week,
      formatTime(period.start_time),
      formatTime(period.end_time),
      getSubjectName(period.subject_id),
      getTeacherName(period.teacher_id)
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `Timetable_${className}_${sectionName}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    success(`✅ Timetable downloaded as CSV file`);
  };

  // Print Function
  const handlePrint = () => {
    if (!timetableData.length) {
      error('No timetable data to print');
      return;
    }

    const printContent = printRef.current;
    const windowPrint = window.open('', '', 'width=800,height=600');
    
    windowPrint.document.write(`
      <html>
        <head>
          <title>Timetable - ${getClassName(selectedClass)} - ${getSectionName(selectedSection)}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #000; }
            h1 { text-align: center; color: #000; margin-bottom: 10px; }
            h2 { text-align: center; color: #333; margin-bottom: 20px; font-size: 18px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 10px; text-align: left; color: #000; }
            th { background-color: #f0f0f0; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .no-print { display: none; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Timetable</h1>
          <h2>${getClassName(selectedClass)} - ${getSectionName(selectedSection)}</h2>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    windowPrint.document.close();
    windowPrint.focus();
    setTimeout(() => {
      windowPrint.print();
      windowPrint.close();
    }, 250);
  };

  // Helper Functions
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getSubjectName = (id) => subjects.find(sub => sub.subject_id == id)?.subject_name || 'Not assigned';
  const getTeacherName = (id) => teachers.find(teach => teach.teacher_id == id)?.name || 'Not assigned';
  const getClassName = (id) => classes.find(cls => cls.class_id == id)?.class_name || 'Select Class';
  const getSectionName = (id) => sections.find(sec => sec.section_id == id)?.section_name || 'Select Section';

  // Group by Day
  const groupedByDay = timetableData.reduce((acc, period) => {
    if (!acc[period.day_of_week]) {
      acc[period.day_of_week] = [];
    }
    acc[period.day_of_week].push(period);
    return acc;
  }, {});

  // Sort periods by time
  Object.keys(groupedByDay).forEach(day => {
    groupedByDay[day].sort((a, b) => a.start_time.localeCompare(b.start_time));
  });

  // Stats
  const totalPeriods = timetableData.length;
  const daysWithClasses = Object.keys(groupedByDay).length;
  const uniqueSubjects = new Set(timetableData.map(p => p.subject_id)).size;
  const uniqueTeachers = new Set(timetableData.map(p => p.teacher_id)).size;

  // Check if day is selected
  const isDaySelected = selectedDay !== '';

  return (
    <div className="p-6">
      <ToastContainer />
      
      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black bg-white"
              disabled={loading.initial}
            >
              <option value="" className="text-black">Select Class</option>
              {classes.map(cls => (
                <option key={cls.class_id} value={cls.class_id} className="text-black">
                  {cls.class_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black bg-white"
              disabled={!selectedClass || loading.sections}
            >
              <option value="" className="text-black">Select Section</option>
              {sections.map(sec => (
                <option key={sec.section_id} value={sec.section_id} className="text-black">
                  {sec.section_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Day (Optional)
            </label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black bg-white"
              disabled={!selectedClass || !selectedSection}
            >
              <option value="" className="text-black">All Days</option>
              {days.map(day => (
                <option key={day} value={day} className="text-black">{day}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={fetchTimetable}
            disabled={!selectedClass || !selectedSection || loading.timetable}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            {loading.timetable ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Loading...
              </>
            ) : (
              'Load Timetable'
            )}
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={handleDownloadCSV}
              disabled={!timetableData.length}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
            >
              <Download size={16} />
              Download CSV
            </button>
            <button
              onClick={handlePrint}
              disabled={!timetableData.length}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center gap-2"
            >
              <Printer size={16} />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      {timetableData.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-700">{totalPeriods}</div>
            <div className="text-blue-800 text-sm">Total Periods</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-700">{daysWithClasses}</div>
            <div className="text-green-800 text-sm">Days</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-700">{uniqueSubjects}</div>
            <div className="text-purple-800 text-sm">Subjects</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="text-2xl font-bold text-orange-700">{uniqueTeachers}</div>
            <div className="text-orange-800 text-sm">Teachers</div>
          </div>
        </div>
      )}

      {/* Timetable Display */}
      {loading.timetable ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-black">Loading timetable...</p>
        </div>
      ) : selectedClass && selectedSection && timetableData.length > 0 ? (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <div ref={printRef}>
            {!isDaySelected ? (
              /* All Days View */
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-black font-bold">Subject</th>
                      <th className="px-4 py-3 text-left text-black font-bold">Teacher</th>
                      <th className="px-4 py-3 text-left text-black font-bold">Day</th>
                      <th className="px-4 py-3 text-left text-black font-bold">Time</th>
                      <th className="px-4 py-3 text-center text-black font-bold no-print">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timetableData.map((period) => (
                      <tr key={period.timetable_id} className="border-t border-gray-200 hover:bg-gray-50">
                        {editingId === period.timetable_id ? (
                          <>
                            <td className="px-4 py-3">
                              <select
                                value={editData.subject_id}
                                onChange={(e) => setEditData({...editData, subject_id: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-black bg-white"
                              >
                                <option value="" className="text-black">Select Subject</option>
                                {subjects.map(s => (
                                  <option key={s.subject_id} value={s.subject_id} className="text-black">{s.subject_name}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={editData.teacher_id}
                                onChange={(e) => setEditData({...editData, teacher_id: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-black bg-white"
                              >
                                <option value="" className="text-black">Select Teacher</option>
                                {teachers.map(t => (
                                  <option key={t.teacher_id} value={t.teacher_id} className="text-black">{t.name}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={editData.day_of_week}
                                onChange={(e) => setEditData({...editData, day_of_week: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-black bg-white"
                              >
                                {days.map(d => (
                                  <option key={d} value={d} className="text-black">{d}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <input
                                  type="time"
                                  value={editData.start_time}
                                  onChange={(e) => setEditData({...editData, start_time: e.target.value})}
                                  className="px-2 py-1 border border-gray-300 rounded text-black"
                                />
                                <span className="text-black">-</span>
                                <input
                                  type="time"
                                  value={editData.end_time}
                                  onChange={(e) => setEditData({...editData, end_time: e.target.value})}
                                  className="px-2 py-1 border border-gray-300 rounded text-black"
                                />
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center no-print">
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={() => handleSaveEdit(period.timetable_id)}
                                  disabled={loading.saving}
                                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
                                >
                                  {loading.saving ? (
                                    <>
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                      Saving...
                                    </>
                                  ) : (
                                    'Save'
                                  )}
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  disabled={loading.saving}
                                  className="px-3 py-1 bg-gray-300 text-black rounded hover:bg-gray-400 disabled:bg-gray-400"
                                >
                                  Cancel
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 font-medium text-black">
                              {getSubjectName(period.subject_id)}
                            </td>
                            <td className="px-4 py-3 text-black">
                              {getTeacherName(period.teacher_id)}
                            </td>
                            <td className="px-4 py-3 text-black">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                                {period.day_of_week}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-black">
                              {formatTime(period.start_time)} - {formatTime(period.end_time)}
                            </td>
                            <td className="px-4 py-3 text-center no-print">
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={() => handleEdit(period)}
                                  className="p-1 text-blue-600 hover:text-blue-800"
                                  title="Edit"
                                >
                                  <Edit2 size={18} />
                                </button>
                                <button
                                  onClick={() => handleDelete(period.timetable_id)}
                                  disabled={loading.deleting}
                                  className="p-1 text-red-600 hover:text-red-800 disabled:text-gray-400 flex items-center gap-1"
                                  title="Delete"
                                >
                                  {loading.deleting ? (
                                    <>
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                                    </>
                                  ) : (
                                    <Trash2 size={18} />
                                  )}
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Single Day View */
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4 text-black">{selectedDay}</h3>
                {groupedByDay[selectedDay]?.length > 0 ? (
                  <div className="space-y-3">
                    {groupedByDay[selectedDay].map((period) => (
                      <div key={period.timetable_id} className="border border-gray-200 rounded-lg p-4">
                        {editingId === period.timetable_id ? (
                          <div className="space-y-3">
                            <div className="flex gap-3">
                              <select
                                value={editData.subject_id}
                                onChange={(e) => setEditData({...editData, subject_id: e.target.value})}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded text-black bg-white"
                              >
                                <option value="" className="text-black">Select Subject</option>
                                {subjects.map(s => (
                                  <option key={s.subject_id} value={s.subject_id} className="text-black">{s.subject_name}</option>
                                ))}
                              </select>
                              <select
                                value={editData.teacher_id}
                                onChange={(e) => setEditData({...editData, teacher_id: e.target.value})}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded text-black bg-white"
                              >
                                <option value="" className="text-black">Select Teacher</option>
                                {teachers.map(t => (
                                  <option key={t.teacher_id} value={t.teacher_id} className="text-black">{t.name}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex gap-3">
                              <input
                                type="time"
                                value={editData.start_time}
                                onChange={(e) => setEditData({...editData, start_time: e.target.value})}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded text-black"
                              />
                              <input
                                type="time"
                                value={editData.end_time}
                                onChange={(e) => setEditData({...editData, end_time: e.target.value})}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded text-black"
                              />
                            </div>
                            <div className="flex gap-2 no-print">
                              <button
                                onClick={() => handleSaveEdit(period.timetable_id)}
                                disabled={loading.saving}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
                              >
                                {loading.saving ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                    Saving...
                                  </>
                                ) : (
                                  'Save'
                                )}
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                disabled={loading.saving}
                                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 disabled:bg-gray-400"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-semibold text-lg text-black">
                                {getSubjectName(period.subject_id)}
                              </div>
                              <div className="text-black">
                                {getTeacherName(period.teacher_id)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-black">
                                {formatTime(period.start_time)} - {formatTime(period.end_time)}
                              </div>
                              <div className="flex gap-2 mt-2 no-print">
                                <button
                                  onClick={() => handleEdit(period)}
                                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(period.timetable_id)}
                                  disabled={loading.deleting}
                                  className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:bg-gray-200 disabled:text-gray-500 flex items-center gap-2"
                                >
                                  {loading.deleting ? (
                                    <>
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                                      Deleting...
                                    </>
                                  ) : (
                                    'Delete'
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-black">
                    No classes scheduled for {selectedDay}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : selectedClass && selectedSection ? (
        <div className="text-center py-12 text-black">
          No timetable found for {getClassName(selectedClass)} - {getSectionName(selectedSection)}
        </div>
      ) : (
        <div className="text-center py-12 text-black">
          Please select a class and section to view timetable
        </div>
      )}
    </div>
  );
};

export default ViewAllTimetable;