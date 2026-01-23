"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Users, Target, Globe, Zap, Shield, Award } from 'lucide-react';

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition font-medium"
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
              About FundTracer
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Empowering change through transparent, verified crowdfunding. We believe in the power of community to solve real problems.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Mission Section */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Our Mission</h2>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-lg text-gray-700 leading-relaxed">
                FundTracer exists to democratize fundraising and make a real difference in people's lives. We connect compassionate donors with vetted campaigns that create meaningful impact across healthcare, education, emergency relief, and community development.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Our platform combines cutting-edge technology with human values to ensure every donation counts and reaches those who need it most.
              </p>
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">500+</div>
                  <div className="text-sm text-gray-600 mt-2">Active Campaigns</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">₹50L+</div>
                  <div className="text-sm text-gray-600 mt-2">Funds Raised</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">10K+</div>
                  <div className="text-sm text-gray-600 mt-2">Donors</div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white">
              <Heart className="w-16 h-16 mb-4 opacity-80" />
              <h3 className="text-2xl font-bold mb-4">Driven by Impact</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Transparent verification of all campaigns</span>
                </li>
                <li className="flex items-start gap-3">
                  <Users className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Direct support from verified beneficiaries</span>
                </li>
                <li className="flex items-start gap-3">
                  <Target className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Real-time tracking of campaign progress</span>
                </li>
                <li className="flex items-start gap-3">
                  <Zap className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Fast, secure donation processing</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">Our Core Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Heart,
                title: "Compassion",
                desc: "We care deeply about the causes and communities we serve"
              },
              {
                icon: Shield,
                title: "Integrity",
                desc: "Every campaign is verified and transparent from start to finish"
              },
              {
                icon: Globe,
                title: "Inclusivity",
                desc: "We believe everyone deserves the chance to make a difference"
              },
              {
                icon: Award,
                title: "Excellence",
                desc: "We continuously improve to serve our community better"
              }
            ].map((value, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition">
                <value.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">How FundTracer Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                num: "1",
                title: "Campaigns Are Verified",
                desc: "Our team thoroughly verifies every campaign to ensure legitimacy and impact potential"
              },
              {
                num: "2",
                title: "Donors Contribute",
                desc: "Browse verified campaigns and donate securely to causes you believe in"
              },
              {
                num: "3",
                title: "Impact Happens",
                desc: "Track your donation's impact with real-time updates as campaigns achieve their goals"
              }
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg mb-4">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-6 -right-4 transform translate-x-8">
                    <div className="text-4xl text-blue-200">→</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Our Team</h2>
          <p className="text-lg text-gray-700 mb-12">
            FundTracer is powered by a passionate team of designers, developers, and fundraising experts committed to making a difference. We work tirelessly to ensure that every donation has maximum impact.
          </p>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Make an Impact?</h2>
          <p className="text-lg mb-8 opacity-90">
            Start supporting verified campaigns and help build a better future
          </p>
          <button
            onClick={() => router.push('/campaigns')}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Explore Campaigns
          </button>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">FundTracer</h3>
              <p className="text-gray-400">Empowering change through transparent crowdfunding</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/campaigns" className="hover:text-white transition">Campaigns</a></li>
                <li><a href="/about" className="hover:text-white transition">About Us</a></li>
                <li><a href="/contact" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Learn</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/faqs" className="hover:text-white transition">FAQs</a></li>
                <li><a href="/help-center" className="hover:text-white transition">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition">Facebook</a></li>
                <li><a href="#" className="hover:text-white transition">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 FundTracer. All rights reserved. | Transparency. Trust. Impact.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
