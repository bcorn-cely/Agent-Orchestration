import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { FeaturesGrid } from "@/components/features-grid"
import { StatsSection } from "@/components/stats-section"
import { UseCasesSection } from "@/components/use-cases-section"
import { CTASection } from "@/components/cta-section"
import { ChatbotWrapper } from "@/components/chatbot-wrapper"
import { ParallaxImageSection } from "@/components/parallax-image-section"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <StatsSection />
      <ParallaxImageSection
        src="/insurance-professionals-shaking-hands-in-modern-of.jpg"
        alt="Insurance professionals collaborating"
        objectPosition="center 30%"
        floorNumber="3"
        title="Collaboration at Every Level"
        subtitle="Bringing teams together for seamless insurance solutions"
      />
      <FeaturesGrid />
      <ParallaxImageSection
        src="/insurance-broker-consulting-with-clients-professio.jpg"
        alt="Insurance broker consulting with clients"
        speed={0.6}
        floorNumber="2"
        title="Expert Guidance, Every Step"
        subtitle="Personal consultation backed by intelligent automation"
      />
      <UseCasesSection />
      <CTASection />
      <ChatbotWrapper />
    </main>
  )
}
