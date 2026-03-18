import { ChevronRight, FileText, Globe, Target } from 'lucide-react'

const FEATURES = [
  {
    icon: Target,
    title: 'Intelligent AI Matching',
    description:
      'Our proprietary algorithm analyzes over 1,000 data points in your profile to deliver a 95%+ match scoring system, ensuring you only see the most relevant roles.',
  },
  {
    icon: FileText,
    title: 'ATS-Optimization Suite',
    description:
      'Built-in CV builder and AI proposal generator designed specifically to pass Applicant Tracking Systems and get your application into human hands.',
  },
  {
    icon: Globe,
    title: 'Global Project Sourcing',
    description:
      'We aggregate jobs from LinkedIn, Upwork, Toptal, and private company boards so you have a unified view of the global marketplace in one dashboard.',
  },
]

export default function FeaturesSection() {
  return (
    <section className="bg-muted py-32">
      <div className="max-w-7xl mx-auto px-8 flex flex-col items-center gap-20">
        <div className="flex flex-col items-center gap-4 max-w-4xl text-center">
          <h2 className="text-5xl font-bold text-foreground leading-none">
            Precision-Engineered Career Growth
          </h2>
          <p className="text-lg text-muted-foreground leading-7 max-w-2xl">
            We&apos;ve built the ultimate workspace for modern professionals to find, manage, and scale
            their freelance or full-time career.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="bg-background rounded-3xl p-8 shadow-marketing-card h-96 flex flex-col relative">
              <div className="w-14 h-14 rounded-2xl bg-[rgba(36,172,235,0.1)] flex items-center justify-center mb-6">
                <feature.icon size={28} className="text-sky-400" strokeWidth={2.3} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 leading-7">{feature.title}</h3>
              <p className="text-base text-muted-foreground leading-relaxed mb-8">{feature.description}</p>
              <button className="flex items-center gap-2 text-base font-semibold text-sky-400 mt-auto self-start">
                Learn more <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
