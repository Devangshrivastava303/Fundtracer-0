import { ShieldCheck, Milestone, FileSearch, MapPin } from "lucide-react"

const features = [
  {
    icon: ShieldCheck,
    title: "Verified NGOs Only",
    description: "Every NGO goes through a rigorous verification process before joining our platform.",
  },
  {
    icon: Milestone,
    title: "Milestone-Based Release",
    description: "Funds are released in stages as NGOs complete verified milestones and deliverables.",
  },
  {
    icon: FileSearch,
    title: "AI-Verified Invoices",
    description: "All expense proofs are verified using AI to ensure authenticity and accuracy.",
  },
  {
    icon: MapPin,
    title: "Geo-Tagged Impact Photos",
    description: "See real photos from the ground with location data to verify impact.",
  },
]

export function WhyTransparency() {
  return (
    <section className="py-20 bg-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">Why Transparency Matters</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We believe every donor deserves to know exactly how their contribution creates impact
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md hover:border-primary/20 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-card-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}