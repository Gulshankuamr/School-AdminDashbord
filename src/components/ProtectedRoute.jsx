// src/components/ProtectedRoute.jsx
//
// ✅ FINAL STABLE VERSION
// Supports string and array permissions.
// Array = OR logic: any one match grants access.
// school_admin bypasses all permission checks inside hasPermission() (AuthContext).
//
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * checkPermission — internal helper
 *
 * @param {Function} hasPermission  - from useAuth()
 * @param {string | string[]} req   - required permission(s)
 * @returns {boolean}
 */
const checkPermission = (hasPermission, req) => {
  if (!req) return true
  if (Array.isArray(req)) return req.some(p => hasPermission(p))
  return hasPermission(req)
}

function ProtectedRoute({ children, permission, allowedRoles }) {
  const { isLoggedIn, isLoading, user, hasPermission } = useAuth()
  const location = useLocation()

  // 1. Auth still loading — spinner prevents flash redirect
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // 2. Not logged in
  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // 3. Role check — backend sends role = "school_admin" (exact string)
  if (allowedRoles?.length && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  // 4. Permission check — string OR array, school_admin always passes
  if (permission && !checkPermission(hasPermission, permission)) {
    return <Navigate to="/unauthorized" replace />
  }

  // 5. All clear
  return children
}

export default ProtectedRoute