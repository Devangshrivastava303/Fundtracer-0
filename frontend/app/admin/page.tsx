"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Heart, FileText, DollarSign, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  total_users: number
  total_campaigns: number
  total_donations: number
  total_amount_raised: string
  active_campaigns: number
  pending_donations: number
  activity_last_30_days: number
  total_amount_last_30_days: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const accessToken = localStorage.getItem("access_token")

      const response = await fetch("http://127.0.0.1:8000/api/admin/stats/", {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch stats")
      }

      const data = await response.json()
      setStats(data)
    } catch (err: any) {
      console.error("Error fetching stats:", err)
      setError(err.message || "Failed to load dashboard stats")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout currentPage="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout currentPage="Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome to FundTracer Admin Panel</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.total_users}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          {/* Total Campaigns */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Campaigns</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.total_campaigns}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          {/* Total Donations */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Donations</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.total_donations}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>

          {/* Amount Raised */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Raised</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ₹{parseFloat(stats?.total_amount_raised || "0").toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active Campaigns */}
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Active Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.active_campaigns}</p>
              </div>
            </div>
          </Card>

          {/* Pending Donations */}
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Pending Donations</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.pending_donations}</p>
              </div>
            </div>
          </Card>

          {/* 30-Day Activity */}
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-100 p-3 rounded-lg">
                <Heart className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Last 30 Days Donations</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.activity_last_30_days}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/admin/donations">
              <Button className="w-full bg-red-600 hover:bg-red-700">
                <Heart className="w-4 h-4 mr-2" />
                Review Pending Donations ({stats?.pending_donations})
              </Button>
            </Link>
            <Link href="/admin/campaigns">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                <FileText className="w-4 h-4 mr-2" />
                Manage Campaigns ({stats?.total_campaigns})
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Users className="w-4 h-4 mr-2" />
                View Users ({stats?.total_users})
              </Button>
            </Link>
            <Button
              onClick={fetchStats}
              variant="outline"
              className="w-full"
            >
              Refresh Stats
            </Button>
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}
