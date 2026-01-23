"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react"

interface Campaign {
  id: number
  title: string
  description: string
  target_amount: string
  current_amount: string
  status?: string
  fundtracer_verified: boolean
  is_active: boolean
  created_at: string
  created_by: {
    id: number
    full_name: string
    email: string
  }
  category?: {
    id: number
    name: string
  }
}

interface PaginatedResponse {
  count: number
  next: string | null
  previous: string | null
  results: Campaign[]
}

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [verifiedFilter, setVerifiedFilter] = useState<string>("")
  const [activeFilter, setActiveFilter] = useState<string>("")
  const [categoryFilter, setCategoryFilter] = useState<string>("")
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [categories, setCategories] = useState<Array<{id: number; name: string}>>([])

  useEffect(() => {
    fetchCampaigns()
    fetchCategories()
  }, [currentPage, verifiedFilter, activeFilter, categoryFilter])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      setError("")
      const accessToken = localStorage.getItem("access_token")

      const url = new URL("http://127.0.0.1:8000/api/admin/campaigns/")
      if (verifiedFilter) {
        url.searchParams.append("verified", verifiedFilter)
      }
      if (activeFilter) {
        url.searchParams.append("active", activeFilter)
      }
      if (categoryFilter) {
        url.searchParams.append("category", categoryFilter)
      }
      url.searchParams.append("page", currentPage.toString())

      const response = await fetch(url.toString(), {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch campaigns")
      }

      const data: PaginatedResponse = await response.json()
      setCampaigns(data.results)
      setTotalPages(Math.ceil(data.count / 20))
    } catch (err: any) {
      console.error("Error fetching campaigns:", err)
      setError(err.message || "Failed to load campaigns")
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const accessToken = localStorage.getItem("access_token")
      const response = await fetch("http://127.0.0.1:8000/api/campaigns/categories/", {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        console.log("Categories response:", result)
        // API returns data in { data: [...] } format
        const categoryData = Array.isArray(result.data) ? result.data : result
        setCategories(categoryData)
        console.log("Categories set:", categoryData)
      }
    } catch (err: any) {
      console.error("Error fetching categories:", err)
    }
  }

  const handleVerify = async (campaignId: number) => {
    try {
      setActionLoading(campaignId)
      const accessToken = localStorage.getItem("access_token")

      const response = await fetch(
        `http://127.0.0.1:8000/api/admin/campaigns/${campaignId}/verify/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error("Failed to verify campaign")
      }

      setSuccessMessage("Campaign verified successfully!")
      setTimeout(() => setSuccessMessage(""), 3000)
      fetchCampaigns()
    } catch (err: any) {
      console.error("Error verifying campaign:", err)
      setError(err.message || "Failed to verify campaign")
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (campaignId: number) => {
    try {
      setActionLoading(campaignId)
      const accessToken = localStorage.getItem("access_token")

      const response = await fetch(
        `http://127.0.0.1:8000/api/admin/campaigns/${campaignId}/reject/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error("Failed to reject campaign")
      }

      setSuccessMessage("Campaign rejected successfully!")
      setTimeout(() => setSuccessMessage(""), 3000)
      fetchCampaigns()
    } catch (err: any) {
      console.error("Error rejecting campaign:", err)
      setError(err.message || "Failed to reject campaign")
    } finally {
      setActionLoading(null)
    }
  }

  const getProgressPercentage = (campaign: Campaign) => {
    const target = parseFloat(campaign.target_amount)
    const current = parseFloat(campaign.current_amount)
    return target > 0 ? Math.min((current / target) * 100, 100) : 0
  }

  if (loading) {
    return (
      <AdminLayout currentPage="Campaigns">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout currentPage="Campaigns">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaigns Management</h1>
          <p className="text-gray-600 mt-1">Review and verify campaigns</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Filters */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Status
              </label>
              <select
                value={verifiedFilter}
                onChange={(e) => {
                  setVerifiedFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All</option>
                <option value="true">Verified</option>
                <option value="false">Unverified</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Active Status
              </label>
              <select
                value={activeFilter}
                onChange={(e) => {
                  setActiveFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={fetchCampaigns}
                variant="outline"
                className="w-full"
              >
                Refresh
              </Button>
            </div>
          </div>
        </Card>

        {/* Campaigns Grid */}
        <div className="grid gap-6">
          {campaigns.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-gray-500">No campaigns found</p>
            </Card>
          ) : (
            campaigns.map((campaign) => {
              const progress = getProgressPercentage(campaign)
              return (
                <Card key={campaign.id} className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {campaign.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          by {campaign.created_by.full_name}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge
                          className={
                            campaign.fundtracer_verified
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {campaign.fundtracer_verified ? "Verified" : "Unverified"}
                        </Badge>
                        <Badge
                          className={
                            campaign.is_active
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {campaign.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {campaign.description}
                    </p>

                    {/* Funding Progress */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Funding Progress
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          ₹{parseFloat(campaign.current_amount).toLocaleString("en-IN")} / ₹
                          {parseFloat(campaign.target_amount).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        {progress.toFixed(1)}% funded
                      </p>
                    </div>

                    {/* Meta Info */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Category</p>
                        <p className="font-medium text-gray-900">
                          {campaign.category?.name || "Uncategorized"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Created</p>
                        <p className="font-medium text-gray-900">
                          {new Date(campaign.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Creator Email</p>
                        <p className="font-medium text-gray-900">
                          {campaign.created_by.email}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    {!campaign.fundtracer_verified ? (
                      <div className="flex gap-3 pt-4 border-t">
                        <Button
                          onClick={() => handleVerify(campaign.id)}
                          disabled={actionLoading === campaign.id}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Verify Campaign
                        </Button>
                        <Button
                          onClick={() => handleReject(campaign.id)}
                          disabled={actionLoading === campaign.id}
                          variant="destructive"
                          className="flex-1"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center text-sm text-gray-500 pt-4 border-t">
                        Campaign already verified
                      </div>
                    )}
                  </div>
                </Card>
              )
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
