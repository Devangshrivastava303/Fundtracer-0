"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Heart, MapPin, Target, TrendingUp, DollarSign, Users } from "lucide-react"
import Link from "next/link"

interface Campaign {
  id: string
  title: string
  description: string
  image?: string | null
  category: {
    id: number
    name: string
  }
  goal_amount: number
  raised_amount: number
  progress_percentage: number
  campaign_type: string
  created_by: {
    id: number
    full_name: string
    email: string
  }
  fundtracer_verified: boolean
  is_active: boolean
  donation_count: number
  goal_reached: boolean
  is_liked: boolean
  likes_count: number
  created_at: string
}

interface PaginatedResponse {
  count: number
  next: string | null
  previous: string | null
  results: Campaign[]
}

export default function WishlistPage() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Wait for hydration before accessing localStorage
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return

    const token = localStorage.getItem("access_token")
    const user = localStorage.getItem("user")
    
    console.log("Auth check - Token:", !!token, "User:", !!user)
    
    if (!token || !user) {
      console.log("No auth found, redirecting to login")
      router.push("/auth")
      return
    }

    fetchWishlist(1)
  }, [isHydrated])

  const fetchWishlist = async (page: number) => {
    try {
      setLoading(true)
      const token = localStorage.getItem("access_token")
      const user = localStorage.getItem("user")
      
      console.log("Fetching wishlist - Token:", !!token, "User:", !!user)
      
      if (!token || !user) {
        console.log("Token or user missing in fetchWishlist, redirecting")
        router.push("/auth")
        return
      }

      const response = await fetch(
        `http://127.0.0.1:8000/api/campaigns/wishlist/?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        console.error("API Error:", response.status, response.statusText)
        if (response.status === 401) {
          console.log("Unauthorized, clearing auth and redirecting")
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token")
          localStorage.removeItem("user")
          router.push("/auth")
          return
        }
        setCampaigns([])
        return
      }

      const data: PaginatedResponse = await response.json()
      console.log("Wishlist Response:", data)

      setCampaigns(data.results)
      setTotalCount(data.count)
      setTotalPages(Math.ceil(data.count / 10))
      setCurrentPage(page)
    } catch (error) {
      console.error("Error fetching wishlist:", error)
      setCampaigns([])
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFromWishlist = async (campaignId: string) => {
    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch(
        `http://127.0.0.1:8000/api/campaigns/${campaignId}/like/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (response.ok) {
        // Remove the campaign from the list
        setCampaigns(campaigns.filter((c) => c.id !== campaignId))
        setTotalCount(totalCount - 1)
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center mt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your wishlist...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 mt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-red-600" fill="currentColor" />
            <h1 className="text-4xl font-bold text-gray-900">My Wishlist</h1>
          </div>
          <p className="text-gray-600">
            {totalCount === 0
              ? "No campaigns in your wishlist yet"
              : `${totalCount} campaign${totalCount !== 1 ? "s" : ""} saved`}
          </p>
        </div>

        {/* Empty State */}
        {campaigns.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Start exploring campaigns and add them to your wishlist to keep track of causes you care about.
            </p>
            <Link
              href="/campaigns"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:shadow-lg transition"
            >
              Explore Campaigns
            </Link>
          </div>
        ) : (
          <>
            {/* Campaigns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Campaign Image */}
                  {campaign.image && (
                    <div className="relative h-48 bg-gray-200 overflow-hidden">
                      <img
                        src={campaign.image}
                        alt={campaign.title}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                      {campaign.fundtracer_verified && (
                        <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          ✓ Verified
                        </div>
                      )}
                    </div>
                  )}

                  {/* Campaign Info */}
                  <div className="p-6">
                    {/* Category Badge */}
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        {campaign.category.name}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {campaign.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {campaign.description}
                    </p>

                    {/* Stats */}
                    <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-bold text-blue-600">
                          {campaign.progress_percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(campaign.progress_percentage, 100)}%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-600">
                        <span>₹{campaign.raised_amount.toLocaleString()} raised</span>
                        <span>of ₹{campaign.goal_amount.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="space-y-2 mb-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{campaign.donation_count} donors</span>
                      </div>
                      {campaign.goal_reached && (
                        <div className="flex items-center gap-2 text-green-600">
                          <TrendingUp className="w-4 h-4" />
                          <span className="font-semibold">Goal Reached!</span>
                        </div>
                      )}
                    </div>

                    {/* Creator */}
                    <div className="text-xs text-gray-600 mb-4 pb-4 border-b border-gray-200">
                      <span className="text-gray-500">By</span>{" "}
                      <span className="font-semibold text-gray-900">
                        {campaign.created_by.full_name}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/campaigns/${campaign.id}`}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:shadow-lg transition text-center text-sm"
                      >
                        View Campaign
                      </Link>
                      <button
                        onClick={() => handleRemoveFromWishlist(campaign.id)}
                        className="px-4 py-2 bg-red-100 text-red-600 font-semibold rounded-lg hover:bg-red-200 transition text-sm flex items-center justify-center"
                        title="Remove from wishlist"
                      >
                        <Heart className="w-4 h-4" fill="currentColor" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => fetchWishlist(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => fetchWishlist(page)}
                      className={`px-3 py-2 rounded-lg transition ${
                        currentPage === page
                          ? "bg-blue-600 text-white font-semibold"
                          : "bg-white border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => fetchWishlist(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

