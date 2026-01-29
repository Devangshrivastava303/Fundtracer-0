"use client"

import { useEffect, useRef, useState } from "react"

interface ScrollAnimationProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function ScrollAnimation({ children, delay = 0, className = "" }: ScrollAnimationProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className={`${className} ${isVisible ? "animate-slide-up" : "opacity-0 translate-y-10"}`}
      style={{
        transition: "all 0.8s ease-out",
      }}
    >
      {children}
    </div>
  )
}

export function ParallaxScroll({ children, offset = 0.5 }: { children: React.ReactNode; offset?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [yOffset, setYOffset] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect()
        const scrolled = window.scrollY
        const elementPosition = scrolled + rect.top
        const windowHeight = window.innerHeight
        
        if (elementPosition < scrolled + windowHeight) {
          setYOffset((scrolled - elementPosition) * offset)
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [offset])

  return (
    <div ref={ref} style={{ transform: `translateY(${yOffset}px)` }}>
      {children}
    </div>
  )
}
