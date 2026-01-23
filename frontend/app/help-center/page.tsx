"use client"

import { Search, LifeBuoy, BookOpen, ShieldCheck, MessageCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

const categories = [
  {
    title: "Getting Started",
    icon: <BookOpen className="text-blue-600" />,
    description: "Learn how to create an account, donate, and track your first campaign.",
    links: ["How to donate?", "Creating an account", "Tracking your impact"],
    color: "bg-blue-50"
  },
  {
    title: "Trust & Safety",
    icon: <ShieldCheck className="text-emerald-600" />,
    description: "Our 'Tracer Protocol' and how we verify 85+ NGOs for your safety.",
    links: ["Verification process", "Refund policy", "Data privacy"],
    color: "bg-emerald-50"
  },
  {
    title: "NGO Partnerships",
    icon: <LifeBuoy className="text-indigo-600" />,
    description: "Resources for organizations looking to join our transparency network.",
    links: ["Onboarding guide", "Upload proof", "Payout schedules"],
    color: "bg-indigo-50"
  }
]

export default function HelpCenter() {
  return (
    <div className="min-h-screen bg-[#FDFDFF]">
      <Header />
      {/* 1. Header Section with Gradient Glow */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent -z-10" />
        
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 mb-6">
            How can we <span className="text-blue-600">help you?</span>
          </h1>
          
          {/* Mesmerizing Search Bar */}
          <div className="relative max-w-2xl mx-auto mt-10 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-10 group-focus-within:opacity-25 transition duration-500"></div>
            <div className="relative bg-white rounded-2xl border border-slate-200 shadow-xl shadow-blue-900/5 flex items-center p-2">
              <Search className="ml-4 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Search for articles (e.g. 'how to track donation')..." 
                className="w-full px-4 py-3 outline-none bg-transparent text-slate-700"
              />
              <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6">Search</Button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Category Grid */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat, i) => (
            <div key={i} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-500 group">
              <div className={`w-14 h-14 ${cat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                {cat.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{cat.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">{cat.description}</p>
              
              <ul className="space-y-3">
                {cat.links.map((link, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 cursor-pointer group/link">
                    <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" /> {link}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Contact Support "Floating Card" */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-slate-900 rounded-[3rem] p-10 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[80px] rounded-full" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4 text-white">Still have questions?</h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">Our support team is available 24/7 to help you with your donations or NGO verification.</p>
            <Button size="lg" className="bg-white text-slate-900 hover:bg-blue-50 rounded-2xl px-10 font-bold h-14">
              <MessageCircle className="mr-2" /> Chat with Support
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}