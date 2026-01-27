import { useState, useEffect } from 'react'
import { Users, Activity, TrendingUp, DollarSign } from 'lucide-react'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    growth: 0,
  })

  useEffect(() => {
    // TODO: Replace with actual API call
    // Abhi localStorage se data fetch kar rahe hain
    const mockStats = {
      totalUsers: 1250,
      activeUsers: 980,
      totalRevenue: 345000,
      growth: 23.5,
    }
    setStats(mockStats)
  }, [])

  return (
    <div className="ml-4 pt-4 px-6"> {/* Added padding for sidebar and navbar */}
      {/* Welcome */}
      <div className="mb-12 pt-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, Admin!</h1>
        <p className="text-gray-600">Here's your system overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Users</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</h3>
              <p className="text-sm mt-2 text-green-600 font-medium">+12% from last month</p>
            </div>
            <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center">
              <Users className="w-7 h-7 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Users</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.activeUsers}</h3>
              <p className="text-sm mt-2 text-green-600 font-medium">+8% from last month</p>
            </div>
            <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center">
              <Activity className="w-7 h-7 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">₹{stats.totalRevenue.toLocaleString()}</h3>
              <p className="text-sm mt-2 text-green-600 font-medium">+18% from last month</p>
            </div>
            <div className="bg-purple-100 w-14 h-14 rounded-full flex items-center justify-center">
              <DollarSign className="w-7 h-7 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Growth Rate</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.growth}%</h3>
              <p className="text-sm mt-2 text-green-600 font-medium">+5% from last month</p>
            </div>
            <div className="bg-orange-100 w-14 h-14 rounded-full flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-4 px-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <div>
              <p className="font-medium text-gray-900">New user registration</p>
              <p className="text-sm text-gray-500 mt-1">2 hours ago</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">New</span>
          </div>
          <div className="flex items-center justify-between py-4 px-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <div>
              <p className="font-medium text-gray-900">System backup completed</p>
              <p className="text-sm text-gray-500 mt-1">5 hours ago</p>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">System</span>
          </div>
          <div className="flex items-center justify-between py-4 px-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <div>
              <p className="font-medium text-gray-900">Payment received</p>
              <p className="text-sm text-gray-500 mt-1">1 day ago</p>
            </div>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">Payment</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard