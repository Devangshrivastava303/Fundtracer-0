import { Header } from "@/components/header"
import { HeroSlider } from "@/components/hero-slider"
import { LiveStats } from "@/components/live-stats"
import { SearchCategories } from "@/components/search-categories"
import { HowItWorks } from "@/components/how-it-works"
import { FeaturedCampaigns } from "@/components/featured-campaigns"
import { WhyTransparency } from "@/components/why-transparency"
import { Testimonials } from "@/components/testimonials"
import { FAQSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"
import React from "react"

// Local inline TrustMeter component (fallback for missing module)
export function TrustMeter() {
  return (
    <section className="py-28 px-6">
      <div className="max-w-7xl mx-auto">
         <div className="bg-white rounded-[2.5rem] p-8 shadow">
           <h2 className="text-2xl font-semibold mb-4">Trust Meter</h2>
           <p className="text-slate-500">Scientific validation of the platform.</p>
         </div>
      </div>
    </section>
  )
}

export function ImpactFeed() {
  return (
    <section className="py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow">
          <h2 className="text-2xl font-semibold mb-4">Impact Feed</h2>
          <p className="text-slate-500">Latest impact updates will appear here.</p>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-[#a7b8e0]">
      
      <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />

      <div className="relative z-10">
        <Header />
        
        {/* HERO SECTION */}
        <section className="relative">
          <HeroSlider />
          <div className="max-w-7xl mx-auto px-6 relative z-30 py-12">
            <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-100 p-4 transition-transform hover:scale-[1.01] duration-500">
               <LiveStats />
            </div>
          </div>
        </section>

        {/* SEARCH SECTION */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <SearchCategories />
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-28 bg-slate-100/50 border-y border-slate-200/60 shadow-inner">
          <div className="max-w-7xl mx-auto px-6">
            <HowItWorks />
          </div>
        </section>

        {/* IMPACT FEED */}
        <ImpactFeed />

        {/* FEATURED CAMPAIGNS */}
        <section className="py-28 px-6">
          <div className="max-w-7xl mx-auto ">
             <FeaturedCampaigns />
          </div>
        </section>

        {/* TRUST METER (Scientific validation of the platform) */}
        <TrustMeter />

        {/* WHY TRANSPARENCY */}
        <section className="py-28 bg-slate-100/50 border-y border-slate-200/60 shadow-inner">
          {/* Fixed the background class syntax here to be valid Tailwind */}
          <div className="max-w-7xl mx-auto bg-violet-950/20 backdrop-blur-md rounded-[4rem] p-12 md:p-24 shadow-2xl relative overflow-hidden group p-12 md:p-24 shadow-2xl relative overflow-hidden group">
             <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full group-hover:bg-blue-500/20 transition-all duration-700" />
             
             <div className="relative z-10">
               <WhyTransparency />
             </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-28">
          <div className="max-w-7xl mx-auto px-6">
            <Testimonials />
          </div>
        </section>

        {/* FAQ */}
        <section className="py-28 bg-slate-100/50 border-y border-slate-200/60 shadow-inner">
          <div className="max-w-4xl mx-auto px-6">
            <FAQSection />
          </div>
        </section>

        <Footer />
      </div>
    </main>
  )
}