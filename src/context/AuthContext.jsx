// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services/authService'
import { mapPermissions } from '../config/permissionKeyMap'
   // ✅ mapping layer — converts backend keys → frontend keys

const AuthContext = createContext(null)

// ─────────────────────────────────────────────────────────────────────────────
// ROLES that can access the admin panel
// Add 'accountant' here so ProtectedRoute lets them in.
// school_admin gets full bypass in can() regardless of their permissions array.
// ─────────────────────────────────────────────────────────────────────────────
export const ALLOWED_ROLES = ['school_admin', 'accountant']

export function AuthProvider({ children }) {
  const [isLoading,   setIsLoading]   = useState(true)   // true until localStorage hydrated
  const [isLoggedIn,  setIsLoggedIn]  = useState(false)
  const [user,        setUser]        = useState(null)
  const [permissions, setPermissions] = useState([])     // ✅ MAPPED frontend keys stored here

  // ─────────────────────────────────────────────────────────────────────
  // Restore session on page reload / refresh
  // Permissions stored in localStorage are already mapped (saved after
  // mapPermissions() at login time), so no re-mapping needed here.
  // ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const token    = localStorage.getItem('auth_token')
    const rawUser  = localStorage.getItem('user')
    const rawPerms = localStorage.getItem('permissions')  // already mapped

    if (token) {
      setIsLoggedIn(true)
      try { if (rawUser)  setUser(JSON.parse(rawUser))         } catch { /* corrupt */ }
      try { if (rawPerms) setPermissions(JSON.parse(rawPerms)) } catch { /* corrupt */ }
    }

    setIsLoading(false)
  }, [])

  // ─────────────────────────────────────────────────────────────────────
  // LOGIN
  //
  // Flow:
  //   1. Call authService.login() — it saves raw data to localStorage
  //   2. Map the raw backend permissions → frontend keys
  //   3. Overwrite localStorage['permissions'] with the MAPPED version
  //   4. Update React state with mapped permissions
  //
  // authService returns:
  //   { success: true,  data: { token, user: { role, permissions, ... } } }
  //   { success: false, message: "..." }
  // ─────────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      setIsLoading(true)
      const result = await authService.login(email, password)

      if (result?.success && result?.data?.token) {
        const userData    = result.data.user
        const rawPerms    = userData?.permissions || []          // backend keys
        const mappedPerms = mapPermissions(rawPerms)             // ✅ → frontend keys

        // Overwrite localStorage so hydration on reload also gets mapped keys
        localStorage.setItem('permissions', JSON.stringify(mappedPerms))

        setUser(userData)              // full user object (role = 'school_admin' | 'accountant')
        setPermissions(mappedPerms)    // ✅ frontend-key array stored in state
        setIsLoggedIn(true)

        return { success: true }
      }

      // Login failed — clear any stale state
      setIsLoggedIn(false)
      setUser(null)
      setPermissions([])

      return {
        success: false,
        message: result?.message || 'Login failed. Please try again.',
      }

    } catch (err) {
      console.error('AuthContext login error:', err)
      return { success: false, message: 'Unexpected error. Please try again.' }
    } finally {
      setIsLoading(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────────────────────────────
  const logout = async () => {
    await authService.logout()   // clears localStorage + optional API call
    setIsLoggedIn(false)
    setUser(null)
    setPermissions([])
  }

  // ─────────────────────────────────────────────────────────────────────
  // PERMISSION HELPERS
  //
  // NOTE: `permission` argument is always a FRONTEND KEY
  //       e.g.  can('view_all_student')  — NOT 'view_students'
  //
  // Checking against `permissions` state which already holds mapped keys.
  // ─────────────────────────────────────────────────────────────────────

  /**
   * can(frontendKey)
   *
   *   null / undefined     → true   open to all logged-in users
   *   role = school_admin  → true   full access bypass (no perm check needed)
   *   otherwise            → permissions[].includes(frontendKey)
   *
   * Works for ALL roles: school_admin (bypass), accountant (perm check), etc.
   *
   * @example
   *   can('view_all_student')   // true for admin, or if mapped perm present
   *   can(null)                 // always true
   */
  const can = (permission) => {
    if (!permission) return true
    if (user?.role === 'school_admin') return true   // 🔥 admin full bypass
    return permissions.includes(permission)
  }

  /**
   * canAny(frontendKeys[])
   * Returns true if user has AT LEAST ONE permission from the list.
   * Useful for showing a menu group when any one of its sub-items is visible.
   *
   * @example
   *   canAny(['view_fees', 'manage_fees'])
   *   canAny(['manage_exam_marks', 'generate_marksheet'])
   */
  const canAny = (permList = []) => {
    if (!permList.length) return true
    if (user?.role === 'school_admin') return true
    return permList.some(p => permissions.includes(p))
  }

  /**
   * canAll(frontendKeys[])
   * Returns true only if user has ALL permissions from the list.
   * Useful for guarding actions that require multiple privileges.
   *
   * @example
   *   canAll(['manage_fees', 'collect_payment'])
   */
  const canAll = (permList = []) => {
    if (!permList.length) return true
    if (user?.role === 'school_admin') return true
    return permList.every(p => permissions.includes(p))
  }

  /**
   * isRole(roleName | roleName[])
   * Simple role check — independent of permissions.
   *
   * @example
   *   isRole('school_admin')
   *   isRole(['school_admin', 'accountant'])
   */
  const isRole = (role) => {
    if (!user?.role) return false
    if (Array.isArray(role)) return role.includes(user.role)
    return user.role === role
  }

  // Legacy aliases — keep for backward compat with existing components
  const hasPermission    = can
  const hasAnyPermission = canAny

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isLoading,
        user,
        permissions,          // mapped frontend keys
        login,
        logout,
        can,                  // ✅ primary helper  (single frontend key)
        canAny,               // ✅ primary helper  (any of list)
        canAll,               // ✅ NEW             (all of list)
        isRole,               // ✅ NEW             (role check)
        hasPermission,        // legacy alias → can()
        hasAnyPermission,     // legacy alias → canAny()
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}