import { API_BASE_URL, getAuthToken } from "/src/services/api.js"

export const teacherService = {

  // ===============================
  // 1️⃣ GET ALL TEACHERS
  // ===============================
  getAllTeachers: async (page = 1) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getTotalTeachersListBySchoolId?page=${page}&limit=10`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const data = await response.json()
    if (!response.ok) throw new Error('Could not fetch teachers')

    return data
  },

  // ===============================
  // 2️⃣ GET TEACHER BY ID ✅
  // ===============================
  getTeacherById: async (teacherId) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getTeacherById/${teacherId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const data = await response.json()
    console.log('TEACHER API RESPONSE:', data)

    if (!response.ok || data.success !== true) {
      throw new Error(data.message || 'Failed to load teacher data')
    }

    return data.data
  },

  // ===============================
  // 3️⃣ ADD TEACHER
  // ===============================
  addTeacher: async (teacherData) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const formData = new FormData()
    for (let key in teacherData) {
      if (teacherData[key] !== null && teacherData[key] !== undefined) {
        formData.append(key, teacherData[key])
      }
    }

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/registerTeacher`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    )

    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Teacher not added')

    return data
  },

  // ===============================
  // 4️⃣ UPDATE TEACHER ✅
  // ===============================
  updateTeacher: async (teacherId, teacherData) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const formData = new FormData()
    formData.append('teacher_id', teacherId)

    for (let key in teacherData) {
      if (key !== 'teacher_id' && teacherData[key] !== null && teacherData[key] !== undefined) {
        formData.append(key, teacherData[key])
      }
    }

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/updateTeacher`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    )

    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Teacher not updated')

    return data
  },

  // ===============================
  // 5️⃣ DELETE TEACHER ✅
  // ===============================
  deleteTeacher: async (teacherId) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/deleteTeacherById`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teacher_id: teacherId }),
      }
    )

    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Teacher not deleted')

    return data
  },
}
