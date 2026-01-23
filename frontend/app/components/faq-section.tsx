"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "What is TransparentFund?",
    answer:
      "TransparentFund is a milestone-based fundraising platform that ensures complete transparency in charitable giving. We verify NGOs, track fund usage, and provide donors with real-time updates on how their contributions create impact.",
  },
  {
    question: "How does donation tracking work?",
    answer:
      "When you donate, your funds are held securely and released to NGOs in stages as they complete verified milestones. You receive updates at each stage, including photos, invoices, and progress reports — all verified for authenticity.",
  },
  {
    question: "How are proofs verified?",
    answer:
      "We use a combination of AI technology and manual verification to ensure all proofs are authentic. Invoices are scanned for accuracy, photos are geo-tagged and timestamp verified, and milestone completions are validated by our team.",
  },
  {
    question: "Can I choose which campaign to support?",
    answer:
      "Yes! You can browse campaigns by category, search for specific causes or NGOs, and choose exactly where your donation goes. Each campaign page shows detailed information about the cause, NGO, and expected milestones.",
  },
  {
    question: "Are all NGOs on the platform verified?",
    answer:
      "Absolutely. Every NGO undergoes a rigorous verification process including document verification, background checks, and site visits before being listed on our platform. We only partner with legitimate, registered charitable organizations.",
  },
]

export function FAQSection() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">Everything you need to know about TransparentFund</p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-border">
              <AccordionTrigger className="text-left text-foreground hover:text-primary hover:no-underline py-5">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-5">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
