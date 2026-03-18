// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * ProtectedRoute
 *
 * Props:
 *   allowedRoles  {string[]}  – checks user.role,     e.g. ['school_admin']
 *   permission    {string}    – checks permissions[], e.g. 'view_students'
 *
 * Check order:
 *   1. isLoading     → spinner (avoids flash of redirect)
 *   2. !isLoggedIn   → /login
 *   3. role mismatch → /unauthorized
 *   4. perm missing  → /unauthorized
 *   5. all pass      → render children
 */
function ProtectedRoute({ children, permission, allowedRoles }) {
  const { isLoggedIn, isLoading, user, hasPermission } = useAuth()
  const location = useLocation()

  // 1. Still reading localStorage
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // 2. Not logged in → go to login, remember where user was trying to go
  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // 3. Role check
  //    ✅ Backend sends role = "school_admin" — NOT "admin"
  //    Old code had ['admin'] which NEVER matched → always unauthorized
  if (allowedRoles?.length && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  // 4. Permission check
  //    school_admin bypasses this automatically inside hasPermission()
  if (permission && !hasPermission(permission)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default ProtectedRoute