"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Donation {
  id: string // UUID from backend
  campaign_title: string
  campaign: string // UUID reference
  amount: string // Decimal comes as string from API
  payment_method: string
  status: string
  is_anonymous: boolean
  transaction_id?: string
  message?: string
  created_at: string
  donor?: {
    id: number
    full_name: string
    email: string
  }
}

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [totalDonated, setTotalDonated] = useState(0)

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const accessToken = localStorage.getItem("access_token")
        if (!accessToken) {
          console.error("No access token found")
          return
        }
        
        const response = await fetch("http://127.0.0.1:8000/api/donations/my-donations/", {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        })
        
        if (!response.ok) {
          console.error("API Error:", response.status, response.statusText)
          setDonations([])
          setLoading(false)
          return
        }
        
        const data = await response.json()
        console.log("Raw Donations Response:", data)
        
        // Handle paginated response from Django REST Framework
        let donationsList: Donation[] = []
        
        // DRF pagination wraps data in 'results' key
        if (data.results && Array.isArray(data.results)) {
          donationsList = data.results
        } else if (Array.isArray(data)) {
          donationsList = data
        } else if (data.data && Array.isArray(data.data)) {
          donationsList = data.data
        }
        
        console.log("Processed donations list:", donationsList)
        
        setDonations(donationsList)
        const total = donationsList.length > 0
          ? donationsList.reduce((sum: number, d: Donation) => sum + parseFloat(String(d.amount)), 0)
          : 0
        setTotalDonated(total)
      } catch (error) {
        console.error("Error fetching donations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDonations()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center mt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading donations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background mt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Donations</h1>
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Total Donated</p>
              <p className="text-2xl font-bold">₹{totalDonated.toLocaleString()}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Total Donations</p>
              <p className="text-2xl font-bold">{donations.length}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Average Donation</p>
              <p className="text-2xl font-bold">₹{donations.length > 0 ? Math.round(totalDonated / donations.length) : 0}</p>
            </Card>
          </div>
        </div>

        {donations.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">You haven't made any donations yet.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {donations && donations.length > 0 && donations.map(donation => (
              <Card key={donation.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{donation.campaign_title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(donation.created_at).toLocaleDateString()}
                    </p>
                    {donation.message && (
                      <p className="text-sm mt-2 italic">"{donation.message}"</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">₹{parseFloat(String(donation.amount)).toLocaleString()}</p>
                    <Badge variant={donation.status === "COMPLETED" ? "default" : "secondary"} className="mt-2">
                      {donation.status}
                    </Badge>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Payment: {donation.payment_method.toUpperCase()}</span>
                  {donation.is_anonymous && <Badge variant="outline">Anonymous</Badge>}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
