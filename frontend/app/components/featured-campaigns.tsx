"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BadgeCheck, ChevronLeft, ChevronRight, Shield, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Campaign {
  id: string
  title: string
  image: string | null
  created_by: {
    first_name: string
  }
  category: {
    name: string
  }
  raised_amount: number
  goal_amount: number
  is_active: boolean
  fundtracer_verified: boolean
  progress_percentage: number
}

export function FeaturedCampaigns() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const itemsPerView = 3

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("http://127.0.0.1:8000/api/campaigns/")
        const data = await response.json()
        const campaignsData = data.data || (data.results && data.results.data) || data.results || data
        // Get first 6 campaigns for featured section
        setCampaigns(Array.isArray(campaignsData) ? campaignsData.slice(0, 6) : [])
      } catch (error) {
        console.error("Failed to fetch featured campaigns:", error)
        setCampaigns([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCampaigns()
  }, [])

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`
    }
    return `₹${(amount / 1000).toFixed(0)}K`
  }

  const nextSlide = () => {
    if (campaigns.length <= itemsPerView) return
    setCurrentIndex((prev) => (prev + 1 >= campaigns.length - itemsPerView + 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    if (campaigns.length <= itemsPerView) return
    setCurrentIndex((prev) => (prev - 1 < 0 ? Math.max(campaigns.length - itemsPerView, 0) : prev - 1))
  }

  if (isLoading) {
    return (
      <section id="campaigns" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    )
  }

  if (campaigns.length === 0) {
    return null
  }

  return (
    <section id="campaigns" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 text-balance">Featured Campaigns</h2>
            <p className="text-muted-foreground">Support verified causes making real impact</p>
          </div>
          <div className="hidden sm:flex gap-2">
            <Button variant="outline" size="icon" onClick={prevSlide} aria-label="Previous campaigns">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextSlide} aria-label="Next campaigns">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Carousel */}
        <div className="overflow-hidden">
          <div 
            className="flex gap-6 transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
          >
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="min-w-full sm:min-w-[calc(50%-12px)] lg:min-w-[calc(33.333%-16px)] flex-shrink-0"
              >
                <div className="group bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-xl hover:border-primary/20 transition-all duration-300">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={campaign.image || "/placeholder.svg"}
                      alt={campaign.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div
                      className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium text-white bg-blue-500"
                    >
                      {campaign.category.name}
                    </div>
                    {campaign.fundtracer_verified && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-green-100 dark:bg-green-900 backdrop-blur-sm rounded-full text-xs font-medium text-green-700 dark:text-green-100">
                        <Shield className="w-3 h-3" />
                        FundTracer Verified
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-card-foreground line-clamp-1">{campaign.title}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                      <span>{campaign.created_by.first_name || "Creator"}</span>
                      {campaign.is_active && <BadgeCheck className="w-4 h-4 text-primary" />}
                    </div>

                    {/* Progress */}
                    <div className="mb-3">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${campaign.progress_percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-card-foreground">{formatCurrency(campaign.raised_amount)}</span>
                        <span className="text-muted-foreground text-sm"> of {formatCurrency(campaign.goal_amount)}</span>
                      </div>
                      <span className="text-sm font-medium text-primary">
                        {Math.round(campaign.progress_percentage)}%
                      </span>
                    </div>

                    <Button  
                    onClick={() => router.push("/campaigns/")}
                    className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
                      Contribute Now
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex justify-center gap-2 mt-6 sm:hidden">
          <Button variant="outline" size="icon" onClick={prevSlide} aria-label="Previous campaigns">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextSlide} aria-label="Next campaigns">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" onClick={() => router.push('/campaigns')}>
            View All Campaigns
          </Button>
        </div>
      </div>
    </section>
  )
}
