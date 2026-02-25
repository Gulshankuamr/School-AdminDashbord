import { API_BASE_URL, getAuthToken } from "/src/services/api.js"

export const teacherService = {

  // ===============================
  // 1️⃣ GET ALL TEACHERS
  // API: GET /schooladmin/getTotalTeachersListBySchoolId
  // ===============================
  getAllTeachers: async (page = 1) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getTotalTeachersListBySchoolId?page=${page}&limit=10`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    // API returns { success: true, data: [...] }
    const teachersList = data?.data || []

    return {
      data: Array.isArray(teachersList) ? teachersList : [],
      pagination: {
        page: page,
        totalPages: Math.ceil(teachersList.length / 10) || 1,
        total: teachersList.length,
      },
    }
  },

  // ===============================
  // 2️⃣ GET TEACHER BY ID
  // API: GET /schooladmin/getTeacherById?teacher_id=30
  // ===============================
// In teacherService.js - update getTeacherById function

getTeacherById: async (teacherId) => {
  const token = getAuthToken()
  if (!token) throw new Error('Token missing')

  const response = await fetch(
    `${API_BASE_URL}/schooladmin/getTeacherById?teacher_id=${teacherId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
    }
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch teacher')
  }

  // 🔥 NORMALIZE THE DATA - Flatten the structure
  const teacherData = data.data || {}
  
  // Create a normalized teacher object with all fields at root level
  const normalizedTeacher = {
    // Basic info from root
    teacher_id: teacherData.teacher_id || data.data?.teacher_id,
    name: data.name || teacherData.name,
    user_email: data.user_email || teacherData.user_email,
    
    // Data from teacherData object (your API puts these in data)
    qualification: teacherData.qualification,
    father_name: teacherData.father_name,
    mother_name: teacherData.mother_name,
    mobile_number: teacherData.mobile_number,
    address: teacherData.address,
    experience_years: teacherData.experience_years,
    joining_date: teacherData.joining_date,
    status: teacherData.status,
    gender: teacherData.gender,
    
    // Photos
    teacher_photo_url: data.teacher_photo_url || teacherData.teacher_photo_url,
    aadhar_card_url: data.aadhar_card_url || teacherData.aadhar_card_url,
    
    // Keep original for reference
    original: data
  }

  console.log('✅ Normalized teacher data:', normalizedTeacher)
  return normalizedTeacher
},

  // ===============================
  // 3️⃣ ADD TEACHER
  // API: POST /schooladmin/registerTeacher
  // Fields: name, user_email, password, qualification, experience_years,
  //         joining_date, mobile_number, address, father_name, mother_name,
  //         teacher_photo (file), aadhar_card (file)
  // ===============================
  addTeacher: async (teacherData) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const formData = new FormData()
    
    // Append all fields exactly as API expects
    formData.append('name', teacherData.name || '')
    formData.append('user_email', teacherData.user_email || '')
    formData.append('password', teacherData.password || '')
    formData.append('qualification', teacherData.qualification || '')
    formData.append('experience_years', teacherData.experience_years || '')
    formData.append('joining_date', teacherData.joining_date || '')
    formData.append('mobile_number', teacherData.mobile_number || '')
    formData.append('address', teacherData.address || '')
    formData.append('father_name', teacherData.father_name || '')
    formData.append('mother_name', teacherData.mother_name || '')
    
    // Add gender if provided
    if (teacherData.gender) {
      formData.append('gender', teacherData.gender)
    }
    
    // Add files if provided
    if (teacherData.teacher_photo instanceof File) {
      formData.append('teacher_photo', teacherData.teacher_photo)
    }
    
    if (teacherData.aadhar_card instanceof File) {
      formData.append('aadhar_card', teacherData.aadhar_card)
    }

    console.log('📤 Adding teacher with data:', Object.fromEntries(formData))

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/registerTeacher`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData
        },
        body: formData,
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Server response:', errorText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  },

  // ===============================
  // 4️⃣ UPDATE TEACHER
  // API: PUT /schooladmin/updateTeacher
  // Fields: teacher_id, name, user_email, password, qualification, 
  //         experience_years, joining_date, mobile_number, address,
  //         father_name, mother_name, gender, teacher_photo, aadhar_card
  // ===============================
  updateTeacher: async (teacherId, teacherData) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const formData = new FormData()
    
    // Add ALL fields exactly as API expects
    formData.append('teacher_id', String(teacherId))
    formData.append('name', teacherData.name || '')
    formData.append('user_email', teacherData.user_email || '')
    formData.append('qualification', teacherData.qualification || '')
    formData.append('experience_years', teacherData.experience_years || '')
    formData.append('joining_date', teacherData.joining_date || '')
    formData.append('mobile_number', teacherData.mobile_number || '')
    formData.append('address', teacherData.address || '')
    formData.append('father_name', teacherData.father_name || '')
    formData.append('mother_name', teacherData.mother_name || '')
    
    // Add gender (always include)
    formData.append('gender', teacherData.gender || '')
    
    // Add password only if provided and not empty
    if (teacherData.password && teacherData.password.trim() !== '') {
      formData.append('password', teacherData.password)
    }
    
    // Add files only if new ones are selected
    if (teacherData.teacher_photo instanceof File) {
      formData.append('teacher_photo', teacherData.teacher_photo)
    }
    
    if (teacherData.aadhar_card instanceof File) {
      formData.append('aadhar_card', teacherData.aadhar_card)
    }

    console.log('📤 Updating teacher ID:', teacherId)
    console.log('📤 FormData contents:', Object.fromEntries(formData))

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/updateTeacher`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData
        },
        body: formData,
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Server response:', errorText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  },

  // ===============================
  // 5️⃣ DELETE TEACHER
  // API: DELETE /schooladmin/deleteTeacherById
  // ===============================
  deleteTeacher: async (teacherId) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/deleteTeacherById`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teacher_id: teacherId }),
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  },
}