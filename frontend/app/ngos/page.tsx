"use client"

import { useState, useMemo } from "react"
import { Search, ShieldCheck, MapPin, Filter, Star, Info, SearchX } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"


// 1. Expanded Data Structure
const INITIAL_NGOS = [
  {
    name: "Education First Foundation",
    category: "Education",
    location: "Patna, Bihar",
    fundsRaised: "₹45L+",
    proofs: "1,200+",
    impact: "15k+ Students",
    logo: "EF",
    color: "bg-blue-600"
  },
  {
    name: "HealthCare India",
    category: "Healthcare",
    location: "Nagpur, Maharashtra",
    fundsRaised: "₹82L+",
    proofs: "3,500+",
    impact: "50k+ Patients",
    logo: "HC",
    color: "bg-rose-500"
  },
  {
    name: "GreenEarth Society",
    category: "Environment",
    location: "Bengaluru, Karnataka",
    fundsRaised: "₹12L+",
    proofs: "850+",
    impact: "10k+ Trees",
    logo: "GE",
    color: "bg-emerald-500"
  },
  {
    name: "Paws & Tail Rescue",
    category: "Animal Welfare",
    location: "Pune, Maharashtra",
    fundsRaised: "₹8.5L+",
    proofs: "420+",
    impact: "1,200+ Rescues",
    logo: "PT",
    color: "bg-orange-500"
  },
  {
    name: "Silver Years Trust",
    category: "Elderly Care",
    location: "Chandigarh, Punjab",
    fundsRaised: "₹22L+",
    proofs: "600+",
    impact: "500+ Seniors",
    logo: "SY",
    color: "bg-purple-600"
  },
  {
    name: "PureFlow Water Initiative",
    category: "Water & Sanitation",
    location: "Jodhpur, Rajasthan",
    fundsRaised: "₹31L+",
    proofs: "1,100+",
    impact: "25+ Villages",
    logo: "PW",
    color: "bg-cyan-500"
  },
  {
    name: "Bharat Relief Corps",
    category: "Disaster Relief",
    location: "Guwahati, Assam",
    fundsRaised: "₹1.2 Cr+",
    proofs: "5,000+",
    impact: "200k+ Families",
    logo: "BR",
    color: "bg-red-600"
  },
  {
    name: "Wings of Change",
    category: "Women Empowerment",
    location: "Lucknow, Uttar Pradesh",
    fundsRaised: "₹18L+",
    proofs: "940+",
    impact: "3k+ Entrepreneurs",
    logo: "WC",
    color: "bg-fuchsia-500"
  },
  {
    name: "Bright Future Labs",
    category: "Skill Development",
    location: "Hyderabad, Telangana",
    fundsRaised: "₹27L+",
    proofs: "1,450+",
    impact: "8k+ Youth",
    logo: "BF",
    color: "bg-amber-500"
  }
]

const CATEGORIES = ["All", "Education", "Healthcare", "Environment", "Animal Welfare", "Elderly Care", "Women Empowerment", "Disaster Relief"];

export default function NGOsDirectory() {
  const [searchQuery, setSearchQuery] = useState("")

  // Filtering Logic
  const filteredNgos = useMemo(() => {
    return INITIAL_NGOS.filter((ngo) => {
      const searchStr = searchQuery.toLowerCase()
      return (
        ngo.name.toLowerCase().includes(searchStr) ||
        ngo.category.toLowerCase().includes(searchStr) ||
        ngo.location.toLowerCase().includes(searchStr)
      )
    })
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-[#FDFDFF] pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-blue-50 text-blue-600 border-none px-4 py-1 rounded-full font-bold uppercase text-[10px] tracking-widest">
              Verified Partners
            </Badge>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 leading-[0.9]">
              Trusted <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent italic font-serif">Organizations.</span>
            </h1>
            <p className="mt-6 text-slate-500 text-lg leading-relaxed">
              Find and support verified NGOs. Every organization here has a track record of radical honesty.
            </p>
          </div>
          
          {/* Functional Search Bar */}
          <div className="w-full md:w-auto flex gap-3">
            <div className="relative group flex-grow md:w-80">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${searchQuery ? 'text-blue-600' : 'text-slate-400'}`} size={18} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, cause, or city..." 
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all shadow-sm"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    ×
                  </button>
                )}
            </div>
            <Button variant="outline" className="h-full px-6 rounded-2xl border-slate-200 text-slate-600 font-bold">
              <Filter size={18} className="mr-2" /> Filters
            </Button>
          </div>
        </div>

        {/* NEW: Filter Pills Section */}
        <div className="flex flex-wrap gap-2 mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSearchQuery(cat === "All" ? "" : cat)}
              className={`px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 border ${
                (searchQuery === cat || (cat === "All" && searchQuery === ""))
                  ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-105"
                  : "bg-white border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results Section */}
        {filteredNgos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in duration-700">
            {filteredNgos.map((ngo, i) => (
              <div key={i} className="group relative bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2">
                {/* Header: Logo & Verification */}
                <div className="flex justify-between items-start mb-8">
                  <div className={`w-16 h-16 ${ngo.color} rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-current/20`}>
                    {ngo.logo}
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                      <ShieldCheck size={12} /> Verified
                    </div>
                    <div className="mt-2 flex gap-0.5">
                      {[1,2,3,4,5].map(s => <Star key={s} size={12} className="fill-blue-500 text-blue-500" />)}
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{ngo.name}</h3>
                  <div className="flex items-center gap-3 text-slate-400 text-sm mt-2">
                     <span className="flex items-center gap-1 font-medium"><MapPin size={14} /> {ngo.location}</span>
                     <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                     <span className="font-medium">{ngo.category}</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50 mb-8">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Raised</p>
                    <p className="text-lg font-bold text-slate-900">{ngo.fundsRaised}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Proofs</p>
                    <p className="text-lg font-bold text-slate-900">{ngo.proofs}</p>
                  </div>
                </div>

                <Button className="w-full py-6 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-200 transition-all">
                  Support this NGO
                </Button>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-50 rounded-full mb-6">
              <SearchX size={40} className="text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">No NGOs found</h3>
            <p className="text-slate-500 mt-2">Try searching for a different name, city, or cause.</p>
            <Button 
              variant="link" 
              onClick={() => setSearchQuery("")}
              className="mt-4 text-blue-600 font-bold"
            >
              Clear all searches
            </Button>
          </div>
        )}

        {/* NGO Call to Action Card */}
        <div className="mt-24 bg-[#0F172A] rounded-[4rem] p-12 md:p-20 relative overflow-hidden text-center md:text-left">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="max-w-xl">
                <h2 className="text-4xl font-bold text-white mb-6">Represent an NGO?</h2>
                <p className="text-slate-400 text-lg leading-relaxed">
                  Join the Fundtracer network to showcase your impact and unlock more funding through verified transparency.
                </p>
              </div>
              <Button className="bg-white text-slate-900 hover:bg-blue-50 px-10 py-8 rounded-2xl font-black text-lg h-auto">
                Apply for Verification
              </Button>
            </div>
        </div>
      </div>
    </div>
  )
}