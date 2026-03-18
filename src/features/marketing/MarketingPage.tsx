import {
  CTASection,
  FeaturesSection,
  HeroSection,
  MarketingFooter,
  MarketingNavbar,
  PartnersSection,
  ResonanceSection,
  StatsSection,
} from './components'

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-muted font-sans flex flex-col relative w-full overflow-x-hidden">
      <MarketingNavbar />
      <HeroSection />
      <PartnersSection />
      <FeaturesSection />
      <StatsSection />
      <ResonanceSection />
      <CTASection />
      <MarketingFooter />
    </div>
  )
}
