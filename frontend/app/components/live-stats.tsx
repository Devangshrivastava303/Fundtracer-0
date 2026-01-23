"use client"

import { useEffect, useState, useRef } from "react"
import { IndianRupee, Target, Building2, FileCheck } from "lucide-react"

const stats = [
  {
    icon: IndianRupee,
    value: 15750000,
    suffix: "",
    prefix: "₹",
    label: "Total Funds Raised",
    color: "from-blue-600 to-cyan-500", // Vibrant Blue
    shadow: "shadow-blue-200",
  },
  {
    icon: Target,
    value: 342,
    suffix: "+",
    prefix: "",
    label: "Active Campaigns",
    color: "from-rose-500 to-pink-500", // Soft Red/Pink
    shadow: "shadow-rose-200",
  },
  {
    icon: Building2,
    value: 85,
    suffix: "+",
    prefix: "",
    label: "NGOs Trusted",
    color: "from-indigo-600 to-purple-500", // Deep Purple
    shadow: "shadow-indigo-200",
  },
  {
    icon: FileCheck,
    value: 12500,
    suffix: "+",
    prefix: "",
    label: "Verified Proofs Shared",
    color: "from-emerald-500 to-teal-500", // Trust Green
    shadow: "shadow-emerald-200",
  },
]

function AnimatedCounter({ value, prefix, suffix }: { value: number; prefix: string; suffix: string }) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
    }, { threshold: 0.1 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return
    const duration = 2000
    const steps = 60
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [isVisible, value])

  const formatNumber = (num: number) => {
    if (num >= 10000000) return (num / 10000000).toFixed(1) + " Cr"
    if (num >= 100000) return (num / 100000).toFixed(1) + " L"
    return new Intl.NumberFormat("en-IN").format(num)
  }

  return (
    <div ref={ref} className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter">
      {prefix}{formatNumber(count)}{suffix}
    </div>
  )
}

export function LiveStats() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-2">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            className="group relative bg-white rounded-[2rem] p-6 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-2 border border-slate-100/50"
          >
            {/* Subtle Gradient Glow on Hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-[0.02] rounded-[2rem] transition-opacity duration-500`} />
            
            <div className="flex items-center gap-4">
              {/* Icon with Glowing Box */}
              <div className={`flex-shrink-0 w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg ${stat.shadow} group-hover:scale-110 transition-transform duration-500`}>
                <stat.icon size={24} strokeWidth={2.5} />
              </div>

              {/* Text Area */}
              <div className="flex flex-col">
                <AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                  {stat.label}
                </p>
              </div>
            </div>

            {/* Bottom Accent Line */}
            <div className={`absolute bottom-3 left-6 right-6 h-1 bg-gradient-to-r ${stat.color} rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 scale-x-0 group-hover:scale-x-100 origin-left`} />
          </div>
        ))}
      </div>
    </div>
  )
}