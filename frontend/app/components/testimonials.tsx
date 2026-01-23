"use client"

import { useEffect, useRef, useState } from "react"
import { Quote } from "lucide-react"
import { cn } from "@/lib/utils"

const testimonials = [
  {
    id: 1,
    quote:
      "For the first time, I could see exactly where my donation went. The milestone updates gave me confidence that my contribution was making a real difference.",
    name: "Priya Sharma",
    role: "Monthly Donor",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop",
  },
  {
    id: 2,
    quote:
      "TransparentFund has revolutionized how we receive donations. Donors trust us more because they can verify our work at every step.",
    name: "Rajesh Kumar",
    role: "NGO Partner - Education First",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  },
  {
    id: 3,
    quote:
      "The AI-verified invoices and geo-tagged photos made me feel like I was right there seeing the impact. This is how charity should work.",
    name: "Anita Desai",
    role: "Corporate Donor",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop",
  },
  {
    id: 4,
    quote:
      "As someone who was skeptical about online donations, TransparentFund changed my perspective completely. True transparency builds trust.",
    name: "Vikram Singh",
    role: "Regular Donor",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
  },
]

export function Testimonials() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">Trusted by Donors & NGOs</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Hear from our community of changemakers</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={cn(
                "bg-card rounded-2xl p-8 shadow-sm border border-border relative",
                isVisible && "animate-slide-up",
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Quote Icon */}
              <Quote className="absolute top-6 right-6 w-10 h-10 text-primary/10" />

              {/* Quote Text */}
              <p className="text-card-foreground leading-relaxed mb-6 relative z-10">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image || "/placeholder.svg"}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-card-foreground">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
