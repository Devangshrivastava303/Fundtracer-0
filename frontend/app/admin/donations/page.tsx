"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react"

interface Donation {
  id: number
  campaign: {
    id: number
    title: string
  }
  donor: {
    id: number
    full_name: string
    email: string
  }
  amount: string
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED"
  created_at: string
  message?: string
  payment_method?: string
}

interface PaginatedResponse {
  count: number
  next: string | null
  previous: string | null
  results: Donation[]
}

export default function AdminDonations() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>("PENDING")
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    fetchDonations()
  }, [currentPage, statusFilter])

  const fetchDonations = async () => {
    try {
      setLoading(true)
      setError("")
      const accessToken = localStorage.getItem("access_token")

      if (!accessToken) {
        throw new Error("No authentication token found. Please log in.")
      }

      const url = new URL("http://127.0.0.1:8000/api/admin/donations/")
      if (statusFilter) {
        url.searchParams.append("status", statusFilter)
      }
      url.searchParams.append("page", currentPage.toString())

      const response = await fetch(url.toString(), {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error("Response status:", response.status)
        console.error("Response text:", errorData)
        throw new Error(
          `Failed to fetch donations (${response.status}): ${errorData || "Unknown error"}`
        )
      }

      const data: PaginatedResponse = await response.json()
      setDonations(data.results)
      setTotalPages(Math.ceil(data.count / 20))
    } catch (err: any) {
      console.error("Error fetching donations:", err)
      setError(err.message || "Failed to load donations")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (donationId: number) => {
    try {
      setActionLoading(donationId)
      const accessToken = localStorage.getItem("access_token")

      const response = await fetch(
        `http://127.0.0.1:8000/api/admin/donations/${donationId}/approve/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error("Failed to approve donation")
      }

      setSuccessMessage("Donation approved successfully!")
      setTimeout(() => setSuccessMessage(""), 3000)
      fetchDonations()
    } catch (err: any) {
      console.error("Error approving donation:", err)
      setError(err.message || "Failed to approve donation")
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (donationId: number) => {
    try {
      setActionLoading(donationId)
      const accessToken = localStorage.getItem("access_token")

      const response = await fetch(
        `http://127.0.0.1:8000/api/admin/donations/${donationId}/reject/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error("Failed to reject donation")
      }

      setSuccessMessage("Donation rejected successfully!")
      setTimeout(() => setSuccessMessage(""), 3000)
      fetchDonations()
    } catch (err: any) {
      console.error("Error rejecting donation:", err)
      setError(err.message || "Failed to reject donation")
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "FAILED":
        return "bg-red-100 text-red-800"
      case "REFUNDED":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <AdminLayout currentPage="Donations">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout currentPage="Donations">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Donations Management</h1>
          <p className="text-gray-600 mt-1">Review and manage all donations</p>
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
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
            <Button
              onClick={fetchDonations}
              variant="outline"
            >
              Refresh
            </Button>
          </div>
        </Card>

        {/* Donations Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Donation ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Donor
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {donations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No donations found
                    </td>
                  </tr>
                ) : (
                  donations.map((donation) => (
                    <tr key={donation.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        #{donation.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {donation.campaign.title}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-900">
                            {donation.donor.full_name}
                          </p>
                          <p className="text-gray-600">{donation.donor.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ₹{parseFloat(donation.amount).toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Badge className={getStatusColor(donation.status)}>
                          {donation.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(donation.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        {donation.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(donation.id)}
                              disabled={actionLoading === donation.id}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleReject(donation.id)}
                              disabled={actionLoading === donation.id}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {donation.status !== "PENDING" && (
                          <span className="text-gray-500 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-6 border-t">
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
        </Card>
      </div>
    </AdminLayout>
  )
}
