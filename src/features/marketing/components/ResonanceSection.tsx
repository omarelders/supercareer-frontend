import { RefreshCcw, Target } from 'lucide-react'

export default function ResonanceSection() {
  return (
    <section className="bg-white py-32 px-8">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-24">
        <div className="flex w-full max-w-lg flex-col gap-6">
          <div className="text-xs font-bold text-blue-600 tracking-widest uppercase">
            Algorithmic Optimization
          </div>
          <h2 className="text-5xl font-extrabold text-foreground leading-none tracking-tighter">
            Deep Resonance<br />Match Scoring
          </h2>
          <p className="text-lg font-medium text-muted-foreground leading-7 mt-2">
            Eliminate ambiguity in your search. Our neural engine quantifies the alignment between your professional DNA and market requirements in real-time.
          </p>

          <div className="flex flex-col gap-10 mt-6">
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-lg bg-background shrink-0 flex items-center justify-center">
                <Target size={20} className="text-foreground" strokeWidth={2} />
              </div>
              <div className="flex flex-col gap-1 w-96">
                <p className="text-lg font-bold text-foreground">Dynamic Alignment</p>
                <p className="text-base font-medium text-muted-foreground leading-6">Continuous match reassessment as market conditions evolve.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-lg bg-background shrink-0 flex items-center justify-center">
                <RefreshCcw size={21} className="text-foreground" strokeWidth={2} />
              </div>
              <div className="flex flex-col gap-1 w-96">
                <p className="text-lg font-bold text-foreground">Contextual Calibration</p>
                <p className="text-base font-medium text-muted-foreground leading-6">Automated resume adjustor out of your credentials for maximum visibility.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative w-[528px] h-[729px] shrink-0">
          <div className="absolute -right-[80px] -bottom-[80px] w-[320px] h-[320px] rounded-full bg-[#2563EB]/20 blur-[50px] z-0" />
          <div className="absolute inset-0 rounded-[32px] box-border p-[40px] flex flex-col gap-[32px] bg-[#0B0F19] border border-[#1E293B] shadow-marketing-glow z-10">
            <div className="w-[446px] h-[169px] rounded-[16px] p-[32px] flex flex-col gap-[24px] box-border" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(2px)' }}>
              <div className="flex justify-between items-center w-[380px]">
                <span className="text-xs font-bold text-white/80 tracking-widest uppercase">SYSTEM MATCH INDEX</span>
                <span className="text-2xl font-black text-[#2563EB] leading-none pb-1">92.4</span>
              </div>
              <div className="w-[380px] h-[8px] bg-white/10 rounded-full relative">
                <div className="absolute left-0 top-0 bottom-0 bg-[#2563EB] shadow-marketing-index rounded-full w-[92%]" />
              </div>
              <div className="flex justify-between w-[380px] text-xs font-bold text-white/40 tracking-widest uppercase mt-1">
                <span>PROBABILITY ^ / v</span>
                <span>CONFIDENCE: 98%</span>
              </div>
            </div>

            <div className="w-[446px] h-[446px] rounded-[16px] border border-white/10 relative overflow-hidden flex flex-col items-center justify-center">
              <div className="absolute inset-0 bg-[#0B0F19] bg-gradient-to-t from-[#0B0F19] to-transparent z-10 opacity-80" />
              <div className="z-20 text-center pb-20">
                <div className="text-5xl font-black text-[#cbd5e1] tracking-widest leading-none mb-1 opacity-90">ATS</div>
                <div className="text-xs font-bold text-[#475569] tracking-widest opacity-80">MATCHSCORE</div>
              </div>
              <div className="w-full space-y-2 mt-auto z-20 absolute bottom-8 px-12">
                <div className="text-xs text-slate-700 tracking-widest flex justify-between uppercase mb-1">
                  <span>ATS</span><span>MATCH</span><span>SCORE</span><span>ANALYSIS</span>
                </div>
                <div className="w-full h-10 border-b border-[#334155]/30 relative flex items-end justify-between px-2">
                  {[3, 6, 4, 8, 5, 2].map((height, index) => (
                    <div key={index} className="w-8 bg-[#1e293b] opacity-50 rounded-t-sm" style={{ height: `${height * 10}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
