"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Edit2, Eye } from "lucide-react"

interface Campaign {
  id: string // UUID from backend
  title: string
  description: string
  goal_amount: string // Decimal comes as string from API
  raised_amount: string // Decimal comes as string from API
  campaign_type: string
  is_active: boolean
  created_at: string
  image?: string
  fundtracer_verified?: boolean
  created_by?: {
    id: number
    full_name: string
    email: string
  }
  category?: {
    id: number
    name: string
  }
  progress_percentage?: number
  donation_count?: number
}

export default function MyCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const accessToken = localStorage.getItem("access_token")
        const response = await fetch("http://127.0.0.1:8000/api/campaigns/?created_by=me", {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        })
        const data = await response.json()
        console.log("Campaigns API response:", data)
        
        // API returns paginated response with results array
        let allCampaigns = []
        if (data.results && Array.isArray(data.results)) {
          allCampaigns = data.results
        } else if (Array.isArray(data)) {
          allCampaigns = data
        } else if (data.data && Array.isArray(data.data)) {
          allCampaigns = data.data
        }
        
        console.log("Campaigns to set:", allCampaigns)
        setCampaigns(allCampaigns)
      } catch (error) {
        console.error("Error fetching campaigns:", error)
        setCampaigns([])
      } finally {
        setLoading(false)
      }
    }

    fetchCampaigns()
  }, [])

  const progressPercentage = (campaign: Campaign) => {
    const goal = parseFloat(campaign.goal_amount)
    const raised = parseFloat(campaign.raised_amount)
    return goal > 0 ? Math.min((raised / goal) * 100, 100) : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center mt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading campaigns...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background mt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Campaigns</h1>
          <Button
            onClick={() => router.push("/campaigns/create")}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Create Campaign
          </Button>
        </div>

        {campaigns.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">You haven't created any campaigns yet.</p>
            <Button
              onClick={() => router.push("/campaigns/create")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Start Your First Campaign
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {campaigns.map(campaign => (
              <Card key={campaign.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{campaign.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{campaign.description}</p>
                  </div>
                  <Badge variant={campaign.is_active ? "default" : "secondary"}>
                    {campaign.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Progress</span>
                      <span className="text-sm font-semibold">₹{campaign.raised_amount.toLocaleString()} / ₹{campaign.goal_amount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{ width: `${progressPercentage(campaign)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{progressPercentage(campaign).toFixed(1)}% funded</p>
                  </div>

                  {/* Campaign Type */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Type:</span>
                    <Badge variant="outline">{campaign.campaign_type}</Badge>
                  </div>

                  {/* Created Date */}
                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(campaign.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/campaigns/${campaign.id}`)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/campaigns/${campaign.id}/edit`)}
                    className="flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
