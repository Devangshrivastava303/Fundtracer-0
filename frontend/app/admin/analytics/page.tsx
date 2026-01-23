"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  BarChart3,
  TrendingUp,
  Users,
  Heart,
  DollarSign,
} from "lucide-react"

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

export default function AdminAnalytics() {
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
      setError(err.message || "Failed to load analytics")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout currentPage="Analytics">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout currentPage="Analytics">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600 mt-1">Platform performance and user statistics</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Average Donation */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Avg Donation</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ₹
                  {stats?.total_donations
                    ? Math.round(
                        parseFloat(stats.total_amount_raised) / stats.total_donations
                      ).toLocaleString("en-IN")
                    : "0"}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          {/* Campaigns to Donation Ratio */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Avg Donations/Campaign</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.total_campaigns
                    ? (stats.total_donations / stats.total_campaigns).toFixed(1)
                    : "0"}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          {/* Funded Campaigns % */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Completion Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.active_campaigns && stats?.total_campaigns
                    ? Math.round((stats.active_campaigns / stats.total_campaigns) * 100)
                    : "0"}
                  %
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          {/* Pending Items */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending Reviews</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.pending_donations}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Last 30 Days Performance */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Last 30 Days Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Activity */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <p className="text-gray-700 font-medium">Total Donations (30 days)</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.activity_last_30_days}
                </p>
              </div>
              <Progress
                value={
                  stats?.total_donations
                    ? (stats.activity_last_30_days / stats.total_donations) * 100
                    : 0
                }
                className="h-2"
              />
              <p className="text-xs text-gray-500 mt-2">
                {stats?.total_donations
                  ? (
                      (stats.activity_last_30_days / stats.total_donations) *
                      100
                    ).toFixed(1)
                  : "0"}
                % of total donations
              </p>
            </div>

            {/* Amount */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <p className="text-gray-700 font-medium">Amount Raised (30 days)</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{parseFloat(stats?.total_amount_last_30_days || "0").toLocaleString("en-IN")}
                </p>
              </div>
              <Progress
                value={
                  stats?.total_amount_raised
                    ? (parseFloat(stats.total_amount_last_30_days) /
                        parseFloat(stats.total_amount_raised)) *
                      100
                    : 0
                }
                className="h-2"
              />
              <p className="text-xs text-gray-500 mt-2">
                {stats?.total_amount_raised
                  ? (
                      (parseFloat(stats.total_amount_last_30_days) /
                        parseFloat(stats.total_amount_raised)) *
                      100
                    ).toFixed(1)
                  : "0"}
                % of total raised
              </p>
            </div>
          </div>
        </Card>

        {/* User Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">User Statistics</h3>
          <div className="space-y-6">
            {/* Total Users */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium">Total Users</p>
                    <p className="text-sm text-gray-600">Active and inactive</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats?.total_users}</p>
              </div>
            </div>

            {/* Campaigns */}
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium">Campaigns</p>
                    <p className="text-sm text-gray-600">Active: {stats?.active_campaigns}</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats?.total_campaigns}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Summary Stats Table */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">Total Amount Raised</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{parseFloat(stats?.total_amount_raised || "0").toLocaleString("en-IN")}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">Total Donations</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total_donations}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">Active Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.active_campaigns}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">Platform Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total_users}</p>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}
