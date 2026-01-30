// src/services/feecreateService.js
import { API_BASE_URL, getAuthToken } from '../api'

export const feecreateService = {

  // ===============================
  // 1️⃣ GET ALL FEE HEADS
  // ===============================
  getAllFeeHeads: async () => {
    try {
      const token = getAuthToken()
      if (!token) {
        console.warn('Token missing, redirecting to login')
        throw new Error('Authentication required')
      }

      const response = await fetch(
        `${API_BASE_URL}/schooladmin/getAllFeeHeads`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      if (response.status === 401) {
        throw new Error('Session expired. Please login again.')
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('📊 Fee Heads API Response:', data)

      if (!data || data.success !== true) {
        throw new Error(data?.message || 'Failed to fetch fee heads')
      }

      return data
    } catch (error) {
      console.error('Get all fee heads error:', error)
      throw error
    }
  },

  // ===============================
  // 2️⃣ GET ALL CLASSES
  // ===============================
  getAllClasses: async () => {
    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(
        `${API_BASE_URL}/schooladmin/getAllClassList`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      if (response.status === 401) {
        throw new Error('Session expired. Please login again.')
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('📊 Classes API Response:', data)

      if (!data || data.success !== true) {
        throw new Error(data?.message || 'Failed to fetch classes')
      }

      return data
    } catch (error) {
      console.error('Get all classes error:', error)
      throw error
    }
  },

  // ===============================
  // 3️⃣ CREATE FEE
  // ===============================
  createFee: async (payload) => {
    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error('Authentication required')
      }

      console.log('📤 Create Fee Payload:', payload)

      const response = await fetch(
        `${API_BASE_URL}/schooladmin/createFee`,
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
        throw new Error('Session expired. Please login again.')
      }

      const data = await response.json()
      console.log('📥 Create Fee Response:', data)

      if (!response.ok || data.success !== true) {
        const errorMessage = data.message || 'Failed to create fee'
        if (errorMessage.includes('already exists')) {
          throw new Error('Fee already exists for this class, fee head, and academic year')
        }
        throw new Error(errorMessage)
      }

      return data
    } catch (error) {
      console.error('Create fee error:', error)
      throw error
    }
  },

  // ===============================
  // 4️⃣ GET ALL FEES
  // ===============================
  getAllFees: async () => {
    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(
        `${API_BASE_URL}/schooladmin/getAllFees`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      if (response.status === 401) {
        throw new Error('Session expired. Please login again.')
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('📊 All Fees API Response:', data)

      if (!data || data.success !== true) {
        throw new Error(data?.message || 'Failed to fetch fees')
      }

      return data
    } catch (error) {
      console.error('Get all fees error:', error)
      throw error
    }
  },

  // ===============================
  // 5️⃣ DELETE FEE (FIXED)
  // ===============================
  deleteFee: async (feeId) => {
    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error('Authentication required')
      }

      // Based on API example, need to send fee_id and status
      const payload = {
        fee_id: feeId,
        status: 0
      }

      console.log('🗑️ Delete Fee Payload:', payload)

      const response = await fetch(
        `${API_BASE_URL}/schooladmin/deleteFee`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      )

      if (response.status === 401) {
        throw new Error('Session expired. Please login again.')
      }

      let data;
      try {
        data = await response.json()
      } catch (parseError) {
        throw new Error('Invalid JSON response from server')
      }

      console.log('🗑️ Delete Fee Response:', data)

      if (!response.ok || data.success !== true) {
        const errorMessage = data?.message || 'Failed to delete fee'
        
        // Handle specific error messages
        if (errorMessage.includes('not found')) {
          throw new Error('Fee structure not found')
        }
        if (errorMessage.includes('already assigned to students')) {
          throw new Error('Cannot delete fee as it is already assigned to students. Please deactivate it instead.')
        }
        throw new Error(errorMessage)
      }

      return data
    } catch (error) {
      console.error('Delete fee error:', error)
      throw error
    }
  },
}