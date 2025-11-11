import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { FeaturesGrid } from "@/components/features-grid"
import { StatsSection } from "@/components/stats-section"
import { ChatbotWrapper } from "@/components/chatbot-wrapper"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <StatsSection />
      <FeaturesGrid />
      <ChatbotWrapper />
    </main>
  )
}
