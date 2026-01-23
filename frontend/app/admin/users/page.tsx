"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Eye } from "lucide-react"

interface UserDetail {
  id: number
  full_name: string
  email: string
  role: "donor" | "ngo"
  is_active: boolean
  created_at: string
  donations_count?: number
  campaigns_count?: number
  total_donated?: string
}

interface PaginatedResponse {
  count: number
  next: string | null
  previous: string | null
  results: UserDetail[]
}

interface UserModal {
  isOpen: boolean
  user: UserDetail | null
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [roleFilter, setRoleFilter] = useState<string>("")
  const [selectedUser, setSelectedUser] = useState<UserModal>({
    isOpen: false,
    user: null,
  })
  const [userDetailLoading, setUserDetailLoading] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [currentPage, roleFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError("")
      const accessToken = localStorage.getItem("access_token")
      const userData = localStorage.getItem("user")

      if (!accessToken) {
        throw new Error("No authentication token found. Please log in.")
      }

      console.log("User data:", userData ? JSON.parse(userData) : "None")
      console.log("Access token:", accessToken ? `${accessToken.substring(0, 30)}...` : "None")

      const url = new URL("http://127.0.0.1:8000/api/admin/users/")
      if (roleFilter) {
        url.searchParams.append("role", roleFilter)
      }
      url.searchParams.append("page", currentPage.toString())

      console.log("Fetching from:", url.toString())

      const response = await fetch(url.toString(), {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      })

      console.log("Response status:", response.status)
      console.log("Response headers:", Object.fromEntries(response.headers))

      if (!response.ok) {
        const errorData = await response.text()
        console.error("Response status:", response.status)
        console.error("Response text:", errorData)
        throw new Error(
          `Failed to fetch users (${response.status}): ${errorData || "Unknown error"}`
        )
      }

      const data: PaginatedResponse = await response.json()
      console.log("Fetched users data:", data)
      setUsers(data.results)
      setTotalPages(Math.ceil(data.count / 20))
    } catch (err: any) {
      console.error("Error fetching users:", err)
      setError(err.message || "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const handleViewUser = async (userId: number) => {
    try {
      setUserDetailLoading(true)
      const accessToken = localStorage.getItem("access_token")

      const response = await fetch(
        `http://127.0.0.1:8000/api/admin/users/${userId}/`,
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.text()
        console.error("Response status:", response.status)
        console.error("Response text:", errorData)
        throw new Error(
          `Failed to fetch user details (${response.status}): ${errorData || "Unknown error"}`
        )
      }

      const data = await response.json()
      setSelectedUser({
        isOpen: true,
        user: data,
      })
    } catch (err: any) {
      console.error("Error fetching user:", err)
      setError(err.message || "Failed to load user details")
    } finally {
      setUserDetailLoading(false)
    }
  }

  const closeModal = () => {
    setSelectedUser({ isOpen: false, user: null })
  }

  if (loading) {
    return (
      <AdminLayout currentPage="Users">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout currentPage="Users">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-1">View and manage all platform users</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Filters */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Role
              </label>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Users</option>
                <option value="donor">Donors</option>
                <option value="ngo">NGOs</option>
              </select>
            </div>
            <Button
              onClick={fetchUsers}
              variant="outline"
            >
              Refresh
            </Button>
          </div>
        </Card>

        {/* Users Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {user.full_name}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          className={
                            user.role === "ngo"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }
                        >
                          {user.role === "ngo" ? "NGO" : "Donor"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          className={
                            user.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString()}
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

      {/* User Detail Modal */}
      {selectedUser.isOpen && selectedUser.user && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={closeModal}
        >
          <Card className="w-full max-w-md max-h-96 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedUser.user.full_name}
                  </h3>
                  <p className="text-gray-600 text-sm">{selectedUser.user.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </Button>
              </div>

              {/* Info */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {selectedUser.user.role === "ngo" ? "NGO" : "Donor"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge
                    className={
                      selectedUser.user.is_active
                        ? "bg-green-100 text-green-800 mt-1"
                        : "bg-gray-100 text-gray-800 mt-1"
                    }
                  >
                    {selectedUser.user.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {new Date(selectedUser.user.created_at).toLocaleDateString()}
                  </p>
                </div>

                {selectedUser.user.role === "donor" && (
                  <>
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-600">Total Donated</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        ₹{parseFloat(selectedUser.user.total_donated || "0").toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Donations</p>
                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {selectedUser.user.donations_count}
                      </p>
                    </div>
                  </>
                )}

                {selectedUser.user.role === "ngo" && (
                  <>
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-600">Active Campaigns</p>
                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {selectedUser.user.campaigns_count}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Total Raised</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        ₹{parseFloat(selectedUser.user.total_donated || "0").toLocaleString("en-IN")}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <Button onClick={closeModal} className="w-full">
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </AdminLayout>
  )
}
