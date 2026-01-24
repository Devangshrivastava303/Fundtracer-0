"use client"

import { useState, useEffect } from "react"
import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

const slides = [
  {
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070",
    title: "Transparent Giving,",
    subtitle: "Real-time Impact.",
    description: "Track your donation from your wallet to the hands of those in need with our AI-verified Tracer Protocol.",
    cta: "Start Donating",
    color: "from-blue-600/40"
  },
  {
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2070",
    title: "Educate the Future,",
    subtitle: "Verify the Change.",
    description: "Join 85+ verified NGOs providing education to underprivileged children across India.",
    cta: "View Campaigns",
    color: "from-emerald-600/40"
  },
  {
    image: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb8?q=80&w=2070",
    title: "Disaster Relief,",
    subtitle: "Immediate Action.",
    description: "When crisis hits, every second counts. Our protocol ensures emergency funds reach ground zero instantly.",
    cta: "Help in Crisis",
    color: "from-red-600/40"
  },
  {
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070",
    title: "Protecting Paws,",
    subtitle: "Vetted Mercy.",
    description: "Support animal shelters that provide 100% transparent medical and food reports for every rescue.",
    cta: "Save a Life",
    color: "from-orange-600/40"
  },
  {
    image: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?q=80&w=2070",
    title: "Medical Support,",
    subtitle: "Pure Transparency.",
    description: "Funding critical surgeries with digital proof of billing and hospital clearance records.",
    cta: "Donate for Health",
    color: "from-rose-600/40"
  }
]

export function HeroSlider() {
  const [current, setCurrent] = useState(0)

  // Auto-slide every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => setCurrent(current === slides.length - 1 ? 0 : current + 1)
  const prevSlide = () => setCurrent(current === 0 ? slides.length - 1 : current - 1)

  return (
    <section className="relative h-[95vh] min-h-[750px] w-full overflow-hidden bg-slate-950">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* Background Image with Ken Burns Effect */}
          <div 
            className={`absolute inset-0 bg-cover bg-center transition-transform duration-[8000ms] ease-linear ${
                index === current ? "scale-110" : "scale-100"
            }`}
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          
          {/* Dynamic Gradient Overlay based on slide color */}
          <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} via-slate-900/80 to-slate-950`} />
          
          {/* Content Area */}
          <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-center">
            <div className={`max-w-4xl transition-all duration-1000 delay-300 ${
              index === current ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
            }`}>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 w-fit px-4 py-1.5 rounded-full mb-8">
                <ShieldCheck className="text-blue-400" size={16} />
                <span className="text-white/90 text-[10px] font-black uppercase tracking-[0.2em]">Tracer Protocol Active</span>
              </div>
              
              <h1 className="text-6xl md:text-[100px] font-black text-white tracking-tighter leading-[0.85] mb-8">
                {slide.title} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40 italic font-serif">
                  {slide.subtitle}
                </span>
              </h1>
              
              <p className="text-slate-300 text-lg md:text-2xl max-w-2xl mb-12 leading-relaxed font-medium">
                {slide.description}
              </p>
              
              <div className="flex flex-wrap gap-5">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl px-12 py-9 text-xl font-black shadow-[0_20px_50px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-1">
                  {slide.cta} <ArrowRight className="ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 hover:border-white/40 transition-all rounded-2xl px-12 py-9 text-xl font-bold">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation: Bottom Bar */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-7xl px-6 flex items-center justify-between z-30">
        <div className="flex gap-4">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="group py-4"
            >
              <div className={`h-1 transition-all duration-500 rounded-full ${
                i === current ? "w-16 bg-blue-500" : "w-8 bg-white/20 group-hover:bg-white/40"
              }`} />
            </button>
          ))}
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={prevSlide}
            className="w-14 h-14 rounded-2xl border border-white/10 flex items-center justify-center text-white hover:bg-white/20 backdrop-blur-md transition-all group"
          >
            <ChevronLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={nextSlide}
            className="w-14 h-14 rounded-2xl border border-white/10 flex items-center justify-center text-white hover:bg-white/20 backdrop-blur-md transition-all group"
          >
            <ChevronRight size={28} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Side Vignette for depth */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-950 to-transparent z-20 pointer-events-none" />
    </section>
  )
}