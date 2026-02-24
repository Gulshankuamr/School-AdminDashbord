import { API_BASE_URL, getAuthToken } from '../api'

export const homeWorkService = {

  // ===============================
  // 1️⃣ GET ALL CLASSES
  // ===============================
  getAllClasses: async () => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')
    const response = await fetch(`${API_BASE_URL}/schooladmin/getAllClassList`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const data = await response.json()
    if (!data || data.success !== true) throw new Error(data?.message || 'Failed to fetch classes')
    return data
  },

  // ===============================
  // 2️⃣ GET ALL SECTIONS BY CLASS ID
  // ===============================
  getAllSections: async (classId) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')
    const response = await fetch(`${API_BASE_URL}/schooladmin/getAllSections?class_id=${classId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const data = await response.json()
    if (!data || data.success !== true) throw new Error(data?.message || 'Failed to fetch sections')
    return data
  },

  // ===============================
  // 3️⃣ GET ALL SUBJECTS
  // ===============================
  getAllSubjects: async () => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')
    const response = await fetch(`${API_BASE_URL}/schooladmin/getAllSubjects`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const data = await response.json()
    if (!data || data.success !== true) throw new Error(data?.message || 'Failed to fetch subjects')
    return data
  },

  // ===============================
  // 4️⃣ GET ALL TEACHERS  ✅ NEW
  // ===============================
  getAllTeachers: async () => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')
    const response = await fetch(`${API_BASE_URL}/schooladmin/getTotalTeachersListBySchoolId`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const data = await response.json()
    console.log('📊 getAllTeachers:', data)
    if (!data || data.success !== true) throw new Error(data?.message || 'Failed to fetch teachers')
    return data
  },

  // ===============================
  // 5️⃣ GET TEACHER HOMEWORK LIST
  // ===============================
  getTeacherHomeworkByTeacherId: async (teacherId = '') => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')
    const url = teacherId
      ? `${API_BASE_URL}/schooladmin/getTeacherHomeworkByTeacherId?teacher_id=${teacherId}`
      : `${API_BASE_URL}/schooladmin/getTeacherHomeworkByTeacherId`
    const response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const data = await response.json()
    if (!data || data.success !== true) throw new Error(data?.message || 'Failed to fetch homework')
    return data
  },

  // ===============================
  // 6️⃣ GET HOMEWORK BY ID
  // ===============================
  getHomeworkById: async (homeworkId) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')
    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getTeacherHomeworkByTeacherId?homework_id=${homeworkId}`,
      { method: 'GET', headers: { Authorization: `Bearer ${token}` } }
    )
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const data = await response.json()
    if (!data || data.success !== true) throw new Error(data?.message || 'Failed to fetch homework details')
    return data
  },

  // ===============================
  // 7️⃣ GET STUDENT HOMEWORK SUBJECT WISE
  // ===============================
  getStudentHomeworkSubjectWise: async (studentId) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')
    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getStudentHomeworkSubjectWise?student_id=${studentId}`,
      { method: 'GET', headers: { Authorization: `Bearer ${token}` } }
    )
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const data = await response.json()
    if (!data || data.success !== true) throw new Error(data?.message || 'Failed to fetch student homework')
    return data
  },

  // ===============================
  // 8️⃣ DELETE HOMEWORK
  // ===============================
  deleteStudentHomeworkPermanently: async (homeworkId) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')
    const response = await fetch(`${API_BASE_URL}/schooladmin/deleteStudentHomeworkPermanently`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ homework_id: homeworkId }),
    })
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const data = await response.json()
    if (!data || data.success !== true) throw new Error(data?.message || 'Failed to delete homework')
    return data
  },
}