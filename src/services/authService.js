import { API_BASE_URL } from './api'

/**
 * Authentication Service
 * Handles login, logout, and token management
 */
export const authService = {
  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - { success: boolean, user?, token?, error? }
   */
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: email,
          password: password,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        return {
          success: false,
          error: data.message || 'Login failed',
        }
      }

      const token = data.data.token
      const userFromApi = data.data.user

      const userData = {
        id: userFromApi.id,
        name: userFromApi.name,
        email: userFromApi.email || email,
        role: userFromApi.role,
      }

      // Only allow school_admin
      if (userData.role !== 'school_admin') {
        return {
          success: false,
          error: 'Access Denied: Only admin users allowed',
        }
      }

      // Store user and token in localStorage
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user', JSON.stringify(userData))

      return {
        success: true,
        user: userData,
        token: token,
      }
    } catch (error) {
      console.error('Login API Error:', error)
      return {
        success: false,
        error: 'Something went wrong. Please try again.',
      }
    }
  },

  /**
   * Logout user
   * Clears user and token from localStorage
   */
  logout: async () => {
    try {
      const token = localStorage.getItem('auth_token')

      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
      }
    } catch (error) {
      console.error('Logout API Error:', error)
    } finally {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    }
  },

  /**
   * Get current logged-in user from localStorage
   * @returns {Object|null} - user data or null
   */
  getCurrentUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  /**
   * Get current auth token
   * @returns {string|null} - token or null
   */
  getToken: () => {
    return localStorage.getItem('auth_token') || null
  },
}
