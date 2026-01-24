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
import { ScrollAnimation } from "@/components/scroll-animations"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <HeroSlider />
      
      <ScrollAnimation>
        <LiveStats />
      </ScrollAnimation>
      
      <ScrollAnimation delay={100}>
        <SearchCategories />
      </ScrollAnimation>
      
      <ScrollAnimation delay={150}>
        <HowItWorks />
      </ScrollAnimation>
      
      <ScrollAnimation delay={200}>
        <FeaturedCampaigns />
      </ScrollAnimation>
      
      <ScrollAnimation delay={250}>
        <WhyTransparency />
      </ScrollAnimation>
      
      <ScrollAnimation delay={300}>
        <Testimonials />
      </ScrollAnimation>
      
      <ScrollAnimation delay={350}>
        <FAQSection />
      </ScrollAnimation>
      
      <Footer />
    </main>
  )
}

