import { API_BASE_URL, getAuthToken } from '../api'

export const markExameService = {

  // ===============================
  // 1️⃣ GET EXAM TIMETABLE
  // GET /api/schooladmin/getExamTimetable
  // Returns: timetable_id, class_id, section_id, subject_id,
  //          exam_date, start_time, end_time, room_no,
  //          max_marks, min_passing_marks, subject_name
  // ===============================
  getExamTimetable: async () => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    try {
      const response = await fetch(`${API_BASE_URL}/schooladmin/getExamTimetable`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      console.log('📅 getExamTimetable:', data)
      if (!data || data.success !== true) throw new Error(data?.message || 'Failed to fetch timetable')
      return data
    } catch (error) {
      console.error('getExamTimetable error:', error)
      throw error
    }
  },

  // ===============================
  // 2️⃣ GET ALL CLASSES
  // GET /api/schooladmin/getAllClassList
  // Returns: [{ class_id, class_name, ... }]
  // ===============================
  getAllClassList: async () => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    try {
      const response = await fetch(`${API_BASE_URL}/schooladmin/getAllClassList`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      console.log('🏫 getAllClassList:', data)
      if (!data || data.success !== true) throw new Error(data?.message || 'Failed to fetch classes')
      return data
    } catch (error) {
      console.error('getAllClassList error:', error)
      throw error
    }
  },

  // ===============================
  // 3️⃣ GET ALL SECTIONS (by class_id)
  // GET /api/schooladmin/getAllSections?class_id=2
  // Returns: [{ section_id, section_name, class_id, class_name }]
  // ===============================
  getAllSections: async (classId) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    try {
      const response = await fetch(
        `${API_BASE_URL}/schooladmin/getAllSections?class_id=${classId}`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      console.log('📋 getAllSections:', data)
      if (!data || data.success !== true) throw new Error(data?.message || 'Failed to fetch sections')
      return data
    } catch (error) {
      console.error('getAllSections error:', error)
      throw error
    }
  },

  // ===============================
  // 4️⃣ GET ALL SUBJECTS
  // GET /api/schooladmin/getAllSubjects
  // Returns: [{ subject_id, subject_name }]
  // ===============================
  getAllSubjects: async () => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    try {
      const response = await fetch(`${API_BASE_URL}/schooladmin/getAllSubjects`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      console.log('📚 getAllSubjects:', data)
      if (!data || data.success !== true) throw new Error(data?.message || 'Failed to fetch subjects')
      return data
    } catch (error) {
      console.error('getAllSubjects error:', error)
      throw error
    }
  },

  // ===============================
  // 5️⃣ GET STUDENTS BY CLASS + SECTION
  // GET /api/schooladmin/getStudentList?class_id=2&section_id=5
  // Returns: [{ student_id, student_name, roll_no, avatar }]
  // ===============================
  getStudentsByClass: async (classId, sectionId) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    try {
      const params = new URLSearchParams({ class_id: classId })
      if (sectionId) params.append('section_id', sectionId)

      const response = await fetch(
        `${API_BASE_URL}/schooladmin/getStudentList?${params.toString()}`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      console.log('👨‍🎓 getStudentsByClass:', data)
      if (!data || data.success !== true) throw new Error(data?.message || 'Failed to fetch students')
      return data
    } catch (error) {
      console.error('getStudentsByClass error:', error)
      throw error
    }
  },

  // ===============================
  // 6️⃣ CREATE EXAM MARKS (Single Student)
  // POST /api/schooladmin/createExamMarks
  // Body: { timetable_id, student_id, marks_obtained, is_absent, remarks }
  // Response: { success: true, message: "Marks entered successfully", data: { mark_id: 10 } }
  // ===============================
  createExamMarks: async (payload) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    try {
      const response = await fetch(`${API_BASE_URL}/schooladmin/createExamMarks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        // payload: { timetable_id, student_id, marks_obtained, is_absent, remarks }
      })
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      console.log('✅ createExamMarks:', data)
      if (!data || data.success !== true) throw new Error(data?.message || 'Failed to save marks')
      return data
    } catch (error) {
      console.error('createExamMarks error:', error)
      throw error
    }
  },

  // ===============================
  // 7️⃣ SAVE ALL MARKS (Loop POST per student)
  // ===============================
  saveAllMarks: async (studentsArray, timetableId) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const results = []
    const errors  = []

    for (const student of studentsArray) {
      try {
        const payload = {
          timetable_id:   Number(timetableId),
          student_id:     Number(student.student_id || student.id),
          marks_obtained: student.is_absent ? 0 : Number(student.marks || 0),
          is_absent:      student.is_absent ? 1 : 0,
          remarks:        student.remark || '',
        }

        const response = await fetch(`${API_BASE_URL}/schooladmin/createExamMarks`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const data = await response.json()
        console.log(`✅ Student ${student.id} marks saved:`, data)
        results.push({ studentId: student.id, success: true, data })
      } catch (err) {
        console.error(`❌ Student ${student.id} failed:`, err)
        errors.push({ studentId: student.id, error: err.message })
      }
    }

    return {
      success: errors.length === 0,
      results,
      errors,
      message:
        errors.length === 0
          ? `All ${results.length} marks saved successfully`
          : `Saved ${results.length}, Failed ${errors.length}`,
    }
  },
}

export default markExameService