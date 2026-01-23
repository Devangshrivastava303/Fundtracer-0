import CampaignsBrowser from "@/components/campaigns-browser"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function CampaignsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <CampaignsBrowser />
      <Footer />
    </main>
  )
}
