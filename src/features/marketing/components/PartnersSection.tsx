export default function PartnersSection() {
  return (
    <section className="bg-white py-12 border-y border-border relative z-20">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-8">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest text-center">
          Integrated with Industry Leaders
        </p>
        <div className="flex flex-wrap items-center justify-center gap-20 text-2xl font-bold text-foreground opacity-60">
          <div className="flex items-center gap-1">
            LinkedIn
            <div className="bg-foreground text-white text-2xl font-bold rounded p-0.5 leading-none px-1 pb-1">in</div>
          </div>
          <span>Upwork</span>
          <span>Toptal</span>
          <span className="tracking-tighter">Dribbble</span>
          <span>GitHub</span>
        </div>
      </div>
    </section>
  )
}
