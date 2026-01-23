"use client"

import { HelpCircle, ShieldCheck, Wallet, RefreshCcw, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

const faqData = [
  {
    question: "How do I know my money reached the cause?",
    answer: "Every donation is tracked via our 'Tracer Protocol'. You receive geotagged photos and digital invoices directly in your dashboard once the NGO completes a milestone.",
    icon: <ShieldCheck className="text-emerald-500" />,
    color: "group-hover:border-emerald-500/50"
  },
  {
    question: "Are my donations tax-deductible?",
    answer: "Yes! All 85+ NGOs on Fundtracer are verified and provide 80G tax-exempt certificates which are automatically generated and sent to your email.",
    icon: <Wallet className="text-blue-500" />,
    color: "group-hover:border-blue-500/50"
  },
  {
    question: "What if the NGO fails to provide proof?",
    answer: "Our system uses milestone-based payouts. If an NGO fails to verify a stage with AI-checked proof, the remaining funds are held and can be re-routed or refunded.",
    icon: <RefreshCcw className="text-purple-500" />,
    color: "group-hover:border-purple-500/50"
  },
  {
    question: "How does the AI verification work?",
    answer: "We use computer vision to cross-reference uploaded receipts and photos against historical data and metadata to ensure they are unique and location-accurate.",
    icon: <HelpCircle className="text-orange-500" />,
    color: "group-hover:border-orange-500/50"
  }
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#FDFDFF]">
      <Header />
      <div className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-4 py-1 px-4 border-blue-200 bg-blue-50 text-blue-600 rounded-full font-bold uppercase text-[10px] tracking-widest">
              Common Questions
            </Badge>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 mb-6">
              Everything you <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent italic font-serif">need to know.</span>
            </h1>
            <p className="text-slate-500 text-lg">Transparent answers for a transparent platform.</p>
          </div>

          {/* FAQ Grid - The "Mesmerizing" Cards */}
          <div className="grid grid-cols-1 gap-6">
            {faqData.map((faq, i) => (
              <div 
                key={i} 
                className={`group relative bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-500 cursor-default ${faq.color}`}
              >
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
                    {faq.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {faq.question}
                    </h3>
                    <p className="text-slate-500 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
                
                {/* Subtle Decorative Arrow */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500 text-slate-300">
                  <ChevronRight size={24} />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-20 p-12 bg-blue-600 rounded-[3rem] text-center text-white shadow-2xl shadow-blue-200">
            <h2 className="text-2xl font-bold mb-2">Can't find your answer?</h2>
            <p className="opacity-80 mb-6">We're here to help you make an impact.</p>
            <Link href="/contact">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 hover:shadow-lg transition-all active:scale-95">
             Contact Support Team
           </button>
           </Link>
        </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}