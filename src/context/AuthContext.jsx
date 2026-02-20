// import { createContext, useContext, useEffect, useState } from 'react'
// import { authService } from '../services/authService'

// // Simple auth context that only cares about the token
// const AuthContext = createContext(null)
// const TOKEN_KEY = 'auth_token'

// export function AuthProvider({ children }) {
//   const [isLoading, setIsLoading] = useState(true)
//   const [isLoggedIn, setIsLoggedIn] = useState(false)

//   // Check token on first render
//   useEffect(() => {
//     const storedToken = localStorage.getItem(TOKEN_KEY)
//     setIsLoggedIn(!!storedToken)
//     setIsLoading(false)
//   }, [])

//   // Login: call API, store token, set state
//   const login = async (email, password) => {
//     try {
//       setIsLoading(true)
//       const result = await authService.login(email, password)

//       if (result?.success && result?.token) {
//         localStorage.setItem(TOKEN_KEY, result.token)
//         setIsLoggedIn(true)
//         return { success: true }
//       }

//       return { success: false, message: result?.error || result?.message || 'Login failed' }
//     } catch (error) {
//       console.error('Login error:', error)
//       return { success: false, message: 'Could not login. Try again.' }
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   // Logout: drop token and flag as logged out
//   const logout = () => {
//     localStorage.removeItem(TOKEN_KEY)
//     setIsLoggedIn(false)
//   }

//   return (
//     <AuthContext.Provider
//       value={{
//         isLoggedIn,
//         isLoading,
//         login,
//         logout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   )
// }

// export function useAuth() {
//   const context = useContext(AuthContext)
//   if (!context) throw new Error('useAuth must be used inside AuthProvider')
//   return context
// }



import { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)
const TOKEN_KEY = 'auth_token'

export function AuthProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)

  // Check token + user on first render
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    const storedUser = localStorage.getItem('user')

    if (storedToken) {
      setIsLoggedIn(true)
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch {
          setUser(null)
        }
      }
    }
    setIsLoading(false)
  }, [])

  // Login: call API, store token + user, set state
  const login = async (email, password) => {
    try {
      setIsLoading(true)
      const result = await authService.login(email, password)

      if (result?.success && result?.token) {
        localStorage.setItem(TOKEN_KEY, result.token)
        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user))
          setUser(result.user)
        }
        setIsLoggedIn(true)
        return { success: true }
      }

      return { success: false, message: result?.error || result?.message || 'Login failed' }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'Could not login. Try again.' }
    } finally {
      setIsLoading(false)
    }
  }

  // Logout: drop token, user and flag as logged out
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isLoading,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}