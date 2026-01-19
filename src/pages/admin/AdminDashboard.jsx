// import { motion } from 'framer-motion';
// import { Users, GraduationCap, BookOpen, DollarSign } from 'lucide-react';

// /**
//  * ============================================
//  * ADMIN DASHBOARD PAGE
//  * ============================================
//  * 
//  * Main dashboard for Admin users.
//  * Shows overview stats and quick actions.
//  */
// function AdminDashboard() {
//   // Sample stats data
//   const stats = [
//     { 
//       title: 'Total Users', 
//       value: '1,234', 
//       change: '+12%', 
//       icon: Users,
//       color: 'bg-primary/20 text-primary'
//     },
//     { 
//       title: 'Students', 
//       value: '856', 
//       change: '+8%', 
//       icon: GraduationCap,
//       color: 'bg-success/20 text-success'
//     },
//     { 
//       title: 'Teachers', 
//       value: '64', 
//       change: '+3%', 
//       icon: BookOpen,
//       color: 'bg-warning/20 text-warning'
//     },
//     { 
//       title: 'Revenue', 
//       value: '$45,230', 
//       change: '+18%', 
//       icon: DollarSign,
//       color: 'bg-accent/20 text-accent'
//     },
//   ];

//   return (
//     <div className="space-y-6">
//       {/* Page Header */}
//       <div>
//         <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
//         <p className="text-muted-foreground">Overview of your institution</p>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         {stats.map((stat, index) => (
//           <motion.div
//             key={stat.title}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: index * 0.1 }}
//             className="bg-card border border-border rounded-xl p-5"
//           >
//             <div className="flex items-start justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">{stat.title}</p>
//                 <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
//                 <p className="text-sm text-success mt-1">{stat.change} this month</p>
//               </div>
//               <div className={`p-3 rounded-lg ${stat.color}`}>
//                 <stat.icon className="h-5 w-5" />
//               </div>
//             </div>
//           </motion.div>
//         ))}
//       </div>

//       {/* Quick Info */}
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 0.4 }}
//         className="bg-card border border-border rounded-xl p-6"
//       >
//         <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
//         <p className="text-muted-foreground">
//           Welcome to the Admin Dashboard. As an admin, you have full access to all 
//           sections of the system. Use the sidebar to navigate between different modules.
//         </p>
//       </motion.div>
//     </div>
//   );
// }

// export default AdminDashboard;


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
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, Admin!</h1>
        <p className="text-gray-600 mt-2">Here's your system overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Users</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</h3>
              <p className="text-sm mt-2 text-green-600">+12% from last month</p>
            </div>
            <div className="bg-blue-500 w-14 h-14 rounded-full flex items-center justify-center">
              <Users className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Users</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.activeUsers}</h3>
              <p className="text-sm mt-2 text-green-600">+8% from last month</p>
            </div>
            <div className="bg-green-500 w-14 h-14 rounded-full flex items-center justify-center">
              <Activity className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">₹{stats.totalRevenue.toLocaleString()}</h3>
              <p className="text-sm mt-2 text-green-600">+18% from last month</p>
            </div>
            <div className="bg-purple-500 w-14 h-14 rounded-full flex items-center justify-center">
              <DollarSign className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Growth Rate</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.growth}%</h3>
              <p className="text-sm mt-2 text-green-600">+5% from last month</p>
            </div>
            <div className="bg-orange-500 w-14 h-14 rounded-full flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium text-gray-900">New user registration</p>
              <p className="text-sm text-gray-500">2 hours ago</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm">New</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium text-gray-900">System backup completed</p>
              <p className="text-sm text-gray-500">5 hours ago</p>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">System</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-900">Payment received</p>
              <p className="text-sm text-gray-500">1 day ago</p>
            </div>
            <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm">Payment</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
