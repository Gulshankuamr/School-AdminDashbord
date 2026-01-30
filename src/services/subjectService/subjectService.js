// src/services/subjectService.js
import { API_BASE_URL, getAuthToken } from "../api.js"

export const subjectService = {
  // ===============================
  // 1️⃣ GET ALL SUBJECTS ✅
  // ===============================
  getAllSubjects: async () => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getAllSubjects`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const data = await response.json()
    console.log('GET ALL SUBJECTS RESPONSE:', data)

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch subjects')
    }

    // Return only the data array
    return data.data || []
  },

  // ===============================
  // 2️⃣ GET SUBJECT BY ID ✅
  // ===============================
  getSubjectById: async (subjectId) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    // First get all subjects
    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getAllSubjects`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const data = await response.json()
    console.log('SUBJECT BY ID RESPONSE:', data)

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch subjects')
    }

    // Find the specific subject
    const subject = (data.data || []).find(s => 
      String(s.subject_id) === String(subjectId) || 
      s.subject_id === parseInt(subjectId)
    )

    if (!subject) {
      throw new Error('Subject not found')
    }

    return subject
  },

  // ===============================
  // 3️⃣ ADD SUBJECT ✅
  // ===============================
  addSubject: async (subjectData) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/createSubject`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject_name: subjectData.subject_name
        }),
      }
    )

    const data = await response.json()
    console.log('ADD SUBJECT RESPONSE:', data)

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to create subject')
    }

    return data
  },

  // ===============================
  // 4️⃣ UPDATE SUBJECT ✅
  // ===============================
  updateSubject: async (subjectId, subjectData) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/updateSubject`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject_id: parseInt(subjectId),
          subject_name: subjectData.subject_name
        }),
      }
    )

    const data = await response.json()
    console.log('UPDATE SUBJECT RESPONSE:', data)

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to update subject')
    }

    return data
  },

  // ===============================
  // 5️⃣ DELETE SUBJECT ✅
  // ===============================
  deleteSubject: async (subjectId) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/deleteSubject`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject_id: parseInt(subjectId)
        }),
      }
    )

    const data = await response.json()
    console.log('DELETE SUBJECT RESPONSE:', data)

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to delete subject')
    }

    return data
  },

  // ===============================
  // 6️⃣ SEARCH SUBJECTS ✅ (Optional)
  // ===============================
  searchSubjects: async (searchTerm) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getAllSubjects`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const data = await response.json()
    
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch subjects')
    }

    const allSubjects = data.data || []
    
    // Filter locally based on search term
    if (searchTerm) {
      return allSubjects.filter(subject =>
        subject.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(subject.subject_id).includes(searchTerm)
      )
    }

    return allSubjects
  }
}