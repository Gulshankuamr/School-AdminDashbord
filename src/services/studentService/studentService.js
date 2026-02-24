import { API_BASE_URL, getAuthToken } from "../api.js"

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
    if (!response.ok) throw new Error(data.message || 'Could not fetch students')

    // ✅ FIX: Handle both nested and flat response shapes
    return {
      data: data?.data?.students || data?.data || data?.students || [],
      pagination: data?.data?.pagination || data?.pagination || {
        page: page,
        totalPages: 1,
        total: 0,
      },
    }
  },

  // ===============================
  // 2️⃣ GET STUDENT BY ID
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

    // ✅ FIX: Handle both data.data and data.data.student nesting
    return data?.data?.student || data?.data || null
  },

  // ===============================
  // 3️⃣ ADD STUDENT
  // ===============================
  addStudent: async (studentData) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const formData = new FormData()
    for (let key in studentData) {
      if (studentData[key] !== null && studentData[key] !== undefined && studentData[key] !== '') {
        formData.append(key, studentData[key])
      }
    }

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/registerStudent`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // ✅ Do NOT set Content-Type — browser sets it with boundary for FormData
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
    console.log('updateStudent called:', studentId, studentData)
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const formData = new FormData()
    formData.append('student_id', studentId)

    for (let key in studentData) {
      if (key === 'student_id') continue

      const val = studentData[key]

      // ✅ FIX: Allow empty string for optional fields (like roll_no, religion)
      // but skip null/undefined/File-type-null
      if (val === null || val === undefined) continue

      // ✅ FIX: Always include selected_fee_heads even if empty array
      if (key === 'selected_fee_heads') {
        formData.append(key, val) // already JSON.stringified
        continue
      }

      // ✅ FIX: Only append File objects if they are actual File instances
      if (val instanceof File) {
        formData.append(key, val)
        continue
      }

      // Append all other non-empty strings/numbers
      if (val !== '') {
        formData.append(key, val)
      }
    }

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/updateStudent`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          // ✅ Do NOT set Content-Type for FormData
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

    // ✅ FIX: Handle multiple response shapes
    return data?.data?.classes || data?.data || data?.classes || []
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

    // ✅ FIX: Handle multiple response shapes
    return data?.data?.sections || data?.data || data?.sections || []
  },

  // ===============================
  // 8️⃣ GET ALL FEE HEADS
  // ===============================
  getAllFeeHeads: async () => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getAllFeeHeads`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Could not fetch fee heads')

    // ✅ FIX: Correctly extract fee_heads array from nested response
    // API: { "success": true, "data": { "count": 1, "fee_heads": [...] } }
    return data?.data?.fee_heads || data?.data || data?.fee_heads || []
  },
}