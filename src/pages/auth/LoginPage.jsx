// src/pages/auth/LoginPage.jsx
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  LogIn, 
  BookOpen, 
  Users, 
  Award, 
  TrendingUp 
} from 'lucide-react'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Get redirect path
  const from = location.state?.from?.pathname || '/admin'

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await login(email, password)

      if (result.success) {
        navigate(from, { replace: true })
      } else {
        setError(result.message || 'Login failed. Please try again.')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Full Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070')`,
          }}
        />
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-indigo-900/85 to-purple-900/90" />
        
        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-pink-500/10 animate-pulse" />
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Branding & Info */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-white space-y-8 hidden lg:block"
            >
              {/* Logo */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
                  <GraduationCap className="h-9 w-9 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">SchoolEdge</h1>
                  <p className="text-blue-200 text-sm">School Management System</p>
                </div>
              </div>

              {/* Main Heading */}
              <div className="space-y-4">
                <h2 className="text-5xl lg:text-6xl font-bold leading-tight">
                  Transform Your
                  <br />
                  <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                    Educational
                  </span>
                  <br />
                  Institution
                </h2>
                <p className="text-xl text-blue-100 max-w-lg">
                  A comprehensive platform to manage students, teachers, attendance, fees, and everything your institution needs.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                {[
                  { icon: Users, text: 'Manage Students & Teachers', color: 'from-blue-500 to-cyan-500' },
                  { icon: BookOpen, text: 'Track Attendance & Grades', color: 'from-purple-500 to-pink-500' },
                  { icon: Award, text: 'Handle Fees & Payments', color: 'from-orange-500 to-red-500' },
                  { icon: TrendingUp, text: 'Generate Reports & Analytics', color: 'from-green-500 to-emerald-500' },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                    className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all group"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-sm text-blue-100">{feature.text}</p>
                  </motion.div>
                ))}
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-4">
                {[
                  { label: 'Students', value: '10,000+' },
                  { label: 'Teachers', value: '500+' },
                  { label: 'Schools', value: '50+' },
                ].map((stat, index) => (
                  <div key={index}>
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <div className="text-blue-200 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right Side - Login Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full max-w-md mx-auto"
            >
              {/* Glass Morphism Card */}
              <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                {/* Card Header */}
                <div className="bg-gradient-to-br from-white/20 to-white/5 p-8 border-b border-white/10">
                  {/* Mobile Logo */}
                  <div className="lg:hidden flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/30">
                      <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">EduManage</div>
                      <div className="text-xs text-blue-200">School Management</div>
                    </div>
                  </div>

                  <h3 className="text-3xl font-bold text-white mb-2">Welcome Back</h3>
                  <p className="text-blue-100">Sign in to access your dashboard</p>
                </div>

                {/* Card Body */}
                <div className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Error Message */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-white text-sm backdrop-blur-xl"
                      >
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    )}

                    {/* Email Field */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-semibold text-white block">
                        Email Address
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-200 z-10" />
                          <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your Email"
                            required
                            className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-semibold text-white block">
                        Password
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-200 z-10" />
                          <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            className="w-full pl-12 pr-14 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-200 hover:text-white transition-colors z-10"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-blue-500/50 relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <>
                          <LogIn className="h-5 w-5" />
                          <span>Sign In</span>
                        </>
                      )}
                    </motion.button>
                  </form>

                  {/* API Testing Notice */}
                  <div className="mt-6 p-4 bg-amber-500/10 backdrop-blur-xl border border-amber-500/20 rounded-xl">
                    <div className="flex items-start gap-2">
                      <span className="text-2xl">⚡</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-amber-200 mb-1">
                          Admin Access Only
                        </p>
                        <p className="text-xs text-amber-100/80">
                          Only admin users can login to this dashboard. Other roles will be denied access.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Test Credentials */}
                  <details className="mt-4">
                    <summary className="text-xs text-blue-200 cursor-pointer hover:text-white transition-colors select-none">
                      View test credentials (for development)
                    </summary>
                    <div className="mt-3 space-y-2">
                      <div className="text-xs p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg">
                        <span className="text-blue-200">Admin:</span>{' '}
                        <span className="text-white font-mono">avi@abc.com / Avdi@123</span>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage