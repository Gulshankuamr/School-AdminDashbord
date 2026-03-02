// src/services/rolePermissionService/index.js
import { API_BASE_URL, getAuthToken } from '../api'

export const rolePermissionService = {

  // ===============================
  // 1️⃣ GET ALL PERMISSIONS
  // ===============================
  getAllPermissions: async () => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    try {
      const response = await fetch(
        `${API_BASE_URL}/schooladmin/getAllPermissions`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      console.log('📊 getAllPermissions raw response:', data)
      if (!data || data.success !== true) throw new Error(data?.message || 'Failed to fetch permissions')
      return data
    } catch (error) {
      console.error('Get all permissions error:', error)
      throw error
    }
  },

  // ===============================
  // 2️⃣ GET ROLE PERMISSIONS
  // ===============================
  getRolePermissions: async (role) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    try {
      const response = await fetch(
        `${API_BASE_URL}/schooladmin/getRolePermissions/${role}`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      console.log(`📊 getRolePermissions (${role}):`, data)
      if (!data || data.success !== true) throw new Error(data?.message || 'Failed to fetch role permissions')
      return data
    } catch (error) {
      console.error('Get role permissions error:', error)
      throw error
    }
  },

  // ===============================
  // 3️⃣ ASSIGN PERMISSIONS TO ROLE
  // ===============================
  assignRolePermissions: async ({ role, permission_ids }) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    try {
      const response = await fetch(
        `${API_BASE_URL}/schooladmin/assignRolePermissions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role, permission_ids }),
        }
      )
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      console.log('📊 assignRolePermissions:', data)
      if (!data || data.success !== true) throw new Error(data?.message || 'Failed to assign permissions')
      return data
    } catch (error) {
      console.error('Assign role permissions error:', error)
      throw error
    }
  },

  // ===============================
  // 4️⃣ REMOVE PERMISSIONS FROM ROLE
  // ===============================
  removeRolePermission: async ({ role, permission_ids }) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    try {
      const response = await fetch(
        `${API_BASE_URL}/schooladmin/removeRolePermission`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role, permission_ids }),
        }
      )
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      console.log('📊 removeRolePermission:', data)
      if (!data || data.success !== true) throw new Error(data?.message || 'Failed to remove permissions')
      return data
    } catch (error) {
      console.error('Remove role permissions error:', error)
      throw error
    }
  },
}