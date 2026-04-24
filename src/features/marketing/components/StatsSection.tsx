const STATS = [
  { value: '50,000+', label: 'ACTIVE PROFESSIONALS' },
  { value: '1M+', label: 'JOBS SCANNED DAILY' },
  { value: '85%', label: 'HIGHER REPLY RATE' },
  { value: '$120M+', label: 'FREELANCE EARNINGS' },
]

export default function StatsSection() {
  return (
    <section className="relative py-20 md:py-32 px-4 bg-slate-800 overflow-hidden">
      <div
        className="absolute inset-0 z-0 opacity-10"
        style={{ background: 'radial-gradient(51.77% 192.65% at 50% 50%, #24ACEB 0%, rgba(36, 172, 235, 0) 70%)' }}
      />

      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
        {STATS.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center justify-center h-24">
            <div className="text-4xl md:text-6xl font-extrabold text-white leading-none h-[60px] flex items-center text-center">
              {stat.value}
            </div>
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide mt-2">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
