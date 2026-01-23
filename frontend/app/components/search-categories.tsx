"use client"

import { useState } from "react"
import { Search, GraduationCap, HeartPulse, Baby, Users, PawPrint, AlertTriangle, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const categories = [
  { icon: GraduationCap, label: "Education", color: "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200" },
  { icon: HeartPulse, label: "Health", color: "hover:bg-red-50 hover:text-red-600 hover:border-red-200" },
  { icon: Baby, label: "Children", color: "hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200" },
  { icon: Users, label: "Elderly", color: "hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200" },
  { icon: PawPrint, label: "Animal Welfare", color: "hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200" },
  {
    icon: AlertTriangle,
    label: "Emergency",
    color: "hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200",
  },
  { icon: Sparkles, label: "Other Causes", color: "hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200" },
]

export function SearchCategories() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for Campaigns or NGOs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6 text-base rounded-xl border-border bg-card shadow-sm focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <button
              key={category.label}
              onClick={() => setSelectedCategory(selectedCategory === category.label ? null : category.label)}
              className={cn(
                "inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border bg-card text-foreground text-sm font-medium transition-all duration-200",
                category.color,
                selectedCategory === category.label && "ring-2 ring-primary ring-offset-2",
              )}
            >
              <category.icon className="w-4 h-4" />
              {category.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
