// src/services/authService.js
import { API_BASE_URL } from './api'

// ─────────────────────────────────────────────────────────────────────────────
// NOTE: We use raw fetch here (NOT the apiFetch wrapper from api.js) because:
//   1. Login has no auth token yet — apiFetch tries to attach Bearer token
//   2. apiFetch throws on non-ok responses — we want to handle login errors gracefully
//   3. Logout uses apiFetch indirectly via api.js `post()` after token is set
// ─────────────────────────────────────────────────────────────────────────────

export const authService = {

  // ═══════════════════════════════════════════════════════════════════════════
  // LOGIN
  //
  // Backend response:
  // {
  //   success: true,
  //   message: "Login successful",
  //   data: {
  //     token: "eyJ...",
  //     user: {
  //       user_id, school_id, name, user_email,
  //       role: "school_admin",
  //       admin_id, device_token,
  //       permissions: ["view_students", "add_student", ...]
  //     }
  //   }
  // }
  // ═══════════════════════════════════════════════════════════════════════════
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: email,   // ✅ backend expects "user_email" not "email"
          password,
        }),
      })

      const data = await response.json()

      // ── API-level or HTTP failure ──────────────────────────────────────
      if (!response.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Login failed. Please check your credentials.',
        }
      }

      const token   = data.data.token
      const userObj = data.data.user
      const perms   = userObj?.permissions || []

      // ── Role guard ─────────────────────────────────────────────────────
      // Only school_admin can access this admin dashboard
      if (userObj.role !== 'school_admin') {
        return {
          success: false,
          message: 'Access denied. Only admin users can login here.',
        }
      }

      // ── Persist to localStorage ────────────────────────────────────────
      // These 3 keys are read by:
      //   - AuthContext  (on page reload, to restore session)
      //   - api.js       (getAuthToken reads 'auth_token' for all API calls)
      //   - Sidebar.jsx  (reads permissions via AuthContext)
      localStorage.setItem('auth_token',  token)              // ✅ api.js reads this key
      localStorage.setItem('user',        JSON.stringify(userObj))
      localStorage.setItem('permissions', JSON.stringify(perms))

      // ── Return shape that AuthContext.login() expects ──────────────────
      return {
        success: true,
        data: {
          token,
          user: userObj,   // full object — role, permissions, user_id, etc.
        },
      }

    } catch (err) {
      console.error('Login API Error:', err)
      return {
        success: false,
        message: 'Network error. Check your connection and try again.',
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LOGOUT
  //
  // Calls logout API (optional — backend may invalidate token server-side),
  // then clears all localStorage keys.
  // api.js `apiFetch` is NOT used here because we want to clear storage even
  // if the API call fails.
  // ═══════════════════════════════════════════════════════════════════════════
  logout: async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (token) {
        // Best-effort API call — ignore failures
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method:  'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization:  `Bearer ${token}`,
          },
        }).catch(() => {})   // silent fail — we clear storage regardless
      }
    } finally {
      // Always clear — even if API call fails or throws
      localStorage.removeItem('auth_token')    // ✅ same key api.js uses
      localStorage.removeItem('user')
      localStorage.removeItem('permissions')
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPERS  (used by components that don't have AuthContext access)
  // ═══════════════════════════════════════════════════════════════════════════

  /** Returns the full user object from localStorage, or null */
  getCurrentUser: () => {
    try {
      const u = localStorage.getItem('user')
      return u ? JSON.parse(u) : null
    } catch { return null }
  },

  /** Returns the auth token string, or null */
  getToken: () => localStorage.getItem('auth_token') || null,

  /** Returns the permissions array, or [] */
  getPermissions: () => {
    try {
      const p = localStorage.getItem('permissions')
      return p ? JSON.parse(p) : []
    } catch { return [] }
  },
}