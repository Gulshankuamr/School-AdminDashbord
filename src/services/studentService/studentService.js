import { API_BASE_URL, getAuthToken } from "/src/services/api.js"

export const studentService = {

  // ===============================
  // 1️⃣ GET ALL STUDENTS
  // ===============================
  getAllStudents: async (page = 1) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getTotalStudentsListBySchoolId?page=${page}&limit=10`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const data = await response.json()
    if (!response.ok) throw new Error('Could not fetch students')

    return data
  },

  // ===============================
  // 2️⃣ GET STUDENT BY ID ✅ FINAL
  // ===============================
  getStudentById: async (studentId) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getStudentById/${studentId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const data = await response.json()
    console.log('STUDENT API RESPONSE:', data)

    if (!response.ok || data.success !== true) {
      throw new Error(data.message || 'Failed to load student data')
    }

    return data.data
  },

  // ===============================
  // 3️⃣ ADD STUDENT
  // ===============================
  addStudent: async (studentData) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const formData = new FormData()
    for (let key in studentData) {
      if (studentData[key] !== null && studentData[key] !== undefined) {
        formData.append(key, studentData[key])
      }
    }

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/registerStudent`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    )

    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Student not added')

    return data
  },

  // ===============================
  // 4️⃣ UPDATE STUDENT
  // ===============================
  updateStudent: async (studentId, studentData) => {
    console.log(studentData, ">>>>", studentId)
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const formData = new FormData()
    formData.append('student_id', studentId)

    for (let key in studentData) {
      if (
        key !== 'student_id' &&
        studentData[key] !== null &&
        studentData[key] !== undefined &&
        studentData[key] !== ''
      ) {
        formData.append(key, studentData[key])
      }
    }

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/updateStudent`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    )

    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Student not updated')

    return data
  },

  // ===============================
  // 5️⃣ DELETE STUDENT
  // ===============================
  deleteStudent: async (studentId) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/deleteStudentById`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ student_id: studentId }),
      }
    )

    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Student not deleted')

    return data
  },

  // ===============================
  // 6️⃣ GET ALL CLASSES
  // ===============================
  getAllClasses: async () => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getAllClassList`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Could not fetch classes')

    return data.data || data
  },

  // ===============================
  // 7️⃣ GET SECTIONS BY CLASS ID
  // ===============================
  getSectionsByClassId: async (classId) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getAllSections?class_id=${classId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Could not fetch sections')

    return data.data || data
  },
}