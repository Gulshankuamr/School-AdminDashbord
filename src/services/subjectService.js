import { API_BASE_URL, getAuthToken } from "./api.js"

export const subjectService = {
  // ===============================
  // 1️⃣ GET ALL SUBJECTS
  // ===============================
  getAllSubjects: async () => {
    const token = getAuthToken()
    if (!token) {
      console.error('Authentication token is missing')
      throw new Error('Authentication required. Please login again.')
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/schooladmin/getAllSubjects`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      console.log('GET ALL SUBJECTS - Status:', response.status)

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.')
        } else if (response.status === 404) {
          return { success: true, data: [] } // Return empty array if not found
        } else {
          throw new Error(`Server error: ${response.status}`)
        }
      }

      const data = await response.json()
      console.log('GET ALL SUBJECTS RESPONSE:', data)

      // Handle empty response
      if (!data) {
        console.warn('No data received from server')
        return { success: true, data: [] }
      }

      if (data.success !== true) {
        throw new Error(data.message || 'Could not fetch subjects')
      }

      // Ensure data.data is an array
      if (!Array.isArray(data.data)) {
        console.warn('Response data is not an array, converting to empty array')
        data.data = []
      }

      return data
    } catch (error) {
      console.error('Get all subjects error:', error)
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection.')
      }
      
      throw error
    }
  },

  // ===============================
  // 2️⃣ GET SUBJECT BY ID (NEW FUNCTION ADDED)
  // ===============================
  getSubjectById: async (subjectId) => {
    const token = getAuthToken()
    if (!token) {
      throw new Error('Authentication required. Please login again.')
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/schooladmin/getSubjectById/${subjectId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      console.log('GET SUBJECT BY ID - Status:', response.status)
      console.log('GET SUBJECT BY ID - ID:', subjectId)

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.')
        } else if (response.status === 404) {
          throw new Error('Subject not found')
        } else {
          throw new Error(`Server error: ${response.status}`)
        }
      }

      const data = await response.json()
      console.log('GET SUBJECT BY ID RESPONSE:', data)

      if (!data || data.success !== true) {
        throw new Error(data?.message || 'Could not fetch subject details')
      }

      return data.data
    } catch (error) {
      console.error('Get subject by ID error:', error)
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection.')
      }
      
      throw error
    }
  },

  // ===============================
  // 3️⃣ CREATE SUBJECT
  // ===============================
  createSubject: async (subjectData) => {
    const token = getAuthToken()
    if (!token) {
      console.error('Authentication token is missing')
      throw new Error('Authentication required. Please login again.')
    }

    try {
      // Validate subject name
      if (!subjectData.subject_name || subjectData.subject_name.trim() === '') {
        throw new Error('Subject name is required')
      }

      const response = await fetch(
        `${API_BASE_URL}/schooladmin/createSubject`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subject_name: subjectData.subject_name.trim()
          }),
        }
      )

      console.log('CREATE SUBJECT - Status:', response.status)
      console.log('CREATE SUBJECT - Data:', subjectData)

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.')
        } else if (response.status === 400) {
          throw new Error('Invalid subject data')
        } else if (response.status === 409) {
          throw new Error('Subject already exists')
        } else {
          throw new Error(`Server error: ${response.status}`)
        }
      }

      const data = await response.json()
      console.log('CREATE SUBJECT RESPONSE:', data)

      if (!data || data.success !== true) {
        throw new Error(data?.message || 'Subject could not be created')
      }

      return data
    } catch (error) {
      console.error('Create subject error:', error)
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection.')
      }
      
      throw error
    }
  },

  // ===============================
  // 4️⃣ UPDATE SUBJECT
  // ===============================
  updateSubject: async (subjectData) => {
    const token = getAuthToken()
    if (!token) {
      console.error('Authentication token is missing')
      throw new Error('Authentication required. Please login again.')
    }

    try {
      // Validate data
      if (!subjectData.subject_id) {
        throw new Error('Subject ID is required')
      }
      
      if (!subjectData.subject_name || subjectData.subject_name.trim() === '') {
        throw new Error('Subject name is required')
      }

      const response = await fetch(
        `${API_BASE_URL}/schooladmin/updateSubject`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subject_id: subjectData.subject_id,
            subject_name: subjectData.subject_name.trim()
          }),
        }
      )

      console.log('UPDATE SUBJECT - Status:', response.status)
      console.log('UPDATE SUBJECT - Data:', subjectData)

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.')
        } else if (response.status === 404) {
          throw new Error('Subject not found')
        } else if (response.status === 400) {
          throw new Error('Invalid subject data')
        } else {
          throw new Error(`Server error: ${response.status}`)
        }
      }

      const data = await response.json()
      console.log('UPDATE SUBJECT RESPONSE:', data)

      if (!data || data.success !== true) {
        throw new Error(data?.message || 'Failed to update subject')
      }

      return data
    } catch (error) {
      console.error('Update subject error:', error)
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection.')
      }
      
      throw error
    }
  },

  // ===============================
  // 5️⃣ DELETE SUBJECT
  // ===============================
  deleteSubject: async (subjectId) => {
    const token = getAuthToken()
    if (!token) {
      console.error('Authentication token is missing')
      throw new Error('Authentication required. Please login again.')
    }

    try {
      // Validate subjectId
      if (!subjectId) {
        throw new Error('Subject ID is required')
      }

      const response = await fetch(
        `${API_BASE_URL}/schooladmin/deleteSubject`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subject_id: subjectId,
          }),
        }
      )

      console.log('DELETE SUBJECT - Status:', response.status)
      console.log('DELETE SUBJECT - ID:', subjectId)

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.')
        } else if (response.status === 404) {
          throw new Error('Subject not found')
        } else if (response.status === 403) {
          throw new Error('Permission denied to delete subject')
        } else {
          throw new Error(`Server error: ${response.status}`)
        }
      }

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error('JSON parse error:', parseError)
        throw new Error('Invalid response from server')
      }

      console.log('DELETE SUBJECT RESPONSE:', data)

      if (!data || data.success !== true) {
        throw new Error(data?.message || 'Failed to delete subject')
      }

      return data
    } catch (error) {
      console.error('Delete subject error:', error)
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection.')
      }
      
      throw error
    }
  },

  // ===============================
  // 6️⃣ TOGGLE SUBJECT STATUS (NEW FUNCTION)
  // ===============================
  toggleSubjectStatus: async (subjectId, status) => {
    const token = getAuthToken()
    if (!token) {
      throw new Error('Authentication required. Please login again.')
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/schooladmin/toggleSubjectStatus`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subject_id: subjectId,
            status: status
          }),
        }
      )

      console.log('TOGGLE STATUS - Status:', response.status)
      console.log('TOGGLE STATUS - Data:', { subjectId, status })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.')
        } else if (response.status === 404) {
          throw new Error('Subject not found')
        } else {
          throw new Error(`Server error: ${response.status}`)
        }
      }

      const data = await response.json()
      console.log('TOGGLE STATUS RESPONSE:', data)

      if (!data || data.success !== true) {
        throw new Error(data?.message || 'Failed to update subject status')
      }

      return data
    } catch (error) {
      console.error('Toggle status error:', error)
      throw error
    }
  }
}