import { API_BASE_URL, getAuthToken } from '../api'

export const getAllExamTypes = async () => {
  const token = getAuthToken()
  
  if (!token) {
    throw new Error('Authentication required. Please login.')
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getExamTypes`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (response.status === 401) {
      localStorage.removeItem('auth_token')
      throw new Error('Session expired. Please login again.')
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    throw error
  }
}

export const createExamType = async (payload) => {
  const token = getAuthToken()
  
  if (!token) {
    throw new Error('Authentication required. Please login.')
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/schooladmin/createExamType`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    )

    if (response.status === 401) {
      localStorage.removeItem('auth_token')
      throw new Error('Session expired. Please login again.')
    }

    if (!response.ok) {
      throw new Error(`Failed to create exam type: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    throw error
  }
}

export const updateExamType = async (payload) => {
  const token = getAuthToken()
  
  if (!token) {
    throw new Error('Authentication required. Please login.')
  }

  try {
    console.log('📤 Sending update payload:', payload)
    
    // CRITICAL FIX: Use PUT method instead of POST
    const response = await fetch(
      `${API_BASE_URL}/schooladmin/updateExamType`,
      {
        method: 'PUT', // Changed from POST to PUT
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    )

    console.log('📡 Update response status:', response.status)

    if (response.status === 401) {
      localStorage.removeItem('auth_token')
      throw new Error('Session expired. Please login again.')
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Update error response:', errorText)
      throw new Error(`Failed to update exam type: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ Update success response:', data)
    return data
  } catch (error) {
    console.error('❌ Update exam type error:', error)
    throw error
  }
}

export const deleteExamType = async (examTypeId) => {
  const token = getAuthToken()
  
  if (!token) {
    throw new Error('Authentication required. Please login.')
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/schooladmin/deleteExamType`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exam_type_id: examTypeId
        }),
      }
    )

    if (response.status === 401) {
      localStorage.removeItem('auth_token')
      throw new Error('Session expired. Please login again.')
    }

    if (!response.ok) {
      throw new Error(`Failed to delete exam type: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    throw error
  }
}