"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, BadgeCheck } from "lucide-react"
import { cn } from "@/lib/utils"

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&h=800&fit=crop",
    category: "Education",
    categoryColor: "bg-blue-500",
    headline: "See Exactly Where Every Rupee Goes",
    subtitle: "Fund education with complete transparency. Track every milestone and see verified proof of impact.",
    campaign: {
      title: "Books for Rural Schools",
      ngo: "Education First Foundation",
      raised: 245000,
      goal: 500000,
      verified: true,
    },
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&h=800&fit=crop",
    category: "Healthcare",
    categoryColor: "bg-red-500",
    headline: "Healthcare That's Accountable",
    subtitle: "Support life-saving treatments with milestone-based fund releases and AI-verified proofs.",
    campaign: {
      title: "Heart Surgery for Children",
      ngo: "Care India Trust",
      raised: 780000,
      goal: 1000000,
      verified: true,
    },
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&h=800&fit=crop",
    category: "Child Welfare",
    categoryColor: "bg-purple-500",
    headline: "Transform a Child's Future",
    subtitle: "Every donation creates real impact. See geo-tagged photos and verified invoices.",
    campaign: {
      title: "Orphanage Nutrition Program",
      ngo: "Happy Kids NGO",
      raised: 156000,
      goal: 300000,
      verified: true,
    },
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&h=800&fit=crop",
    category: "Animal Welfare",
    categoryColor: "bg-amber-500",
    headline: "Protect Lives That Can't Speak",
    subtitle: "Fund animal rescues with real-time updates on shelter conditions and care provided.",
    campaign: {
      title: "Stray Animal Shelter",
      ngo: "Paws & Claws India",
      raised: 89000,
      goal: 150000,
      verified: true,
    },
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=1200&h=800&fit=crop",
    category: "Elder Care",
    categoryColor: "bg-teal-500",
    headline: "Dignity in Golden Years",
    subtitle: "Support elderly care homes with transparent tracking of meals, medicine, and daily care.",
    campaign: {
      title: "Senior Citizens Home",
      ngo: "Silver Care Foundation",
      raised: 320000,
      goal: 400000,
      verified: true,
    },
  },
]

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }, [])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }, [])

  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [isPaused, nextSlide])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <section
      className="relative h-[90vh] min-h-[600px] w-full overflow-hidden pt-16"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-all duration-1000 ease-in-out",
            index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105",
          )}
        >
          {/* Background Image */}
          <div
            className={cn("absolute inset-0 bg-cover bg-center", "backgroundImage")}
            style={{ "--bg-image": `url(${slide.image})` } as React.CSSProperties}
          />
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />

          {/* Content */}
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
            <div className="max-w-2xl">
              {/* Category Badge */}
              <div
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium text-primary-foreground mb-6",
                  slide.categoryColor,
                  index === currentSlide && "animate-slide-up category-badge",
                )}
              >
                {slide.category}
              </div>

              {/* Headline */}
              <h1
                className={cn(
                  "text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground mb-4 leading-tight text-balance",
                  index === currentSlide && "animate-slide-up",
                )}
                style={{ animationDelay: "0.2s" }}
              >
                {slide.headline}
              </h1>

              {/* Subtitle */}
              <p
                className={cn(
                  "text-lg sm:text-xl text-primary-foreground/80 mb-8 max-w-xl",
                  index === currentSlide && "animate-slide-up",
                )}
                style={{ animationDelay: "0.3s" }}
              >
                {slide.subtitle}
              </p>

              {/* CTAs */}
              <div
                className={cn("flex flex-wrap gap-4", index === currentSlide && "animate-slide-up")}
                style={{ animationDelay: "0.4s" }}
              >
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Explore Campaigns
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
                >
                  How It Works
                </Button>
              </div>
            </div>

            {/* Campaign Card - Hidden on mobile */}
            <div
              className={cn(
                "hidden lg:block absolute right-8 bottom-24 w-80",
                index === currentSlide && "animate-slide-up",
              )}
              style={{ animationDelay: "0.5s" }}
            >
              <div className="bg-card/90 backdrop-blur-md rounded-2xl p-5 shadow-2xl border border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium text-primary-foreground",
                      slide.categoryColor,
                    )}
                  >
                    {slide.category}
                  </span>
                  {slide.campaign.verified && (
                    <span className="flex items-center gap-1 text-xs text-accent">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-card-foreground mb-1">{slide.campaign.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{slide.campaign.ngo}</p>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn("h-full bg-primary rounded-full", index === currentSlide && "animate-progress")}
                      style={{ width: `${(slide.campaign.raised / slide.campaign.goal) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-card-foreground">{formatCurrency(slide.campaign.raised)}</span>
                  <span className="text-muted-foreground">of {formatCurrency(slide.campaign.goal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-background/20 backdrop-blur-sm rounded-full flex items-center justify-center text-primary-foreground hover:bg-background/30 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-background/20 backdrop-blur-sm rounded-full flex items-center justify-center text-primary-foreground hover:bg-background/30 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-all duration-300",
              index === currentSlide
                ? "bg-primary-foreground w-8"
                : "bg-primary-foreground/40 hover:bg-primary-foreground/60",
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
