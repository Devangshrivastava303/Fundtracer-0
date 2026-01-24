"use client"

import { useEffect, useRef, useState } from "react"
import { Heart, BarChart3, CheckCircle2 } from "lucide-react"

const animationStyles = `
  @keyframes slideInFromLeft {
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideInFromRight {
    from { opacity: 0; transform: translateX(30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes pulse-scale {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  .step-card-animate {
    animation: slideInFromLeft 0.6s ease-out forwards;
  }
  .step-icon-bounce {
    transition: all 0.3s ease;
  }
  .step-card:hover .step-icon-bounce {
    animation: pulse-scale 0.6s ease-in-out;
    transform: scale(1.1);
  }
`

const steps = [
  {
    icon: Heart,
    title: "Donate",
    description: "Choose a campaign and donate any amount. Your contribution goes to verified NGOs only.",
  },
  {
    icon: BarChart3,
    title: "Track Milestones",
    description: "Funds are released in stages as NGOs complete verified milestones. Full transparency.",
  },
  {
    icon: CheckCircle2,
    title: "See Verified Impact",
    description: "Receive geo-tagged photos, AI-verified invoices, and real impact updates.",
  },
]

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <>
      <style>{animationStyles}</style>
      <section ref={sectionRef} id="how-it-works" className="py-20 bg-muted/30 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance" style={{ opacity: isVisible ? 1 : 0, animation: isVisible ? 'slideInFromLeft 0.6s ease-out' : 'none' }}>How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto" style={{ opacity: isVisible ? 1 : 0, animation: isVisible ? 'slideInFromRight 0.6s ease-out 0.2s backwards' : 'none' }}>
              Three simple steps to make a difference with complete transparency
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Line */}
            <div className="absolute top-1/4 left-1/6 right-1/6 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent hidden md:block" />
            
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="step-card group relative bg-card rounded-2xl p-8 shadow-sm border border-border hover:shadow-lg hover:border-primary/20 hover:scale-105 transition-all duration-300 cursor-pointer"
                style={{
                  opacity: isVisible ? 1 : 0,
                  animation: isVisible ? `slideInFromLeft 0.6s ease-out ${index * 0.15}s` : 'none',
                }}
              >
              {/* Step Number */}
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg">
                {index + 1}
              </div>

              {/* Icon */}
              <div className="step-icon-bounce w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-all duration-300">
                <step.icon className="w-7 h-7 text-primary" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-card-foreground mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
    </>
  )
}
