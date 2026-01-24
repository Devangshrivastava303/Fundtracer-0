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
import { LogIn } from "lucide-react"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSlider />
      <LiveStats />
      <SearchCategories />
      <HowItWorks />
      <FeaturedCampaigns />
      <WhyTransparency />
      <Testimonials />
      <FAQSection />
      <Footer />
    </main>
  )
}

