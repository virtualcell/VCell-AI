"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  MessageSquare, 
  FileText, 
  Shield,
  Settings,
  Trash2
} from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user" | "moderator"
  status: "active" | "inactive" | "suspended"
  joinDate: string
  lastActive: string
  conversationsCount: number
  filesCount: number
}

interface DashboardStats {
  totalUsers: number
  totalConversations: number
  totalFiles: number
  newUsersThisMonth: number
  conversationsThisMonth: number
  todaysConversations: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalConversations: 0,
    totalFiles: 0,
    newUsersThisMonth: 0,
    conversationsThisMonth: 0,
    todaysConversations: 0
  })
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // Mock data - replace with actual API calls
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock stats data
        setStats({
          totalUsers: 1247,
          totalConversations: 5678,
          totalFiles: 234,
          newUsersThisMonth: 45,
          conversationsThisMonth: 1234,
          todaysConversations: 156
        })

        // Mock users data
        setUsers([
          {
            id: "1",
            name: "Michael Blinov",
            email: "michael.blinov@uchc.edu",
            role: "admin",
            status: "active",
            joinDate: "2024-01-15",
            lastActive: "2024-12-19T10:30:00Z",
            conversationsCount: 45,
            filesCount: 12
          },
          {
            id: "2",
            name: "Jim Schaff",
            email: "jim.schaff@uchc.edu",
            role: "admin",
            status: "active",
            joinDate: "2024-02-20",
            lastActive: "2024-12-19T09:15:00Z",
            conversationsCount: 67,
            filesCount: 18
          },
          {
            id: "3",
            name: "Zeke",
            email: "zeke@uchc.edu",
            role: "admin",
            status: "active",
            joinDate: "2024-03-10",
            lastActive: "2024-12-18T16:45:00Z",
            conversationsCount: 34,
            filesCount: 8
          },
          {
            id: "4",
            name: "Kacem",
            email: "kacem.mathlouthi@insat.ucar.tn",
            role: "user",
            status: "active",
            joinDate: "2024-01-05",
            lastActive: "2024-12-10T14:20:00Z",
            conversationsCount: 23,
            filesCount: 5
          },
          {
            id: "5",
            name: "Sarah Chen",
            email: "sarah.chen@uchc.edu",
            role: "user",
            status: "active",
            joinDate: "2024-04-12",
            lastActive: "2024-12-15T11:30:00Z",
            conversationsCount: 15,
            filesCount: 3
          },
          {
            id: "6",
            name: "David Rodriguez",
            email: "david.rodriguez@uchc.edu",
            role: "user",
            status: "active",
            joinDate: "2024-05-08",
            lastActive: "2024-12-18T13:45:00Z",
            conversationsCount: 28,
            filesCount: 7
          },
          {
            id: "7",
            name: "Emily Watson",
            email: "emily.watson@uchc.edu",
            role: "user",
            status: "active",
            joinDate: "2024-06-15",
            lastActive: "2024-12-19T08:30:00Z",
            conversationsCount: 12,
            filesCount: 2
          }
        ])
      } catch (err) {
        setError("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactive</Badge>
      case "suspended":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Suspended</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Admin</Badge>
      case "moderator":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Moderator</Badge>
      case "user":
        return <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">User</Badge>
      default:
        return <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">{role}</Badge>
    }
  }

  if (loading) return <div className="p-8 text-center">Loading admin dashboard...</div>
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto p-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-blue-900 flex items-center gap-3">
                <Shield className="h-8 w-8 text-blue-500" />
                Admin Dashboard
              </h1>
              <p className="text-slate-600 mt-2">Manage users, conversations, and system resources</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => window.open('/admin/knowledge-base', '_blank')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded border border-green-600 text-green-700 bg-white font-semibold shadow-sm transition-colors hover:bg-green-50"
              >
                <FileText className="h-4 w-4" /> Knowledge Base
              </Button>
              <Button
                onClick={() => window.open('/admin/settings', '_blank')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded border border-blue-600 text-blue-700 bg-white font-semibold shadow-sm transition-colors hover:bg-blue-50"
              >
                <Settings className="h-4 w-4" /> Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-lg border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{stats.totalUsers.toLocaleString()}</div>
              <div className="text-sm text-slate-600 mt-1">
                <span className="text-green-600">+{stats.newUsersThisMonth}</span> this month
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-500" />
                Total Conversations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{stats.totalConversations.toLocaleString()}</div>
              <div className="text-sm text-slate-600 mt-1">
                <span className="text-green-600">+{stats.conversationsThisMonth}</span> this month
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-500" />
                Total Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">{stats.totalFiles.toLocaleString()}</div>
              <div className="text-sm text-slate-600 mt-1">
                <span className="text-green-600">+12</span> this week
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-orange-500" />
                Today's Conversations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">{stats.todaysConversations.toLocaleString()}</div>
              <div className="text-sm text-slate-600 mt-1">
                <span className="text-green-600">+12%</span> from yesterday
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 border-b border-slate-200 px-6 py-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-extrabold text-blue-900 flex items-center gap-3">
                <Users className="h-6 w-6 text-blue-500" />
                User Management
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Conversations</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-700">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">{user.name}</div>
                            <div className="text-sm text-slate-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {user.conversationsCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {new Date(user.joinDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 