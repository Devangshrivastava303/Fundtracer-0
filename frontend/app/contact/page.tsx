"use client"

import { useState } from "react"
import { Mail, MessageSquare, Phone, MapPin, Send, ShieldCheck, CheckCircle2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function ContactPage() {
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate an API call
    setShowSuccess(true)
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-[#FDFDFF] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center animate-in zoom-in-95 duration-500">
          <div className="relative inline-block mb-8">
            {/* Pulsing background glow */}
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
            <div className="relative bg-white shadow-2xl shadow-blue-200 rounded-[2.5rem] p-8">
              <CheckCircle2 size={80} className="text-blue-600 mx-auto" strokeWidth={1.5} />
            </div>
          </div>
          
          <h2 className="text-4xl font-black tracking-tighter text-slate-900 mb-4">Message Received!</h2>
          <p className="text-slate-500 leading-relaxed mb-10">
            Thank you for reaching out to <span className="font-bold text-blue-600">FundTracer</span>. 
            Our team usually responds within 2 hours. Keep an eye on your inbox!
          </p>
          
          <Button 
            onClick={() => setShowSuccess(false)}
            variant="ghost" 
            className="text-slate-400 hover:text-blue-600 font-bold flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={18} /> Send another message
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFDFF] pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-blue-50 text-blue-600 border-none px-4 py-1 rounded-full font-bold uppercase text-[10px] tracking-widest">
            Support Lounge
          </Badge>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900">
            Let's start a <span className="text-blue-600 italic font-serif">conversation.</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT COLUMN: Contact Information */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
              <h3 className="text-2xl font-bold text-slate-900 mb-8">Reach out directly</h3>
              
              <div className="space-y-8">
                <div className="flex gap-5 group">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Email us</p>
                    <p className="text-lg font-bold text-slate-900">support@fundtracer.org</p>
                  </div>
                </div>

                <div className="flex gap-5 group">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Live Chat</p>
                    <p className="text-lg font-bold text-slate-900">Available 10am - 7pm IST</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Box */}
            <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
              <ShieldCheck className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:rotate-12 transition-transform duration-700" />
              <p className="text-sm font-medium opacity-80 mb-2">Verified Response</p>
              <h4 className="text-xl font-bold">98% Support Satisfaction</h4>
            </div>
          </div>

          {/* RIGHT COLUMN: The Form */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-slate-100 rounded-[3rem] p-10 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Your Name</label>
                    <input required type="text" placeholder="John Doe" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                    <input required type="email" placeholder="john@example.com" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Subject</label>
                  <select title="Subject" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all appearance-none">
                    <option>General Inquiry</option>
                    <option>NGO Verification Request</option>
                    <option>Donation Tracking Issue</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Message</label>
                  <textarea required rows={4} placeholder="Tell us how we can help..." className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all resize-none"></textarea>
                </div>

                <Button type="submit" className="w-full py-8 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black text-lg shadow-xl shadow-blue-200 transition-all flex gap-3">
                  <Send size={20} /> SEND MESSAGE
                </Button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}