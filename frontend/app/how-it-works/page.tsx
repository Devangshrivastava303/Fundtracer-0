import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HowItWorks } from "@/components/how-it-works"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "How It Works - Fundtracer",
  description: "Learn how Fundtracer brings transparency and trust to charitable giving with milestone-based funding and verified proof of impact.",
}

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="pt-20">
        <HowItWorks />
      </div>
      <Footer />
    </main>
  )
}
